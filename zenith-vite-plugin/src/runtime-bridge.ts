/**
 * Zenith Runtime Bridge
 * 
 * Injected into the user's application iframe to enable:
 * 1. DOM Hierarchy scanning for the Layers Panel.
 * 2. Visual selection and hover tracking on the Canvas.
 */

(function() {
  if ((window as any).__ZENITH_BRIDGE_LOADED__) return;
  (window as any).__ZENITH_BRIDGE_LOADED__ = true;

  console.log('%c Zenith Bridge Active ', 'background: #00f2ff; color: #000; font-weight: bold; border-radius: 4px;');

  // --- 0. Logging Forwarder ---
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  function forwardLog(level: string, args: any[]) {
    window.parent.postMessage({ 
      type: 'zenithBridgeLog', 
      level, 
      text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') 
    }, '*');
  }

  console.log = (...args) => { originalLog(...args); forwardLog('info', args); };
  console.warn = (...args) => { originalWarn(...args); forwardLog('warn', args); };
  console.error = (...args) => { originalError(...args); forwardLog('error', args); };

  forwardLog('info', ['[BRIDGE] Bridge fully initialized and log-forwarding active.']);

  // --- 1. Tree Scanning ---

  function buildHierarchy(): any[] {
    const roots: any[] = [];
    const elements = document.querySelectorAll('[data-zenith-id]');
    
    // Simple flat-to-tree conversion based on path segments if needed, 
    // but usually we just want to reflect the DOM structure.
    
    function scanNode(el: Element): any {
        const id = el.getAttribute('data-zenith-id');
        const fingerprint = el.getAttribute('data-zenith-fingerprint');
        
        const node: any = {
            id: id || `ghost-${Math.random().toString(36).slice(2, 9)}`,
            tagName: el.tagName.toLowerCase(),
            className: el.className,
            isZenithElement: !!id,
            fingerprint,
            children: []
        };

        // Recurse into children
        for (const child of Array.from(el.children)) {
            const childNode = scanNode(child);
            if (childNode) node.children.push(childNode);
        }

        // Only include nodes that are Zenith-tagged OR have Zenith-tagged descendants
        if (node.isZenithElement || node.children.length > 0) {
            return node;
        }
        return null;
    }

    // Start from body or root
    const rootEl = document.getElementById('root') || document.body;
    const tree = scanNode(rootEl);
    return tree ? [tree] : [];
  }

  function broadcastTree() {
    const tree = buildHierarchy();
    window.parent.postMessage({ type: 'zenithTreeUpdate', tree }, '*');
  }

  // --- 2. Interaction Handlers ---

  function getElementAt(x: number, y: number): HTMLElement | null {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    return el.closest('[data-zenith-id]') as HTMLElement;
  }

  function getElementDetails(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    const id = el.getAttribute('data-zenith-id');
    
    // Extract component name from fingerprint if available
    const fingerprint = el.getAttribute('data-zenith-fingerprint') || '';
    const componentName = fingerprint.split('|')[1] || el.tagName.toLowerCase();

    return {
      zenithId: id,
      tagName: el.tagName.toLowerCase(),
      componentName,
      rect: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      },
      computedStyles: {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        fontFamily: styles.fontFamily,
        padding: styles.padding,
        margin: styles.margin,
        borderRadius: styles.borderRadius,
        borderWidth: styles.borderWidth,
        borderColor: styles.borderColor,
        display: styles.display,
        position: styles.position,
        width: styles.width,
        height: styles.height,
        opacity: styles.opacity,
      }
    };
  }

  // --- 3. Message Listener ---

  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || typeof m !== 'object') return;

    switch (m.type) {
      case 'zenithRequestTree':
        broadcastTree();
        break;

      case 'zenithSelect':
      case 'zenithForceSelect': {
        const el = m.id 
            ? Array.from(document.querySelectorAll('[data-zenith-id]')).find(e => e.getAttribute('data-zenith-id') === m.id) as HTMLElement
            : getElementAt(m.x, m.y);
            
        if (el) {
          window.parent.postMessage({
            type: 'zenithSelect',
            ...getElementDetails(el)
          }, '*');
        }
        break;
      }

      case 'zenithForceHover': {
        const el = Array.from(document.querySelectorAll('[data-zenith-id]')).find(e => e.getAttribute('data-zenith-id') === m.id) as HTMLElement;
        if (el) {
          const rect = el.getBoundingClientRect();
          window.parent.postMessage({
            type: 'zenithHover',
            rect: {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            },
            tagName: el.tagName.toLowerCase()
          }, '*');
        } else {
          window.parent.postMessage({ type: 'zenithHoverClear' }, '*');
        }
        break;
      }

      case 'zenithHover': {
        const el = getElementAt(m.x, m.y);
        if (el) {
          const rect = el.getBoundingClientRect();
          window.parent.postMessage({
            type: 'zenithHover',
            rect: {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            },
            tagName: el.tagName.toLowerCase()
          }, '*');
        } else {
          window.parent.postMessage({ type: 'zenithHoverClear' }, '*');
        }
        break;
      }
      
      case 'zenithPatchStyle': {
        // v11.3: Visual Hot-Path for instant feedback
        const el = Array.from(document.querySelectorAll('[data-zenith-id]')).find(e => e.getAttribute('data-zenith-id') === m.id) as HTMLElement;
        if (el) {
            if (m.property === 'textContent') {
                el.textContent = m.value;
            } else {
                (el.style as any)[m.property] = m.value;
            }
        }
        break;
      }

      case 'zenithBatchPatch': {
        const el = Array.from(document.querySelectorAll('[data-zenith-id]')).find(e => e.getAttribute('data-zenith-id') === m.zenithId) as HTMLElement;
        if (el) {
            Object.entries(m.styles).forEach(([prop, val]) => {
                if (prop === 'textContent') {
                    el.textContent = val as string;
                } else {
                    (el.style as any)[prop] = val;
                }
            });
        }
        break;
      }
    }
  });

  // Initial Tree Broadcast
  setTimeout(broadcastTree, 500);
  
  // Observers for dynamic updates
  const observer = new MutationObserver(() => {
    broadcastTree();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-zenith-id'] });

  // --- 4. HMR Setup ---
  const hot = (import.meta as any).hot;
  if (hot) {
    hot.on('zenith-hmr', (data: { file: string, patch: string, __zenith_origin: boolean }) => {
      if (!data.__zenith_origin) return;
      console.log(`[Zenith HMR] Applying surgical patch to ${data.file}`);
      hot.accept(data.file, (newModule: any) => {
        if (newModule) {
          console.log(`[Zenith HMR] Module ${data.file} updated successfully.`);
          broadcastTree(); // Refresh tree after content update
        }
      });
      hot.invalidate();
    });
  }

})();
