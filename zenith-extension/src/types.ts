import * as vscode from 'vscode';
import { SidecarManager } from './sidecar_manager';
import { RpcClient } from './rpc_client';
export { RpcClient };

export type SidecarState = 'starting' | 'ready' | 'error';

export interface SidecarHandle {
    manager: SidecarManager;
    rpc: RpcClient;
    state: SidecarState;
    stagedCount: number;
    latencyMs: number;
    framework: string;
    sharedBuffer?: SharedArrayBuffer;
    hotPathProducer?: any; // To be filled by the RingBufferProducer
}

export interface HierarchyItem {
    id: string;
    tagName: string;
    className: string;
    componentName?: string;
}
