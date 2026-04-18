import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { RpcClient } from './rpc_client';
import { activePanels, zenithConfig, activeSidecars, getMessageHandler } from './globals';
import { initializeProject } from './project_manager';
import { normalizePath } from './utils';

export class ZenithPanel {
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
            const handle = activeSidecars.get(normalizePath(this._workspaceRoot));
            const handler = getMessageHandler();
            if (handler) {
                handler(handle, message, this._panel.webview, this._workspaceRoot, this._context);
            }
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

    private _update() {
        const nonce = this._getNonce();
        const distPath = path.join(this._extensionUri.fsPath, 'webview-ui', 'dist');
        const indexPath = path.join(distPath, 'index.html');
        let html = '';
        
        try {
            html = fs.readFileSync(indexPath, 'utf8');
        } catch {
            this._panel.webview.html = '<html><body>Zenith React build not found. Run "npm run build" in webview-ui.</body></html>';
            return;
        }

        html = html.replace(/(href|src)="(\/|\.\/)?assets\/([^"]+)"/g, (m, attr, prefix, assetName) => {
            const assetUri = this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(distPath, 'assets', assetName)));
            return `${attr}="${assetUri}"`;
        });

        html = html.replace(/\${nonce}/g, nonce);
        html = html.replace(/\${cspSource}/g, this._panel.webview.cspSource);

        const csp = [
            "default-src 'none'",
            `font-src ${this._panel.webview.cspSource} https://rsms.me https://fonts.gstatic.com https://unpkg.com https://cdn.jsdelivr.net`,
            `style-src ${this._panel.webview.cspSource} 'unsafe-inline' https://rsms.me https://fonts.googleapis.com https://unpkg.com https://cdn.jsdelivr.net`,
            `img-src ${this._panel.webview.cspSource} data: blob: https://*`,
            `script-src 'nonce-${nonce}' ${this._panel.webview.cspSource} 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net`,
            `connect-src ws://127.0.0.1:* ws://localhost:* http://127.0.0.1:* http://localhost:* https://*`,
            `frame-src http://127.0.0.1:* http://localhost:* https://*`,
        ].join('; ');

        html = html.replace('</head>', `<meta http-equiv="Content-Security-Policy" content="${csp}"><script nonce="${nonce}">console.log('⬡ ZENITH PANEL: READY');</script></head>`);

        this._panel.webview.html = html;

        const handle = activeSidecars.get(normalizePath(this._workspaceRoot));
        const actualRpcPort = handle?.manager.port ?? zenithConfig().get('sidecarPort');

        initializeProject(this._workspaceRoot).then(config => {
            this._panel.webview.postMessage({
                type: 'projectInfo',
                name: path.basename(this._workspaceRoot),
                framework: handle?.framework ?? 'Unknown',
                port: actualRpcPort,
                devServerUrl: handle?.manager.sandboxPort ? `http://127.0.0.1:${handle.manager.sandboxPort}` : config.devServerUrl,
                surgical: vscode.workspace.getConfiguration('zenith').get('surgicalMode', false)
            });
            
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
