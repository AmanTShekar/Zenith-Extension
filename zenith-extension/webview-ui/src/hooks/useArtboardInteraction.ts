import { useState, useEffect, useCallback } from 'react';
import { useSelectionStore, useCanvasStore } from '../stores';

export interface DragState {
  handle: string;
  startX: number;
  startY: number;
  startRect: { x: number; y: number; width: number; height: number };
}

export function useArtboardInteraction(iframeRef: React.RefObject<HTMLIFrameElement>) {
  const selectedRect = useSelectionStore(state => state.rect);
  const zoom = useCanvasStore(state => state.zoom);
  const { previewBatch, patchBatch, setRect } = useSelectionStore(state => state.actions);

  const [resizing, setResizing] = useState<DragState | null>(null);

  const handleResizeStart = useCallback((handle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedRect) return;

    setResizing({
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRect: { ...selectedRect }
    });
  }, [selectedRect]);

  useEffect(() => {
    if (!resizing) return;

    const onMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - resizing.startX) / zoom;
      const dy = (e.clientY - resizing.startY) / zoom;
      const isShiftKey = e.shiftKey;
      
      const newRect = { ...resizing.startRect };
      const { handle } = resizing;

      // Vertical Scaling
      if (handle.includes('e')) newRect.width = Math.max(10, resizing.startRect.width + dx);
      if (handle.includes('w')) {
        const delta = Math.min(resizing.startRect.width - 10, dx);
        newRect.x = resizing.startRect.x + delta;
        newRect.width = resizing.startRect.width - delta;
      }
      if (handle.includes('s')) newRect.height = Math.max(10, resizing.startRect.height + dy);
      if (handle.includes('n')) {
        const delta = Math.min(resizing.startRect.height - 10, dy);
        newRect.y = resizing.startRect.y + delta;
        newRect.height = resizing.startRect.height - delta;
      }

      // Proportional Locking (v11.4 Feature)
      if (isShiftKey) {
        const aspectRatio = resizing.startRect.width / resizing.startRect.height;
        if (handle.includes('e') || handle.includes('w')) {
          newRect.height = newRect.width / aspectRatio;
        } else {
          newRect.width = newRect.height * aspectRatio;
        }
      }

      setRect(newRect);
      previewBatch({
        width: `${Math.round(newRect.width)}px`,
        height: `${Math.round(newRect.height)}px`,
        top: `${Math.round(newRect.y)}px`,
        left: `${Math.round(newRect.x)}px`,
      });
    };

    const onMouseUp = () => {
      if (selectedRect) {
        patchBatch({
          width: `${Math.round(selectedRect.width)}px`,
          height: `${Math.round(selectedRect.height)}px`,
          top: `${Math.round(selectedRect.y)}px`,
          left: `${Math.round(selectedRect.x)}px`,
        });
      }
      setResizing(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizing, zoom, selectedRect, setRect, previewBatch, patchBatch]);

  return { resizing, handleResizeStart };
}
