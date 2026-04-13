import React from 'react';
import { motion } from 'framer-motion';
import { useSelectionStore } from '../stores';
import { clsx } from 'clsx';

interface SelectionOverlayProps {
  rect: { x: number; y: number; width: number; height: number } | null;
  color?: string;
  isHover?: boolean;
  onResizeStart?: (handle: string, e: React.MouseEvent) => void;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ 
  rect, 
  color = '#00F0FF', 
  isHover = false,
  onResizeStart 
}) => {
  const fiberInfo = useSelectionStore(state => state.fiberInfo);
  const currentStack = useSelectionStore(state => state.currentStack);
  const hoverTag = useSelectionStore(state => state.hoverTag);

  if (!rect) return null;

  const getTagIcon = (tag: string) => {
    const t = tag.toLowerCase();
    if (t === 'img') return 'ph-image';
    if (['h1', 'h2', 'h3', 'p', 'span'].includes(t)) return 'ph-text-t';
    if (t === 'button') return 'ph-hand-pointing';
    return 'ph-square';
  };

  const componentLabel = fiberInfo?.name || currentStack?.[0]?.componentName || currentStack?.[0]?.tagName || 'element';
  const sourceInfo = fiberInfo?.source ? `${fiberInfo.source.fileName.split('/').pop()}:${fiberInfo.source.lineNumber}` : null;

  return (
    <motion.div
      initial={isHover ? { opacity: 0 } : false}
      animate={{
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        opacity: 1
      }}
      className={clsx(
        "absolute pointer-events-none z-[9999]",
        isHover 
          ? "border border-cyan-400/30 border-dashed" 
          : "border-[0.5px] border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.1)]"
      )}
    >
      {/* Onlook Signature: High-Contrast Corner Brackets */}
      {!isHover && (
          <>
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00F0FF] -translate-x-[1px] -translate-y-[1px]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00F0FF] translate-x-[1px] -translate-y-[1px]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00F0FF] -translate-x-[1px] translate-y-[1px]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00F0FF] translate-x-[1px] translate-y-[1px]" />
          </>
      )}

      {/* Floating Tag Badge — Top Left */}
      <div className={clsx(
        "absolute top-[-22px] left-[-0.5px] flex items-center gap-2 px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest text-black transition-all",
        isHover ? "bg-cyan-400/50" : "bg-[#00F0FF] shadow-lg"
      )}>
        <i className={clsx('opacity-60', getTagIcon(hoverTag || 'div'))} />
        <span>{componentLabel}</span>
      </div>

      {/* Onlook Breadcrumb Tail — Bottom Precision Traversal */}
      {!isHover && currentStack && currentStack.length > 1 && (
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

      {/* Size Badge — Bottom Right */}
      {!isHover && (
          <div className="absolute bottom-[-22px] right-[-0.5px] px-2 py-1 bg-black/80 backdrop-blur-md rounded-sm text-[8px] font-mono font-bold text-cyan-400/80 border border-white/5">
              {Math.round(rect.width)} × {Math.round(rect.height)}
          </div>
      )}

      {/* Resize Handles — Refined Studio Dots */}
      {!isHover && onResizeStart && (
        <>
          {[
            { id: 'nw', class: '-top-1 -left-1' },
            { id: 'ne', class: '-top-1 -right-1' },
            { id: 'sw', class: '-bottom-1 -left-1' },
            { id: 'se', class: '-bottom-1 -right-1' },
          ].map(h => (
            <div
              key={h.id}
              onMouseDown={(e) => onResizeStart(h.id, e)}
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
