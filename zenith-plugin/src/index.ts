import { Plugin } from 'vite';
import * as babel from '@babel/core';
import * as path from 'path';
import * as net from 'net';
import zenithBabel from './babel-plugin-zenith-id';

/**
 * Zenith v2.6 — The Virtualizer (Vite Plugin)
 * 
 * 1. Injects data-zenith-id="file:line:col" into JSX.
 * 2. Redirects source requests to the Zenith Ghost-Proxy.
 */
export function zenithPlugin(): Plugin {
    return {
        name: 'vite-plugin-zenith',
        enforce: 'pre',

        // 1. JSX Instrumentation (Ghost-ID Injection)
        transform(code, id) {
            const normalizedId = id.replace(/\\/g, '/');
            if (!normalizedId.endsWith('.tsx') && !normalizedId.endsWith('.jsx')) return;
            if (normalizedId.includes('node_modules') || normalizedId.endsWith('main.tsx') || normalizedId.endsWith('main.ts')) return;

            const result = babel.transformSync(code, {
                filename: id,
                presets: [
                    ['@babel/preset-react', { runtime: 'automatic' }],
                    '@babel/preset-typescript'
                ],
                plugins: [
                    [zenithBabel, { filename: id }]
                ],
                sourceMaps: true
            });

            return {
                code: result?.code || code,
                map: result?.map
            };
        },

        // 2. Ghost-Proxy Virtualization
        configureServer(server) {
            // NOTE: COEP/COOP headers removed — they block the webview iframe from embedding the app.
            // Cross-origin isolation is opt-in only when SharedArrayBuffer is needed.

            server.middlewares.use(async (req: any, res: any, next: any) => {
                const url = new URL(req.url || '', `http://${req.headers.host}`);
                const filePath = url.pathname;

                // v2.6 Surgical Mode: Automatically serve virtualized source if staged in Sidecar
                if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
                    try {
                        const virtualSource = await fetchFromGhostProxy(filePath);
                        if (virtualSource) {
                            res.setHeader('Content-Type', 'application/javascript');
                            res.end(virtualSource);
                            return;
                        }
                    } catch (err) {
                        // Expected if file not staged
                    }
                }
                next();
            });
        },

        // 3. Visual Designer Bridge — injected into the app's HTML at dev time
        transformIndexHtml(html: string) {
            return {
                html,
                tags: [
                    {
                        tag: 'script',
                        injectTo: 'body',
                        children: `
                        (function() {
                            // Hover highlight overlay
                            var ov = document.createElement('div');
                            ov.style.cssText = 'position:fixed;pointer-events:none;border:2px solid #00c2ff;border-radius:4px;z-index:99999;box-shadow:0 0 0 1px rgba(0,194,255,0.15),0 0 12px rgba(0,194,255,0.3);transition:all 80ms ease;display:none;';
                            document.body.appendChild(ov);

                            var hovEl = null;
                            document.addEventListener('mouseover', function(e) {
                                var el = e.target.closest ? e.target.closest('[data-zenith-id]') || e.target : e.target;
                                if (!el || el === document.body || el === hovEl) return;
                                hovEl = el;
                                var r = el.getBoundingClientRect();
                                ov.style.display = 'block';
                                ov.style.left = r.left + 'px';
                                ov.style.top = r.top + 'px';
                                ov.style.width = r.width + 'px';
                                ov.style.height = r.height + 'px';
                            }, true);

                            document.addEventListener('mouseout', function(e) {
                                if (!e.relatedTarget || e.relatedTarget === document.body) {
                                    ov.style.display = 'none'; hovEl = null;
                                }
                            }, true);

                            document.addEventListener('click', function(e) {
                                // Prefer [data-zenith-id] — fall back to any element so selection always works
                                var el = (e.target.closest && e.target.closest('[data-zenith-id]')) || e.target;
                                if (!el || el === document.body || el === document.documentElement) return;
                                e.stopPropagation();

                                var rect = el.getBoundingClientRect();
                                var zenithId = el.getAttribute('data-zenith-id') || '';
                                var cls = (el.className && typeof el.className === 'string') ? el.className : '';
                                var name = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '');

                                window.parent.postMessage({
                                    type: 'zenithSelect',
                                    zenithId: zenithId,
                                    element: name,
                                    className: cls,
                                    rect: {
                                        x: Math.round(rect.left),
                                        y: Math.round(rect.top),
                                        w: Math.round(rect.width),
                                        h: Math.round(rect.height)
                                    }
                                }, '*');
                            }, true);
                        })();
                        `
                    }
                ]
            };
        }
    };
}

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

/**
 * Connect to the Sidecar's Named Pipe (Windows)
 */
async function fetchFromGhostProxy(filePath: string): Promise<string> {
    const root = process.cwd(); // Assume project root is CWD for the plugin
    const hash = workspaceHash(root);
    const pipePath = process.platform === 'win32'
        ? `\\\\.\\pipe\\zenith-${hash}`
        : `/tmp/zenith-${hash}.sock`;

    return new Promise((resolve, reject) => {
        const client = net.connect(pipePath, () => {
            const request = JSON.stringify({
                type: 'GetFile',
                path: filePath
            });
            client.write(request);
        });

        let data = '';
        client.on('data', (chunk) => {
            data += chunk.toString();
        });

        client.on('end', () => {
            try {
                if (!data) return resolve('');
                const response = JSON.parse(data);
                if (response.type === 'Content') {
                    resolve(response.data);
                } else if (response.type === 'NotFound') {
                    reject(new Error('File not found in Ghost-Proxy'));
                } else {
                    reject(new Error(response.message || 'Unknown Ghost-Proxy error'));
                }
            } catch (err) {
                reject(err);
            }
        });

        client.on('error', reject);
    });
}
