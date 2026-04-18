import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ipcChannel, statusBar, activeSidecars } from './globals';

export function normalizePath(p: string): string {
    if (!p) return '';
    // Strip Windows UNC prefix if present
    let normalized = p.replace(/^\\\\\?\\/, '');
    // Standardize separators
    normalized = normalized.replace(/\\/g, '/');
    // Drive letter casing normalization (Windows)
    if (normalized.match(/^[a-zA-Z]:/)) {
        normalized = normalized[0].toLowerCase() + normalized.slice(1);
    }
    // Remove trailing slash
    if (normalized.endsWith('/') && normalized.length > 3) {
        normalized = normalized.slice(0, -1);
    }
    return normalized.trim();
}

export function generateZenithUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function getGitBranch(root: string): string | undefined {
    try {
        const headPath = path.join(root, '.git', 'HEAD');
        if (!fs.existsSync(headPath)) return undefined;
        const head = fs.readFileSync(headPath, 'utf8').trim();
        if (head.startsWith('ref: ')) {
            return head.split('/').pop();
        }
        return head.slice(0, 7);
    } catch {
        return undefined;
    }
}

export function updateStatusBar(root: string | undefined) {
    if (!statusBar) return;

    if (!root) {
        statusBar.text = '$(circle-outline) Zenith: Off';
        statusBar.backgroundColor = undefined;
        statusBar.tooltip = 'Zenith: No active project detected in this file.';
        return;
    }

    const normRoot = normalizePath(root);
    const handle = activeSidecars.get(normRoot);
    const branch = getGitBranch(root);
    const branchPrefix = branch ? `$(git-branch) ${branch} | ` : '';

    if (!handle) {
        statusBar.text = `${branchPrefix}$(circle-outline) Zenith: Disc.`;
        statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        return;
    }

    switch (handle.state) {
        case 'starting':
            statusBar.text = `${branchPrefix}$(sync~spin) Zenith: Starting...`;
            statusBar.backgroundColor = undefined;
            break;
        case 'ready':
            statusBar.text = `${branchPrefix}$(check) Zenith: Live (${handle.stagedCount})`;
            statusBar.backgroundColor = handle.stagedCount > 0 
                ? new vscode.ThemeColor('statusBarItem.warningBackground') 
                : undefined;
            break;
        case 'error':
            statusBar.text = `${branchPrefix}$(error) Zenith: Error`;
            statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            break;
    }
}

export function getWorkspaceRootForFile(filePath: string): string | undefined {
    // 1. Check monorepo sticky root first
    // (This requires access to lastValidWorkspaceRoot which is in extension.ts for now)
    
    const folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
    if (!folder) return undefined;

    let target = folder.uri.fsPath;
    
    // Check if it's the zenith-demo subfolder (v3.15 parity)
    const demoPath = path.join(target, 'zenith-demo');
    if (fs.existsSync(demoPath) && filePath.toLowerCase().includes('zenith-demo')) {
        return demoPath;
    }

    return target;
}
