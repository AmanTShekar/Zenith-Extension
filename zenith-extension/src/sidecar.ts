// ---------------------------------------------------------------------------
// Sidecar Process Manager
// ---------------------------------------------------------------------------
//
// Spawns the `zenith-sidecar` Rust binary as a child process and connects
// to its WebSocket JSON-RPC server.

import { ChildProcess, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import * as vscode from "vscode";
import WebSocket from "ws";

const DEFAULT_PORT = 9876;
const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Manages the lifecycle of the Rust sidecar process.
 */
export class SidecarManager {
  private process: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private port: number = DEFAULT_PORT;
  public sabPath: string | null = null;
  private readonly context: vscode.ExtensionContext;
  private readonly handlers = new Map<
    string,
    (params: unknown) => void
  >();
  private reconnectAttempts = 0;
  private rpcId = 0;
  private readonly pendingRequests = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (err: Error) => void }
  >();

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  private async isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const client = new (require('net').Socket)();
      client.setTimeout(200);
      client.once('error', () => { resolve(false); client.destroy(); });
      client.once('timeout', () => { resolve(false); client.destroy(); });
      client.connect(port, '127.0.0.1', () => { resolve(true); client.destroy(); });
    });
  }

  /**
   * Start the sidecar process and connect via WebSocket.
   */
  public async start(port: number = DEFAULT_PORT): Promise<void> {
    this.port = port;
    if (await this.isPortInUse(this.port)) {
      console.log(`[Zenith Sidecar] Port ${this.port} already in use. Skipping spawn.`);
      this.connectWebSocket(); // Try to connect anyway
      return;
    }

    if (this.process) {
      console.log("[Zenith Sidecar] Already running");
      return;
    }

    const binaryPath = this.findBinary();
    if (!binaryPath) {
      vscode.window.showErrorMessage(
        "Zenith: Sidecar binary not found. Running in offline mode."
      );
      return;
    }

    const workspaceRoot =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? ".";

    console.log(`[Zenith Sidecar] Spawning: ${binaryPath} on port ${port}`);

    // v3.10: Ensure binary is executable (Patch 13)
    if (process.platform !== 'win32') {
      try {
        fs.chmodSync(binaryPath, 0o755);
      } catch (err) {
        console.warn(`[Zenith Sidecar] Failed to chmod binary: ${err}`);
      }
    }

    this.sabPath = path.join(workspaceRoot, ".zenith", "sab.bin");

    this.process = spawn(binaryPath, ["--port", String(port), "--sab-path", this.sabPath], {
      cwd: workspaceRoot,
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        ZENITH_WORKSPACE: workspaceRoot,
        ZENITH_PORT: String(this.port),
        ZENITH_SAB_PATH: this.sabPath,
      },
    });

    // Log stdout/stderr
    this.process.stdout?.on("data", (data: Buffer) => {
      console.log(`[Sidecar stdout] ${data.toString().trim()}`);
    });

    this.process.stderr?.on("data", (data: Buffer) => {
      console.error(`[Sidecar stderr] ${data.toString().trim()}`);
    });

    this.process.on("exit", (code) => {
      console.log(`[Zenith Sidecar] Exited with code ${code}`);
      this.process = null;
      this.ws = null;
    });

    // Wait a moment for the sidecar to start its WebSocket server
    await this.delay(500);
    this.connectWebSocket();
  }

  /**
   * Send a JSON-RPC request to the sidecar.
   */
  send(method: string, params: unknown = {}): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn(`[Zenith Sidecar] Not connected, dropping: ${method}`);
      return;
    }

    const id = ++this.rpcId;
    const message = JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params,
    });

    this.ws.send(message);
  }

  /**
   * Send a JSON-RPC request and wait for a response.
   */
  async request(method: string, params: unknown = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Sidecar not connected"));
        return;
      }

      // v3.10: Per-method timeout configuration
      const RPC_TIMEOUTS: Record<string, number> = {
        "auditor.check": 5000,
        "auditor.update_layout": 3000,
        "engine.stage": 15000, // Heavy OT transformations can take longer
        "default": 10000
      };

      const id = ++this.rpcId;
      const timeoutMs = RPC_TIMEOUTS[method] ?? RPC_TIMEOUTS["default"];
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`RPC timeout: ${method} after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      // Store timeout to clear it on resolution
      this.pendingRequests.set(id, { 
        resolve: (val) => { clearTimeout(timeout); resolve(val); },
        reject: (err) => { clearTimeout(timeout); reject(err); }
      });

      const message = JSON.stringify({
        jsonrpc: "2.0",
        id,
        method,
        params,
      });

      this.ws.send(message);
    });
  }

  /**
   * Register a handler for a JSON-RPC notification from the sidecar.
   */
  on(method: string, handler: (params: unknown) => void): void {
    this.handlers.set(method, handler);
  }

  /**
   * Stop the sidecar process.
   */
  dispose(): void {
    this.ws?.close();
    this.ws = null;

    if (this.process) {
      this.process.kill("SIGTERM");
      this.process = null;
    }

    this.pendingRequests.clear();
    this.handlers.clear();
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  private findBinary(): string | null {
    // Check multiple locations for the sidecar binary
    const workspaceRoot =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? ".";

    const candidates = [
      // Development: cargo build output
      path.join(
        workspaceRoot,
        "zenith-sidecar",
        "target",
        "release",
        "zenith-sidecar.exe"
      ),
      path.join(
        workspaceRoot,
        "zenith-sidecar",
        "target",
        "debug",
        "zenith-sidecar.exe"
      ),
      // Bundled with extension
      path.join(
        this.context.extensionPath,
        "bin",
        "zenith-sidecar.exe"
      ),
      // Linux/Mac variants
      path.join(
        workspaceRoot,
        "zenith-sidecar",
        "target",
        "release",
        "zenith-sidecar"
      ),
      path.join(
        this.context.extensionPath,
        "bin",
        "zenith-sidecar"
      ),
    ];

    const fs = require("fs");
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  private connectWebSocket(): void {
    const url = `ws://127.0.0.1:${this.port}`;
    
    // v3.10: PID verification before connection (Patch 13)
    if (this.process && this.process.exitCode !== null) {
      console.warn(`[Zenith Sidecar] Process has exited with code ${this.process.exitCode}. Not connecting.`);
      return;
    }

    console.log(`[Zenith Sidecar] Connecting to ${url}`);

    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log("[Zenith Sidecar] WebSocket connected");
      this.reconnectAttempts = 0;
    });

    this.ws.on("message", (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.id && this.pendingRequests.has(msg.id)) {
          // This is a response to a request
          const pending = this.pendingRequests.get(msg.id)!;
          this.pendingRequests.delete(msg.id);

          if (msg.error) {
            pending.reject(new Error(msg.error.message));
          } else {
            pending.resolve(msg.result);
          }
        } else if (msg.method) {
          // This is a notification from the sidecar
          const handler = this.handlers.get(msg.method);
          if (handler) {
            handler(msg.params);
          }
        }
      } catch (err) {
        console.error("[Zenith Sidecar] Failed to parse message:", err);
      }
    });

    this.ws.on("close", () => {
      this.ws = null;
      
      // v3.10: Clear all pending RPCs on disconnect (Patch 11)
      if (this.pendingRequests.size > 0) {
        console.log(`[Zenith Sidecar] Rejecting ${this.pendingRequests.size} pending RPCs due to disconnect`);
        for (const [id, req] of this.pendingRequests) {
          req.reject(new Error("Sidecar disconnected"));
        }
        this.pendingRequests.clear();
      }

      // Auto-reconnect
      if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        this.reconnectAttempts++;
        setTimeout(() => this.connectWebSocket(), RECONNECT_DELAY_MS);
      }
    });

    this.ws.on("error", (err) => {
      console.error("[Zenith Sidecar] WebSocket error:", err.message);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
