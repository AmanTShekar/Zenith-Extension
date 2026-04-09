//! # Zenith Sandbox Proxy
//!
//! A high-performance Rust proxy that strips security headers (CORS/CSP/X-Frame-Options)
//! to enable "Mechanical Perfection" on the Zenith Canvas.

use std::net::SocketAddr;
use hyper::body::Incoming;
use hyper::service::service_fn;
use hyper::{Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use hyper_util::server::conn::auto::Builder;
use tokio::net::TcpListener;
use http_body_util::{BodyExt, Full};
use bytes::Bytes;
use tracing::{info, error, warn, debug};

pub struct SandboxProxy {
    target_port: u16,
}

impl SandboxProxy {
    pub fn new(target_port: u16) -> Self {
        Self { target_port }
    }

    pub async fn start(self, listen_port: u16) -> anyhow::Result<()> {
        let mut port = listen_port;
        let listener = loop {
            let addr = SocketAddr::from(([127, 0, 0, 1], port));
            match TcpListener::bind(addr).await {
                Ok(l) => break l,
                Err(_) if port < listen_port + 10 => { port += 1; continue; }
                Err(e) => return Err(e.into()),
            }
        };

        info!("ZENITH_PROXY_PORT:{}", port);
        info!("[Zenith Proxy] Sandbox active on http://127.0.0.1:{}", port);

        let target_port = self.target_port;
        
        // v13.0 Efficiency: Reuse a single reqwest client to prevent socket exhaustion
        // and maintain connection pools to the upstream server.
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .timeout(std::time::Duration::from_secs(10))
            .build()
            .unwrap();

        loop {
            let (stream, _) = listener.accept().await?;
            let io = TokioIo::new(stream);
            let client = client.clone();
            
            tokio::task::spawn(async move {
                // [O4] Audit Fix: MUST allow_http1_upgrades for HMR WebSocket tunneling
                if let Err(err) = Builder::new(hyper_util::rt::TokioExecutor::new())
                    .serve_connection(io, service_fn(move |req| {
                        handle_proxy(req, target_port, client.clone())
                    }))
                    .await
                {
                    tracing::debug!("[Zenith Proxy] Connection closed: {}", err);
                }
            });
        }
    }
}

async fn handle_proxy(
    req: Request<Incoming>, 
    target_port: u16,
    client: reqwest::Client
) -> Result<Response<Full<Bytes>>, hyper::Error> {
    // v9.5 Mechanical Perfection: Forward WebSocket Upgrades (Vite HMR)
    if req.headers().get("upgrade").is_some() {
        return handle_ws_upgrade(req, target_port).await;
    }

    // Preserve the full URI (including query params) for proper HMR/Routing
    let target_uri = format!("http://127.0.0.1:{}{}", target_port, req.uri());
    let method = req.method().clone();
    let headers = req.headers().clone();

    // v12.1 Refinement: MUST set Host header for upstream compatibility
    let mut target_req = client.request(method.clone(), &target_uri)
        .version(reqwest::Version::HTTP_11)
        .header("host", format!("127.0.0.1:{}", target_port));

    for (key, value) in headers.iter() {
        if key != "host" {
            target_req = target_req.header(key, value);
        }
    }

    let mut res = match target_req.send().await {
        Ok(r) => r,
        Err(_) => {
            error!("[ZENITH-PROXY] Failed to reach target: {}", target_uri);
            return Ok(Response::builder()
                .status(StatusCode::BAD_GATEWAY)
                .body(Full::new(Bytes::from("Zenith Proxy: Target Unreachable")))
                .unwrap());
        }
    };

    // v12.2 Alignment: Fallback for Vite 404 on "/" 
    // If the root returns 404, we try fetching index.html explicitly
    if res.status() == StatusCode::NOT_FOUND && req.uri().path() == "/" {
        let fallback_uri = format!("http://127.0.0.1:{}/index.html", target_port);
        let fallback_req = client.request(method.clone(), &fallback_uri)
            .version(reqwest::Version::HTTP_11)
            .header("host", format!("127.0.0.1:{}", target_port));

        if let Ok(fallback_res) = fallback_req.send().await {
            if fallback_res.status().is_success() {
                res = fallback_res;
            }
        }
    }

    let status = res.status();
    if !status.is_success() && status != StatusCode::NOT_MODIFIED {
        warn!("[ZENITH-PROXY] Upstream returned non-success: {} for {}", status, req.uri());
    }
    let is_html = res.headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.contains("text/html"))
        .unwrap_or(false);

    let mut resp_builder = Response::builder().status(status.as_u16());

    // v12.1 Refinement: Diagnostic Header Tracing
    tracing::debug!("[ZENITH-PROXY] Upstream headers for {}: {:?}", req.uri(), res.headers());

    // v9.5: Selective Header Stripping
    for (key, value) in res.headers().iter() {
        let key_str = key.as_str().to_lowercase();
        // v12.1 Hardware Hardening: MUST strip Content-Length and Transfer-Encoding
        // because we are modifying the body size (injection) and re-buffering.
        if key_str == "content-security-policy" || 
           key_str == "x-frame-options" || 
           key_str == "cross-origin-opener-policy" ||
           key_str == "access-control-allow-origin" ||
           key_str == "content-length" ||
           key_str == "transfer-encoding"
        {
            tracing::debug!("[Zenith Proxy] Stripping header: {}", key_str);
            continue;
        }
        resp_builder = resp_builder.header(key, value);
    }

    // Force Open CORS for Zenith Bridge
    resp_builder = resp_builder.header("Access-Control-Allow-Origin", "*");
    
    // [W4] Audit Fix: Re-strip Content-Length just in case it was re-added by builder defaults
    // Note: hyper_util / hyper 1.0 builders can sometimes be helpful in unwanted ways.
    // By removing it here, we force hyper to calculate it from the body we provide.
    let mut response = resp_builder.body(Full::new(Bytes::new())).unwrap();
    response.headers_mut().remove(hyper::header::CONTENT_LENGTH);
    response.headers_mut().remove(hyper::header::TRANSFER_ENCODING);
    let (mut parts, _) = response.into_parts();
    
    // v12.0 Hardening: We collect the full body here (draining the response)
    let body_bytes = match res.bytes().await {
        Ok(b) => b,
        Err(e) => {
            error!("[ZENITH-PROXY] Failed to collect body bytes for {}: {}", req.uri(), e);
            Bytes::new()
        }
    };
    let mut body_bytes = body_bytes;

    // Change #10: Universal Bridge Injection (Surgical Perfection)
    if is_html {
        let body_str = String::from_utf8_lossy(&body_bytes);
        if let Some(pos) = body_str.find("</body>") {
            let mut new_body = String::with_capacity(body_str.len() + 2000);
            new_body.push_str(&body_str[..pos]);
            new_body.push_str(ZENITH_BRIDGE_INJECTION);
            new_body.push_str(&body_str[pos..]);
            body_bytes = Bytes::from(new_body);
        }
    }

    info!("[ZENITH-PROXY] Serving {} (status={}, size={}, is_html={})", req.uri(), status, body_bytes.len(), is_html);
    if !body_bytes.is_empty() && !is_html {
        tracing::debug!("[ZENITH-PROXY] First 32 bytes of binary: {:?}", &body_bytes[..32.min(body_bytes.len())]);
    }
    
    Ok(Response::from_parts(parts, Full::new(body_bytes)))
}

const ZENITH_BRIDGE_INJECTION: &str = r#"
<script id="zenith-unified-bridge">
(function() {
  if (window.__zenithBridgeActive) return;
  window.__zenithBridgeActive = true;
  console.log("%c[ZENITH-BRIDGE] %cMechanical Perfection Bridge Active (v5.0)", "color: #00f0ff; font-weight: bold;", "color: inherit;");

  const sanitizeRect = (rect) => ({
    x: rect.x, y: rect.y, width: rect.width, height: rect.height,
    top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left
  });

  const getFiber = (el) => {
    const key = Object.keys(el).find(k => k.startsWith('__reactFiber$'));
    return key ? el[key] : null;
  };

  const extractFiberMetadata = (el) => {
    let fiber = getFiber(el);
    let name = "Element";
    let source = null;
    let owner = null;
    while (fiber) {
      if (fiber._debugSource) {
        source = {
          fileName: fiber._debugSource.fileName,
          lineNumber: fiber._debugSource.lineNumber,
          columnNumber: fiber._debugSource.columnNumber
        };
      }
      if (typeof fiber.type === 'function' || typeof fiber.type === 'object') {
        name = fiber.type.displayName || fiber.type.name || name;
        if (fiber._debugSource) {
          owner = { name, source: { fileName: fiber._debugSource.fileName, lineNumber: fiber._debugSource.lineNumber } };
          break;
        }
      }
      fiber = fiber.return;
    }
    return { name, source, owner };
  };

  // [W3] Audit Fix: Serialize CSSStyleDeclaration to plain object — raw object is not structurally clonable
  const serializeStyles = (el) => {
    const cs = window.getComputedStyle(el);
    const result = {};
    const KEYS = ['color','background','backgroundColor','fontSize','fontWeight','fontFamily',
      'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
      'margin','marginTop','marginRight','marginBottom','marginLeft',
      'width','height','display','flexDirection','alignItems','justifyContent',
      'borderRadius','border','boxShadow','opacity','transform','gap',
      'lineHeight','letterSpacing','textAlign','position','top','right','bottom','left',
      'zIndex','overflow','cursor'];
    KEYS.forEach(k => { result[k] = cs[k]; });
    return result;
  };

  const syncSelectedRect = (target) => {
    if (!target) return;
    window.parent.postMessage({
      type: 'zenithRectSync',
      zenithId: target.getAttribute('data-zenith-id'),
      rect: sanitizeRect(target.getBoundingClientRect()),
      computedStyles: serializeStyles(target)
    }, '*');
  };

  // 1. Hover & Selection
  window.addEventListener('click', (e) => {
    const target = e.target.closest('[data-zenith-id]') || e.target;
    if (target.isContentEditable) return;

    const zid = target.getAttribute('data-zenith-id');
    console.log("[ZENITH-BRIDGE] Element selected:", zid);
    
    const fiber = extractFiberMetadata(target);
    window.parent.postMessage({
      type: 'zenithSelect',
      zenithId: zid,
      element: target.tagName.toLowerCase(),
      rect: sanitizeRect(target.getBoundingClientRect()),
      computedStyles: serializeStyles(target),
      componentName: fiber.name,
      source: fiber.source,
      owner: fiber.owner
    }, '*');
  }, true);

  // [O3] Audit Fix: rAF-debounce hover — eliminates redundant fiber walks on every mousemove pixel
  let _hoverRaf = null;
  window.addEventListener('mouseover', (e) => {
    if (_hoverRaf) return;
    _hoverRaf = requestAnimationFrame(() => {
      _hoverRaf = null;
      const target = e.target.closest('[data-zenith-id]');
      if (target) {
        window.parent.postMessage({
          type: 'zenithHover',
          zenithId: target.getAttribute('data-zenith-id'),
          rect: sanitizeRect(target.getBoundingClientRect())
        }, '*');
      }
    });
  }, true);

  // 2. Inline Editing (Double Click)
  window.addEventListener('dblclick', (e) => {
    const target = e.target.closest('[data-zenith-id]');
    if (!target || target.childElementCount > 0) return;
    
    e.preventDefault();
    target.contentEditable = 'true';
    target.focus();
    
    const commit = () => {
      target.contentEditable = 'false';
      window.parent.postMessage({
        type: 'zenithTextEdit',
        zenithId: target.getAttribute('data-zenith-id'),
        newText: target.textContent
      }, '*');
      target.removeEventListener('blur', commit);
    };
    target.addEventListener('blur', commit);
  });

  // 3. Style Previews (HMR Fast-Path)
  window.addEventListener('message', (event) => {
    if (event.data.type === 'zenithApplyStyle') {
      const { zenithId, property, value } = event.data;
      console.log("[ZENITH-BRIDGE] Style applied:", property, "=", value, "on", zenithId);
      const target = document.querySelector(`[data-zenith-id="${zenithId}"]`);
      if (target) {
        target.style[property] = value;
        syncSelectedRect(target);
      }
    }
    
    if (event.data.type === 'zenithRequestTree') {
      console.log("[ZENITH-BRIDGE] Building hierarchy tree");
      const buildTree = (el) => {
        return Array.from(el.children).filter(c => !['SCRIPT','STYLE'].includes(c.tagName)).map(child => {
          const zid = child.getAttribute('data-zenith-id');
          return {
            id: zid || 'gen-' + Math.random().toString(36).slice(2, 9),
            tagName: child.tagName.toLowerCase(),
            className: child.className,
            componentName: extractFiberMetadata(child).name,
            children: buildTree(child)
          };
        });
      };
      window.parent.postMessage({ type: 'zenithHierarchy', tree: buildTree(document.body) }, '*');
    }
  });

  // 4. Presence Heartbeat
  setInterval(() => {
    window.parent.postMessage({ type: 'zenithPresence', timestamp: Date.now() }, '*');
  }, 2000);

})();
</script>
"#;

async fn handle_ws_upgrade(mut req: Request<Incoming>, target_port: u16) -> Result<Response<Full<Bytes>>, hyper::Error> {
    let target_addr = format!("127.0.0.1:{}", target_port);
    let mut resp = Response::builder();
    
    // Copy necessary headers for WS handshake
    for (key, value) in req.headers() {
        if key == "upgrade" || key == "connection" || key.as_str().starts_with("sec-websocket-") {
            resp = resp.header(key, value);
        }
    }
    
    tokio::task::spawn(async move {
        match hyper::upgrade::on(&mut req).await {
            Ok(upgraded) => {
                if let Ok(mut target_socket) = tokio::net::TcpStream::connect(target_addr).await {
                    let mut upgraded = TokioIo::new(upgraded);
                    let _ = tokio::io::copy_bidirectional(&mut upgraded, &mut target_socket).await;
                }
            }
            Err(e) => error!("[Zenith Proxy] WS Upgrade failed: {}", e),
        }
    });

    Ok(resp.status(StatusCode::SWITCHING_PROTOCOLS)
        .body(Full::new(Bytes::new()))
        .unwrap())
}
