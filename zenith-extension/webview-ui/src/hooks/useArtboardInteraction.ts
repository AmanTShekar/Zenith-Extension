import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelectionStore } from '../stores/useSelectionStore';
import { getSnapping } from '../utils/snapUtils';
import { useStructuralDND } from './useStructuralDND';
import type { Rect } from '../utils/snapUtils';

export interface DragState {
  type: 'resize' | 'drag';
  handle?: string;
  startX: number;
  startY: number;
  startRect: Rect;
}

const DEADZONE_THRESHOLD = 3;
const GHOST_SYNC_THROTTLE_MS = 16; 
const DOUBLE_CLICK_THRESHOLD = 300;

export function useArtboardInteraction(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  zoom: number
) {
  const { patchBatch, setRect, setDragging } = useSelectionStore(state => state.actions);
  const selectedId = useSelectionStore(state => state.selectedId);
  const selectedRect = useSelectionStore(state => state.rect);
  const isEditingText = useSelectionStore(state => state.isEditingText);

  const { handleDragMove, handleDragStart: startStructuralDrag, handleDragEnd } = useStructuralDND();

  const [interaction, setInteraction] = useState<DragState | null>(null);
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

  const sceneBoundsRef = useRef<Array<{id: string, rect: Rect}>>([]);
  const latestRectRef = useRef<Rect | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastGhostSyncRef = useRef<number>(0);
  const isActuallyMovingRef = useRef<boolean>(false);
  const lastClickTimeRef = useRef<number>(0);

  // ─── CSS Variable Paint Bypass ───────────────────────────────────────────────
  const setCssVars = (rect: Rect) => {
    const root = document.documentElement;
    root.style.setProperty('--zenith-drag-x', `${Math.round(rect.x)}`);
    root.style.setProperty('--zenith-drag-y', `${Math.round(rect.y)}`);
    root.style.setProperty('--zenith-drag-w', `${Math.round(rect.width)}`);
    root.style.setProperty('--zenith-drag-h', `${Math.round(rect.height)}`);
  };

  const clearCssVars = () => {
    const root = document.documentElement;
    root.style.removeProperty('--zenith-drag-x');
    root.style.removeProperty('--zenith-drag-y');
    root.style.removeProperty('--zenith-drag-w');
    root.style.removeProperty('--zenith-drag-h');
  };

  const enterGhostMode = (id: string) => {
    console.log(`[ZENITH] GHOST_START | ID: ${id}`);
    if (iframeRef.current) iframeRef.current.style.pointerEvents = 'none';
    iframeRef.current?.contentWindow?.postMessage({
      type: 'zenithPatchStyle',
      id,
      property: 'opacity',
      value: '0',
    }, '*');
  };

  const exitGhostMode = (id: string) => {
    console.log(`[ZENITH] GHOST_EXIT | ID: ${id}`);
    if (iframeRef.current) iframeRef.current.style.pointerEvents = 'auto';
    iframeRef.current?.contentWindow?.postMessage({
      type: 'zenithPatchStyle',
      id,
      property: 'opacity',
      value: '',
    }, '*');
  };

  const syncGhostPosition = (id: string, rect: Rect) => {
    const now = Date.now();
    if (now - lastGhostSyncRef.current < GHOST_SYNC_THROTTLE_MS) return;
    lastGhostSyncRef.current = now;
    iframeRef.current?.contentWindow?.postMessage({
      type: 'zenithGhostSync',
      id,
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    }, '*');
  };

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (!selectedRect || !selectedId || isEditingText) return;
    
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    if (timeSinceLastClick < DOUBLE_CLICK_THRESHOLD) {
      console.log(`[ZENITH] DOUBLE_CLICK -> EDIT_MODE | ID: ${selectedId}`);
      iframeRef.current?.contentWindow?.postMessage({ type: 'zenithSetEditable', id: selectedId }, '*');
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch(err) { console.error('Capture fail', err); }

    // Aggregate bounds: Scene elements + Viewport boundaries
    const boundsArray = [...((window as any).__ZENITH_SCENE_BOUNDS__ || [])];
    const iframeRect = iframeRef.current?.getBoundingClientRect();
    if (iframeRect) {
      boundsArray.push({
        id: 'viewport',
        rect: { x: 0, y: 0, width: iframeRect.width / zoom, height: iframeRect.height / zoom }
      });
    }
    sceneBoundsRef.current = boundsArray;

    latestRectRef.current = { ...selectedRect };
    isActuallyMovingRef.current = false;

    setCssVars(selectedRect);
    enterGhostMode(selectedId);
    setDragging(true);

    startStructuralDrag(selectedId, e.clientX, e.clientY);

    setInteraction({
      type: 'drag',
      startX: e.clientX,
      startY: e.clientY,
      startRect: { ...selectedRect },
    });
    console.log(`[ZENITH] DRAG_START | ID: ${selectedId}`, selectedRect);
  }, [selectedRect, selectedId, isEditingText, setDragging, startStructuralDrag, iframeRef, zoom]);

  const handleResizeStart = useCallback((handle: string, e: React.PointerEvent) => {
    if (!selectedRect || !selectedId || isEditingText) return;
    e.preventDefault();
    e.stopPropagation();

    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch(err) { console.error('Capture fail', err); }

    const boundsArray = [...((window as any).__ZENITH_SCENE_BOUNDS__ || [])];
    const iframeRect = iframeRef.current?.getBoundingClientRect();
    if (iframeRect) {
      boundsArray.push({
        id: 'viewport',
        rect: { x: 0, y: 0, width: iframeRect.width / zoom, height: iframeRect.height / zoom }
      });
    }
    sceneBoundsRef.current = boundsArray;

    latestRectRef.current = { ...selectedRect };
    isActuallyMovingRef.current = false;
    
    setCssVars(selectedRect);
    enterGhostMode(selectedId);
    setDragging(true);

    setInteraction({
      type: 'resize',
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRect: { ...selectedRect },
    });
    console.log(`[ZENITH] RESIZE_START | ID: ${selectedId} | HANDLE: ${handle}`, selectedRect);
  }, [selectedRect, selectedId, isEditingText, setDragging, iframeRef, zoom]);

  useEffect(() => {
    if (!interaction) {
      setGuides({ x: [], y: [] });
      clearCssVars();
      return;
    }

    const onPointerMove = (e: PointerEvent) => {
      if (rafIdRef.current) return;

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;

        const rawDx = (e.clientX - interaction.startX) / zoom;
        const rawDy = (e.clientY - interaction.startY) / zoom;

        const distance = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
        if (!isActuallyMovingRef.current && distance < DEADZONE_THRESHOLD) return;
        isActuallyMovingRef.current = true;

        const isShiftKey = e.shiftKey;
        const isAltKey = e.altKey;
        let newRect = { ...interaction.startRect };

        if (interaction.type === 'resize') {
          const { handle } = interaction;
          if (!handle) return;
          
          let dx = rawDx;
          let dy = rawDy;

          if (handle.includes('e')) newRect.width = Math.max(1, interaction.startRect.width + dx);
          if (handle.includes('w')) {
            newRect.width = Math.max(1, interaction.startRect.width - dx);
            newRect.x = interaction.startRect.x + (interaction.startRect.width - newRect.width);
          }
          if (handle.includes('s')) newRect.height = Math.max(1, interaction.startRect.height + dy);
          if (handle.includes('n')) {
            newRect.height = Math.max(1, interaction.startRect.height - dy);
            newRect.y = interaction.startRect.y + (interaction.startRect.height - newRect.height);
          }

          if (isShiftKey) {
            const ratio = interaction.startRect.width / interaction.startRect.height;
            if (['e', 'w'].includes(handle)) {
              newRect.height = newRect.width / ratio;
            } else if (['n', 's'].includes(handle)) {
              newRect.width = newRect.height * ratio;
            } else {
              const newRatio = newRect.width / newRect.height;
              if (newRatio > ratio) newRect.width = newRect.height * ratio;
              else newRect.height = newRect.width / ratio;
            }
            if (handle.includes('n')) newRect.y = interaction.startRect.y + (interaction.startRect.height - newRect.height);
            if (handle.includes('w')) newRect.x = interaction.startRect.x + (interaction.startRect.width - newRect.width);
          }

          if (isAltKey) {
             const dw = newRect.width - interaction.startRect.width;
             const dh = newRect.height - interaction.startRect.height;
             newRect.width = interaction.startRect.width + dw * 2;
             newRect.height = interaction.startRect.height + dh * 2;
             newRect.x = interaction.startRect.x - dw;
             newRect.y = interaction.startRect.y - dh;
          }

          const activeEdges: { x: number[], y: number[] } = { x: [], y: [] };
          if (handle.includes('w')) activeEdges.x.push(0);
          if (handle.includes('e')) activeEdges.x.push(2);
          if (handle.includes('n')) activeEdges.y.push(0);
          if (handle.includes('s')) activeEdges.y.push(2);

          const snap = getSnapping(newRect, sceneBoundsRef.current, selectedId ?? undefined, activeEdges);
          
          if (handle.includes('e')) {
            const snappedRight = snap.x + newRect.width;
            newRect.width = Math.max(1, snappedRight - newRect.x);
          } else if (handle.includes('w')) {
            const oldRight = newRect.x + newRect.width;
            newRect.x = snap.x;
            newRect.width = Math.max(1, oldRight - newRect.x);
          }
          if (handle.includes('s')) {
            const snappedBottom = snap.y + newRect.height;
            newRect.height = Math.max(1, snappedBottom - newRect.y);
          } else if (handle.includes('n')) {
            const oldBottom = newRect.y + newRect.height;
            newRect.y = snap.y;
            newRect.height = Math.max(1, oldBottom - newRect.y);
          }
          setGuides(snap.guides);
        } else {
          newRect.x = interaction.startRect.x + rawDx;
          newRect.y = interaction.startRect.y + rawDy;
          
          const boundsMap = new Map<string, DOMRect>();
          sceneBoundsRef.current.forEach(b => boundsMap.set(b.id, b.rect as any));
          handleDragMove(e.clientX, e.clientY, boundsMap);
          
          const snap = getSnapping(newRect, sceneBoundsRef.current, selectedId ?? undefined);
          newRect.x = snap.x;
          newRect.y = snap.y;
          newRect.width = interaction.startRect.width;
          newRect.height = interaction.startRect.height;
          setGuides(snap.guides);
        }

        latestRectRef.current = newRect;
        setCssVars(newRect);
        if (selectedId) syncGhostPosition(selectedId, newRect);
      });
    };

    const onPointerUp = (e: PointerEvent) => {
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      if (rafIdRef.current) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }

      const finalRect = latestRectRef.current;
      const isActuallyMoving = isActuallyMovingRef.current;

      handleDragEnd(); 

      if (finalRect && isActuallyMoving && selectedId) {
        setRect(finalRect);
        const computedStyles = useSelectionStore.getState().computedStyles;
        const isAbsolute = computedStyles.position === 'absolute' || computedStyles.position === 'fixed';
        
        // v12.1: Robust coordinate mapping
        const getNum = (val: string) => {
          if (!val || val === 'auto') return 0;
          return parseFloat(val) || 0;
        };

        const initialLeft = getNum(computedStyles.left);
        const initialTop = getNum(computedStyles.top);
        const initialWidth = getNum(computedStyles.width) || interaction.startRect.width;
        const initialHeight = getNum(computedStyles.height) || interaction.startRect.height;
        
        const dx = finalRect.x - interaction.startRect.x;
        const dy = finalRect.y - interaction.startRect.y;
        
        const styles: Record<string, string> = {};
        
        // Only apply top/left if they actually changed OR if they were already absolute
        if (Math.abs(dx) > 0.01 || isAbsolute) {
           styles.left = `${Math.round(initialLeft + dx)}px`;
        }
        if (Math.abs(dy) > 0.01 || isAbsolute) {
           styles.top = `${Math.round(initialTop + dy)}px`;
        }
        
        if (interaction.type === 'resize') {
           const dw = finalRect.width - interaction.startRect.width;
           const dh = finalRect.height - interaction.startRect.height;
           styles.width = `${Math.round(initialWidth + dw)}px`;
           styles.height = `${Math.round(initialHeight + dh)}px`;
        }

        // v12.2: Force relative position if static and moved, to ensure top/left work
        if (!isAbsolute && (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1)) {
          if (computedStyles.position === 'static' || !computedStyles.position) {
            styles.position = 'relative';
          }
        }

        console.log(`[ZENITH] COMMIT_STYLE | ID: ${selectedId} | TYPE: ${interaction.type}`, styles);
        
        exitGhostMode(selectedId);
        patchBatch(styles);
      } else if (selectedId) {
        console.log(`[ZENITH] INTERACTION_CANCEL | ID: ${selectedId}`);
        exitGhostMode(selectedId);
      }

      setDragging(false);
      setInteraction(null);
      setGuides({ x: [], y: [] });
      clearCssVars();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [interaction, zoom, selectedId, setRect, patchBatch, setDragging, iframeRef, handleDragMove, handleDragEnd]);

  return { interaction, guides, handleResizeStart, handleDragStart };
}
