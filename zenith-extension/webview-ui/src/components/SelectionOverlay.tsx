import React from 'react';
import { motion } from 'framer-motion';
import { useSelectionStore } from '../stores';
import { clsx } from 'clsx';

interface SelectionOverlayProps {
  rect: { x: number; y: number; width: number; height: number } | null;
  color?: string;
  isHover?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  isInvalid?: boolean;
  isInsertion?: boolean;
  onResizeStart?: (handle: string, e: React.PointerEvent) => void;
  onDragStart?: (e: React.PointerEvent) => void;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ 
  rect, 
  color = '#00F0FF', 
  isHover = false,
  isDragging = false,
  isDropTarget = false,
  isInvalid = false,
  isInsertion = false,
  onResizeStart,
  onDragStart
}) => {
  const fiberInfo = useSelectionStore(state => state.fiberInfo);
  const currentStack = useSelectionStore(state => state.currentStack);
  const isEditingText = useSelectionStore(state => state.isEditingText);
  const { setEditingText } = useSelectionStore(state => state.actions);
  const hoverTag = useSelectionStore(state => state.hoverTag);

  if (!rect || isEditingText) return null;

  // Insertion Line rendering (special case)
  if (isInsertion) {
    return (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute zenith-insertion-line"
        style={{ 
          left: rect.x, top: rect.y, 
          width: rect.width, height: rect.height,
          boxShadow: '0 0 12px var(--color-accent), 0 0 4px var(--color-accent)'
        }}
      />
    );
  }

  const getTagIcon = (tag: string) => {
    const t = tag.toLowerCase();
    if (t === 'img') return 'ph-image';
    if (['h1', 'h2', 'h3', 'p', 'span'].includes(t)) return 'ph-text-t';
    if (t === 'button') return 'ph-hand-pointing';
    return 'ph-square';
  };

  const isDndActive = isDropTarget || isDragging;
  
  const componentLabel = isDropTarget 
    ? (isInvalid ? "🚫 Illegal Drop Zone" : "📥 Drop into Container")
    : (fiberInfo?.name || currentStack?.[0]?.componentName || currentStack?.[0]?.tagName || 'element');

  const themeColor = isInvalid ? '#FF4444' : (isDropTarget ? '#00F0FF' : color);

  return (
    <motion.div
      initial={isHover || isDropTarget ? { opacity: 0 } : false}
      onDoubleClick={() => {
        if (isHover || isDropTarget || !rect) return;
        const state = useSelectionStore.getState();
        const id = state.selectedId;
        if (id) {
          const canvasIframes = document.querySelectorAll('iframe');
          canvasIframes.forEach(iframe => {
            iframe.contentWindow?.postMessage({ type: 'zenithSetEditable', id }, '*');
          });
        }
      }}
      animate={isDragging && !isDropTarget ? false : {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        opacity: 1
      }}
      className={clsx(
        "absolute z-[9999]",
        isHover && "pointer-events-none border border-cyan-400/30 border-dashed",
        isDropTarget && (isInvalid ? "zenith-drop-target-invalid" : "zenith-drop-target"),
        !isHover && !isDropTarget && "pointer-events-auto border-[0.5px] border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.1)]",
        isDragging && !isDropTarget && "zenith-drag-ghost",
        isInvalid && "animate-pulse"
      )}
      style={isDragging && !isDropTarget ? {
        opacity: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translate3d(calc(var(--zenith-drag-x, 0) * 1px), calc(var(--zenith-drag-y, 0) * 1px), 0)`,
        width: `calc(var(--zenith-drag-w, 0) * 1px)`,
        height: `calc(var(--zenith-drag-h, 0) * 1px)`,
        zIndex: 2147483647
      } : {
        transform: undefined,
        width: undefined,
        height: undefined,
        borderColor: isDropTarget ? undefined : themeColor
      }}
    >
      {/* Invisible Drag Surface: Ensures we can drag the element even if we miss the border */}
      {!isHover && !isDndActive && onDragStart && !isEditingText && (
        <div 
          className="absolute inset-0 cursor-move z-[10]"
          onPointerDown={(e) => {
            // Only left-click and not on a handle (handles are z-10000)
            if (e.button === 0) {
              onDragStart(e);
            }
          }}
        />
      )}


      {/* Onlook Signature: High-Contrast Corner Brackets */}
      {!isHover && (
          <>
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 -translate-x-[1px] -translate-y-[1px]" style={{ borderColor: themeColor }} />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 translate-x-[1px] -translate-y-[1px]" style={{ borderColor: themeColor }} />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 -translate-x-[1px] translate-y-[1px]" style={{ borderColor: themeColor }} />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 translate-x-[1px] translate-y-[1px]" style={{ borderColor: themeColor }} />
          </>
      )}

      <div 
        className={clsx(
          "absolute top-[-22px] left-[-0.5px] flex items-center gap-2 px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest text-black transition-all",
          isHover ? "bg-cyan-400/50" : "shadow-lg"
        )}
        style={{ backgroundColor: isHover ? undefined : themeColor }}
      >
        <i className={clsx('opacity-60', getTagIcon(hoverTag || 'div'))} />
        <span>{componentLabel}</span>
      </div>

      {/* Onlook Breadcrumb Tail — Bottom Precision Traversal */}
      {!isHover && !isDndActive && currentStack && currentStack.length > 1 && (
         <div className="absolute bottom-[-24px] left-[-0.5px] flex items-center bg-[#111]/90 backdrop-blur-xl border border-white/[0.08] rounded-md pointer-events-auto overflow-hidden shadow-2xl">
            {currentStack.slice(0, 4).reverse().map((el, i) => (
               <React.Fragment key={el.id}>
                  <button 
                    onClick={() => {
                        const canvasIframes = document.querySelectorAll('iframe');
                        canvasIframes.forEach(iframe => {
                          iframe.contentWindow?.postMessage({ type: 'zenithForceSelect', id: el.id }, '*');
                        });
                    }}
                    onPointerDown={e => { if (e.button !== 0) return; /* Allow middle clicks to bubble for panning */ }}
                    className="px-2 py-1.5 text-[8px] font-black text-white/40 hover:text-[#00F0FF] hover:bg-white/5 transition-all uppercase tracking-tight"
                  >
                     {el.componentName || el.tagName}
                  </button>
                  {i < Math.min(currentStack.length, 4) - 1 && <div className="w-px h-3 bg-white/10" />}
               </React.Fragment>
            ))}
         </div>
      )}
 
      {!isHover && !isDndActive && (
          <div className="absolute bottom-[-22px] right-[-0.5px] px-2 py-1 bg-black/80 backdrop-blur-md rounded-sm text-[8px] font-mono font-bold text-cyan-400/80 border border-white/5">
              {Math.round(rect.width)} × {Math.round(rect.height)}
          </div>
      )}

      {/* 8-Point Resize Handles */}
      {!isHover && onResizeStart && (
        <>
          {[
            { id: 'nw', class: '-top-1 -left-1 cursor-nwse-resize' },
            { id: 'n',  class: '-top-1 left-1/2 -translate-x-1/2 cursor-ns-resize' },
            { id: 'ne', class: '-top-1 -right-1 cursor-nesw-resize' },
            { id: 'e',  class: 'top-1/2 -right-1 -translate-y-1/2 cursor-ew-resize' },
            { id: 'se', class: '-bottom-1 -right-1 cursor-nwse-resize' },
            { id: 's',  class: '-bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize' },
            { id: 'sw', class: '-bottom-1 -left-1 cursor-nesw-resize' },
            { id: 'w',  class: 'top-1/2 -left-1 -translate-y-1/2 cursor-ew-resize' },
          ].map(h => (
            <div
              key={h.id}
              onPointerDown={(e) => onResizeStart(h.id, e)}
              className={clsx(
                "absolute w-2 h-2 bg-white border border-[#00F0FF] rounded-full pointer-events-auto",
                "hover:scale-150 transition-all duration-200 z-[10000] shadow-xl",
                h.class
              )}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};
