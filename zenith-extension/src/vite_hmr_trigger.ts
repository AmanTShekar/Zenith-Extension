import WebSocket from 'ws';

/**
 * ViteHmrTrigger — Direct WebSocket message to Vite's HMR server.
 *
 * This is how Vite's own file watcher triggers HMR internally.
 * We bypass query params (?z=v1) and source injection (import.meta.hot)
 * because:
 * - Query params create duplicate module entries in ModuleGraph
 * - import.meta.hot is a build-time construct, not injectable at request time
 *
 * Instead, we send the correct update message format directly to Vite's
 * WebSocket server, which is the same protocol Vite uses internally.
 */
export class ViteHmrTrigger {
    private vitePort: number;

    constructor(vitePort: number) {
        this.vitePort = vitePort;
    }

    /**
     * Trigger a Vite HMR update for a specific file.
     *
     * Sequence:
     * 1. Stage patch to VFS (already done by caller)
     * 2. Ghost-Proxy cache updated (sidecar handles this)
     * 3. THIS: Send HMR update message to Vite
     * 4. Vite re-requests the file from the dev server
     * 5. Ghost-Proxy intercepts and serves new VFS content
     */
    async triggerUpdate(filePath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const ws = new WebSocket(`ws://localhost:${this.vitePort}`);
            const timeout = setTimeout(() => {
                ws.close();
                reject(new Error('Vite HMR trigger timed out'));
            }, 3000);

            ws.on('open', () => {
                // Vite's internal HMR update message format (stable since Vite 3)
                ws.send(JSON.stringify({
                    type: 'update',
                    updates: [{
                        type: 'js-update',
                        path: filePath,
                        acceptedPath: filePath,
                        timestamp: Date.now(),
                        explicitImportRequired: true,
                    }]
                }));

                clearTimeout(timeout);
                ws.close();
                resolve();
            });

            ws.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    }

    /**
     * Trigger a CSS-only HMR update (no JS module refresh needed).
     */
    async triggerCssUpdate(filePath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const ws = new WebSocket(`ws://localhost:${this.vitePort}`);
            const timeout = setTimeout(() => {
                ws.close();
                reject(new Error('Vite CSS HMR trigger timed out'));
            }, 3000);

            ws.on('open', () => {
                ws.send(JSON.stringify({
                    type: 'update',
                    updates: [{
                        type: 'css-update',
                        path: filePath,
                        acceptedPath: filePath,
                        timestamp: Date.now(),
                    }]
                }));

                clearTimeout(timeout);
                ws.close();
                resolve();
            });

            ws.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    }
}
