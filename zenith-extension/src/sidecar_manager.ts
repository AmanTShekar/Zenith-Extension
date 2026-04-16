import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

function getPidFilePath(workspaceRoot: string): string {
    return path.join(workspaceRoot, '.zenith', 'sidecar.pid');
}

async function killOrphanSidecar(workspaceRoot: string): Promise<void> {
    const pidPath = getPidFilePath(workspaceRoot);
    try {
        const raw = await fs.promises.readFile(pidPath, 'utf8');
        const pid = parseInt(raw.trim(), 10);
        if (isNaN(pid)) return;

        try {
            // v3.10: Robust existence check for Windows (Patch 17)
            let alive = false;
            try {
                process.kill(pid, 0);
                alive = true;
            } catch (e: any) {
                alive = e.code === 'EPERM'; // If EPERM, it exists but we can't 'signal' it
            }

            if (alive) {
                if (process.platform === 'win32') {
                    // Taskkill is more reliable for orphaned processes on Windows
                    cp.execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
                } else {
                    process.kill(pid, 'SIGTERM');
                    await new Promise(r => setTimeout(r, 500));
                    try { process.kill(pid, 'SIGKILL'); } catch {}
                }
            }
        } catch {}
        await fs.promises.unlink(pidPath).catch(() => {});
    } catch {}
}

async function ensureExecutable(binaryPath: string): Promise<void> {
    // Windows .exe is always executable — skip
    if (process.platform === 'win32') return;

    try {
        await fs.promises.access(binaryPath, fs.constants.X_OK);
        // Already executable — nothing to do
    } catch {
        // Not executable — set the execute bit (equivalent to chmod +x)
        const stat = await fs.promises.stat(binaryPath);
        await fs.promises.chmod(binaryPath, stat.mode | 0o111);
    }
}

export class SidecarManager {
    private process: import('child_process').ChildProcess | undefined;
    public proxyAddress?: string;
    public onLog?: (data: string) => void;

    constructor(
        public readonly workspaceRoot: string,
        public readonly port: number,
        public readonly targetPort: number = 5173, // v11.0 Fix
        public readonly sandboxPort: number = 3005,
        public detectedFramework: string = 'Unknown',
        private readonly globalIndexPath?: string,
        private readonly logLevel: string = 'info',
    ) {}

    private async isPortInUse(port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const client = new (require('net').Socket)();
            client.setTimeout(200);
            client.once('error', () => { resolve(false); client.destroy(); });
            client.once('timeout', () => { resolve(false); client.destroy(); });
            client.connect(port, '127.0.0.1', () => { resolve(true); client.destroy(); });
        });
    }

    public async start(): Promise<void> {
        // Build platform-correct binary name

        const binaryName = process.platform === 'win32' ? 'zenith-sidecar.exe' : 'zenith-sidecar';
        const debugDir = path.join('target', 'debug', binaryName);

        // Candidate paths in priority order
        const candidates = [
            path.join(this.workspaceRoot, 'zenith-sidecar', debugDir),
            path.join(path.dirname(this.workspaceRoot), 'zenith-sidecar', debugDir),
            path.join(this.workspaceRoot, debugDir),
        ];

        let sidecarPath: string | undefined;
        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                sidecarPath = candidate;
                break;
            }
        }

        if (!sidecarPath) {
            const errorMsg = `Zenith Sidecar binary not found. Tried: ${candidates.join(', ')}`;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        const outputChannel = vscode.window.createOutputChannel('Zenith Sidecar');
        outputChannel.appendLine(`[Manager] Spawning sidecar: ${sidecarPath}`);
        outputChannel.appendLine(`[Manager] Workspace: ${this.workspaceRoot}`);
        outputChannel.show();

        // v12.6 Targeted Lockdown: Only kill processes holding OUR specific port
        // This avoids the 'Zombie War' where multiple folders kill each other's sidecars.
        if (process.platform === 'win32') {
            try {
                const stdout = cp.execSync(`netstat -ano | findstr :${this.port}`, { encoding: 'utf8' });
                const lines = stdout.split('\n');
                for (const line of lines) {
                    if (line.includes('LISTENING')) {
                        const parts = line.trim().split(/\s+/);
                        const pid = parts[parts.length - 1];
                        if (pid && pid !== '0') {
                            outputChannel.appendLine(`[Manager] Clearing port ${this.port} (PID: ${pid})...`);
                            try {
                                cp.execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
                            } catch (e) {
                                outputChannel.appendLine(`[Manager] Taskkill failed (already dead?): ${e}`);
                            }
                        }
                    }
                }
                outputChannel.appendLine(`[Manager] Port cleanup requested. Waiting 250ms for socket release...`);
                await new Promise(r => setTimeout(r, 250));
                outputChannel.appendLine(`[Manager] Port cleanup cycle complete.`);
            } catch {
                // netstat fails if port is totally free, which is fine
            }
        }


        // Always kill any orphan before spawning — safe to call even on clean starts
        await killOrphanSidecar(this.workspaceRoot);

        console.log(`Spawning Zenith Sidecar: ${sidecarPath} for workspace: ${this.workspaceRoot}`);

        // v3.10 Fix: Pre-create SAB file with "ZNTH" magic header
        const zenithDir = path.join(this.workspaceRoot, ".zenith");
        const sabPath = path.join(zenithDir, "sab.bin");
        if (!fs.existsSync(zenithDir)) {
            fs.mkdirSync(zenithDir, { recursive: true });
        }

        let needsInit = !fs.existsSync(sabPath) || fs.statSync(sabPath).size < 32768;
        if (!needsInit) {
            // Even if it exists, check the magic header
            const header = Buffer.alloc(4);
            const fd = fs.openSync(sabPath, 'r');
            fs.readSync(fd, header, 0, 4, 0);
            fs.closeSync(fd);
            if (header.readUInt32LE(0) !== 0x5A4E4448 && header.readUInt32LE(0) !== 0x5A4E5448) {
                needsInit = true; // Header mismatch or zeroed out
            }
        }

        if (needsInit) {
            console.log(`[Manager] Initializing SAB file: ${sabPath}`);
            const buffer = Buffer.alloc(32768, 0);
            buffer.writeUInt32LE(0x5A4E5448, 0); // "ZNTH" magic header
            fs.writeFileSync(sabPath, buffer);
            
            // Force flush to disk
            const fd = fs.openSync(sabPath, 'r+');
            fs.fsyncSync(fd);
            fs.closeSync(fd);
        }

        const spawnArgs = [
            "--workspace", this.workspaceRoot,
            "--sab-path", sabPath,
            "--port", this.port.toString(),
            "--framework", this.detectedFramework,
            "--target-port", this.targetPort.toString(), // v11.0 Fix
            "--sandbox-port", this.sandboxPort.toString(),
        ];

        // Change #6: pass global index path if available
        if (this.globalIndexPath) {
            spawnArgs.push("--global-index-path", this.globalIndexPath);
        }

        await ensureExecutable(sidecarPath);

        this.process = cp.spawn(sidecarPath, spawnArgs, {
            cwd: this.workspaceRoot,
            env: { ...process.env, RUST_LOG: this.logLevel }
        });

        // Write PID immediately so future sessions can clean up if we crash
        const pidPath = getPidFilePath(this.workspaceRoot);
        fs.promises.mkdir(path.dirname(pidPath), { recursive: true })
            .then(() => { if (this.process?.pid !== undefined) return fs.promises.writeFile(pidPath, String(this.process?.pid), 'utf8'); })
            .catch(() => {});

        // v5.1 Production Observability: Log Rotation (5MB max)
        const logPath = path.join(zenithDir, "sidecar_live.log");
        const logOldPath = logPath + ".old";
        try {
            if (fs.existsSync(logPath)) {
                const stats = fs.statSync(logPath);
                if (stats.size > 5 * 1024 * 1024) {
                    fs.renameSync(logPath, logOldPath);
                }
            }
        } catch (e) {
            console.error(`[Manager] Log rotation failed: ${e}`);
        }

        const logStream = fs.createWriteStream(logPath, { flags: 'w' }); // 'w' to clear every session
        logStream.write(`\n--- Zenith Sidecar Live Session Start: ${new Date().toISOString()} ---\n`);

        this.process.stdout?.on('data', (data: Buffer) => {
            logStream.write(data);
            const text = data.toString();
            console.log(`[Sidecar] ${text.trim()}`);
            
            if (this.onLog && (text.includes('[ZENITH-') || text.includes('[SIDECAR] Phase'))) {
                this.onLog(text);
            }
            
            for (const line of text.split('\n')) {
                if (line.startsWith('ZENITH_SOCKET:')) {
                    const rawAddr = line.slice('ZENITH_SOCKET:'.length).trim();
                    // Handle Linux abstract socket signal (Patch 14)
                    // The sidecar sends \0name. We translate to @name for standard Node/VSCode tools.
                    this.proxyAddress = rawAddr.startsWith('\0') ? '@' + rawAddr.slice(1) : rawAddr;
                } else if (line.includes('ZENITH_SHUTDOWN_CLEAN')) {
                    this.process?.emit('zenith_clean_shutdown');
                }
            }
        });

        this.process.stderr?.on('data', (data: Buffer) => {
            logStream.write(data);
            const text = data.toString();
            console.error(`[Sidecar] ${text}`);

            if (this.onLog && (text.includes('ZENITH_') || text.includes('[ZENITH-'))) {
                this.onLog(text);
            }

            if (text.includes('ZENITH_WAL_ERROR')) {
                const detail = text.replace('ZENITH_WAL_ERROR:', '').trim();
                // Fix #10: Never delete WAL. Keep in-memory state. Show non-destructive toast.
                vscode.window.showWarningMessage(
                    'Zenith: Edits staged in memory only — check disk space.',
                    'Show Details',
                    'Retry',
                    'Dismiss'
                ).then(choice => {
                    if (choice === 'Show Details') {
                        vscode.window.showErrorMessage(`WAL write failed: ${detail}. Your edits are safe in memory.`);
                    } else if (choice === 'Retry') {
                        // The sidecar retries WAL writes automatically on next stage call
                        vscode.window.showInformationMessage('Zenith will retry WAL on next edit.');
                    }
                });
            } else if (text.includes('ZENITH_ALREADY_RUNNING')) {
                outputChannel.appendLine(`[Manager] ZENITH_ALREADY_RUNNING detected. Searching for zombie processes for workspace: ${this.workspaceRoot}`);
                
                if (process.platform === 'win32') {
                    // Fix #42 & #43: Kill by workspace path to clear Named Pipes (Ghost Proxy)
                    // We search for zenith-sidecar.exe with the specific workspace in the command line
                    const normalizedRoot = this.workspaceRoot.replace(/\\/g, '\\\\');
                    const wmicCmd = `wmic process where "name='zenith-sidecar.exe' and commandline like '%${normalizedRoot}%'" get processid`;
                    
                    cp.exec(wmicCmd, (err, stdout) => {
                        if (!err && stdout) {
                            const pids = stdout.split('\n')
                                .map(line => line.trim())
                                .filter(line => line && !line.toLowerCase().includes('processid'))
                                .map(line => line.split(/\s+/)[0])
                                .filter(pid => pid && !isNaN(parseInt(pid)));

                            if (pids.length > 0) {
                                outputChannel.appendLine(`[Manager] Found ${pids.length} zombie sidecars. Terminating...`);
                                for (const pid of pids) {
                                    try { cp.execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' }); } catch {}
                                }
                            }
                        }

                        // Also check port 8083 just in case
                        cp.exec(`netstat -ano | findstr :${this.port}`, (err, stdoutPort) => {
                            if (!err && stdoutPort) {
                                const portPids = stdoutPort.split('\n')
                                    .map(line => line.trim().split(/\s+/).pop())
                                    .filter(pid => pid && pid !== '0' && !isNaN(parseInt(pid)));
                                for (const pid of portPids) {
                                    try { cp.execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' }); } catch {}
                                }
                            }

                            this.process?.kill('SIGKILL');
                            setTimeout(() => {
                                outputChannel.appendLine(`[Manager] Attempting clean restart...`);
                                this.start();
                            }, 1500);
                        });
                    });
                } else {
                    this.process?.kill('SIGKILL');
                    setTimeout(() => this.start(), 1500);
                }
            } else if (text.includes('ZENITH_ERROR')) {

                const detail = text.replace('ZENITH_ERROR:', '').trim();
                vscode.window.showErrorMessage(`Zenith sidecar error: ${detail}`);
            } else {
                outputChannel.appendLine(`[sidecar stderr] ${text.trim()}`);
            }
        });

        this.process.on('close', (code) => {
            logStream.write(`\n--- Zenith Sidecar Session End: ${new Date().toISOString()} (Code: ${code}) ---\n`);
            logStream.end();
            fs.promises.unlink(getPidFilePath(this.workspaceRoot)).catch(() => {});
            console.log(`Sidecar process exited with code ${code}`);
            if (code !== 0 && code !== null && code !== 1) { // 1 is standard kill
                vscode.window.showErrorMessage(
                    `Zenith sidecar exited unexpectedly (code ${code}). Run "Zenith: Restart Sidecar".`
                );
            }
        });

        // Wait a bit for the server to start
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    public async purgeStagedLayer(): Promise<boolean> {
        const walPath = path.join(this.workspaceRoot, '.zenith', 'staged.wal');
        try {
            if (fs.existsSync(walPath)) {
                fs.unlinkSync(walPath);
                console.log(`[SidecarManager] Manually purged staged layer: ${walPath}`);
                return true;
            }
        } catch (err) {
            console.error(`[SidecarManager] Failed to purge staged layer:`, err);
        }
        return false;
    }

    public async stop(): Promise<void> {
        if (!this.process || this.process.killed) return;

        // Ask sidecar to shut down cleanly
        const cleanShutdown = new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
                // Sidecar didn't respond in 3s — force kill
                if (this.process && !this.process.killed) {
                    this.process.kill('SIGKILL');
                }
                resolve();
            }, 3000);

            this.process?.once('zenith_clean_shutdown', () => {
                clearTimeout(timeout);
                resolve();
            });
        });

        this.process.kill('SIGTERM'); // ask nicely
        await cleanShutdown;          // wait for WAL flush confirmation
        this.process = undefined;
    }
}
