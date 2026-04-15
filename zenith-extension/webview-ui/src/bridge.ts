interface VSCodeApi {
  postMessage: (msg: ZenithIpcMessage) => void;
  getState: <T>() => T;
  setState: <T>(state: T) => void;
}

export type ZenithIpcMessage = 
  | { type: 'ready' }
  | { type: 'commit' | 'commitAll' }
  | { type: 'toggleSurgical' }
  | { type: 'popOut' }
  | { type: 'setDevServerUrl'; url: string }
  | { type: 'zenithRequestTree' }
  | { type: 'zenithOpenSource'; zenithId: string; filePath?: string; line?: number }
  | { type: 'zenithTextEdit'; zenithId: string; content: string }
  | { type: 'stage'; intent: ZenithIntent; zenithStack?: any[] }
  | { type: 'structuralOperation'; operation: string; zenithId: string; payload?: any }
  | { type: 'toggleVisibility'; zenithId: string }
  | { type: 'toggleLock'; zenithId: string }
  | { type: 'hardenWal' }
  | { type: 'runDeepAudit' }
  | { type: 'healSession' }
  | { [key: string]: unknown; type: string };

export interface ZenithIntent {
  type: 'PropertyChange' | 'StructuralChange';
  element: string;
  property?: string;
  value?: string | number;
  timestamp: number;
}

declare const acquireVsCodeApi: () => VSCodeApi;

class VSCodeBridge {
  private vscode: VSCodeApi | null = typeof (window as any).acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

  postMessage(msg: ZenithIpcMessage) {
    if (this.vscode) {
      this.vscode.postMessage(msg);
    } else {
      console.warn('VSCode API not available', msg);
    }
  }

  // Helper for staging properties
  stage(element: string, property: string, value: string, stack: any[] = []) {
    this.postMessage({ 
      type: 'stage', 
      intent: { 
        type: 'PropertyChange', 
        element, 
        property, 
        value,
        timestamp: Date.now() 
      }, 
      zenithStack: stack 
    });
  }

  // Helper for committing changes
  commit() {
    this.postMessage({ type: 'commitAll' });
  }
}

export const vscode = new VSCodeBridge();

