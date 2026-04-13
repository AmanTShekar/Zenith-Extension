/**
 * Zenith v3.6 — Global Mode Extension
 *
 * Changes from single-workspace prototype:
 *   1. Auto-spawn one sidecar per workspace (Map<root, SidecarHandle>)
 *   2. Auto-detect dev server port (no hardcoded :3000)
 *   3. Framework auto-detection forwarded to sidecar
 *   4. Zero-config init — no zenith.config.ts needed
 *   5. Global Ghost Index via context.globalStorageUri
 *   6. Multi-root workspace support
 *   7. Global VS Code settings (autoStart, devServerPort, logLevel)
 *   8. Status bar item showing live sidecar state
 *   9. Platform-aware socket cleanup on deactivate
 *  10. onDidChangeWorkspaceFolders listener for dynamic folder add/remove
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';
import { SidecarManager } from './sidecar_manager';
import { RpcClient } from './rpc_client';
// import { ZenithCanvasPanel } from './canvas-panel'; // DEPRECATED v5.0


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SidecarState = 'starting' | 'ready' | 'error';

interface SidecarHandle {
    manager: SidecarManager;
    rpc: RpcClient;
    state: SidecarState;
    stagedCount: number;
    latencyMs: number;
    framework: string;
}

// ---------------------------------------------------------------------------
// Module-level state — one entry per workspace root
// ---------------------------------------------------------------------------

const activeSidecars = new Map<string, SidecarHandle>();
const activePanels = new Set<ZenithPanel>();

// --- UUID Generator (v5.0 Stability) ---
function generateZenithUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let sidebarProvider: ZenithViewProvider | undefined;
let extensionContext: vscode.ExtensionContext;
let statusBar: vscode.StatusBarItem;

// v3.15 Monorepo Hard-Lock: Force targeting of the Zenith Demo application
const MONOREPO_DEMO_LOCK = 'c:\\Users\\Asus\\Desktop\\ve\\zenith-demo';
let lastValidWorkspaceRoot: string | undefined = MONOREPO_DEMO_LOCK;

// ---------------------------------------------------------------------------
// Common dev server ports to probe (order = likelihood)
// BANNED: 8080 (Postgres/EDB), 8081, 8082
// ---------------------------------------------------------------------------
const COMMON_DEV_PORTS = [3009, 3000, 5173, 5174, 4173, 4321, 5500];

// ---------------------------------------------------------------------------
// Activate
// ---------------------------------------------------------------------------

export async function activate(context: vscode.ExtensionContext) {
    console.log('Zenith v3.6 — Global Mode Activated');
    extensionContext = context;

    // v11.3: Surgical Lockdown — Purge hijacked URLs from workspace state
    const currentUrl = context.workspaceState.get<string>('zenith.projectUrl');
    if (currentUrl?.includes('enterprisedb.com') || currentUrl?.includes(':8080')) {
        console.warn('[Zenith Lockdown] Purging hijacked URL from state:', currentUrl);
        context.workspaceState.update('zenith.projectUrl', undefined);
        context.workspaceState.update('zenith.detectedServers', undefined);
    }
    
    // --- Status Bar (Change #9) ---
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = 'zenith.visualEdit';
    statusBar.tooltip = 'Zenith Designer';
    statusBar.show();
    context.subscriptions.push(statusBar);
    
    // v3.15 Monorepo Priming: Auto-detect 'zenith-demo' to prevent 'Off' state on startup
    const folders = vscode.workspace.workspaceFolders ?? [];
    for (const folder of folders) {
        const demoPath = path.join(folder.uri.fsPath, 'zenith-demo');
        if (fs.existsSync(demoPath)) {
            lastValidWorkspaceRoot = demoPath;
            console.log(`[Zenith] Monorepo detected. Priming 'zenith-demo' as sticky target: ${demoPath}`);
            break;
        }
    }

    // --- Workspace folder watcher (Change #10) ---
    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders((e) => {
            for (const added of e.added) {
                void ensureSidecarForWorkspace(added.uri.fsPath).catch(err => {
                    console.error(`Sidecar start failed: ${err}`);
                });
            }
            for (const removed of e.removed) {
                void shutdownSidecarForWorkspace(removed.uri.fsPath);
            }
        })
    );

    // v11.3: Auto-Prime — trigger sidecar start for all folders already present
    for (const folder of folders) {
        if (zenithConfig().autoStart) {
            void ensureSidecarForWorkspace(folder.uri.fsPath).catch(err => {
                console.error(`[Zenith] Auto-prime failed for ${folder.uri.fsPath}:`, err);
            });
        }
    }

    // --- Active editor change → update status bar + selection sync ---
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            const filePath = editor?.document?.uri?.fsPath;
            if (!filePath) return;

            const root = getWorkspaceRootForFile(filePath);
            updateStatusBar(root);

            if (root) {
                // Try to resolve current element under cursor if in a supported file
                // For now, just send a ping to ensure the webview knows we're active
                broadcastToWebviews({ type: 'editorActive', file: path.basename(filePath) });
            }
        })
    );

    // --- Commands ---
    context.subscriptions.push(
        vscode.commands.registerCommand('zenith.visualEdit', async () => {
            const root = await resolveTargetWorkspace();
            if (!root) return;

            // Explicitly show "Starting" state in UI if possible
            updateStatusBar(root);

            try {
                await ensureSidecarForWorkspace(root);
                const handle = activeSidecars.get(root);
                
                // v5.0: Consolidation — Always use ZenithPanel (React Studio)
                const panel = ZenithPanel.createOrShow(
                    context.extensionUri, 
                    handle?.rpc, 
                    root, 
                    context, 
                    vscode.ViewColumn.Active, 
                    zenithConfig().launchInSeparateWindow
                );
                
                if (zenithConfig().launchInSeparateWindow && panel) {
                    setTimeout(() => {
                        vscode.commands.executeCommand('workbench.action.moveEditorToNewWindow');
                    }, 500);
                }
            } catch (err) {
                vscode.window.showErrorMessage(`Failed to start Zenith designer: ${err}`);
            }
        }),

        vscode.commands.registerCommand('zenith.openSeparateWindow', async () => {
            const root = await resolveTargetWorkspace();
            if (!root) return;
            void ensureSidecarForWorkspace(root).catch(() => { });
            const handle = activeSidecars.get(root);
            
            // v5.0: Consolidation — Always use ZenithPanel
            const panel = ZenithPanel.createOrShow(
                context.extensionUri, 
                handle?.rpc, 
                root, 
                context, 
                vscode.ViewColumn.Beside, 
                true
            );
            
            if (panel) {
                await vscode.commands.executeCommand('workbench.action.moveEditorToNewWindow');
            }
        }),

        vscode.commands.registerCommand('zenith.surgicalMode.toggle', async () => {
            const root = await resolveTargetWorkspace();
            if (!root) return;
            const handle = activeSidecars.get(root);
            if (!handle) return;
            try {
                const result = await handle.rpc.call('zenith.engine.toggle_surgical', []);
                await vscode.workspace.getConfiguration('zenith').update(
                    'surgicalMode', result, vscode.ConfigurationTarget.Global
                );
                
                // Enhanced Notification with Mechanical Parity
                vscode.window.showInformationMessage(
                    `Zenith Surgical Mode: ${result ? 'ENABLED ✓' : 'DISABLED ✗'}`,
                    ...(result ? ['Audit System'] : [])
                );

                broadcastToWebviews({ type: 'surgicalModeSet', enabled: result });
            } catch (err: any) {
                vscode.window.showErrorMessage(`Surgical toggle failed: ${err.message}`);
            }
        }),

        // Surgical Bridge API — stage with tx_id (Fix #11 from v3.6 audit)
        vscode.commands.registerCommand('zenith.engine.stage', async (intent: any) => {
            const root = await resolveTargetWorkspace(true);
            if (!root) return;
            const handle = activeSidecars.get(root);
            if (!handle) return;
            try {
                // v5.0 Hardening: Legacy webviews might send 'tx-*' IDs.
                // We MUST override them with valid UUIDs for the Rust sidecar.
                const txId = generateZenithUuid();
                
                // v5.3: Ensure intent has a timestamp and is in flattened format (Patch 15)
                const rpcIntent = {
                    ...intent,
                    timestamp: intent.timestamp || Date.now()
                };
                
                console.log(`[ZENITH-RPC] staging tx=${txId}`, JSON.stringify(rpcIntent, null, 2));
                
                let result;
                try {
                    console.log(`[ZENITH-RPC] EXEC zenith.engine.stage tx=${txId} intent=${rpcIntent.type}`);
                    result = await handle.rpc.call('zenith.engine.stage', [
                        txId,
                        rpcIntent
                    ]) as any;
                } catch (e: any) {
                    console.error(`[ZENITH-RPC] Stage FAILED for tx=${txId}. Params:`, JSON.stringify([txId, rpcIntent], null, 2));
                    throw e;
                }
                
                if (result.type === 'Conflict') {
                    const conflict = result.data.HumanReview;
                    ZenithPanel.currentPanel?.showConflict(
                        conflict.reason,
                        JSON.stringify(conflict.human_intent),
                        JSON.stringify(conflict.ai_intent)
                    );
                    return { type: 'Conflict', tx_id: txId };
                }

                updateStatusBar(root);
                broadcastToWebviews({
                    type: 'status',
                    connected: true,
                    workspaceRoot: root,
                    stagedCount: handle.stagedCount
                });
                return { ...result, tx_id: txId };
            } catch (err: any) {
                vscode.window.showErrorMessage(`Zenith Stage Failed: ${err.message || err}`);
                throw err;
            }
        }),

        vscode.commands.registerCommand('zenith.engine.heal', async () => {
            const root = await resolveTargetWorkspace(true);
            if (!root) return;
            const handle = activeSidecars.get(root);
            if (!handle) return;
            try {
                console.log(`[ZENITH-RPC] EXEC zenith.engine.heal`);
                await handle.rpc.call('vfs.heal', []);
                handle.stagedCount = 0; // Reset count
                broadcastToWebviews({ type: 'status', connected: true, stagedCount: 0 });
                vscode.window.showInformationMessage('Zenith: System Healed. Staging layer has been reset.');
            } catch (err: any) {
                vscode.window.showErrorMessage(`Healing failed: ${err.message}`);
                throw err;
            }
        }),

        vscode.commands.registerCommand('zenith.engine.commit', async (zenithId?: string) => {
            const root = await resolveTargetWorkspace(true);
            if (!root) return;
            const handle = activeSidecars.get(root);
            if (!handle) return;
            try {
                const targetId = zenithId || '';
                const method = targetId === '' ? 'vfs.commit' : 'zenith.engine.commit';
                console.log(`[ZENITH-RPC] EXEC ${method} target=${targetId || 'ALL'}`);
                const result = await handle.rpc.call(method, targetId === '' ? [] : [targetId]);
                
                if (targetId === '') {
                    handle.stagedCount = 0;
                } else {
                    handle.stagedCount = Math.max(0, handle.stagedCount - 1);
                }
                updateStatusBar(root);
                broadcastToWebviews({
                    type: 'status',
                    connected: true,
                    workspaceRoot: root,
                    stagedCount: handle.stagedCount
                });
                return result;

                // Onlook Parity: Force VS Code to re-read files if they are currently open
                // This ensures the "Source of Truth" in the IDE matches the visual edits instantly.
                const statPromises = vscode.workspace.textDocuments
                    .filter(doc => doc.uri.scheme === 'file' && !doc.isDirty)
                    .map(doc => vscode.workspace.fs.stat(doc.uri).then(() => {}, () => {}));
                
                await Promise.allSettled(statPromises);

                return result;
            } catch (err: any) {
                vscode.window.showErrorMessage(`Zenith Commit Failed: ${err.message || err}`);
                throw err;
            }
        }),


        vscode.commands.registerCommand('zenith.killSidecar', async () => {
            const root = await resolveTargetWorkspace(true);
            if (!root) return;
            await shutdownSidecarForWorkspace(root);
            vscode.window.showInformationMessage('Zenith sidecar killed.');
        }),

        vscode.commands.registerCommand('zenith.restartSidecar', async () => {
            const root = await resolveTargetWorkspace(true);
            if (!root) return;
            await shutdownSidecarForWorkspace(root);
            await ensureSidecarForWorkspace(root);
            vscode.window.showInformationMessage('Zenith sidecar restarted.');
        }),

        vscode.commands.registerCommand('zenith.engine.resolveConflict', async (choice: string) => {
            const root = await resolveTargetWorkspace(true);
            if (!root) return;
            const handle = activeSidecars.get(root);
            if (!handle) return;
            
            // v3.8: In a real implementation, this would call an OT 'resolve' RPC.
            // For now, we simulate the resolution by logging and clearing the UI.
            console.log(`[Zenith OT] User resolved conflict with choice: ${choice}`);
            vscode.window.showInformationMessage(`Conflict resolved: ${choice}`);
        }),
    );

    // --- Register sidebar view provider ---
    sidebarProvider = new ZenithViewProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ZenithViewProvider.viewType, sidebarProvider)
    );

    // --- Auto-start for all currently open workspace folders (Change #1) ---
    const cfg = zenithConfig();
    if (cfg.autoStart) {
        for (const folder of vscode.workspace.workspaceFolders ?? []) {
            // Fire and forget — do not block activate()
            void ensureSidecarForWorkspace(folder.uri.fsPath).catch(console.error);
        }
    }

    // --- Update status bar for currently active file ---
    const activeRoot = vscode.window.activeTextEditor
        ? getWorkspaceRootForFile(vscode.window.activeTextEditor.document.uri.fsPath)
        : vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    updateStatusBar(activeRoot);
}

// ---------------------------------------------------------------------------
// Deactivate — platform-aware socket cleanup + WAL flush (changes #9, Fix#F)
// ---------------------------------------------------------------------------

export async function deactivate(): Promise<void> {
    for (const [root, handle] of activeSidecars) {
        handle.rpc.disconnect();
        await handle.manager.stop();

        // Linux uses abstract namespace — no unlink needed
        if (process.platform !== 'linux' && handle.manager.proxyAddress) {
            try { fs.unlinkSync(handle.manager.proxyAddress); } catch { /* already gone */ }
        }
    }
    activeSidecars.clear();
    activePanels.clear();
}

// --- Status Polling Loop (Fix #12) ---
setInterval(() => {
    for (const [root, handle] of activeSidecars) {
        if (handle.state === 'ready') {
            const start = Date.now();
            handle.rpc.call('telemetry.get_token_usage', []).then(() => {
                handle.latencyMs = Date.now() - start;
                broadcastToWebviews({
                    type: 'status',
                    connected: true,
                    latency: handle.latencyMs,
                    workspaceRoot: root,
                    stagedCount: handle.stagedCount
                });
            }).catch(() => {
                handle.state = 'error';
                broadcastToWebviews({
                    type: 'status',
                    connected: false,
                    workspaceRoot: root,
                    stagedCount: 0
                });
            });
        }
    }
}, 5000);

function broadcastToWebviews(message: any) {
    activePanels.forEach(p => p.postMessage(message));
    sidebarProvider?.postMessage(message);
}

// ---------------------------------------------------------------------------
// Sidecar lifecycle helpers
// ---------------------------------------------------------------------------

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

// --- Global Startup Tracking ---
const ongoingStartups = new Map<number, Promise<void>>();

async function ensureSidecarForWorkspace(workspaceRoot: string): Promise<void> {
    // v3.12 Project Filtering: Ignore Zenith's own source code to avoid connection hijacking
    const lowerRoot = workspaceRoot.toLowerCase();
    if (lowerRoot.includes('zenith-extension') || lowerRoot.includes('zenith-vite-plugin')) {
        console.log(`[Zenith] Skipping sidecar for source-project: ${workspaceRoot}`);
        return;
    }

    const configBasePort = zenithConfig().sidecarPort;

    // Check if already ready
    const existing = activeSidecars.get(workspaceRoot);
    if (existing && existing.state === 'ready') return;

    // v3.10 Hardening (EX1): Dynamic Port Allocation for Multi-Root
    const port = await getAvailablePort(configBasePort);

    // Check if already starting this specific root
    // (ongoingStartups was using port as key, which was broken for multi-root)
    const startupKey = `${workspaceRoot}:${port}`;
    if (ongoingStartups.has(port)) return; // Still guard by port to prevent overlap

    const startup = (async () => {
        // Detect target port for the Sandbox Proxy (v11.0 Hardening)
        const targetPort = await resolveProjectPort(workspaceRoot) ?? 5173;

        const [framework, globalIndexPath] = await Promise.all([
            detectFrameworkTS(workspaceRoot),
            getGlobalIndexPath(workspaceRoot),
        ]);

        const config = zenithConfig();
        const sandboxPort = config.sandboxPort || 3005;

        const manager = new SidecarManager(
            workspaceRoot, 
            port, 
            targetPort, 
            sandboxPort, 
            framework, 
            globalIndexPath
        );
        const rpc = new RpcClient(port);

        // v5.1 Production Observability: Pipe sidecar logs to IDE webviews
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
        };
        activeSidecars.set(workspaceRoot, handle);
        updateStatusBar(workspaceRoot);

        try {
            await manager.start();
            await rpc.connect(10); // 10 retries for fresh start
            
            // v11.0: Start the Orchestrated Sandbox Latch
            try {
                await rpc.call('zenith.sandbox.start', [targetPort, sandboxPort]);
                console.log(`Zenith: Sandbox Proxy active (latching port ${targetPort} -> ${sandboxPort})`);
            } catch (proxyErr) {
                console.warn('Sandbox proxy fail (silent fallback):', proxyErr);
            }

            handle.state = 'ready';
            console.log(`Zenith: sidecar ready for ${workspaceRoot}`);
            
            // Change #16: Broadcast readiness so the sidebar knows to connect
            broadcastToWebviews({
                type: 'sidecarState',
                state: 'ready',
                port: port,
                sandboxPort: sandboxPort, // Tell webviews about the sandbox
                workspaceRoot: workspaceRoot
            });

            // v3.8: Check session recovery status
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
            // Don't throw here, just set state to error so UI shows it
        } finally {
            updateStatusBar(workspaceRoot);
            ongoingStartups.delete(port);
        }
    })();

    ongoingStartups.set(port, startup);

    // Cleanup subscription — remove from map when VS Code disposes this folder
    extensionContext.subscriptions.push({
        dispose: () => { shutdownSidecarForWorkspace(workspaceRoot).catch(() => { }); }
    });

    return startup;
}

async function shutdownSidecarForWorkspace(workspaceRoot: string): Promise<void> {
    const handle = activeSidecars.get(workspaceRoot);
    if (!handle) return;

    handle.rpc.disconnect();
    await handle.manager.stop();

    if (process.platform !== 'linux' && handle.manager.proxyAddress) {
        try { fs.unlinkSync(handle.manager.proxyAddress); } catch { /* already gone */ }
    }

    activeSidecars.delete(workspaceRoot);
    updateStatusBar(undefined);
}

// ---------------------------------------------------------------------------
// Dev server auto-detection (Change #2)
// ---------------------------------------------------------------------------

// [O4] Audit Fix: Cache probe results for 30s — prevents 24 HTTP probes on every sidecar restart
let _devServerCache: { result: string[]; ts: number } | null = null;
const DEV_SERVER_CACHE_TTL_MS = 30_000;

export async function detectDevServers(): Promise<string[]> {
    if (_devServerCache && Date.now() - _devServerCache.ts < DEV_SERVER_CACHE_TTL_MS) {
        console.log('[Zenith Detection] Returning cached dev server list');
        return _devServerCache.result;
    }

    const http = require('http');
    
    // v3.11: GET-request probe for better Vite compatibility (Patch 11)
    const probe = (host: string, port: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const req = http.get({
                host,
                port,
                path: '/',
                timeout: 1000,
            }, (res: any) => {
                // If it responds at all (even 404), it's a dev server
                resolve(`http://${host}:${port}`);
            });
            req.on('error', () => reject());
            req.on('timeout', () => { req.destroy(); reject(); });
            req.end();
        });
    };

    const probes: Promise<string>[] = [];
    for (const port of COMMON_DEV_PORTS) {
        // Double-check blacklist even if port is in the common list (Surgical Lockdown)
        if (port === 8080 || port === 8081 || port === 8082) continue;
        
        probes.push(probe('localhost', port));
        probes.push(probe('127.0.0.1', port));
    }

    console.log(`[Zenith Detection] Probing ${COMMON_DEV_PORTS.length * 2} endpoints...`);
    
    const results = await Promise.allSettled(probes);
    const sites = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map(r => r.value);
    
    // v11.3: Prioritize 127.0.0.1 (Fast-Path) over localhost (DNS-Path)
    const sorted = Array.from(new Set(sites)).sort((a, b) => {
        const isA_IP = a.includes('127.0.0.1');
        const isB_IP = b.includes('127.0.0.1');
        if (isA_IP && !isB_IP) return -1;
        if (!isA_IP && isB_IP) return 1;
        return 0;
    });

    // [O4] Store result in cache
    _devServerCache = { result: sorted, ts: Date.now() };
    return sorted;
}


async function resolveProjectPort(workspaceRoot: string): Promise<number | null> {
    // v3.15 Monorepo Hard-Pinning: Always prefer 3001 for the Demo
    const lowerRoot = workspaceRoot.toLowerCase();
    if (lowerRoot.includes('zenith-demo')) {
        return 3009;
    }

    // Priority 1: User-set override in VS Code settings
    const configSetting = vscode.workspace.getConfiguration('zenith').get<number>('devServerPort', 0);
    if (configSetting > 0) {
        // Explicitly forbid 8080 even if set in settings, to protect the developer
        if (configSetting === 8080) {
            vscode.window.showErrorMessage('Zenith: Port 8080 is reserved for databases (Postgres). Redirection blocked.');
            return null;
        }
        return configSetting;
    }

    // Priority 2: Explicit Zenith config file
    const zenithConfigPath = path.join(workspaceRoot, 'zenith.config.ts');
    if (fs.existsSync(zenithConfigPath)) {
        try {
            const raw = fs.readFileSync(zenithConfigPath, 'utf8');
            const match = raw.match(/devServerUrl:\s*['"]http:\/\/127.0.0.1:(\d+)['"]/);
            if (match) return parseInt(match[1], 10);
        } catch {}
    }

    // Priority 3: Vite config (most common in monorepos)
    const viteConfigPath = path.join(workspaceRoot, 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
        try {
            const raw = fs.readFileSync(viteConfigPath, 'utf8');
            // Support both "port: 3009" and "port = 3009"
            const match = raw.match(/port:\s*(\d+)/i) || raw.match(/port\s*=\s*(\d+)/i);
            if (match) return parseInt(match[1], 10);
        } catch {}
    }

    // Priority 4: Dynamic detection via probe (v3.11 logic)
    const sites = await detectDevServers();
    if (sites.length > 0) {
        const match = sites[0].match(/:(\d+)/);
        if (match) return parseInt(match[1], 10);
    }

    return null;
}


async function resolveDevServerUrl(workspaceRoot: string): Promise<string | null> {
    const config = vscode.workspace.getConfiguration('zenith');
    const manualPort = config.get<number>('devServerPort', 0);

    // User set a manual port — use it directly, no confirmation needed
    if (manualPort > 0) {
        return `http://127.0.0.1:${manualPort}`;
    }

    const sites = await detectDevServers();
    const detected = sites[0] || null;

    if (!detected) {
        const manual = await vscode.window.showInputBox({
            prompt: 'No dev server detected. Enter URL manually:',
            placeHolder: 'http://127.0.0.1:3000',
        });
        return manual ?? null;
    }

    // If multiple sites, let user pick from a QuickPick instead of just confirming one
    if (sites.length > 1) {
        const picked = await vscode.window.showQuickPick(sites, {
            placeHolder: 'Multiple dev servers detected. Select one to use as primary:',
        });
        if (picked) return picked;
    }

    // Show what was detected — let user confirm or override
    const action = await vscode.window.showInformationMessage(
        `Zenith detected dev server at ${detected}`,
        { modal: false },
        'Open Canvas',
        'Use different URL'
    );

    if (action === 'Use different URL') {
        const custom = await vscode.window.showInputBox({
            prompt: 'Enter dev server URL:',
            value: detected,
        });
        return custom ?? null;
    }

    if (action === 'Open Canvas') return detected;

    return null; // user dismissed
}

// ---------------------------------------------------------------------------
// Zero-config initialization (Change #5)
// ---------------------------------------------------------------------------

export async function initializeProject(workspaceRoot: string): Promise<ProjectConfig> {
    const configPath = path.join(workspaceRoot, 'zenith.config.ts');

    const hasConfig = await fs.promises.access(configPath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);

    if (hasConfig) {
        // User has an explicit config — load and trust it
        return loadUserConfig(configPath);
    }

    // Auto-detect everything
    const [framework, detectedSites, tsConfigPath, tailwindConfig] = await Promise.all([
        detectFrameworkTS(workspaceRoot),
        detectDevServers(),
        detectTsConfig(workspaceRoot),
        detectTailwind(workspaceRoot),
    ]);

    const preferredPort = workspaceRoot.toLowerCase().includes('zenith-demo') ? '3009' : null;
    let devServer = detectedSites.find(s => preferredPort && s.includes(preferredPort)) || detectedSites[0];
    
    // Final fallback (Surgical Lockdown: Force 3009 for Demo)
    if (!devServer || (preferredPort && !devServer.includes(preferredPort))) {
        devServer = preferredPort ? `http://127.0.0.1:${preferredPort}` : 'http://127.0.0.1:3000';
    }

    // Safety: If somehow we still got a non-local URL, set it back to local
    if (devServer.includes('enterprisedb.com') || devServer.includes(':8080')) {
        devServer = 'http://127.0.0.1:3009';
    }

    const config: ProjectConfig = {
        framework,
        devServerUrl: devServer,
        detectedSites,
        tsConfigPath,
        tailwindConfig,
        autoDetected: true,
    };

    // Offer to save (non-blocking) only if a known framework is detected
    if (framework !== 'Unknown') {
        vscode.window.showInformationMessage(
            `Zenith detected ${framework} project on ${path.basename(workspaceRoot)}.`,
            'Save Config', 'Dismiss'
        ).then(async (choice) => {
            if (choice === 'Save Config') {
                await writeAutoConfig(configPath, config);
                vscode.window.showInformationMessage(`Saved zenith.config.ts to ${workspaceRoot}`);
            }
        });
    }

    return config;
}

export interface ProjectConfig {
    framework: string;
    devServerUrl: string;
    detectedSites: string[];
    tsConfigPath: string | null;
    tailwindConfig: string | null;
    autoDetected: boolean;
}

async function detectFrameworkTS(root: string): Promise<string> {
    const pkgPath = path.join(root, 'package.json');
    try {
        const raw = await fs.promises.readFile(pkgPath, 'utf8');
        const pkg = JSON.parse(raw);
        const allDeps = new Set<string>([
            ...Object.keys(pkg.dependencies ?? {}),
            ...Object.keys(pkg.devDependencies ?? {}),
            ...Object.keys(pkg.peerDependencies ?? {}),
        ]);
        const devScript = pkg.scripts?.dev ?? '';
        const buildScript = pkg.scripts?.build ?? '';

        if (allDeps.has('next') || devScript.includes('next')) return 'NextJs';
        if (allDeps.has('@remix-run/react') || devScript.includes('remix')) return 'Remix';
        if (allDeps.has('astro') || devScript.includes('astro')) return 'Astro';
        if (allDeps.has('nuxt') || devScript.includes('nuxt')) return 'Nuxt';
        if (allDeps.has('@sveltejs/kit') || devScript.includes('svelte')) return 'SvelteKit';
        if (allDeps.has('vite') || devScript.includes('vite') || buildScript.includes('vite')) return 'Vite';
        if (allDeps.has('react-scripts') || devScript.includes('react-scripts')) return 'CreateReactApp';
        if (allDeps.has('@angular/core')) return 'Angular';
    } catch { /* bad package.json or missing */ }
    return 'Unknown';
}

async function detectTsConfig(root: string): Promise<string | null> {
    const candidates = ['tsconfig.json', 'tsconfig.app.json', 'jsconfig.json']
        .map(name => path.join(root, name));

    const checks = candidates.map(p =>
        fs.promises.access(p, fs.constants.F_OK)
            .then(() => p)
            .catch(() => null)
    );

    const results = await Promise.all(checks);
    return results.find(r => r !== null) ?? null;
}

async function detectTailwind(root: string): Promise<string | null> {
    const candidates = [
        'tailwind.config.ts', 'tailwind.config.js',
        'tailwind.config.mjs', 'tailwind.config.cjs',
    ].map(name => path.join(root, name));

    const results = await Promise.all(
        candidates.map(p =>
            fs.promises.access(p, fs.constants.F_OK)
                .then(() => p)
                .catch(() => null)
        )
    );

    return results.find(r => r !== null) ?? null;
}

function loadUserConfig(_configPath: string): ProjectConfig {
    // User config file loading — for now return defaults; full implementation
    // would use require() or ts-node to load the config
    return { framework: 'Unknown', devServerUrl: 'http://127.0.0.1:3000', detectedSites: [], tsConfigPath: null, tailwindConfig: null, autoDetected: false };
}

async function writeAutoConfig(configPath: string, config: ProjectConfig): Promise<void> {
    const content = `// Auto-generated by Zenith — edit as needed
export default {
    framework: '${config.framework}',
    devServerUrl: '${config.devServerUrl}',
    tsConfigPath: ${config.tsConfigPath ? `'${config.tsConfigPath.replace(/\\/g, '/')}'` : 'null'},
    tailwindConfig: ${config.tailwindConfig ? `'${config.tailwindConfig.replace(/\\/g, '/')}'` : 'null'},
};
`;
    await fs.promises.writeFile(configPath, content, 'utf8');
}

// ---------------------------------------------------------------------------
// Global Ghost Index path (Change #6)
// ---------------------------------------------------------------------------

function workspaceIndexKey(workspaceRoot: string): string {
    const normalized = workspaceRoot
        .replace(/\\/g, '/')           // backslash → forward slash
        .replace(/\/+$/, '')           // strip trailing slashes
        .toLowerCase();                // case-insensitive (Windows)
    return fnv1aU32(normalized).toString(16).padStart(8, '0');
}

async function getGlobalIndexPath(workspaceRoot: string): Promise<string> {
    const key = workspaceIndexKey(workspaceRoot); // stable across OSes
    const dir = path.join(extensionContext.globalStorageUri.fsPath, 'indices');
    await fs.promises.mkdir(dir, { recursive: true });
    return path.join(dir, `${key}.msgpack`);
}

// ---------------------------------------------------------------------------
// Multi-root workspace helpers (Change #7)
// ---------------------------------------------------------------------------

function getWorkspaceRootForFile(filePath: string): string | undefined {
    if (!filePath) return undefined;
    
    // v3.11 Monorepo Hardening: Search for the closest project root (package.json)
    // This ensures hash synchronization with the Vite plugin in subfolders.
    let current = path.dirname(filePath);
    while (current !== path.dirname(current)) {
        if (fs.existsSync(path.join(current, 'package.json'))) {
            return current;
        }
        current = path.dirname(current);
    }
    
    // Fallback to standard VS Code logic
    const uri = vscode.Uri.file(filePath);
    return vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath;
}

/**
 * Resolve which workspace the user intends to act on:
 * - If only one folder → use it
 * - If active editor → use its workspace
 * - If multiple folders and no hint → QuickPick
 */
async function resolveTargetWorkspace(silent = false): Promise<string | undefined> {
    // v3.15 Monorepo Hard-Lock: Always favor the demo project if present
    if (MONOREPO_DEMO_LOCK && fs.existsSync(MONOREPO_DEMO_LOCK)) {
        return MONOREPO_DEMO_LOCK;
    }

    const folders = vscode.workspace.workspaceFolders ?? [];

    if (folders.length === 0) {
        if (!silent) vscode.window.showWarningMessage('Zenith: Open a folder first.');
        return undefined;
    }

    // High Priority: Always check the active editor first (Change #10)
    const activeFile = vscode.window.activeTextEditor?.document.uri.fsPath;
    if (activeFile) {
        let root = getWorkspaceRootForFile(activeFile);
        if (root) {
            const lowerRoot = root.toLowerCase();
            const isExcluded = lowerRoot.includes('zenith-extension') || lowerRoot.includes('zenith-vite-plugin');

            if (isExcluded) {
                // If focused on Zenith source code, stick to the last valid project
                if (lastValidWorkspaceRoot) return lastValidWorkspaceRoot;
            } else {
                // If focused on a new valid project, update the sticky root
                lastValidWorkspaceRoot = root;
                return root;
            }
        }
    }

    if (folders.length === 1) {
        const root = folders[0].uri.fsPath;
        const lowerRoot = root.toLowerCase();
        if (!lowerRoot.includes('zenith-extension') && !lowerRoot.includes('zenith-vite-plugin')) {
            lastValidWorkspaceRoot = root;
        }
        return root;
    }

    // Multiple roots and no active editor — ask the user
    const picked = await vscode.window.showQuickPick(
        folders.map(f => ({ label: f.name, description: f.uri.fsPath, root: f.uri.fsPath })),
        { placeHolder: 'Select workspace to open Zenith for' }
    );
    return picked?.root;
}

// ---------------------------------------------------------------------------
// Status Bar (Change #9)
// ---------------------------------------------------------------------------

function updateStatusBar(workspaceRoot: string | undefined) {
    if (!workspaceRoot) {
        statusBar.text = '$(symbol-color) Zenith';
        statusBar.tooltip = 'Open a workspace to use Zenith';
        statusBar.backgroundColor = undefined;
        return;
    }

    const handle = activeSidecars.get(workspaceRoot);

    if (!handle) {
        statusBar.text = '$(symbol-color) Zenith: Off';
        statusBar.tooltip = 'Click to start Zenith';
        statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        return;
    }

    // Guard against missing fields on partially-initialized handle
    const staged = handle.stagedCount ?? 0;
    const latency = handle.latencyMs ?? '…';

    switch (handle.state) {
        case 'starting':
            statusBar.text = '$(sync~spin) Zenith: Starting…';
            statusBar.backgroundColor = undefined;
            statusBar.tooltip = `Starting sidecar for ${path.basename(workspaceRoot)}`;
            break;
        case 'ready':
            statusBar.text = staged > 0
                ? `$(symbol-color) Zenith: ${staged} staged`
                : `$(symbol-color) Zenith: Ready`;
            statusBar.tooltip = `${handle.framework} · ${path.basename(workspaceRoot)} · ${latency}ms`;
            statusBar.backgroundColor = undefined;
            break;
        case 'error':
            statusBar.text = '$(error) Zenith: Error';
            statusBar.tooltip = 'Click to restart sidecar';
            statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            break;
        default:
            statusBar.text = '$(symbol-color) Zenith';
            statusBar.backgroundColor = undefined;
    }
}

// ---------------------------------------------------------------------------
// Settings helpers (Change #8)
// ---------------------------------------------------------------------------

interface ZenithConfig {
    autoStart: boolean;
    devServerPort: number;
    sidecarPort: number;
    sandboxPort: number;
    showWelcome: boolean;
    logLevel: string;
    launchInSeparateWindow: boolean;
}

function zenithConfig(): ZenithConfig {
    const cfg = vscode.workspace.getConfiguration('zenith');
    return {
        autoStart: cfg.get<boolean>('autoStart', true),
        devServerPort: cfg.get<number>('devServerPort', 0),
        sidecarPort: cfg.get<number>('sidecarPort', 8083),
        sandboxPort: cfg.get<number>('sandboxPort', 3111),
        showWelcome: cfg.get<boolean>('showWelcome', true),
        logLevel: cfg.get<string>('logLevel', 'info'),
        launchInSeparateWindow: cfg.get<boolean>('launchInSeparateWindow', true),
    };
}

// ---------------------------------------------------------------------------
// FNV-1a u32 hash (must match workspace_hash() in Rust)
// ---------------------------------------------------------------------------

export function fnv1aU32(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
}

/** @deprecated Use fnv1aU32; kept for backward compat */
export function workspaceHash(canonicalPath: string): string {
    const normalized = process.platform === 'win32'
        ? canonicalPath.toLowerCase().replace(/\\/g, '/')
        : canonicalPath;
    return fnv1aU32(normalized).toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------------------
// Webview message handler (shared between panel and sidebar view)
// ---------------------------------------------------------------------------

async function handleWebviewMessage(
    handle: SidecarHandle | undefined,
    message: any,
    webview: vscode.Webview,
    root: string,
    context: vscode.ExtensionContext
) {
    const command = message.command || message.type;

    switch (command) {
        case 'ready':
            const config = await initializeProject(root);
            webview.postMessage({
                type: 'projectInfo',
                name: path.basename(root),
                framework: handle?.framework ?? 'Unknown',
                port: zenithConfig().sidecarPort,
                devServerUrl: handle ? `http://127.0.0.1:${handle.manager.sandboxPort}` : config.devServerUrl,
                surgical: vscode.workspace.getConfiguration('zenith').get('surgicalMode', false)
            });
            return;

        case 'stage':
            try {
                if (!message.intent) throw new Error('Missing intent');

                // Fix I: Send visual patch FIRST — before the async sidecar RPC call
                // This gives ~0ms visual feedback regardless of sidecar latency
                webview.postMessage({
                    type: 'zenithForwardToFrame',
                    payload: {
                        type: 'zenithPatchStyle',
                        id: message.intent.element || `gen-${Math.random().toString(36).slice(2, 9)}`,
                        property: message.intent.property,
                        value: message.intent.value
                    }
                });

                // Then commit durably to the sidecar (async, may take 10-100ms)
                await vscode.commands.executeCommand('zenith.engine.stage', message.intent);
                
                // Broadcase new stagedCount immediately after staging
                if (handle) {
                   webview.postMessage({ type: 'status', connected: true, stagedCount: handle.stagedCount });
                }
                
                webview.postMessage({ type: 'stageResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'stageResult', success: false, error: e.message });
            }
            return;

        case 'commit':
            try {
                await vscode.commands.executeCommand('zenith.engine.commit', message.zenithId);
                webview.postMessage({ type: 'commitResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'commitResult', success: false, error: e.message ?? JSON.stringify(e) });
            }
            return;

        case 'openTraceLog': {
            if (!root) return;
            const logPath = path.join(root, '.zenith', 'sidecar_live.log');
            if (fs.existsSync(logPath)) {
                const uri = vscode.Uri.file(logPath);
                await vscode.window.showTextDocument(uri, { preview: false });
            } else {
                vscode.window.showErrorMessage('Zenith trace log not found yet. Try performing an action first.');
            }
            return;
        }

        case 'manualConnect':
            try {
                const url = message.url;
                const folders = vscode.workspace.workspaceFolders ?? [];
                
                // Find which workspace this URL likely belongs to
                // For now, we'll try to match it based on port or folder proximity
                // In a perfect world, we probe each folder's dev sites.
                let targetRoot = root; // default to current
                
                for (const folder of folders) {
                    const folderPath = folder.uri.fsPath;
                    // If the folder is zenith-demo and port is 3009, it's a match
                    if (folderPath.includes('zenith-demo') && url.includes('3009')) {
                        targetRoot = folderPath;
                        break;
                    }
                    // Generic fallback: if only one folder is open, it's probably it
                    if (folders.length === 1) {
                        targetRoot = folder.uri.fsPath;
                    }
                }

                if (ZenithPanel.currentPanel) {
                    ZenithPanel.currentPanel.workspaceRoot = targetRoot;
                }
                
                // Re-initialize for the new root
                const newHandle = activeSidecars.get(targetRoot);
                const config = await initializeProject(targetRoot);
                
                webview.postMessage({
                    type: 'projectInfo',
                    name: path.basename(targetRoot),
                    framework: newHandle?.framework ?? 'Unknown',
                    port: newHandle?.manager.port ?? zenithConfig().sidecarPort,
                    devServerUrl: url, // user the manually provided one
                    surgical: vscode.workspace.getConfiguration('zenith').get('surgicalMode', false)
                });

                if (newHandle?.state === 'ready') {
                    webview.postMessage({
                        type: 'sidecarState',
                        state: 'ready',
                        port: newHandle.manager.port,
                        workspaceRoot: targetRoot
                    });
                }
                
                vscode.window.showInformationMessage(`Zenith: Switched context to ${path.basename(targetRoot)}`);
            } catch (e: any) {
                vscode.window.showErrorMessage(`Manual connect failed: ${e.message}`);
            }
            return;

        case 'undo':
            try {
                if (!handle) throw new Error('Not connected to sidecar');
                await handle.rpc.call('vfs.undo', []);
                webview.postMessage({ type: 'undoResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'undoResult', success: false, error: e.message });
            }
            return;

        case 'redo':
            try {
                if (!handle) throw new Error('Not connected to sidecar');
                await handle.rpc.call('vfs.redo', []);
                webview.postMessage({ type: 'redoResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'redoResult', success: false, error: e.message });
            }
            return;

        case 'duplicateNode':
            try {
                // v5.3: Flatten structure for Rust MutationIntent internal tagging (Patch 14)
                const intent = { 
                    type: 'DuplicateNode', 
                    node: message.id, 
                    timestamp: Date.now() 
                };
                await vscode.commands.executeCommand('zenith.engine.stage', intent);
                webview.postMessage({ type: 'duplicateResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'duplicateResult', success: false, error: e.message });
            }
            return;

        case 'deleteNode':
            try {
                // v5.3: Standardized flattened intent (Patch 16)
                const intent = { 
                    type: 'DeleteNode', 
                    node: message.id, 
                    timestamp: Date.now() 
                };
                await vscode.commands.executeCommand('zenith.engine.stage', intent);
                webview.postMessage({ type: 'deleteResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'deleteResult', success: false, error: e.message });
            }
            return;

        case 'moveNode':
            try {
                // v5.3: Standardized flattened Reorder intent (Patch 16)
                const intent = {
                    type: 'Reorder',
                    parent: message.parentId,
                    old_order: message.oldOrder,
                    new_order: message.newOrder,
                    timestamp: Date.now()
                };
                await vscode.commands.executeCommand('zenith.engine.stage', intent);
                webview.postMessage({ type: 'moveResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'moveResult', success: false, error: e.message });
            }
            return;

        case 'groupNodes':
            try {
                // v5.6: Corrected to singular 'GroupNode' for Rust sync (Patch 20)
                const intent = {
                    type: 'GroupNode', 
                    node: message.ids[0], 
                    container_tag: message.containerTag, 
                    timestamp: Date.now() 
                };
                await vscode.commands.executeCommand('zenith.engine.stage', intent);
                webview.postMessage({ type: 'groupResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'groupResult', success: false, error: e.message });
            }
            return;

        case 'connect':
            try {
                // message.url is like ws://127.0.0.1:8082
                const match = message.url.match(/:(\d+)/);
                if (match) {
                    const port = parseInt(match[1], 10);
                    
                    // Notify webview we are attempting
                    webview.postMessage({ type: 'sidecarState', state: 'connecting', port });

                    // Update sidecarPort setting
                    await vscode.workspace.getConfiguration('zenith').update('sidecarPort', port, vscode.ConfigurationTarget.Global);
                    
                    // This will probe and update the activeSidecars map
                    await ensureSidecarForWorkspace(root);
                    
                    webview.postMessage({ type: 'log', text: `Connected to sidecar on port ${port}`, level: 'success' });
                }
            } catch (e: any) {
                webview.postMessage({ type: 'sidecarState', state: 'error', error: e.message });
                webview.postMessage({ type: 'log', text: `Manual connect failed: ${e.message}`, level: 'error' });
            }
            return;

        case 'popOut':
            // If already in a panel, and mode is 'window', just move it.
            const existingPanel = Array.from(activePanels).find(p => p.getWebview() === webview);
            const mode = message.mode || 'window';

            if (existingPanel && mode === 'window') {
                existingPanel.reveal();
                vscode.commands.executeCommand('workbench.action.moveEditorToNewWindow');
                return;
            }

            if (mode === 'editor') {
                // Just create beside if not already there
                ZenithPanel.createOrShow(
                    context.extensionUri,
                    handle?.rpc,
                    root,
                    context,
                    vscode.ViewColumn.Beside,
                    false // Not popout mode
                );
                return;
            }

            const newPanel = ZenithPanel.createOrShow(
                context.extensionUri,
                handle?.rpc,
                root,
                context,
                vscode.ViewColumn.Beside,
                true // Popout mode
            );
            
            if (newPanel && mode === 'window') {
                setTimeout(() => {
                    vscode.commands.executeCommand('workbench.action.moveEditorToNewWindow');
                }, 200);
            }
            return;

        case 'toggleSurgical':
            vscode.commands.executeCommand('zenith.surgicalMode.toggle');
            return;

        case 'hardenWal':
            try {
                if (!handle) throw new Error('Not connected to sidecar');
                await handle.rpc.call('vfs.harden_wal', []);
                webview.postMessage({ type: 'hardenWalResult', success: true });
                webview.postMessage({ type: 'log', text: 'WAL Hardened: Log truncated successfully', level: 'success' });
            } catch (e: any) {
                webview.postMessage({ type: 'hardenWalResult', success: false, error: e.message });
                webview.postMessage({ type: 'log', text: `WAL Hardening failed: ${e.message}`, level: 'error' });
            }
            return;

        case 'detectDevServer':
            resolveDevServerUrl(root).then((url) => {
                if (url) {
                    webview.postMessage({ type: 'devServerDetected', url });
                }
            });
            return;

        case 'openNewInstance':
            ZenithPanel.createOrShow(
                context.extensionUri,
                handle?.rpc,
                root,
                context,
                vscode.ViewColumn.Beside,
                true, // popout mode bypasses the single currentPanel logic
                true // createNew flag
            );
            return;

        case 'zenithTextEdit':
            try {
                if (!handle) throw new Error('Not connected to sidecar');
                console.log(`[ZENITH-EXT] Processing zenithTextEdit: ${message.zenithId} -> "${message.newText}"`);
                webview.postMessage({ type: 'log', text: `[EXT] Patching text for ${message.zenithId}...`, level: 'info' });
                
                const txId = generateZenithUuid();
                
                // Stage the text change (Aligning with Bridge 'content' property)
                await vscode.commands.executeCommand('zenith.engine.stage', {
                    type: 'TextChange',
                    element: message.zenithId,
                    newText: message.content || message.newText,
                });
                
                // v11.3: MANUAL PERSISTENCE — Removed immediate commit. 
                // StagedCount is incremented inside zenith.engine.stage.
                
                webview.postMessage({ type: 'status', connected: true, stagedCount: handle.stagedCount });
                webview.postMessage({ type: 'log', text: `Staged text change: "${message.newText.slice(0, 20)}..."`, level: 'success' });
            } catch (e: any) {
                webview.postMessage({ type: 'log', text: `Text edit failed: ${e.message}`, level: 'error' });
            }
            return;

        case 'healSession':
            try {
                if (!handle) throw new Error('Not connected to sidecar');
                webview.postMessage({ type: 'log', text: `[EXT] Triggering Autonomous Heal RPC...`, level: 'warn' });
                
                await vscode.commands.executeCommand('zenith.engine.heal');
                
                webview.postMessage({ type: 'healResult', success: true });
                webview.postMessage({ type: 'log', text: `System Healed: Staging layer reset.`, level: 'success' });
            } catch (e: any) {
                webview.postMessage({ type: 'healResult', success: false, error: e.message });
            }
            return;

        case 'runDeepAudit':
            // Logic to trigger the bridge scan
            webview.postMessage({ type: 'bridge-msg', payload: { type: 'zenithDeepAudit' } });
            return;

        case 'patchStyle':
        case 'stage': {
            const isText = message.type === 'zenithTextEdit' || message.property === 'textContent';
            const txId = generateZenithUuid();
            
            const rpcIntent = message.intent || (isText ? {
                type: 'TextChange',
                element: message.zenithId,
                newText: message.newText || message.value,
            } : {
                type: 'PropertyChange',
                element: message.zenithId,
                property: message.property,
                value: message.value,
            });

            try {
                if (!handle) throw new Error('Not connected to sidecar');
                
                const zenithId = message.zenithId || message.element;
                const signature = message.signature;

                if (zenithId) {
                    await vscode.commands.executeCommand('zenith.engine.stage', rpcIntent);
                } else if (signature) {
                    // v11.4: Fix missing txId in universal staging
                    await handle.rpc.call('vfs.stage_universal', [
                        txId,
                        signature,
                        message.property,
                        message.value,
                        root
                    ]);
                }
                
                if (message.liveSave) {
                   await vscode.commands.executeCommand('zenith.engine.commit', zenithId || '');
                }

                webview.postMessage({ type: 'status', connected: true, stagedCount: handle.stagedCount });
            } catch (e: any) {
                webview.postMessage({ type: 'log', text: `Failed to stage design: ${e.message}`, level: 'error' });
            }
        }
            return;

        case 'zenithBatchPatch':
            try {
                if (!handle) throw new Error('Not connected to sidecar');
                const { zenithId, signature, styles } = message;
                
                // v5.0 Force UUID parity across all transactions
                const txId = generateZenithUuid();

                if (zenithId) {
                    // Optimized batch staged for existing zenith elements
                    await handle.rpc.call('zenith.engine.stage_batch', [txId, zenithId, styles]);
                    handle.stagedCount++;
                } else if (signature) {
                    // Batch for universal elements (future optimization)
                    for (const [prop, val] of Object.entries(styles)) {
                        await handle.rpc.call('vfs.stage_universal', [txId, signature, prop, val, root]);
                        handle.stagedCount++;
                    }
                }
                
                updateStatusBar(root);
                webview.postMessage({ type: 'status', connected: true, stagedCount: handle.stagedCount });
                webview.postMessage({ type: 'log', text: `Batch update applied to ${zenithId || 'selection'}`, level: 'success' });
            } catch (e: any) {
                webview.postMessage({ type: 'log', text: `Batch patch failed: ${e.message}`, level: 'error' });
            }
            return;

        case 'universalStage':
            try {
                if (!handle) throw new Error('Not connected to sidecar');
                // Use a new RPC method for signature-based staging
                await handle.rpc.call('vfs.stage_universal', [
                    message.signature,
                    message.property,
                    message.value,
                    root
                ]);
                handle.stagedCount++;
                updateStatusBar(root);
                webview.postMessage({ type: 'status', connected: true, stagedCount: handle.stagedCount });
            } catch (e: any) {
                webview.postMessage({ type: 'log', text: `Universal stage failed: ${e.message}`, level: 'error' });
            }
            return;

        case 'commitAll':
            try {
                // Call vfs.commit on the sidecar
                await vscode.commands.executeCommand('zenith.engine.commit', ''); 
                
                // Broadcast immediate update for stagedCount (reset to 0)
                webview.postMessage({
                  type: 'status',
                  connected: true,
                  stagedCount: 0
                });

                webview.postMessage({ type: 'log', text: 'All changes committed to source code!', level: 'success' });
            } catch (e: any) {
                webview.postMessage({ type: 'log', text: `Commit failed: ${e.message}`, level: 'error' });
            }
            return;

        case 'zenithJumpToSource': {
            const { source } = message;
            if (source?.fileName) {
                const uri = vscode.Uri.file(source.fileName);
                const doc = await vscode.workspace.openTextDocument(uri);
                const editor = await vscode.window.showTextDocument(doc, {
                    selection: new vscode.Range(
                        source.lineNumber - 1, 
                        source.columnNumber, 
                        source.lineNumber - 1, 
                        source.columnNumber
                    ),
                    preview: false
                });
                // Pulse the line for visibility
                vscode.commands.executeCommand('revealLine', { lineNumber: source.lineNumber - 1, at: 'center' });
            }
            return;
        }

        // v5.0 Consolidation: All structural ops route through 'structuralOperation'
        case 'duplicateNode':
        case 'deleteNode':
        case 'groupNodes':
            await handleWebviewMessage(handle, { 
                type: 'structuralOperation', 
                operation: message.type.replace('Node', '').replace('Nodes', '').toLowerCase(),
                zenithId: message.id || message.zenithId,
                payload: message.payload
            }, webview, root, context);
            return;

        case 'structuralOperation': {
            const { operation, zenithId, payload } = message;
            if (!handle) {
                webview.postMessage({ type: 'log', text: 'Structural op failed: sidecar not connected', level: 'error' });
                return;
            }
            if (!zenithId) {
                webview.postMessage({ type: 'log', text: 'Structural op failed: no element selected', level: 'warn' });
                return;
            }

            try {
                const txId = generateZenithUuid();
                let intent: any;

                switch (operation) {
                    case 'delete':
                        intent = { type: 'DeleteNode', node: zenithId, timestamp: Date.now() };
                        break;

                    case 'insert':
                        intent = {
                            type: 'InsertNode',
                            parent: zenithId,
                            index: payload?.position?.index ?? 9999,
                            nodeType: payload?.tagName ?? 'div',
                            timestamp: Date.now(),
                        };
                        break;

                    case 'group':
                        intent = {
                            type: 'GroupNode', 
                            node: zenithId,
                            containerTag: payload?.containerTag ?? 'div',
                            timestamp: Date.now(),
                        };
                        break;

                    case 'ungroup':
                        intent = { type: 'UngroupNode', node: zenithId, timestamp: Date.now() };
                        break;

                    case 'duplicate':
                        intent = { type: 'DuplicateNode', node: zenithId, timestamp: Date.now() };
                        break;

                    case 'move':
                        intent = {
                            type: 'Reorder',
                            parent: payload?.parentId ?? zenithId,
                            oldOrder: [],
                            newOrder: [zenithId],
                            timestamp: Date.now()
                        };
                        break;

                    case 'moveUp':
                        intent = {
                            type: 'Reorder',
                            parent: zenithId, // sidecar resolve parent
                            oldOrder: [],
                            newOrder: [`__up__:${zenithId}`],
                            timestamp: Date.now()
                        };
                        break;

                    case 'moveDown':
                        intent = {
                            type: 'Reorder',
                            parent: zenithId,
                            oldOrder: [],
                            newOrder: [`__down__:${zenithId}`],
                            timestamp: Date.now()
                        };
                        break;

                    default:
                        webview.postMessage({ type: 'log', text: `Unknown structural operation: ${operation}`, level: 'warn' });
                        return;
                }

                const result = await handle.rpc.call('zenith.engine.stage', [txId, intent]) as any;
 
                // Commit immediately for structural ops to show live in browser
                console.log(`[ZENITH-RPC] committing zenithId=${zenithId}`);
                try {
                    await handle.rpc.call('zenith.engine.commit', [zenithId]);
                } catch (e: any) {
                    console.error(`[ZENITH-RPC] Commit FAILED for zenithId=${zenithId}. Params:`, JSON.stringify([zenithId], null, 2));
                    throw e;
                }
 
                if (handle) handle.stagedCount = Math.max(0, handle.stagedCount - 1);
                updateStatusBar(root);
 
                webview.postMessage({ type: 'log', text: `${operation} applied to ${zenithId}`, level: 'success' });
                
                // v9.5 Mechanical Perfection: Defensive Optimistic Selection
                // The StageResult is adjacently tagged: { type: "Success", data: { new_zenith_id: "..." } }
                if (result?.type === 'Success' && result?.data?.new_zenith_id) {
                    webview.postMessage({ 
                        type: 'zenithStructuralOpSuccess', 
                        operation, 
                        oldId: zenithId, 
                        newId: result.data.new_zenith_id 
                    });
                }
                
                // Trigger tree refresh so LayersPanel reflects the new structure
                webview.postMessage({ type: 'zenithForwardToFrame', payload: { type: 'zenithRequestTree' } });
            } catch (e: any) {
                webview.postMessage({ type: 'log', text: `Structural op '${operation}' failed: ${e.message}`, level: 'error' });
            }
            return;
        }
    }
}


// ---------------------------------------------------------------------------
// Zenith Sidebar View Provider
// ---------------------------------------------------------------------------

class ZenithViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'zenith.designer';
    private _view?: vscode.WebviewView;
    private _lastRoot?: string;

    constructor(private readonly _context: vscode.ExtensionContext) { }

    private async _handleMessage(message: any, webview: vscode.Webview) {
        const root = await resolveTargetWorkspace();
        if (!root) return;
        const handle = activeSidecars.get(root);
        handleWebviewMessage(handle, message, webview, root, this._context);
    }

    public postMessage(message: any) {
        this._view?.webview.postMessage(message);
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._context.extensionUri,
                vscode.Uri.file(path.join(this._context.extensionUri.fsPath, 'webview-ui', 'dist'))
            ],
        };

        webviewView.webview.html = this._getHtml(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message) => {
            const root = await resolveTargetWorkspace();
            if (!root) return;
            const handle = activeSidecars.get(root);
            handleWebviewMessage(handle, message, webviewView.webview, root, this._context);
        });

        // Change #20: Push current state immediately if sidecar is already ready
        const activeFile = vscode.window.activeTextEditor?.document.uri.fsPath;
        const initialRoot = activeFile ? getWorkspaceRootForFile(activeFile) : vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        
        if (initialRoot) {
            const handle = activeSidecars.get(initialRoot);
            if (handle?.state === 'ready') {
                const actualRpcPort = handle.manager.port;
                webviewView.webview.postMessage({
                    type: 'sidecarState',
                    state: 'ready',
                    port: actualRpcPort,
                    workspaceRoot: initialRoot
                });
            }
        }
    }

    private _getHtml(webview: vscode.Webview): string {
        const nonce = this._getNonce();
        const distPath = path.join(this._context.extensionUri.fsPath, 'webview-ui', 'dist');
        const indexPath = path.join(distPath, 'index.html');
        let html = '';
        
        try {
            html = fs.readFileSync(indexPath, 'utf8');
        } catch {
            html = '<html><body>Zenith React build not found. Run "npm run build" in webview-ui.</body></html>';
        }

        const baseUri = webview.asWebviewUri(vscode.Uri.file(distPath));
        
        // Manual resolution of assets (more reliable than <base>)
        html = html.replace(/(href|src)="\.\/assets\/([^"]+)"/g, (m, attr, assetName) => {
            const uri = webview.asWebviewUri(vscode.Uri.file(path.join(distPath, 'assets', assetName)));
            return `${attr}="${uri}"`;
        });
        
        // Replace nonces and URIs
        html = html.replace(/\${nonce}/g, nonce);
        html = html.replace(/\${cspSource}/g, webview.cspSource);
        
        return html;
    }

    private _getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}


// ---------------------------------------------------------------------------
// Zenith Designer Panel
// ---------------------------------------------------------------------------

class ZenithPanel {
    public static currentPanel: ZenithPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _workspaceRoot: string;
    private readonly _extensionUri: vscode.Uri;
    private readonly _context: vscode.ExtensionContext;
    private readonly _rpc: RpcClient | undefined;
    private _disposables: vscode.Disposable[] = [];

    public get workspaceRoot(): string { return this._workspaceRoot; }
    public set workspaceRoot(newRoot: string) { this._workspaceRoot = newRoot; }

    public static postToAll(message: any) {
        for (const panel of activePanels) {
            panel._panel.webview.postMessage(message);
        }
    }

    public static createOrShow(
        extensionUri: vscode.Uri,
        rpc: RpcClient | undefined,
        workspaceRoot: string,
        context: vscode.ExtensionContext,
        column: vscode.ViewColumn = vscode.ViewColumn.One,
        popout = false,
        createNew = false,
    ): ZenithPanel | undefined {
        if (!popout && !createNew && ZenithPanel.currentPanel) {
            if (ZenithPanel.currentPanel._workspaceRoot !== workspaceRoot) {
                ZenithPanel.currentPanel.dispose();
            } else {
                ZenithPanel.currentPanel._panel.reveal(column);
                return ZenithPanel.currentPanel;
            }
        }

        const panel = vscode.window.createWebviewPanel(
            'zenithDesigner',
            '⬡ Zenith Designer',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(extensionUri.fsPath, 'webview-ui', 'dist')),
                    vscode.Uri.file(path.join(extensionUri.fsPath, 'webview'))
                ],
            }
        );

        const newPanel = new ZenithPanel(panel, extensionUri, rpc, workspaceRoot, context);
        activePanels.add(newPanel);
        if (!popout) ZenithPanel.currentPanel = newPanel;
        return newPanel;
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        rpc: RpcClient | undefined,
        workspaceRoot: string,
        context: vscode.ExtensionContext,
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._rpc = rpc;
        this._workspaceRoot = workspaceRoot;
        this._context = context;
        this._update();
        this._panel.onDidDispose(() => {
            activePanels.delete(this);
            this.dispose();
        }, null, this._disposables);
        this._panel.webview.onDidReceiveMessage(async (message) => {
            const handle = activeSidecars.get(this._workspaceRoot);
            handleWebviewMessage(handle, message, this._panel.webview, this._workspaceRoot, this._context);
        }, null, this._disposables);
    }

    public dispose() {
        ZenithPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            this._disposables.pop()?.dispose();
        }
    }

    public postMessage(message: any) {
        this._panel.webview.postMessage(message);
    }

    public getWebview(): vscode.Webview {
        return this._panel.webview;
    }

    public reveal() {
        this._panel.reveal(vscode.ViewColumn.Beside);
    }

    public showConflict(reason: string, mine: string, agent: string): void {
        this._panel.webview.postMessage({
            type: "showConflict",
            reason,
            mine,
            agent,
        });
    }

    private _update() {
        const nonce = this._getNonce();
        const distPath = path.join(this._extensionUri.fsPath, 'webview-ui', 'dist');
        const indexPath = path.join(distPath, 'index.html');
        let html = '';
        
        try {
            html = fs.readFileSync(indexPath, 'utf8');
        } catch {
            html = '<html><body>Zenith React build not found. Run "npm run build" in webview-ui.</body></html>';
        }

        const baseUri = this._panel.webview.asWebviewUri(vscode.Uri.file(distPath));
        
        // Manual resolution of assets (more reliable than <base>)
        html = html.replace(/(href|src)="\.\/assets\/([^"]+)"/g, (m, attr, assetName) => {
            const uri = this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(distPath, 'assets', assetName)));
            return `${attr}="${uri}"`;
        });

        // Replace nonces and URIs
        html = html.replace(/\${nonce}/g, nonce);
        html = html.replace(/\${cspSource}/g, this._panel.webview.cspSource);

        // v5.0 Hardened CSP for Electron/VSCode Security Parity
        const csp = [
            "default-src 'none'",
            `font-src ${this._panel.webview.cspSource} https://rsms.me https://fonts.gstatic.com https://unpkg.com https://cdn.jsdelivr.net`,
            `style-src ${this._panel.webview.cspSource} 'unsafe-inline' https://rsms.me https://fonts.googleapis.com https://unpkg.com https://cdn.jsdelivr.net`,
            `img-src ${this._panel.webview.cspSource} data: blob: https://*`,
            `script-src 'nonce-${nonce}' ${this._panel.webview.cspSource} 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net`,
            `connect-src ws://127.0.0.1:* ws://localhost:* http://127.0.0.1:* http://localhost:* https://*`,
            `frame-src http://127.0.0.1:* http://localhost:* https://*`,
        ].join('; ');

        html = html.replace('</head>', `<meta http-equiv="Content-Security-Policy" content="${csp}"><script nonce="${nonce}">console.log('⬡ ZENITH DESIGNER: REACT STUDIO INITIALIZED');</script></head>`);

        this._panel.webview.html = html;

        // Change #15: Ensure initial state is pushed, including devServerUrl if known
        const handle = activeSidecars.get(this._workspaceRoot);
        const actualRpcPort = handle?.manager.port ?? zenithConfig().sidecarPort;

        initializeProject(this._workspaceRoot).then(config => {
            this._panel.webview.postMessage({
                type: 'projectInfo',
                name: path.basename(this._workspaceRoot),
                framework: handle?.framework ?? 'Unknown',
                port: actualRpcPort,
                devServerUrl: this._workspaceRoot.toLowerCase().includes('zenith-demo') ? 'http://127.0.0.1:3009' : config.devServerUrl,
                surgical: vscode.workspace.getConfiguration('zenith').get('surgicalMode', false)
            });
            
            // Change #21: Also push sidecarState if ready
            if (handle?.state === 'ready') {
                this._panel.webview.postMessage({
                    type: 'sidecarState',
                    state: 'ready',
                    port: actualRpcPort,
                    workspaceRoot: this._workspaceRoot
                });
            }
        });
    }

    private _getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}

