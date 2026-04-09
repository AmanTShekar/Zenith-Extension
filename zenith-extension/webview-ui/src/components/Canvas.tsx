import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  useCanvasStore, 
  useSystemStore, 
  useSelectionStore, 
  useExplorerStore, 
  normalizeStyles 
} from '../stores';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { vscode } from '../bridge';
import { 
  AlertCircle, ChevronRight, Layout, Layers, Smartphone, Tablet, Monitor, 
  Maximize2, AlertTriangle, Info, Copy, Trash2, Box, Code2, MoreVertical
} from 'lucide-react';

import { useArtboardInteraction } from '../hooks/useArtboardInteraction';
import { SelectionOverlay } from './SelectionOverlay';
import { SpacingRulers } from './SpacingRulers';
import { CanvasContextMenu } from './CanvasContextMenu';

const ArtboardHeader: React.FC<any> = ({ title, w, h }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm rounded-t-2xl">
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-cyan-500/10 rounded-lg">
        <Layout className="w-3.5 h-3.5 text-cyan-400" />
      </div>
      <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">{title}</span>
    </div>
    <div className="flex items-center gap-3">
       <span className="text-[9px] font-mono text-white/30">{w}x{h}</span>
       <div className="flex gap-1">
         <div className="w-2 h-2 rounded-full bg-white/5" />
         <div className="w-2 h-2 rounded-full bg-white/5" />
         <div className="w-2 h-2 rounded-full bg-white/10" />
       </div>
    </div>
  </div>
);

const Artboard: React.FC<any> = ({ title, w, h, devServerUrl, isSelectMode }) => {
  const sandboxPort = useSystemStore(state => state.sandboxPort);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedRect = useSelectionStore(state => state.rect);
  const hoverRect = useSelectionStore(state => state.hoverRect);
  const selectedId = useSelectionStore(state => state.selectedId);
  const fiberInfo = useSelectionStore(state => state.fiberInfo);
  const explorerActions = useExplorerStore(state => state.actions);

  const { resizing, handleResizeStart } = useArtboardInteraction(iframeRef);

  // Derive the sandbox URL from the original devServerUrl
  const sandboxUrl = useMemo(() => {
    if (!devServerUrl) return '';
    try {
      const url = new URL(devServerUrl);
      url.port = sandboxPort.toString();
      return url.toString();
    } catch (e) {
      return devServerUrl;
    }
  }, [devServerUrl, sandboxPort]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'zenithSyncMode', selectMode: isSelectMode }, '*');
  }, [isSelectMode]);

  const handleLoad = () => {
    // Bridge is now injected by Sandbox Proxy (Mechanical Perfection)
  };

  // v11.0 Master Sync Listener (Receiving from Bridge)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;

      switch (data.type) {
        case 'zenithHierarchy':
          explorerActions.setTree(data.tree);
          break;
        case 'zenithHover':
          useSelectionStore.setState({ hoverRect: data.rect, hoverTag: data.tagName });
          break;
        case 'zenithSelect': // Match new name from injected bridge
          useSelectionStore.setState({
            selectedId: data.zenithId,
            rect: data.rect,
            computedStyles: data.computedStyles || {},
            fiberInfo: {
              name: data.componentName,
              source: data.source
            },
            elementSignature: { 
              tag: data.tagName ?? data.element ?? 'div', 
              classes: data.classes ?? [] 
            } 
          });
          break;
        case 'zenithRectSync':
          if (useSelectionStore.getState().selectedId === data.zenithId) {
             useSelectionStore.setState({ 
               rect: data.rect, 
               computedStyles: data.computedStyles ?? {} 
             });
          }
          break;
        case 'zenithTextEdit':
          vscode.postMessage({
            type: 'stage',
            intent: {
              type: 'TextChange',
              element: data.zenithId,
              newText: data.newText,
              timestamp: Date.now()
            }
          });
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [explorerActions]);

  // v9.0 Optimistic Style Listener (Forward to Bridge)
  useEffect(() => {
    const handlePreview = (e: any) => {
      const { zenithId, property, value, styles } = e.detail;
      iframeRef.current?.contentWindow?.postMessage({
        type: 'zenithApplyStyle',
        zenithId,
        property,
        value,
        styles
      }, '*');
    };

    window.addEventListener('zenith-preview-style', handlePreview as any);
    return () => window.removeEventListener('zenith-preview-style', handlePreview as any);
  }, []);

  return (
    <div className="flex flex-col rounded-2xl border border-white/5 bg-[#050505] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] translate-z-0">
      <ArtboardHeader title={title} w={w} h={h} />
      <div className="relative overflow-hidden" style={{ width: w, height: h }}>
        <iframe ref={iframeRef} src={sandboxUrl} onLoad={handleLoad} className="w-full h-full border-none" />
        
        {isSelectMode && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {/* 1. Spacing Rulers for hover and selection */}
            {hoverRect && <SpacingRulers rect={hoverRect} color="#00f2ff" />}
            {selectedRect && <SpacingRulers rect={selectedRect} color="#ff00ff" />}
            
            {/* 2. Hover Interaction */}
            <SelectionOverlay 
              rect={hoverRect} 
              color="#00f2ff" 
              isHover 
            />
            
            {/* 3. Primary Selection Interaction */}
            <SelectionOverlay 
              rect={selectedRect} 
              color="#ff00ff" 
              onResizeStart={handleResizeStart}
            />
          </div>
        )}
        
        {resizing && (
           <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#ff00ff] rounded-full text-[10px] font-black text-white z-50 shadow-2xl animate-bounce">
             PRO-SURGICAL SCALE: {(selectedRect?.width || 0).toFixed(0)}px
           </div>
        )}
      </div>
    </div>
  );
};

export function Canvas({ devServerUrl, isSpacePressed }: { devServerUrl: string | null; isSpacePressed: boolean }) {
  const deviceWidth = useCanvasStore(state => state.deviceWidth);
  const deviceHeight = useCanvasStore(state => state.deviceHeight);
  const viewMode = useCanvasStore(state => state.viewMode);
  const activeTool = useCanvasStore(state => state.activeTool);
  const zoom = useCanvasStore(state => state.zoom);
  const pan = useCanvasStore(state => state.pan);
  const selectedId = useSelectionStore(state => state.selectedId);
  const fiberInfo = useSelectionStore(state => state.fiberInfo);
  const { setPan, setZoom, setTool } = useCanvasStore(state => state.actions);

  const [ctxMenu, setCtxMenu] = useState<{ x: number, y: number, visible: boolean }>({ x: 0, y: 0, visible: false });
  const canvasRef = useRef<HTMLDivElement>(null);
  const isSelectMode = activeTool === 'select' && !isSpacePressed;

  // v11.4: Auto-Center Logic (Fixed closure)
  useEffect(() => {
    const { zoom: z, pan: p } = stateRef.current;
    if (canvasRef.current && z === 1 && p.x === 0 && p.y === 0) {
        setPan(100, 100); 
        setZoom(0.75); 
    }
  }, []);

  // [W11] Hardening: Use a ref-synchronized state for native event listeners.

  // This avoids 'ReferenceError: useCanvasStore is not defined' in the bundle
  // and fixes stale closure bugs in the non-passive wheel handler.
  const stateRef = useRef({ zoom, pan, selectedId, fiberInfo });
  useEffect(() => {
    stateRef.current = { zoom, pan, selectedId, fiberInfo };
  }, [zoom, pan, selectedId, fiberInfo]);

  // v7.0 Zoom-to-Mouse
  // v8.0 Master Keyboard Shortcuts (Onlook parity)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (e.key.toLowerCase() === 'v' && !cmdKey) setTool('select');
      if (e.key.toLowerCase() === 'h' && !cmdKey) setTool('hand');
      
      if (cmdKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoom(stateRef.current.zoom * 1.1);
        }
        if (e.key === '-') {
          e.preventDefault();
          setZoom(stateRef.current.zoom / 1.1);
        }
        if (e.key === '0') {
          e.preventDefault();
          setPan(0, 0);
          setZoom(1);
        }
      }

      // Surgical Operations
      const selectedId = useSelectionStore.getState().selectedId;
      if (selectedId) {
        if (cmdKey && e.key.toLowerCase() === 'd') {
          e.preventDefault();
          useSelectionStore.getState().actions.duplicateNode(selectedId);
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          useSelectionStore.getState().actions.deleteNode(selectedId);
        }
      }

      // Deselect
      if (e.key === 'Escape') {
        useSelectionStore.setState({ selectedId: null, rect: null });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, setZoom, setPan]);

  useEffect(() => {

    const el = canvasRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY;
        const factor = delta > 0 ? 0.90 : 1.11;
        const rect = el.getBoundingClientRect();
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const { zoom: currentZoom, pan: currentPan } = stateRef.current;
        const newZoom = Math.max(0.05, Math.min(10, currentZoom * factor));
        
        const newPanX = mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom);
        const newPanY = mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom);
        
        setPan(newPanX, newPanY);
        setZoom(newZoom);
      } else {
        const { pan: currentPan } = stateRef.current;
        setPan(currentPan.x - e.deltaX, currentPan.y - e.deltaY);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [setPan, setZoom]); // stateRef is stable, no need to include it here


  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'zenithContextMenu') {
        setCtxMenu({ x: e.data.x, y: e.data.y, visible: true });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div
      ref={canvasRef}
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement) !== canvasRef.current) return;
        const { fiberInfo, selectedId } = stateRef.current;
        if (fiberInfo?.source && selectedId) {
          vscode.postMessage({ 
            type: 'zenithJumpToSource', 
            id: selectedId,
            source: fiberInfo.source 
          });
        }
      }}
      onMouseDown={(e) => {
        if (activeTool === 'hand' || isSpacePressed) {
          const move = (em: MouseEvent) => {
            const currentPan = stateRef.current.pan;
            setPan(currentPan.x + em.movementX, currentPan.y + em.movementY);
          };
          const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
          window.addEventListener('mousemove', move);
          window.addEventListener('mouseup', up);
        }
      }}
      className={clsx(
        "w-full h-full overflow-hidden relative bg-[#0a0a09] transition-all",
        isSpacePressed || activeTool === 'hand' ? "cursor-grab" : "cursor-default"
      )}
    >
      <CanvasContextMenu {...ctxMenu} onClose={() => setCtxMenu(c => ({ ...c, visible: false }))} />

      {/* Figma Dots */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 0)', 
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }} 
      />

      <div 
        className="absolute top-0 left-0 transform-gpu origin-top-left"
        style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}
      >
        {!devServerUrl ? (
          <div className="p-20 text-center bg-[#1a1a1a] rounded-3xl border border-white/5 opacity-40 uppercase tracking-[0.4em] text-[10px] font-black">
            Zenith Engine Offline
          </div>
        ) : (
          <div className="flex items-center justify-center min-w-full min-h-full">
             {viewMode === 'multi' ? (
                <div className="flex items-start gap-40 p-40">
                  <Artboard title="Desktop Large" w={1440} h={900} devServerUrl={devServerUrl} isSelectMode={isSelectMode} />
                  <Artboard title="iPad Pro" w={1024} h={1366} devServerUrl={devServerUrl} isSelectMode={isSelectMode} />
                  <Artboard title="iPhone 15" w={393} h={852} devServerUrl={devServerUrl} isSelectMode={isSelectMode} />
                </div>
             ) : (
                <div className="p-40">
                  <Artboard title="Active Focus" w={deviceWidth} h={deviceHeight} devServerUrl={devServerUrl} isSelectMode={isSelectMode} />
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
