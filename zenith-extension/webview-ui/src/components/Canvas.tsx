import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useSystemStore } from '../stores/useSystemStore';
import { useSelectionStore } from '../stores/useSelectionStore';
import { useExplorerStore } from '../stores/useExplorerStore';
import { clsx } from 'clsx';
import { Layout as LayoutIcon } from 'lucide-react';

import { useArtboardInteraction } from '../hooks/useArtboardInteraction';
import { SelectionOverlay } from './SelectionOverlay';
import { SpacingRulers } from './SpacingRulers';
import { SnapGuides } from './SnapGuides';
import { CanvasContextMenu } from './CanvasContextMenu';

const ArtboardHeader: React.FC<{ title: string; w: number; h: number }> = ({ title, w, h }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm rounded-t-2xl">
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-cyan-500/10 rounded-lg">
        <LayoutIcon className="w-3.5 h-3.5 text-cyan-400" />
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

const Artboard: React.FC<{ 
  title: string; 
  w: number; 
  h: number; 
  devServerUrl: string | null; 
  isSelectMode: boolean;
  previewMode: boolean;
}> = ({ title, w, h, devServerUrl, isSelectMode, previewMode }) => {
  const sandboxPort = useSystemStore(state => state.sandboxPort);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedRect = useSelectionStore(state => state.rect);
  const hoverRect = useSelectionStore(state => state.hoverRect);
  const explorerActions = useExplorerStore(state => state.actions);

  const zoom = useCanvasStore(state => state.zoom);
  const { interaction, guides, handleResizeStart, handleDragStart } = useArtboardInteraction(iframeRef, zoom);
  const isDragging = useSelectionStore(state => state.isDragging);
  const dropTargetRect = useSelectionStore(state => state.dropTargetRect);
  const insertionRect = useSelectionStore(state => state.insertionRect);
  const isDropTargetInvalid = useSelectionStore(state => state.isDropTargetInvalid);

  const handleMouseMove = (e: React.PointerEvent) => {
    if (previewMode || !iframeRef.current || e.buttons === 4) return; // 4 is middle button held
    const rect = iframeRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    iframeRef.current.contentWindow?.postMessage({ type: 'zenithHover', x, y }, '*');
  };

  const handleClick = (e: React.PointerEvent) => {
    // [W6] Audit Fix: Interaction Guard. 
    // Only allow left-click (0) to trigger selection. Ignore middle (1) and right (2).
    if (previewMode || !iframeRef.current || e.button !== 0) return;
    const rect = iframeRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    iframeRef.current.contentWindow?.postMessage({ type: 'zenithSelect', x, y }, '*');
  };

  const handleMouseLeave = () => {
    if (previewMode || !iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage({ type: 'zenithHover', x: -1000, y: -1000 }, '*');
    useSelectionStore.setState({ hoverRect: null, hoverTag: null });
  };

  const handleArtboardPointerDown = (e: React.PointerEvent) => {
    if (!isSelectMode || previewMode || !selectedRect) return;
    
    // Convert click to local artboard space
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    // Check if click is inside the selected element's bounds
    // We add a tiny 4px buffer for easier manipulation
    const buffer = 4;
    const isInside = 
      x >= selectedRect.x - buffer && 
      x <= (selectedRect.x + selectedRect.width + buffer) &&
      y >= selectedRect.y - buffer &&
      y <= (selectedRect.y + selectedRect.height + buffer);
      
    if (isInside && e.button === 0) {
      // It's a drag start!
      handleDragStart(e);
    }
  };

  // Derive the sandbox URL
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

  // Effect 1: Full reload ONLY when the sandbox URL changes (not on tool changes)
  useEffect(() => {
    if (!sandboxUrl || !iframeRef.current) return;
    iframeRef.current.src = 'about:blank';
    const timer = setTimeout(() => {
      if (iframeRef.current) iframeRef.current.src = sandboxUrl;
    }, 10);
    return () => clearTimeout(timer);
  }, [sandboxUrl]);

  // Effect 2: Sync interaction mode without reloading
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'zenithSyncMode', selectMode: isSelectMode }, '*');
  }, [isSelectMode]);

  const handleLoad = () => {
    // Post mode sync reliably after iframe finishes loading
    iframeRef.current?.contentWindow?.postMessage({ type: 'zenithSyncMode', selectMode: isSelectMode }, '*');
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'zenithTreeUpdate') explorerActions.setTree(data.tree);
      if (data.type === 'zenithHover' && !previewMode) {
          useSelectionStore.setState({ hoverRect: data.rect, hoverTag: data.tagName || data.element });
      }
      if (data.type === 'zenithSelect' && !previewMode) {
          useSelectionStore.setState({
            selectedId: data.zenithId,
            rect: data.rect,
            computedStyles: data.computedStyles || {},
            fiberInfo: { name: data.componentName, source: data.source },
            elementSignature: { 
              tag: data.tagName ?? data.element ?? 'div', 
              classes: data.classes ?? [], 
              textContent: data.textContent ?? '', 
              xpath: data.xpath ?? '' 
            } 
          });
      }
      if (data.type === 'zenithSceneBoundsUpdate' && !previewMode) {
          (window as any).__ZENITH_SCENE_BOUNDS__ = data.bounds;
      }
      if (data.type === 'zenithTextUpdate' && !previewMode) {
          useSelectionStore.getState().actions.updateText(data.zenithId, data.content);
      }
      if (data.type === 'zenithEditingState' && !previewMode) {
          useSelectionStore.getState().actions.setEditingText(data.editing);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [explorerActions, previewMode]);

  // Ghost sync bridge: forward throttled position updates to the iframe
  // The ghost itself is just the SelectionOverlay; we sync position so the iframe
  // can update any ghost-related CSS (e.g. debug outlines) without re-rendering React.
  useEffect(() => {
    const handleGhostCmd = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'zenithGhostSync') {
        iframeRef.current?.contentWindow?.postMessage(data, '*');
      }
    };
    window.addEventListener('message', handleGhostCmd);
    return () => window.removeEventListener('message', handleGhostCmd);
  }, [iframeRef]);

  useEffect(() => {
    const handlePreview = (e: CustomEvent<{ zenithId: string; property?: string; value?: string; styles?: Record<string, string> }>) => {
      const { zenithId, property, value, styles } = e.detail;
      const payload = styles ? { type: 'zenithBatchPatch', zenithId, styles } : { type: 'zenithPatchStyle', id: zenithId, property: property!, value: value! };
      iframeRef.current?.contentWindow?.postMessage(payload, '*');
    };
    window.addEventListener('zenith-preview-style', handlePreview as EventListener);
    return () => window.removeEventListener('zenith-preview-style', handlePreview as EventListener);
  }, []);

  return (
    <div className={clsx(
        "flex flex-col rounded-2xl border border-white/5 bg-[#050505] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] translate-z-0 transition-all duration-500",
        previewMode ? "rounded-none border-none shadow-none" : ""
    )}>
      {!previewMode && <ArtboardHeader title={title} w={w} h={h} />}
      <div 
        className="relative overflow-hidden" 
        style={{ width: w, height: h }}
        onPointerDown={handleArtboardPointerDown}
      >
        <iframe 
          ref={iframeRef} 
          src={sandboxUrl} 
          onLoad={handleLoad} 
          className={clsx(
            "w-full h-full border-none transition-all",
            "pointer-events-auto"
          )} 
        />
        
         {isSelectMode && !previewMode && (
           <div className="absolute inset-0 pointer-events-none z-30">
             {hoverRect && <SpacingRulers rect={hoverRect} color="#00f2ff" />}
             {selectedRect && <SpacingRulers rect={selectedRect} color="#ff00ff" />}
             
             {/* Alignment Guides for Smart Snapping */}
             <SnapGuides guides={guides} artboardRect={{ width: w, height: h }} />
             
             {/* DND Structural Indicators */}
             {isDragging && dropTargetRect && (
               <SelectionOverlay 
                 rect={dropTargetRect} 
                 isDropTarget 
                 isInvalid={isDropTargetInvalid} 
               />
             )}
             {isDragging && insertionRect && (
               <SelectionOverlay 
                 rect={insertionRect} 
                 isInsertion 
               />
             )}

             <SelectionOverlay 
               rect={hoverRect} 
               color="#00f2ff" 
               isHover 
             />
             <SelectionOverlay 
               rect={selectedRect} 
               color="#ff00ff" 
               isDragging={isDragging}
               onResizeStart={handleResizeStart}
               onDragStart={handleDragStart} 
             />
           </div>
         )}
      </div>
    </div>
  );
};

export function Canvas({ devServerUrl, isSpacePressed }: { devServerUrl: string | null; isSpacePressed: boolean }) {
  const deviceWidth = useCanvasStore(state => state.deviceWidth);
  const deviceHeight = useCanvasStore(state => state.deviceHeight);
  const activeTool = useCanvasStore(state => state.activeTool);
  const zoom = useCanvasStore(state => state.zoom);
  const pan = useCanvasStore(state => state.pan);
  const { setPan, setZoom, setTool } = useCanvasStore(state => state.actions);

  const [ctxMenu, setCtxMenu] = useState<{ x: number, y: number, visible: boolean }>({ x: 0, y: 0, visible: false });
  const [isPanning, setIsPanning] = useState(false);
  const previewMode = useSystemStore(state => state.previewMode);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isSelectMode = ['select', 'text', 'insert'].includes(activeTool) && !isSpacePressed && !previewMode;

  // v11.3: Studio Refinement — Use ref for stable closures in high-frequency events
  const stateRef = useRef({ zoom, pan });
  useEffect(() => {
    stateRef.current = { zoom, pan };
  }, [zoom, pan]);

  // v11.4: Auto-Center Logic
  useEffect(() => {
    const { zoom: z, pan: p } = stateRef.current;
    if (canvasRef.current && z === 1 && p.x === 0 && p.y === 0) {
        // v11.9 Restoration: Match user preferred "Home" coordinates
        setPan(-7, -75);
        setZoom(0.65);
    }
  }, [setPan, setZoom]);

  // P-2 Fix: Track active panning listeners so they can be cleaned up on unmount
  const panMoveRef = useRef<((e: PointerEvent) => void) | null>(null);
  const panUpRef = useRef<((e: PointerEvent) => void) | null>(null);

  // Cleanup panning listeners if component unmounts during a drag
  useEffect(() => {
    return () => {
      if (panMoveRef.current) window.removeEventListener('pointermove', panMoveRef.current);
      if (panUpRef.current) window.removeEventListener('pointerup', panUpRef.current);
    };
  }, []);

  // v11.7: Surgical Panning Engine (Middle Mouse + Space Drag)
  const startPanning = (e: React.PointerEvent) => {
    const isMiddleClick = e.button === 1;
    const isHandDrag = e.button === 0 && (activeTool === 'hand' || isSpacePressed);
    if (!isMiddleClick && !isHandDrag) return;
    
    // Capture pointer to ensure we get events even outside the canvas
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
    setIsPanning(true);

    const handlePointerMove = (em: PointerEvent) => {
      const currentPan = stateRef.current.pan;
      setPan(currentPan.x + em.movementX, currentPan.y + em.movementY);
    };

    const handlePointerUp = (em: PointerEvent) => {
      setIsPanning(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch { /* pointer may have already been released */ }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      panMoveRef.current = null;
      panUpRef.current = null;
    };

    panMoveRef.current = handlePointerMove;
    panUpRef.current = handlePointerUp;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // v8.0 Master Keyboard Shortcuts (Onlook parity)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;
      const cmdKey = e.metaKey || e.ctrlKey;
      if (e.key.toLowerCase() === 'v') setTool('select');
      if (e.key.toLowerCase() === 'h') setTool('hand');
      if (e.key.toLowerCase() === 't') setTool('text');
      if (e.key.toLowerCase() === 'i') setTool('insert');
      if (cmdKey) {
        if (e.key === '=' || e.key === '+') { e.preventDefault(); setZoom(stateRef.current.zoom * 1.1); }
        if (e.key === '-') { e.preventDefault(); setZoom(stateRef.current.zoom / 1.1); }
        if (e.key === '0') { e.preventDefault(); setPan(0,0); setZoom(1); }
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
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const { zoom: z, pan: p } = stateRef.current;
        const newZoom = Math.max(0.05, Math.min(10, z * factor));
        setPan(mouseX - (mouseX - p.x) * (newZoom / z), mouseY - (mouseY - p.y) * (newZoom / z));
        setZoom(newZoom);
      } else {
        const { pan: p } = stateRef.current;
        setPan(p.x - e.deltaX, p.y - e.deltaY);
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [setPan, setZoom]);

  return (
    <div
      ref={canvasRef}
      onPointerDown={startPanning}
      onAuxClick={(e) => e.button === 1 && e.preventDefault()}
      onContextMenu={(e) => {
        if (isPanning || activeTool === 'hand' || isSpacePressed) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY, visible: true });
      }}
      className={clsx(
        "w-full h-full overflow-hidden relative bg-[#080808] transition-all touch-none",
        isPanning || isSpacePressed || activeTool === 'hand' ? "cursor-grabbing" : "cursor-default"
      )}
    >
      <CanvasContextMenu {...ctxMenu} onClose={() => setCtxMenu(c => ({ ...c, visible: false }))} />

      {(isPanning || isSpacePressed) && (
        <div className="fixed inset-0 z-[6000] cursor-grabbing pointer-events-auto bg-transparent" />
      )}

      {/* High-Contrast Studio Dots */}
      <div 
        className="absolute inset-0 opacity-[0.2]" 
        style={{ 
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', 
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }} 
      />

      <div 
        className="absolute top-0 left-0 transform-gpu origin-top-left"
        style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}
      >
        {!devServerUrl ? (
          <div className="p-20 text-center bg-[#111] rounded-3xl border border-white/5 opacity-40 uppercase tracking-[0.4em] text-[10px] font-black">
            Zenith Engine Standby
          </div>
        ) : (
          <div className="flex items-center justify-center min-w-full min-h-full">
             <div className="p-40">
               <Artboard 
                 title="Active focus" 
                 w={deviceWidth} 
                 h={deviceHeight} 
                 devServerUrl={devServerUrl} 
                 isSelectMode={isSelectMode} 
                 previewMode={previewMode}
               />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
