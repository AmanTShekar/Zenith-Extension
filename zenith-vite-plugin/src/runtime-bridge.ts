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

  function getRotationFromMatrix(matrix: string): number {
    if (!matrix || matrix === 'none') return 0;
    const values = matrix.split('(')[1].split(')')[0].split(',');
    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);
    // Return high-precision rotation for sub-pixel selection alignment
    return Math.atan2(b, a) * (180 / Math.PI);
  }

  function getElementDetails(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    const id = el.getAttribute('data-zenith-id');
    
    const fingerprint = el.getAttribute('data-zenith-fingerprint') || '';
    const componentName = fingerprint.split('|')[1] || el.tagName.toLowerCase();

    // Capture unrotated dimensions for layout-stable interaction
    // We use getComputedStyle to get the layout size before transforms
    const layoutWidth = parseFloat(styles.width) || el.offsetWidth;
    const layoutHeight = parseFloat(styles.height) || el.offsetHeight;
    const rotation = getRotationFromMatrix(styles.transform) || parseFloat(styles.rotate) || 0;

    return {
      zenithId: id,
      tagName: el.tagName.toLowerCase(),
      componentName,
      rect: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        layoutWidth,
        layoutHeight,
        rotation
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
        gridArea: styles.gridArea,
        transform: styles.transform,
        transformOrigin: styles.transformOrigin
      }
    };
  }

  function broadcastBounds() {
    const elements = document.querySelectorAll('[data-zenith-id]');
    const bounds = Array.from(elements).map(el => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      return {
        id: el.getAttribute('data-zenith-id'),
        rect: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            rotation: getRotationFromMatrix(styles.transform) || parseFloat(styles.rotate) || 0
        }
      };
    });
    window.parent.postMessage({ type: 'zenithSceneBoundsUpdate', bounds }, '*');
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
        broadcastBounds();
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
          const styles = window.getComputedStyle(el);
          window.parent.postMessage({
            type: 'zenithHover',
            rect: {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height,
              rotation: getRotationFromMatrix(styles.transform) || parseFloat(styles.rotate) || 0
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
          const styles = window.getComputedStyle(el);
          window.parent.postMessage({
            type: 'zenithHover',
            rect: {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height,
              rotation: getRotationFromMatrix(styles.transform) || parseFloat(styles.rotate) || 0
            },
            tagName: el.tagName.toLowerCase()
          }, '*');
        } else {
          window.parent.postMessage({ type: 'zenithHoverClear' }, '*');
        }
        break;
      }
      
      case 'zenithLiveResize': {
        const el = Array.from(document.querySelectorAll('[data-zenith-id]')).find(e => e.getAttribute('data-zenith-id') === m.id) as HTMLElement;
        if (el) {
          if (typeof (el as any).__zenith_orig_transition !== 'string') {
            (el as any).__zenith_orig_transition = el.style.transition || '';
            (el as any).__zenith_orig_willChange = el.style.willChange || '';
            (el as any).__zenith_orig_width = el.style.width || '';
            (el as any).__zenith_orig_height = el.style.height || '';
            (el as any).__zenith_orig_left = el.style.left || '';
            (el as any).__zenith_orig_top = el.style.top || '';
            (el as any).__zenith_orig_position = el.style.position || '';
          }

          el.style.setProperty('transition', 'none');
          el.style.setProperty('will-change', 'width, height, left, top');
          
          Object.entries(m.styles).forEach(([prop, val]) => {
             el.style.setProperty(prop, val as string);
          });
        }
        break;
      }
      
      case 'zenithLiveDragTransform': {
        const el = Array.from(document.querySelectorAll('[data-zenith-id]')).find(e => e.getAttribute('data-zenith-id') === m.id) as HTMLElement;
        if (el) {
          if (typeof (el as any).__zenith_orig_transform !== 'string') {
            const computedStyle = window.getComputedStyle(el);
            (el as any).__zenith_orig_transform = el.style.transform || computedStyle.transform || '';
            (el as any).__zenith_orig_rotate = el.style.rotate || computedStyle.rotate || '';
            (el as any).__zenith_orig_scale = el.style.scale || computedStyle.scale || '';
            (el as any).__zenith_orig_translate = el.style.translate || computedStyle.translate || '';
            
            (el as any).__zenith_orig_transition = el.style.transition || '';
            (el as any).__zenith_orig_zIndex = el.style.zIndex || '';
            (el as any).__zenith_orig_willChange = el.style.willChange || '';
            (el as any).__zenith_orig_pointerEvents = el.style.pointerEvents || '';
            
            // Apply isolation CSS (without taking it out of flow)
            el.style.setProperty('will-change', 'transform');
            el.style.setProperty('pointer-events', 'none');
            el.style.setProperty('z-index', '2147483647');
            el.style.setProperty('transition', 'none');
          }
          
          const origTransform = (el as any).__zenith_orig_transform;
          const baseTransform = (origTransform === 'none' || !origTransform) ? '' : origTransform;
          
          // Apply movement as a translation relative to the original state
          el.style.transform = `translate3d(${m.dx}px, ${m.dy}px, 0) ${baseTransform}`;
          
          // Preserve other modern transform properties if they exist
          if ((el as any).__zenith_orig_rotate && (el as any).__zenith_orig_rotate !== 'none') {
            el.style.rotate = (el as any).__zenith_orig_rotate;
          }
          if ((el as any).__zenith_orig_scale && (el as any).__zenith_orig_scale !== 'none') {
            el.style.scale = (el as any).__zenith_orig_scale;
          }
        }
        break;
      }
      
      case 'zenithLiveInteractionCleanup': {
        const el = Array.from(document.querySelectorAll('[data-zenith-id]')).find(e => e.getAttribute('data-zenith-id') === m.id) as HTMLElement;
        if (el) {
          if (typeof (el as any).__zenith_orig_transform === 'string') {
            el.style.transform = (el as any).__zenith_orig_transform;
            delete (el as any).__zenith_orig_transform;
          }
          if (typeof (el as any).__zenith_orig_rotate === 'string') {
            el.style.rotate = (el as any).__zenith_orig_rotate;
            delete (el as any).__zenith_orig_rotate;
          }
          if (typeof (el as any).__zenith_orig_scale === 'string') {
            el.style.scale = (el as any).__zenith_orig_scale;
            delete (el as any).__zenith_orig_scale;
          }
          if (typeof (el as any).__zenith_orig_translate === 'string') {
            el.style.translate = (el as any).__zenith_orig_translate;
            delete (el as any).__zenith_orig_translate;
          }
          if (typeof (el as any).__zenith_orig_transition === 'string') {
            el.style.transition = (el as any).__zenith_orig_transition;
            delete (el as any).__zenith_orig_transition;
          }
          if (typeof (el as any).__zenith_orig_zIndex === 'string') {
            el.style.zIndex = (el as any).__zenith_orig_zIndex;
            delete (el as any).__zenith_orig_zIndex;
          }
          if (typeof (el as any).__zenith_orig_position === 'string') {
            el.style.position = (el as any).__zenith_orig_position;
            delete (el as any).__zenith_orig_position;
          }
          if (typeof (el as any).__zenith_orig_willChange === 'string') {
            el.style.willChange = (el as any).__zenith_orig_willChange;
            delete (el as any).__zenith_orig_willChange;
          }
          if (typeof (el as any).__zenith_orig_pointerEvents === 'string') {
            el.style.pointerEvents = (el as any).__zenith_orig_pointerEvents;
            delete (el as any).__zenith_orig_pointerEvents;
          }
          if (typeof (el as any).__zenith_orig_width === 'string') {
            el.style.width = (el as any).__zenith_orig_width;
            delete (el as any).__zenith_orig_width;
          }
          if (typeof (el as any).__zenith_orig_height === 'string') {
            el.style.height = (el as any).__zenith_orig_height;
            delete (el as any).__zenith_orig_height;
          }
          if (typeof (el as any).__zenith_orig_left === 'string') {
            el.style.left = (el as any).__zenith_orig_left;
            delete (el as any).__zenith_orig_left;
          }
          if (typeof (el as any).__zenith_orig_top === 'string') {
            el.style.top = (el as any).__zenith_orig_top;
            delete (el as any).__zenith_orig_top;
          }
          
          delete (el as any).__zenith_orig_rect;
          delete (el as any).__zenith_compensateX;
          delete (el as any).__zenith_compensateY;
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
    scheduleTreeUpdate();
    scheduleBoundsUpdate();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-zenith-id'] });

  // --- 4. Event Listeners for Parity ---
  let boundsTask: number | null = null;
  const scheduleBoundsUpdate = () => {
    if (boundsTask) return;
    boundsTask = requestAnimationFrame(() => {
      broadcastBounds();
      boundsTask = null;
    });
  };

  let treeTask: number | null = null;
  const scheduleTreeUpdate = () => {
    if (treeTask) return;
    treeTask = requestAnimationFrame(() => {
      broadcastTree();
      treeTask = null;
    });
  };

  window.addEventListener('scroll', scheduleBoundsUpdate, { capture: true, passive: true });
  window.addEventListener('resize', scheduleBoundsUpdate, { passive: true });

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      scheduleBoundsUpdate();
      // Also broadcast tree if layout changes significantly
      scheduleTreeUpdate();
    });
    ro.observe(document.body);
  }

  document.addEventListener('DOMContentLoaded', () => {
    broadcastTree();
    broadcastBounds();
  });

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
