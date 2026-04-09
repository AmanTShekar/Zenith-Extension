import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelectionStore, useCanvasStore } from '../stores';
import { clsx } from 'clsx';

interface SelectionOverlayProps {
  rect: { x: number; y: number; width: number; height: number } | null;
  color?: string;
  isHover?: boolean;
  onResizeStart?: (handle: string, e: React.MouseEvent) => void;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ 
  rect, 
  color = '#00f2ff', 
  isHover = false,
  onResizeStart 
}) => {
  const zoom = useCanvasStore(state => state.zoom);
  const pan = useCanvasStore(state => state.pan);
  
  const selectedId = useSelectionStore(state => state.selectedId);
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
        isHover ? "border border-[#00f2ff]/50 border-dashed" : "border-2 border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.3)]"
      )}
      style={{ borderColor: color }}
    >
      {/* Status Label */}
      <div className={clsx(
        "absolute flex items-center gap-2 px-2 py-1 rounded-sm text-[10px] font-bold text-black whitespace-nowrap",
        isHover ? "top-[-22px] bg-[#00f2ff]/80" : "top-[-32px] bg-[#00f2ff] shadow-xl"
      )} style={{ backgroundColor: color }}>
        <i className={clsx('ph-bold', getTagIcon(hoverTag || 'div'))} />
        <span>{componentLabel}</span>
        {sourceInfo && !isHover && (
          <span className="ml-2 px-1 bg-black/10 rounded text-[9px] font-mono text-black/60">{sourceInfo}</span>
        )}
      </div>

      {/* Resize Handles (Only for selected) */}
      {!isHover && onResizeStart && (
        <>
          {[
            { id: 'nw', class: '-top-1.5 -left-1.5 cursor-nwse-resize' },
            { id: 'ne', class: '-top-1.5 -right-1.5 cursor-nesw-resize' },
            { id: 'sw', class: '-bottom-1.5 -left-1.5 cursor-nesw-resize' },
            { id: 'se', class: '-bottom-1.5 -right-1.5 cursor-nwse-resize' },
            { id: 'n', class: '-top-1.5 left-1/2 -ml-1.5 cursor-ns-resize' },
            { id: 's', class: '-bottom-1.5 left-1/2 -ml-1.5 cursor-ns-resize' },
            { id: 'w', class: '-left-1.5 top-1/2 -mt-1.5 cursor-ew-resize' },
            { id: 'e', class: '-right-1.5 top-1/2 -mt-1.5 cursor-ew-resize' },
          ].map(h => (
            <div
              key={h.id}
              onMouseDown={(e) => onResizeStart(h.id, e)}
              className={clsx(
                "absolute w-3 h-3 bg-white border-2 border-[#00f2ff] rounded-full pointer-events-auto",
                "hover:scale-150 transition-transform z-[10000]",
                h.class
              )}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};
