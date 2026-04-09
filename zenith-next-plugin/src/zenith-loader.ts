import type { LoaderContext } from 'webpack';
import * as net from 'net';
import * as os from 'os';

let sidecarReady = false;
let failedAttempts = 0;

function getWorkspaceHash(rootPath: string): string {
    const isWindows = os.platform() === 'win32';
    const normalized = isWindows ? rootPath.toLowerCase().replace(/\\/g, '/') : rootPath;
    let h = 2166136261;
    for (let i = 0; i < normalized.length; i++) {
        h ^= normalized.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
}

function getSocketPath(hash: string): string {
    if (os.platform() === 'win32') {
        return `\\\\.\\pipe\\zenith-${hash}`;
    } else if (os.platform() === 'darwin') {
        return `${os.tmpdir()}/zenith-${hash}.sock`;
    } else {
        return `\0zenith-${hash}`; // Linux abstract socket
    }
}

async function requestProxy(socketPath: string, req: object): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const client = net.createConnection(socketPath);
        let data = '';

        const timeout = setTimeout(() => {
            client.destroy();
            reject(new Error("Timeout"));
        }, 1500); // Wait slightly longer for initial connection overhead

        client.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });

        client.write(JSON.stringify(req));
        
        client.on('data', chunk => {
            data += chunk.toString();
        });
        
        client.on('end', () => {
            clearTimeout(timeout);
            try {
                if (!data) return resolve(null);
                const res = JSON.parse(data);
                if (res.type === 'Content') resolve(res.data);
                else resolve(null);
            } catch (e) {
                reject(e);
            }
        });
    });
}

export default async function zenithLoader(
    this: LoaderContext<{}>,
    source: string
): Promise<string> {
    this.cacheable?.(false);

    if (failedAttempts > 5) {
        return source; // stop trying if sidecar is offline
    }

    const hash = getWorkspaceHash(this.rootContext);
    const socketPath = getSocketPath(hash);

    try {
        const content = await requestProxy(socketPath, { 
            type: "GetFile", 
            path: this.resourcePath 
        });
        
        if (content !== null) {
            sidecarReady = true;
            failedAttempts = 0;
            
            // v5.0 Bridge Injection: If this is a component, inject the interaction bridge
            // We append a wrapper that ensures the bridge only runs once globally
            const bridgeScript = `
/** -- ZENITH RUNTIME BRIDGE -- **/
if (typeof window !== 'undefined' && !window.__zenithBridgeActive && window.self !== window.top) {
    (function() {
        window.__zenithBridgeActive = true;
        console.log("[Zenith Next] Bridge Active");
        
        // 1. Fiber Metrics
        const getFiber = (el) => {
            const key = Object.keys(el).find(k => k.startsWith('__reactFiber$'));
            return key ? el[key] : null;
        };
        
        const extractFiber = (el) => {
            let fiber = getFiber(el);
            let name = "Element", source = null, owner = null;
            while (fiber) {
                if (fiber._debugSource) source = fiber._debugSource;
                if (typeof fiber.type === 'function' || typeof fiber.type === 'object') {
                    name = fiber.type.displayName || fiber.type.name || name;
                    if (fiber._debugSource) { owner = { name, source: fiber._debugSource }; break; }
                }
                fiber = fiber.return;
            }
            return { name, source, owner };
        };

        // 2. Select / Hover / Style Bridge
        window.addEventListener('click', (e) => {
            const target = e.target.closest('[data-zenith-id]');
            if (target && !target.isContentEditable) {
                const fiber = extractFiber(target);
                window.parent.postMessage({
                    type: 'zenithSelect',
                    zenithId: target.getAttribute('data-zenith-id'),
                    element: target.tagName.toLowerCase(),
                    rect: target.getBoundingClientRect(),
                    componentName: fiber.name,
                    source: fiber.source,
                    owner: fiber.owner
                }, '*');
            }
        }, true);

        window.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-zenith-id]');
            if (target) {
                window.parent.postMessage({
                    type: 'zenithHover',
                    zenithId: target.getAttribute('data-zenith-id'),
                    tagName: target.tagName.toLowerCase(),
                    rect: target.getBoundingClientRect()
                }, '*');
            } else {
                window.parent.postMessage({ type: 'zenithHover', zenithId: null }, '*');
            }
        }, true);

        window.addEventListener('message', (ev) => {
           if (ev.data.type === 'zenithForwardToFrame' && ev.data.payload.type === 'zenithPatchStyle') {
               const { zenithId, property, value } = ev.data.payload;
               const el = document.querySelector(\`[data-zenith-id="\${zenithId}"]\`);
               if (el) {
                   el.style[property] = value;
                   window.parent.postMessage({ type: 'zenithRectSync', zenithId, rect: el.getBoundingClientRect() }, '*');
               }
           }
        });
    })();
}
`;
            return content + "\n" + bridgeScript;
        }
        return source;
    } catch {
        if (!sidecarReady) {
            failedAttempts++;
        }
        return source;
    }
}
