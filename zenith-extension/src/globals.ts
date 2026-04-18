import * as vscode from 'vscode';
import { SidecarHandle } from './types';

export let extensionContext: vscode.ExtensionContext;
export let statusBar: vscode.StatusBarItem;
export let ipcChannel: vscode.OutputChannel;

export function setExtensionContext(context: vscode.ExtensionContext) {
    extensionContext = context;
}

export function setStatusBar(item: vscode.StatusBarItem) {
    statusBar = item;
}

export function setIpcChannel(channel: vscode.OutputChannel) {
    ipcChannel = channel;
}

export let sidebarProvider: any | undefined;
export function setSidebarProvider(p: any) { sidebarProvider = p; }

export type WebviewMessageHandler = (handle: any, message: any, webview: vscode.Webview, root: string, context: vscode.ExtensionContext) => Promise<void>;
let messageHandler: WebviewMessageHandler | undefined;

export function setMessageHandler(h: WebviewMessageHandler) { messageHandler = h; }
export function getMessageHandler(): WebviewMessageHandler | undefined { return messageHandler; }

export function broadcastToWebviews(message: any) {
    const payloadClone = { ...message };
    if (payloadClone.text?.length > 100) payloadClone.text = payloadClone.text.slice(0, 100) + '...';
    if (payloadClone.tree) payloadClone.tree = '[AST Tree...]';
    ipcChannel.appendLine(`[ZENITH-OMNI] IPC_TX to Webview [${message.type}]: ${JSON.stringify(payloadClone)}`);

    sidebarProvider?.postMessage(message);
    activePanels.forEach(p => p.postMessage(message));
}

export const activeSidecars = new Map<string, SidecarHandle>();
export const activePanels = new Set<any>();

export function zenithConfig() {
    return vscode.workspace.getConfiguration('zenith');
}
