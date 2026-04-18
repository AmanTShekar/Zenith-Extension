// ---------------------------------------------------------------------------
// Zenith Vite Plugin — Ghost-ID Injection Transform
// ---------------------------------------------------------------------------

import path from "node:path";
import net from "node:net";
import fs from "node:fs";
import { createHash } from "node:crypto";
import type { Plugin, ResolvedConfig } from "vite";
import WebSocket from "ws";
import { injectGhostIds } from "./injector.js";
import { ShadowDirectory } from "./shadow.js";
import type { ZenithPluginOptions } from "./types.js";

function workspaceHash(root: string): string {
  const normalized = process.platform === 'win32'
    ? root.toLowerCase().replace(/\\/g, '/')
    : root;

  let h = 2166136261;
  for (let i = 0; i < normalized.length; i++) {
    h ^= normalized.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

let sidecarPipe: string | null = null;
// [W1] Audit Fix: 50ms was still hitting race conditions on Windows under high file count.
// 200ms provides enough headroom for the OS to handle concurrent pipe connects.
const PROXY_TIMEOUT_MS = process.platform === 'win32' ? 200 : 50;

// [O2] Audit Fix: Content-hash cache to skip redundant Ghost-ID injection on HMR cycles
const _transformCache = new Map<string, { hash: string; result: any }>();
function fnv1a32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

const JSX_EXTENSIONS = /\.(jsx|tsx)$/;

export function zenithGhostId(options: ZenithPluginOptions = {}): Plugin {
  let config: ResolvedConfig;
  let projectRoot: string;
  let shadow: ShadowDirectory | null = null;
  const attrName = options.attributeName ?? "data-zenith-id";
  let rpcWs: WebSocket | null = null;

  return {
    name: "zenith-ghost-id",
    enforce: "pre",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
      projectRoot = options.root ?? config.root;

      if (options.shadow) {
        shadow = new ShadowDirectory(projectRoot);
      }
    },

    configureServer(server) {
      const ports = [8082, 8083, 8084]; // Probe common sidecar ports (8082 is current active)
      let portIndex = 0;
      let subscriptionId: string | null = null;

      function connectRpc() {
        const sidecarPort = ports[portIndex];
        const url = `ws://127.0.0.1:${sidecarPort}`;
        const ws = new WebSocket(url);
        rpcWs = ws;

        ws.on('open', () => {
          console.log(`[Zenith Vite] Connected to Sidecar RPC at ${url}`);
          // v3.10 Infrastructure Hardening: Subscribe to Sidecar HMR Signals
          ws.send(JSON.stringify({
            jsonrpc: "2.0",
            method: "zenith.hmr.subscribe",
            params: [],
            id: "subscribe_hmr"
          }));
        });

        ws.on('message', (data) => {
          try {
            const res = JSON.parse(data.toString());
            
            // Handle Subscription Acknowledgement
            if (res.id === "subscribe_hmr") {
               subscriptionId = res.result;
               return;
            }

            // Handle HMR Notifications from Sidecar
            if (res.method === "zenith.hmr.subscribe") {
               const signal = res.params.result;
               console.log(`[Zenith Vite] Sidecar HMR Trigger: ${signal}`);
               // Full reload ensures the browser reflects the latest disk state after persist()
               server.ws.send({ type: 'full-reload', path: '*' });
            }
          } catch { /* skip */ }
        });

        ws.on('close', () => {
          if (rpcWs === ws) {
            rpcWs = null;
            subscriptionId = null;
            // Cycle through ports on reconnection
            portIndex = (portIndex + 1) % ports.length;
            setTimeout(connectRpc, 2000); 
          }
        });

        ws.on('error', () => {
           // On error, let 'close' handle the retry/cycling
           ws.close();
        });
      }

      function warmupRegistry() {
        if (!rpcWs || rpcWs.readyState !== WebSocket.OPEN) return;
        
        console.log(`[Zenith Vite] Proactive Registry Warmup starting in: ${projectRoot}`);
        const files: string[] = [];

        function scan(dir: string) {
          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory()) {
                if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
                  scan(fullPath);
                }
              } else if (/\.(jsx|tsx|ts|js|css|html)$/.test(entry.name)) {
                files.push(fullPath);
              }
            }
          } catch { /* skip */ }
        }

        scan(projectRoot);

        for (const file of files) {
          try {
            let relativePath = path.relative(projectRoot, file).replace(/\\/g, '/');
            if (process.platform === 'win32') {
              relativePath = relativePath.toLowerCase();
            }
            const source = fs.readFileSync(file, 'utf-8');
            const result = injectGhostIds(source, relativePath, attrName);
            
            const rpcId = Date.now() + Math.random();
            rpcWs.send(JSON.stringify({
              jsonrpc: "2.0",
              method: "zenith.registry.register",
              params: [result.entries],
              id: `warmup_${rpcId}`
            }));
          } catch { /* skip */ }
        }
        console.log(`[Zenith Vite] Warmup complete. Registered ${files.length} files.`);
      }

      connectRpc();
      // Wait a bit for connection to stabilize before warmup
      setTimeout(warmupRegistry, 1000);
    },

    transformIndexHtml(html) {
      // v11.3: Injected Runtime Bridge — Enables Layers Panel & Canvas Interactions
      // This is local-only and only runs during development.
      const curDir = path.dirname(import.meta.url.replace('file:///', ''));
      const possiblePaths = [
        path.join(curDir, 'runtime-bridge.js'),
        path.join(curDir, '..', 'dist', 'runtime-bridge.js'),
        path.join(curDir, 'runtime-bridge.ts'),
        path.join(curDir, '..', 'src', 'runtime-bridge.ts')
      ];

      let bridgePath = '';
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          bridgePath = p;
          break;
        }
      }

      let bridgeCode = '';
      if (bridgePath) {
        try {
          bridgeCode = fs.readFileSync(bridgePath, 'utf-8');
        } catch (e) {
          console.warn(`[Zenith Vite] Failed to read bridge at ${bridgePath}:`, e);
        }
      }
      
      if (!bridgeCode) {
        console.warn('[Zenith Vite] Failed to locate runtime-bridge, using recovery fallback.');
        bridgeCode = 'console.error("Zenith Bridge Source Missing");';
      }

      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: bridgeCode,
          injectTo: 'body'
        }
      ];
    },

    async buildStart() {
      if (shadow) await shadow.clean();
    },
    async transform(code: string, id: string) {
      if (id.includes("node_modules")) return null;
      let relativePath = path.relative(projectRoot, id).replace(/\\/g, '/');
      if (process.platform === 'win32') {
        relativePath = relativePath.toLowerCase();
      }

      // [O2] Audit Fix: Content-hash cache
      const contentHash = createHash('sha256').update(code).digest('hex');
      const cached = _transformCache.get(relativePath);
      if (cached && cached.hash === contentHash) {
        return cached.result;
      }

      // v12.6 Fix: Virtualization for ALL files. 
      // This enables editing split-logic in .ts files via the Ghost Proxy.
      try {
        if (!sidecarPipe) {
          const hash = workspaceHash(projectRoot);
          sidecarPipe = process.platform === 'win32'
            ? `\\\\.\\pipe\\zenith-${hash}`
            : `/tmp/zenith-${hash}.sock`;
        }

        // 1. Try Virtual Cache (Ghost Proxy)
        let baseCode = code;
        const virtualContent = await fetchFromGhostProxy(relativePath, sidecarPipe);
        if (virtualContent) {
           baseCode = virtualContent;
           
           // If it's NOT a JSX file, we can return the virtual content immediately
           // as there's no Ghost-ID injection needed.
           if (!JSX_EXTENSIONS.test(id)) {
             return { code: baseCode, map: null };
           }
        } else if (!JSX_EXTENSIONS.test(id)) {
           // Standard .ts/.js file with no virtual override — let Vite handle normally
           return null;
        }

        // 2. Local Injector (JSX-only path)
        const result = injectGhostIds(baseCode, relativePath, attrName);
        _transformCache.set(relativePath, { hash: contentHash, result });
        
        // 3. Sync to Sidecar Registry (Real-time)
        if (rpcWs && rpcWs.readyState === WebSocket.OPEN) {
          const rpcId = Date.now();
          // v3.10 Hardening: Clear old IDs for this file before registering new ones
          // This prevents registry drift during refactors/deletes.
          rpcWs.send(JSON.stringify({
            jsonrpc: "2.0",
            method: "zenith.registry.clear_file",
            params: [relativePath],
            id: `clear_${rpcId}`
          }));

          if (result.entries.length > 0) {
            rpcWs.send(JSON.stringify({
              jsonrpc: "2.0",
              method: "zenith.registry.register",
              params: [result.entries],
              id: `reg_${rpcId}`
            }));
          }
        }

        if (shadow && result.entries.length > 0) {
          shadow.write(relativePath, result.code, result.entries);
        }

        return { code: result.code, map: result.map as any };
      } catch (err) {
        return null;
      }
    },
  };
}

async function fetchFromGhostProxy(path: string, pipe: string): Promise<string | null> {
  const tryConnect = (attempt: number): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      let resolved = false;
      const socket = net.connect(pipe);
      socket.setTimeout(Math.max(50, attempt * 50)); 
      
      socket.on('connect', () => {
        socket.write(JSON.stringify({ type: 'GetFile', path }));
      });

      socket.on('data', (data) => {
        if (resolved) return;
        try {
          const res = JSON.parse(data.toString());
          if (res.type === 'Content') {
            resolved = true;
            resolve(res.data);
          } else {
            resolved = true;
            resolve(null);
          }
          socket.destroy();
        } catch { 
           // Ignore partial JSON, might be incomplete buffer
        }
      });

      socket.on('error', (err) => { 
        if (!resolved) {
          resolved = true;
          reject(err);
        }
        socket.destroy(); 
      });

      socket.on('timeout', () => { 
        if (!resolved) {
          resolved = true;
          reject(new Error('timeout'));
        }
        socket.destroy(); 
      });
    });
  };

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const result = await tryConnect(attempt);
      return result;
    } catch (err: any) {
      if (err.code === 'ENOENT' || err.message === 'timeout' || err.code === 'ECONNREFUSED') {
         if (attempt < 5) {
             console.warn(`[Zenith Proxy] Cold start try ${attempt} for ${pipe}...`);
             await new Promise(r => setTimeout(r, 100 * attempt));
             continue;
         }
      }
      return null;
    }
  }
  return null;
}
