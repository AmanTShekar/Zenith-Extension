declare const acquireVsCodeApi: any;

class VSCodeBridge {
  private vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

  postMessage(msg: any) {
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
