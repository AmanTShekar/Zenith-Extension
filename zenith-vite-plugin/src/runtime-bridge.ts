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
    return (el.closest('[data-zenith-id]') || el.closest('a, button, input, [onclick]')) as HTMLElement;
  }

  // --- 2.1 Global Selection Listener ---
  document.addEventListener('mousedown', (e) => {
    // Only handle left-click
    if (e.button !== 0) return;
    
    const el = (e.target as HTMLElement).closest('[data-zenith-id]') as HTMLElement;
    if (el) {
      console.log(`[BRIDGE] CLICK_SELECT | ID: ${el.getAttribute('data-zenith-id')}`);
      window.parent.postMessage({
        type: 'zenithSelect',
        ...getElementDetails(el)
      }, '*');
      
      // Prevent navigation/default if in Zenith mode (the parent will sync this)
      if ((window as any).__ZENITH_SELECT_MODE__) {
        // [Bugfix] Do NOT prevent default if the element is currently being text-edited!
        const isEditing = el.isContentEditable || el.closest('[contenteditable="true"]');
        if (!isEditing) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  }, true);

  function getElementDetails(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    const id = el.getAttribute('data-zenith-id');
    
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
        left: styles.left,
        top: styles.top,
        right: styles.right,
        bottom: styles.bottom,
        flex: styles.flex,
        gridArea: styles.gridArea
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

      case 'zenithRequestSceneBounds': {
        const elements = document.querySelectorAll('[data-zenith-id]');
        const bounds = Array.from(elements).map(el => {
          const rect = (el as HTMLElement).getBoundingClientRect();
          return {
            id: el.getAttribute('data-zenith-id'),
            rect: {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            }
          };
        });
        window.parent.postMessage({ type: 'zenithSceneBoundsUpdate', bounds }, '*');
        break;
      }

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
      
      case 'zenithGhostSync': {
        const el = Array.from(document.querySelectorAll('[data-zenith-id]')).find(e => e.getAttribute('data-zenith-id') === m.id) as HTMLElement;
        if (el) {
          let ghost = document.getElementById(`zenith-ghost-${m.id}`);
          if (!ghost) {
             ghost = el.cloneNode(true) as HTMLElement;
             ghost.id = `zenith-ghost-${m.id}`;
             ghost.removeAttribute('data-zenith-id');
             ghost.querySelectorAll('[data-zenith-id]').forEach(desc => desc.removeAttribute('data-zenith-id'));
             
             ghost.style.pointerEvents = 'none';
             ghost.style.opacity = '0.8';
             ghost.style.position = 'fixed';
             ghost.style.zIndex = '2147483647';
             ghost.style.margin = '0';
             ghost.style.transition = 'none';
             ghost.style.boxSizing = 'border-box';
             document.body.appendChild(ghost);
          }
          
          ghost.style.width = `${m.width}px`;
          ghost.style.height = `${m.height}px`;
          ghost.style.left = '0px';
          ghost.style.top = '0px';
          ghost.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`;
        }
        break;
      }

      case 'zenithSyncMode': {
        (window as any).__ZENITH_SELECT_MODE__ = m.selectMode;
        break;
      }

      case 'zenithPatchStyle': {
        const el = Array.from(document.querySelectorAll('[data-zenith-id]')).find(e => e.getAttribute('data-zenith-id') === m.id) as HTMLElement;
        if (el) {
            const ghost = document.getElementById(`zenith-ghost-${m.id}`);
            if (ghost) {
                console.log(`[BRIDGE] Cleanup ghost for ${m.id}`);
                ghost.remove();
            }
            
            const placeholder = document.getElementById(`zenith-placeholder-${m.id}`);
            if (placeholder) placeholder.remove();

            if (m.property === 'opacity' && m.value === '0.2') {
                if (typeof (el as any).__zenith_orig_style !== 'string') {
                    (el as any).__zenith_orig_style = el.getAttribute('style') || '';
                }
                el.style.opacity = '0.2';
            } else if (m.property === 'opacity' && m.value === '') {
                if (typeof (el as any).__zenith_orig_style === 'string') {
                    el.setAttribute('style', (el as any).__zenith_orig_style);
                    delete (el as any).__zenith_orig_style;
                } else {
                    el.style.opacity = '';
                }
            } else if (m.property === 'textContent') {
                el.textContent = m.value;
            } else {
                (el.style as any)[m.property] = m.value;
                if (m.property === 'position' || m.property === 'opacity') {
                    el.style.zIndex = '';
                    el.style.pointerEvents = '';
                    el.style.transform = '';
                }
            }
        }
        break;
      }

      case 'zenithBatchPatch': {
        const el = Array.from(document.querySelectorAll('[data-zenith-id]')).find(e => e.getAttribute('data-zenith-id') === m.zenithId) as HTMLElement;
        if (el) {
            const placeholder = document.getElementById(`zenith-placeholder-${m.zenithId}`);
            if (placeholder) placeholder.remove();

            Object.entries(m.styles).forEach(([prop, val]) => {
                if (prop === 'textContent') {
                    el.textContent = val as string;
                } else {
                    (el.style as any)[prop] = val;
                }
            });
            el.style.position = (m.styles as any).position || el.style.position;
            el.style.zIndex = '';
            el.style.pointerEvents = '';
            el.style.transform = '';
        }
        break;
      }

      case 'zenithSetEditable': {
        const el = Array.from(document.querySelectorAll('[data-zenith-id]')).find(e => e.getAttribute('data-zenith-id') === m.id) as HTMLElement;
        if (el) {
          console.log(`[BRIDGE] ENTER EDIT MODE: ${m.id}`);
          
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.pointerEvents = 'auto';
          el.style.userSelect = 'text';
          
          window.parent.postMessage({ type: 'zenithEditingState', id: m.id, editing: true }, '*');

          el.contentEditable = 'true';
          
          setTimeout(() => {
            el.focus();
            const range = document.createRange();
            range.selectNodeContents(el);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
            console.log(`[BRIDGE] Focused text content for editing: ${m.id}`);
          }, 10);

          const commit = () => {
            if (el.contentEditable !== 'true') return;
            console.log(`[BRIDGE] COMMIT TEXT: ${m.id}`);
            el.contentEditable = 'false';
            el.style.userSelect = '';
            el.removeEventListener('blur', commit);
            el.removeEventListener('keydown', handleKey);
            
            window.parent.postMessage({ type: 'zenithEditingState', id: m.id, editing: false }, '*');
            window.parent.postMessage({
              type: 'zenithTextUpdate',
              zenithId: m.id,
              content: el.textContent || ''
            }, '*');
          };

          const handleKey = (ev: KeyboardEvent) => {
            if (ev.key === 'Enter' && !ev.shiftKey) {
              ev.preventDefault();
              commit();
            } else if (ev.key === 'Escape') {
              console.log(`[BRIDGE] CANCEL EDIT: ${m.id}`);
              el.contentEditable = 'false';
              window.parent.postMessage({ type: 'zenithEditingState', id: m.id, editing: false }, '*');
              el.removeEventListener('blur', commit);
              el.removeEventListener('keydown', handleKey);
              broadcastTree();
            }
          };

          el.addEventListener('blur', commit);
          el.addEventListener('keydown', handleKey);
        }
        break;
      }
    }
  });

  setTimeout(broadcastTree, 500);
  
  const observer = new MutationObserver(() => {
    broadcastTree();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-zenith-id'] });

  const hot = (import.meta as any).hot;
  if (hot) {
    hot.on('zenith-hmr', (data: { file: string, patch: string, __zenith_origin: boolean }) => {
      if (!data.__zenith_origin) return;
      console.log(`[Zenith HMR] Surgical patch: ${data.file}`);
      hot.accept(data.file, (newModule: any) => {
        if (newModule) {
          broadcastTree();
        }
      });
      hot.invalidate();
    });
  }

})();
