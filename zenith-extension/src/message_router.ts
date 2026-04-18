import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SidecarHandle } from './types';
import { ScrubMsgType } from './hot_path';
import { ipcChannel, zenithConfig, activePanels, sidebarProvider, activeSidecars } from './globals';
import { initializeProject } from './project_manager';
import { ensureSidecarForWorkspace, waitForStagedCount, syncSidecarStatus } from './sidecar_handler';
import { normalizePath } from './utils';
import { updateStatusBar, generateZenithUuid } from './utils';

export async function handleWebviewMessage(
    handle: SidecarHandle | undefined,
    message: any,
    webview: vscode.Webview,
    root: string,
    context: vscode.ExtensionContext
) {
    const command = message.command || message.type;
    
    // Telemetry Sync
    const payloadClone = { ...message };
    if (payloadClone.content?.length > 100) payloadClone.content = payloadClone.content.slice(0, 100) + '...';
    ipcChannel.appendLine(`[ZENITH-OMNI] IPC_RX from Webview [${command}]: ${JSON.stringify(payloadClone)}`);

    switch (command) {
        case 'ready':
            const config = await initializeProject(root);
            webview.postMessage({
                type: 'projectInfo',
                name: path.basename(root),
                framework: handle?.framework ?? 'Unknown',
                port: handle?.manager.port ?? zenithConfig().get('sidecarPort', 8082),
                devServerUrl: handle ? `http://127.0.0.1:${handle.manager.sandboxPort}` : config.devServerUrl,
                surgical: vscode.workspace.getConfiguration('zenith').get('surgicalMode', false)
            });
            return;

        case 'stage':
            try {
                if (!message.intent) throw new Error('Missing intent');
                
                // v3.8 Hot Path: Direct-to-SAB for numeric scrubs
                const val = parseFloat(message.intent.value);
                if (handle && handle.hotPathProducer && !isNaN(val)) {
                    // Map property string to ID (Must match Sidecar's registry)
                    // For now, we use a simple mapping or just pass the string if the producer supports it.
                    // Actually, let's look at hot_path.ts: it takes a numeric propertyId.
                    // Property IDs: 1:x, 2:y, 3:width, 4:height, 5:opacity, 6:rotation
                    const propMap: Record<string, number> = { 
                        'left': 1, 'top': 2, 'width': 3, 'height': 4, 
                        'opacity': 5, 'transform': 6 
                    };
                    const pid = propMap[message.intent.property];
                    if (pid) {
                        handle.hotPathProducer.writeScrub(message.intent.element, pid, val, ScrubMsgType.Scrub);
                    }
                }

                webview.postMessage({
                    type: 'zenithForwardToFrame',
                    payload: {
                        type: 'zenithPatchStyle',
                        id: message.intent.element || `gen-${Math.random().toString(36).slice(2, 9)}`,
                        property: message.intent.property,
                        value: message.intent.value
                    }
                });
                await vscode.commands.executeCommand('zenith.engine.stage', message.intent);
                if (handle) {
                   webview.postMessage({ type: 'status', connected: true, stagedCount: handle.stagedCount });
                }
                webview.postMessage({ type: 'stageResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'stageResult', success: false, error: e.message });
            }
            return;

        case 'stageBatch':
            try {
                if (!message.zenithId || !message.styles) throw new Error('Missing batch params');
                
                // v3.8 Hot Path: Direct-to-SAB for numeric scrubs
                if (handle && handle.hotPathProducer) {
                    const propMap: Record<string, number> = { 
                        'left': 1, 'top': 2, 'width': 3, 'height': 4, 
                        'opacity': 5, 'transform': 6 
                    };
                    for (const [prop, val] of Object.entries(message.styles)) {
                        const numericVal = parseFloat(val as string);
                        const pid = propMap[prop];
                        if (pid && !isNaN(numericVal)) {
                            handle.hotPathProducer.writeScrub(message.zenithId, pid, numericVal, ScrubMsgType.Scrub);
                        }
                    }
                }

                Object.entries(message.styles).forEach(([prop, val]) => {
                    webview.postMessage({
                        type: 'zenithForwardToFrame',
                        payload: {
                            type: 'zenithPatchStyle',
                            id: message.zenithId,
                            property: prop,
                            value: val
                        }
                    });
                });
                await vscode.commands.executeCommand('zenith.engine.stage_batch', message.zenithId, message.styles);
                if (handle) {
                    webview.postMessage({ type: 'status', connected: true, stagedCount: handle.stagedCount });
                }
                webview.postMessage({ type: 'stageBatchResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'stageBatchResult', success: false, error: e.message });
            }
            return;

        case 'commitAll':
            try {
                await vscode.commands.executeCommand('zenith.engine.commit');
                webview.postMessage({ type: 'commitResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'commitResult', success: false, error: e.message });
            }
            return;

        case 'undo':
            try {
                if (!handle) throw new Error('Not connected');
                await handle.rpc.call('vfs.undo', []);
                webview.postMessage({ type: 'undoResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'undoResult', success: false, error: e.message });
            }
            return;

        case 'redo':
            try {
                if (!handle) throw new Error('Not connected');
                await handle.rpc.call('vfs.redo', []);
                webview.postMessage({ type: 'redoResult', success: true });
            } catch (e: any) {
                webview.postMessage({ type: 'redoResult', success: false, error: e.message });
            }
            return;

        case 'openTraceLog': {
            if (!root) return;
            const logPath = path.join(root, '.zenith', 'sidecar_live.log');
            if (fs.existsSync(logPath)) {
                await vscode.window.showTextDocument(vscode.Uri.file(logPath), { preview: false });
            }
            return;
        }

        case 'zenithJumpToSource': {
            const { source } = message;
            if (source?.fileName) {
                const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(source.fileName));
                await vscode.window.showTextDocument(doc, {
                    selection: new vscode.Range(source.lineNumber - 1, source.columnNumber, source.lineNumber - 1, source.columnNumber),
                    preview: false
                });
                vscode.commands.executeCommand('revealLine', { lineNumber: source.lineNumber - 1, at: 'center' });
            }
            return;
        }

        case 'zenithRequestTree':
            activePanels.forEach(p => p.postMessage({ 
                type: 'zenithForwardToFrame', 
                payload: { type: 'zenithRequestTree' } 
            }));
            return;

        case 'zenithTreeUpdate':
            sidebarProvider?.postMessage({ type: 'zenithTreeUpdate', tree: message.tree });
            activePanels.forEach(p => {
                if (p.getWebview() !== webview) {
                    p.postMessage({ type: 'zenithTreeUpdate', tree: message.tree });
                }
            });
            return;

        case 'structuralOperation':
            try {
                if (!handle) throw new Error('Not connected');
                await vscode.commands.executeCommand('zenith.engine.stage', {
                    type: 'StructuralChange',
                    operation: message.operation,
                    element: message.zenithId,
                    payload: message.payload
                });
                const count = await syncSidecarStatus(root);
                updateStatusBar(root);
                webview.postMessage({ type: 'status', connected: true, stagedCount: count });
            } catch (e: any) {
                webview.postMessage({ type: 'log', text: `Structural error: ${e.message}`, level: 'error' });
            }
            return;

        case 'popOut':
            // v3.18 Decoupling: Use command to avoid circular dependency with ZenithPanel
            vscode.commands.executeCommand('zenith.visualEdit', vscode.Uri.file(path.join(root, 'index.html')));
            return;

        case 'zenithBridgeLog':
            ipcChannel.appendLine(`[BRIDGE] ${message.text}`);
            return;
    }
}
