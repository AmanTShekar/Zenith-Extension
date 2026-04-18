import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as net from 'net';

export interface ProjectConfig {
    framework: string;
    devServerUrl: string;
    detectedSites: string[];
    tsConfigPath: string | null;
    tailwindConfig: string | null;
    autoDetected: boolean;
}

export async function detectFrameworkTS(root: string): Promise<string> {
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
    } catch { }
    return 'Unknown';
}

export function fnv1aU32(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
}

export function workspaceIndexKey(workspaceRoot: string): string {
    const normalized = workspaceRoot
        .replace(/\\/g, '/')          
        .replace(/\/+$/, '')          
        .toLowerCase();               
    return fnv1aU32(normalized).toString(16).padStart(8, '0');
}

import { extensionContext } from './globals';
export async function getGlobalIndexPath(workspaceRoot: string): Promise<string> {
    const key = workspaceIndexKey(workspaceRoot);
    const dir = path.join(extensionContext.globalStorageUri.fsPath, 'indices');
    await fs.promises.mkdir(dir, { recursive: true });
    return path.join(dir, `${key}.msgpack`);
}

export async function detectTsConfig(root: string): Promise<string | null> {
    const candidates = ['tsconfig.json', 'tsconfig.app.json', 'jsconfig.json']
        .map(name => path.join(root, name));

    const checks = candidates.map(p =>
        fs.promises.access(p, fs.constants.F_OK)
            .then(() => p)
            .catch(() => null)
    );

    const results = await Promise.all(checks);
    return results.find((r): r is string => r !== null) ?? null;
}

export async function detectTailwind(root: string): Promise<string | null> {
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

    return results.find((r): r is string => r !== null) ?? null;
}

export function loadUserConfig(configPath: string): ProjectConfig {
    try {
        const raw = fs.readFileSync(configPath, 'utf8');
        const frameworkMatch = raw.match(/framework:\s*['"]([^'"]+)['"]/);
        const devServerMatch = raw.match(/devServerUrl:\s*['"]([^'"]+)['"]/);
        const framework = frameworkMatch?.[1] ?? 'Unknown';
        const devServerUrl = devServerMatch?.[1] ?? 'http://127.0.0.1:3000';
        return { framework, devServerUrl, detectedSites: [], tsConfigPath: null, tailwindConfig: null, autoDetected: false };
    } catch {
        return { framework: 'Unknown', devServerUrl: 'http://127.0.0.1:3000', detectedSites: [], tsConfigPath: null, tailwindConfig: null, autoDetected: false };
    }
}

export async function detectDevServers(): Promise<string[]> {
    const ports = [3000, 3001, 3009, 5173, 5174, 8080];
    const results: string[] = [];
    for (const port of ports) {
        try {
            await new Promise((resolve, reject) => {
                const socket = new net.Socket();
                socket.setTimeout(100);
                socket.once('connect', () => { socket.destroy(); resolve(true); });
                socket.once('error', () => { socket.destroy(); reject(); });
                socket.once('timeout', () => { socket.destroy(); reject(); });
                socket.connect(port, '127.0.0.1');
            });
            results.push(`http://127.0.0.1:${port}`);
        } catch { }
    }
    return results;
}

export async function resolveProjectPort(workspaceRoot: string): Promise<number | null> {
    const config = await initializeProject(workspaceRoot);
    if (config.devServerUrl) {
        const portMatch = config.devServerUrl.match(/:(\d+)/);
        if (portMatch) return parseInt(portMatch[1], 10);
    }
    return null;
}

export async function writeAutoConfig(configPath: string, config: ProjectConfig): Promise<void> {
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

export async function initializeProject(workspaceRoot: string): Promise<ProjectConfig> {
    const configPath = path.join(workspaceRoot, 'zenith.config.ts');

    const hasConfig = await fs.promises.access(configPath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);

    if (hasConfig) {
        return loadUserConfig(configPath);
    }

    const [framework, detectedSites, tsConfigPath, tailwindConfig] = await Promise.all([
        detectFrameworkTS(workspaceRoot),
        detectDevServers(),
        detectTsConfig(workspaceRoot),
        detectTailwind(workspaceRoot),
    ]);

    const preferredPort = workspaceRoot.toLowerCase().includes('zenith-demo') ? '3009' : null;
    let devServer = detectedSites.find(s => !!(preferredPort && s.includes(preferredPort))) || detectedSites[0];
    
    if (!devServer || (preferredPort && !devServer.includes(preferredPort))) {
        devServer = preferredPort ? `http://127.0.0.1:${preferredPort}` : 'http://127.0.0.1:3000';
    }

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
