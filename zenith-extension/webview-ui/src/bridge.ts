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
  | { type: 'structuralOperation'; operation: any }
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

const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  let lastArgs: any[] | null = null;
  
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          const finalArgs = lastArgs;
          lastArgs = null;
          func.apply(this, finalArgs);
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
};

class VSCodeBridge {
  private vscode: VSCodeApi | null = typeof (window as any).acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

  postMessage(msg: ZenithIpcMessage) {
    if (this.vscode) {
      this.vscode.postMessage(msg);
    } else {
      console.warn('VSCode API not available', msg);
    }
  }

  // Throttled versions for high-frequency updates
  patchStyleThrottled = throttle((data: any) => {
    this.postMessage(data);
  }, 50);

  patchBatchThrottled = throttle((data: any) => {
    this.postMessage(data);
  }, 50);

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

