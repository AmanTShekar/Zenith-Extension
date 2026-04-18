import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';
import { SidecarHandle, SidecarState } from './types';
import { SidecarManager } from './sidecar_manager';
import { RpcClient } from './rpc_client';
import { RingBufferProducer } from './hot_path';
import { extensionContext, ipcChannel, zenithConfig, activeSidecars, broadcastToWebviews } from './globals';
import { updateStatusBar, normalizePath } from './utils';
export const ongoingStartups = new Map<number, Promise<void>>();
export const healingWorkspaces = new Set<string>();

export function stopAllSidecars() {
    for (const [root, handle] of activeSidecars) {
        shutdownSidecarForWorkspace(root);
    }
}

export async function ensureSidecarForActiveEditor(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.uri.scheme === 'file') {
        const { getWorkspaceRootForFile } = await import('./utils');
        const root = getWorkspaceRootForFile(editor.document.uri.fsPath);
        if (root) {
            await ensureSidecarForWorkspace(root);
        }
    }
}

export async function resolveTargetWorkspace(silent = false): Promise<string | undefined> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        if (!silent) vscode.window.showErrorMessage('Zenith: No workspace folders open.');
        return undefined;
    }
    if (folders.length === 1) return folders[0].uri.fsPath;

    const selection = await vscode.window.showWorkspaceFolderPick({ placeHolder: 'Select workspace for Zenith' });
    return selection?.uri.fsPath;
}

export async function ensureSidecarForWorkspace(workspaceRoot: string): Promise<void> {
    const lowerRoot = workspaceRoot.toLowerCase();
    if (lowerRoot.includes('zenith-extension') || lowerRoot.includes('zenith-vite-plugin')) {
        console.log(`[Zenith] Skipping sidecar for source-project: ${workspaceRoot}`);
        return;
    }

    const configBasePort = zenithConfig().get<number>('sidecarPort', 8082);

    const existing = activeSidecars.get(normalizePath(workspaceRoot));
    if (existing) {
        if (existing.state === 'ready') {
            try {
                await existing.rpc.call('sidecar/status', []);
                return; 
            } catch {
                console.log(`[Zenith] Sidecar handle for ${workspaceRoot} is stale. Cleaning up.`);
                activeSidecars.delete(normalizePath(workspaceRoot));
            }
        } else if (existing.state === 'starting') {
            return; 
        }
    }

    const port = (vscode.workspace.workspaceFolders?.length === 1) ? configBasePort : await getAvailablePort(configBasePort);

    if (ongoingStartups.has(port)) return; 

    const startup = (async () => {
        const { resolveProjectPort, detectFrameworkTS, getGlobalIndexPath } = await import('./project_manager');
        const targetPort = await resolveProjectPort(workspaceRoot) ?? 5173;

        const [framework, globalIndexPath] = await Promise.all([
            detectFrameworkTS(workspaceRoot),
            getGlobalIndexPath(workspaceRoot),
        ]);

        const sandboxPort = zenithConfig().get<number>('sandboxPort', 3005);

        const manager = new SidecarManager(
            workspaceRoot, 
            port, 
            targetPort, 
            sandboxPort, 
            framework,
            globalIndexPath
        );
        const rpc = new RpcClient(port);
        
        const zenithDir = path.join(workspaceRoot, '.zenith');
        const sabPath = path.join(zenithDir, 'sab.bin');
        const producer = new RingBufferProducer(sabPath);

        manager.onLog = (data) => {
            broadcastToWebviews({
                type: 'log',
                text: data.trim(),
                level: data.includes('ERROR') ? 'error' : (data.includes('WARN') ? 'warn' : 'info')
            });
        };

        const handle: SidecarHandle = {
            manager, rpc,
            state: 'starting',
            stagedCount: 0,
            latencyMs: 0,
            framework,
            sharedBuffer: undefined, // Using file-backed mmap for now
            hotPathProducer: producer
        };
        activeSidecars.set(normalizePath(workspaceRoot), handle);
        updateStatusBar(workspaceRoot);

        try {
            await manager.start();
            await rpc.connect(10); 
            
            try {
                await rpc.call('zenith.sandbox.start', [targetPort, sandboxPort]);
                console.log(`Zenith: Sandbox Proxy active (latching port ${targetPort} -> ${sandboxPort})`);
            } catch (proxyErr) {
                console.warn('Sandbox proxy fail (silent fallback):', proxyErr);
            }

            handle.state = 'ready';
            console.log(`Zenith: sidecar ready for ${workspaceRoot}`);
            syncSidecarStatus(workspaceRoot);
            
            broadcastToWebviews({
                type: 'sidecarState',
                state: 'ready',
                port: port,
                sandboxPort: sandboxPort,
                workspaceRoot: workspaceRoot
            });

            try {
                const recoveryMsg = await rpc.call('zenith.session.get_status', []);
                if (recoveryMsg) {
                    vscode.window.showInformationMessage(`Zenith: ${recoveryMsg}`, 'Review Ledger', 'Dismiss')
                        .then(selection => {
                            if (selection === 'Review Ledger') {
                                vscode.commands.executeCommand('zenith.openLedger');
                            }
                        });
                }
            } catch (err) {
                console.warn('Failed to fetch session status:', err);
            }
        } catch (e) {
            handle.state = 'error';
            console.error(`Zenith: sidecar failed for ${workspaceRoot}:`, e);
        } finally {
            updateStatusBar(workspaceRoot);
            ongoingStartups.delete(port);
        }
    })();

    ongoingStartups.set(port, startup);

    extensionContext.subscriptions.push({
        dispose: () => { shutdownSidecarForWorkspace(workspaceRoot).catch(() => { }); }
    });

    return startup;
}

export async function shutdownSidecarForWorkspace(workspaceRoot: string): Promise<void> {
    const handle = activeSidecars.get(normalizePath(workspaceRoot));
    if (!handle) return;

    handle.rpc.disconnect();
    await handle.manager.stop();

    if (process.platform !== 'linux' && handle.manager.proxyAddress) {
        try { fs.unlinkSync(handle.manager.proxyAddress); } catch { /* already gone */ }
    }

    activeSidecars.delete(normalizePath(workspaceRoot));
    updateStatusBar(undefined);
}

export async function syncSidecarStatus(root: string): Promise<number> {
    const handle = activeSidecars.get(normalizePath(root));
    if (!handle || handle.state !== 'ready') return 0;

    const start = Date.now();
    try {
        const res = await handle.rpc.call('sidecar/status', []) as any;
        const latency = Date.now() - start;
        handle.latencyMs = latency;
        
        if (res && typeof res.stagedCount === 'number') {
            const oldThread = handle.stagedCount;
            handle.stagedCount = res.stagedCount;
            
            if (oldThread !== handle.stagedCount) {
                console.log(`[ZENITH-SYNC] Staged Count Transition: ${oldThread} -> ${handle.stagedCount} (lat=${latency}ms)`);
            }
        }
        
        broadcastToWebviews({
            type: 'status',
            connected: true,
            port: handle.manager.port,
            latency: handle.latencyMs,
            workspaceRoot: root,
            stagedCount: handle.stagedCount
        });
        return handle.stagedCount;
    } catch (e: any) {
        console.error(`[ZENITH-SYNC] Status poll failed: ${e.message}`);
        handle.state = 'error';
        broadcastToWebviews({
            type: 'status',
            connected: false,
            workspaceRoot: root,
            stagedCount: 0
        });
        return 0;
    }
}

export async function waitForStagedCount(root: string, expectedMinimum: number, maxAttempts = 20): Promise<number> {
    let count = 0;
    for (let i = 0; i < maxAttempts; i++) {
        count = await syncSidecarStatus(root);
        if (count >= expectedMinimum) {
            ipcChannel.appendLine(`[ZENITH-SYNC] Settle found consistency (attempt ${i+1}): ${count}`);
            return count;
        }
        await new Promise(r => setTimeout(r, 100));
    }
    return count;
}

function isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.unref();
        server.on('error', () => resolve(false));
        server.on('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port, '127.0.0.1');
    });
}

async function getAvailablePort(start: number): Promise<number> {
    let port = start;
    while (!(await isPortAvailable(port))) {
        port++;
        if (port > start + 100) throw new Error('No available ports found in range');
    }
    return port;
}
