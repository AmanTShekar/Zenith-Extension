import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { activeSidecars, getMessageHandler } from './globals';
import { getWorkspaceRootForFile, normalizePath } from './utils';

export class ZenithViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'zenith.designer';
    private _view?: vscode.WebviewView;

    constructor(private readonly _context: vscode.ExtensionContext) { }

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
            const activeFile = vscode.window.activeTextEditor?.document.uri.fsPath;
            const root = activeFile ? getWorkspaceRootForFile(activeFile) : vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!root) return;
            const handle = activeSidecars.get(normalizePath(root));
            const handler = getMessageHandler();
            if (handler) {
                handler(handle, message, webviewView.webview, root, this._context);
            }
        });

        // Push current state immediately if sidecar is already ready
        const activeFile = vscode.window.activeTextEditor?.document.uri.fsPath;
        const initialRoot = activeFile ? getWorkspaceRootForFile(activeFile) : vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        
        if (initialRoot) {
            const handle = activeSidecars.get(normalizePath(initialRoot));
            if (handle?.state === 'ready') {
                webviewView.webview.postMessage({
                    type: 'sidecarState',
                    state: 'ready',
                    port: handle.manager.port,
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
        html = html.replace(/(href|src)="\.\/assets\/([^"]+)"/g, (m, attr, assetName) => {
            const uri = webview.asWebviewUri(vscode.Uri.file(path.join(distPath, 'assets', assetName)));
            return `${attr}="${uri}"`;
        });
        
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
