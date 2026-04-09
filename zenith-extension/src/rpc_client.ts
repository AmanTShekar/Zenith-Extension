import WebSocket from 'ws';

const RPC_TIMEOUTS: Record<string, number> = {
    'sidecar/ping':            1_000,   // 1s
    'sidecar/status':          2_000,   // 2s
    'element/select':          3_000,   // 3s
    'zenith.engine.preview':   2_000,   // 2s
    'zenith.engine.stage':     5_000,   // 5s
    'zenith.engine.commit':   30_000,   // 30s
    'zenith.engine.rollback':  5_000,   // 5s
    'zenith.engine.undo':      5_000,   // 5s
};

const DEFAULT_TIMEOUT = 10_000;

export class RpcClient {
    private ws: WebSocket | undefined;
    private idCounter = 1;
    private pendingRequests = new Map<number, { 
        resolve: Function, 
        reject: Function,
        timer: NodeJS.Timeout 
    }>();
    private isConnecting = false;
    private connectionPromise: Promise<void> | null = null;

    constructor(private port: number) { }

    public async connect(retries = 5): Promise<void> {
        if (this.isConnecting && this.connectionPromise) return this.connectionPromise;

        this.isConnecting = true;
        this.connectionPromise = (async () => {
            const url = `ws://127.0.0.1:${this.port}`;
            
            for (let i = 0; i < retries; i++) {
                try {
                    console.log(`Connecting to Zenith RPC: ${url} (Attempt ${i + 1}/${retries})`);
                    await this._attemptConnection(url);
                    console.log('Zenith RPC Connected');
                    this.isConnecting = false;
                    return;
                } catch (err) {
                    if (i === retries - 1) {
                        this.isConnecting = false;
                        this.connectionPromise = null;
                        throw err;
                    }
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        })();

        return this.connectionPromise;
    }

    private _attemptConnection(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.ws) {
                this.ws.removeAllListeners();
                this.ws.terminate();
            }

            this.ws = new WebSocket(url);
            
            const timeout = setTimeout(() => {
                this.ws?.terminate();
                reject(new Error('Connection timeout'));
            }, 3000);

            this.ws.on('open', () => {
                clearTimeout(timeout);
                this._setupListeners();
                resolve();
            });

            this.ws.on('error', (err: any) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    }

    private _setupListeners() {
        if (!this.ws) return;

        this.ws.on('close', () => {
            this.isConnecting = false;
            this.connectionPromise = null;
            console.log('Zenith RPC Disconnected — resetting state');
            
            for (const [id, entry] of this.pendingRequests) {
                clearTimeout(entry.timer);
                entry.reject(new Error('WebSocket disconnected'));
            }
            this.pendingRequests.clear();
            this.idCounter = 1;
        });

        this.ws.on('message', (data: any) => {
            try {
                const response = JSON.parse(data.toString());
                if (response.id && this.pendingRequests.has(response.id)) {
                    const { resolve, reject, timer } = this.pendingRequests.get(response.id)!;
                    clearTimeout(timer);
                    this.pendingRequests.delete(response.id);
                    if (response.error) {
                        reject(response.error);
                    } else {
                        resolve(response.result);
                    }
                }
            } catch (err) {
                console.error('RPC Message Parse Error:', err);
            }
        });
    }

    public async call(method: string, params: any[]): Promise<any> {
        if (!this.ws || this.ws.readyState !== 1) {
            await this.connect();
        }

        const id = this.idCounter++;
        const timeoutMs = RPC_TIMEOUTS[method] ?? DEFAULT_TIMEOUT;

        const request = {
            jsonrpc: '2.0',
            method,
            params,
            id
        };

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error(`RPC timeout: ${method} (${timeoutMs}ms)`));
                }
            }, timeoutMs);

            this.pendingRequests.set(id, {
                resolve: (v: any) => { clearTimeout(timer); resolve(v); },
                reject:  (e: any) => { clearTimeout(timer); reject(e); },
                timer
            });

            if (this.ws && this.ws.readyState === 1) {
                this.ws.send(JSON.stringify(request));
            } else {
                clearTimeout(timer);
                this.pendingRequests.delete(id);
                reject(new Error('WebSocket not ready'));
            }
        });
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }
    }
}
