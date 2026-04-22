import { useCallback, useRef } from 'react';
import { useSelectionStore } from '../stores/useSelectionStore';

export const useStructuralDND = () => {
  const isDragging = useSelectionStore((s) => s.isDragging);
  const draggedId = useSelectionStore((s) => s.draggedIdentifier);
  const { startDragging, setDropTarget, stopDragging, reparentNodes } = useSelectionStore((s) => s.actions);

  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleDragStart = useCallback((id: string, clientX: number, clientY: number) => {
    dragStartPos.current = { x: clientX, y: clientY };
    startDragging(id);
    console.log(`[DND] Started dragging: ${id}`);
  }, [startDragging]);

  const handleDragMove = useCallback((clientX: number, clientY: number, sceneBounds: Map<string, DOMRect>) => {
    if (!isDragging || !draggedId) return;

    let bestParent: string | null = null;
    let minArea = Infinity;
    let bestParentRect: DOMRect | null = null;

    // 1. Find the smallest container under the cursor
    sceneBounds.forEach((rect, id) => {
      // Ignore the dragged element itself in parent search
      if (id === draggedId) return;

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        const area = rect.width * rect.height;
        if (area < minArea) {
          minArea = area;
          bestParent = id;
          bestParentRect = rect;
        }
      }
    });

    // 2. Find insertion index and horizontal/vertical flow
    let bestIndex = 0;
    let insertionRect: { x: number; y: number; width: number; height: number } | null = null;
    let isInvalid = false;

    if (bestParent) {
      // Robust Ancestor Guard: Don't reparent into yourself or your descendants
      // We check if bestParent is a descendant of draggedId
      const isDescendant = bestParent.startsWith(draggedId + ':');
      if (bestParent === draggedId || isDescendant) {
        isInvalid = true;
      }

      const bestParentIdStr = bestParent as string;
      const childrenIds = Array.from(sceneBounds.keys()).filter(id => {
        const parts = id.split(':');
        const parentParts = bestParentIdStr.split(':');
        // Direct children only: must start with parentId and have exactly one more segment
        return id.startsWith(bestParentIdStr + ':') && parts.length === parentParts.length + 1;
      });

      const sortedChildren = childrenIds.sort((a, b) => {
        const ra = sceneBounds.get(a)!;
        const rb = sceneBounds.get(b)!;
        
        // Centroids
        const ay = ra.top + ra.height / 2;
        const by = rb.top + rb.height / 2;
        const ax = ra.left + ra.width / 2;
        const bx = rb.left + rb.width / 2;
        
        // Primary sort by Y (rows), secondary by X (columns)
        // We use a rounding threshold to group elements into "rows"
        const rowThreshold = Math.max(1, Math.min(ra.height, rb.height) * 0.5);
        const yDiff = Math.round(ay / rowThreshold) - Math.round(by / rowThreshold);
        return yDiff || ax - bx;
      });

      // Refined layout heuristic: 
      let isHorizontal = false;
      if (sortedChildren.length >= 2) {
        const r1 = sceneBounds.get(sortedChildren[0])!;
        const r2 = sceneBounds.get(sortedChildren[1])!;
        // If they share significant vertical overlap, it's horizontal
        const verticalOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
        const minHeight = Math.max(1, Math.min(r1.height, r2.height));
        isHorizontal = verticalOverlap > minHeight * 0.6;
      } else if (bestParentRect) {
        // Fallback to aspect ratio of the container if it has no children yet
        isHorizontal = bestParentRect.width > bestParentRect.height * 1.2;
      }

      bestIndex = sortedChildren.length;
      for (let i = 0; i < sortedChildren.length; i++) {
        const childId = sortedChildren[i];
        if (childId === draggedId) continue;
        const rect = sceneBounds.get(childId)!;
        
        const pos = isHorizontal ? clientX : clientY;
        const threshold = isHorizontal 
          ? rect.left + rect.width / 2 
          : rect.top + rect.height / 2;
        
        if (pos < threshold) {
          bestIndex = i;
          break;
        }
      }

      // Calculate insertion line rectangle with premium padding
      if (sortedChildren.length === 0) {
        // Empty container feedback
        const pad = 4;
        insertionRect = isHorizontal 
          ? { x: bestParentRect!.left + pad, y: bestParentRect!.top + pad, width: 2, height: bestParentRect!.height - pad * 2 }
          : { x: bestParentRect!.left + pad, y: bestParentRect!.top + pad, width: bestParentRect!.width - pad * 2, height: 2 };
      } else {
        const targetIdx = Math.min(bestIndex, sortedChildren.length - 1);
        const targetChildId = sortedChildren[targetIdx];
        const targetRect = sceneBounds.get(targetChildId)!;
        const isAfter = bestIndex > targetIdx || (bestIndex === sortedChildren.length);

        if (isHorizontal) {
          insertionRect = {
            x: isAfter ? targetRect.right : targetRect.left,
            y: targetRect.top,
            width: 2,
            height: targetRect.height
          };
        } else {
          insertionRect = {
            x: targetRect.left,
            y: isAfter ? targetRect.bottom : targetRect.top,
            width: targetRect.width,
            height: 2
          };
        }
      }
    }

    setDropTarget(bestParent, bestIndex, bestParentRect ? {
      x: bestParentRect.left,
      y: bestParentRect.top,
      width: bestParentRect.width,
      height: bestParentRect.height
    } : null, insertionRect, isInvalid);
  }, [isDragging, draggedId, setDropTarget]);

  const handleDragEnd = useCallback(() => {
    const state = useSelectionStore.getState();
    if (state.isDragging && state.draggedIdentifier && state.dropTargetId && !state.isDropTargetInvalid) {
      // Reparenting logic: In a real system, we'd also calculate the 
      // new local coordinates so the element doesn't jump.
      // For now, the extension host handles the structural move.
      reparentNodes(state.draggedIdentifier, state.dropTargetId, state.insertionIndex);
    }
    stopDragging();
  }, [reparentNodes, stopDragging]);

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    isDragging
  };
};
