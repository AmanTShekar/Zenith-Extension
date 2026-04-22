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
  const interactionRef = useRef<DragState | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const driftRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Keep refs in sync for cleanup
  useEffect(() => { interactionRef.current = interaction; }, [interaction]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  // ─── CSS Variable Paint Bypass ───────────────────────────────────────────────
  const setCssVars = (rect: Rect) => {
    const root = document.documentElement;
    const rotation = rect.rotation || 0;
    const useLayout = !!rotation && !!rect.layoutWidth && !!rect.layoutHeight;
    
    const overlayWidth = useLayout ? rect.layoutWidth! : rect.width;
    const overlayHeight = useLayout ? rect.layoutHeight! : rect.height;
    const overlayX = useLayout ? (rect.x + rect.width / 2 - overlayWidth / 2) : rect.x;
    const overlayY = useLayout ? (rect.y + rect.height / 2 - overlayHeight / 2) : rect.y;

    // Sub-pixel precision for fluid selection overlay rendering
    root.style.setProperty('--zenith-drag-x', `${overlayX.toFixed(3)}`);
    root.style.setProperty('--zenith-drag-y', `${overlayY.toFixed(3)}`);
    root.style.setProperty('--zenith-drag-w', `${overlayWidth.toFixed(3)}`);
    root.style.setProperty('--zenith-drag-h', `${overlayHeight.toFixed(3)}`);
    root.style.setProperty('--zenith-drag-r', `${rotation.toFixed(3)}`);
  };

  const clearCssVars = () => {
    const root = document.documentElement;
    root.style.removeProperty('--zenith-drag-x');
    root.style.removeProperty('--zenith-drag-y');
    root.style.removeProperty('--zenith-drag-w');
    root.style.removeProperty('--zenith-drag-h');
    root.style.removeProperty('--zenith-drag-r');
  };

  const enterGhostMode = (id: string) => {
    console.log(`[ZENITH] LIVE_INTERACTION_START | ID: ${id}`);
    if (iframeRef.current) iframeRef.current.style.pointerEvents = 'none';
  };

  const exitGhostMode = (id?: string | null) => {
    console.log(`[ZENITH] LIVE_INTERACTION_EXIT | ID: ${id || 'unknown'}`);
    if (iframeRef.current) iframeRef.current.style.pointerEvents = 'auto';
    
    if (id) {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'zenithLiveInteractionCleanup',
        id
      }, '*');
    }
  };

  const syncLivePosition = (id: string, deltaUx: number, deltaUy: number, isResize: boolean, newRect: Rect) => {
    if (!interaction) return;
    const state = useSelectionStore.getState();
    const computedStyles = state.computedStyles;
    const isAbsolute = computedStyles.position === 'absolute' || computedStyles.position === 'fixed';

    const getNum = (val: string) => parseFloat(val) || 0;
    const initialLeft = getNum(computedStyles.left);
    const initialTop = getNum(computedStyles.top);
    const initialWidth = getNum(computedStyles.width) || interaction.startRect.width;
    const initialHeight = getNum(computedStyles.height) || interaction.startRect.height;

    if (isResize) {
       const dw = newRect.layoutWidth! - (interaction.startRect.layoutWidth || interaction.startRect.width);
       const dh = newRect.layoutHeight! - (interaction.startRect.layoutHeight || interaction.startRect.height);
       const liveStyles: Record<string, string> = {
         width: `${(initialWidth + dw).toFixed(3)}px`,
         height: `${(initialHeight + dh).toFixed(3)}px`
       };
       if (Math.abs(deltaUx) > 0.001 || isAbsolute) {
           liveStyles.left = `${(initialLeft + deltaUx).toFixed(3)}px`;
       }
       if (Math.abs(deltaUy) > 0.001 || isAbsolute) {
           liveStyles.top = `${(initialTop + deltaUy).toFixed(3)}px`;
       }
       if (!isAbsolute && (Math.abs(deltaUx) > 0.001 || Math.abs(deltaUy) > 0.001)) {
           if (computedStyles.position === 'static' || !computedStyles.position) {
               liveStyles.position = 'relative';
           }
       }
       
       iframeRef.current?.contentWindow?.postMessage({
         type: 'zenithLiveResize',
         id,
         styles: liveStyles
       }, '*');
    } else {
       // Free drag uses hardware accelerated transform exclusively for 60fps fluidity!
       iframeRef.current?.contentWindow?.postMessage({
         type: 'zenithLiveDragTransform',
         id,
         dx: deltaUx.toFixed(3),
         dy: deltaUy.toFixed(3)
       }, '*');
    }
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

    const state = useSelectionStore.getState();
    const getNum = (val: string) => {
        if (!val || val === 'auto') return 0;
        return parseFloat(val) || 0;
    };
    const currentW = selectedRect.layoutWidth || selectedRect.width;
    const currentH = selectedRect.layoutHeight || selectedRect.height;
    const cx = selectedRect.x + selectedRect.width / 2;
    const cy = selectedRect.y + selectedRect.height / 2;
    const ux = cx - currentW / 2;
    const uy = cy - currentH / 2;

    driftRef.current = {
        x: ux - getNum(state.computedStyles.left),
        y: uy - getNum(state.computedStyles.top)
    };

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
    console.log(`[ZENITH] DRAG_START | ID: ${selectedId} | DRIFT:`, driftRef.current);
  }, [selectedRect, selectedId, isEditingText, setDragging, startStructuralDrag, iframeRef, zoom]);

  const handleResizeStart = useCallback((handle: string, e: React.PointerEvent) => {
    if (!selectedRect || !selectedId || isEditingText) return;
    e.preventDefault();
    e.stopPropagation();

    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch(err) { console.error('Capture fail', err); }

    const state = useSelectionStore.getState();
    const getNum = (val: string) => {
        if (!val || val === 'auto') return 0;
        return parseFloat(val) || 0;
    };
    const currentW = selectedRect.layoutWidth || selectedRect.width;
    const currentH = selectedRect.layoutHeight || selectedRect.height;
    const cx = selectedRect.x + selectedRect.width / 2;
    const cy = selectedRect.y + selectedRect.height / 2;
    const ux = cx - currentW / 2;
    const uy = cy - currentH / 2;

    driftRef.current = {
        x: ux - getNum(state.computedStyles.left),
        y: uy - getNum(state.computedStyles.top)
    };

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
          
          const rotation = interaction.startRect.rotation || 0;
          const rad = (rotation * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);

          // Transform mouse delta into local coordinate space
          const localDx = rawDx * cos + rawDy * sin;
          const localDy = -rawDx * sin + rawDy * cos;

          const startW = interaction.startRect.layoutWidth || interaction.startRect.width;
          const startH = interaction.startRect.layoutHeight || interaction.startRect.height;
          
          let newW = startW;
          let newH = startH;
          let localShiftX = 0;
          let localShiftY = 0;

          if (handle.includes('e')) {
            newW = Math.max(1, startW + localDx);
            if (isAltKey) newW = Math.max(1, startW + localDx * 2);
            else localShiftX = (newW - startW) / 2;
          }
          if (handle.includes('w')) {
            newW = Math.max(1, startW - localDx);
            if (isAltKey) newW = Math.max(1, startW - localDx * 2);
            else localShiftX = -(newW - startW) / 2;
          }
          if (handle.includes('s')) {
            newH = Math.max(1, startH + localDy);
            if (isAltKey) newH = Math.max(1, startH + localDy * 2);
            else localShiftY = (newH - startH) / 2;
          }
          if (handle.includes('n')) {
            newH = Math.max(1, startH - localDy);
            if (isAltKey) newH = Math.max(1, startH - localDy * 2);
            else localShiftY = -(newH - startH) / 2;
          }

          if (isShiftKey) {
            const safeStartW = Math.max(1, startW);
            const safeStartH = Math.max(1, startH);
            const ratio = safeStartW / safeStartH;
            if (handle === 'e' || handle === 'w') {
              newH = newW / ratio;
            } else if (handle === 'n' || handle === 's') {
              newW = newH * ratio;
            } else {
              if (newW / Math.max(1, newH) > ratio) {
                newW = newH * ratio;
              } else {
                newH = newW / ratio;
              }
            }
            if (!isAltKey) {
               if (handle.includes('e')) localShiftX = (newW - startW) / 2;
               if (handle.includes('w')) localShiftX = -(newW - startW) / 2;
               if (handle.includes('s')) localShiftY = (newH - startH) / 2;
               if (handle.includes('n')) localShiftY = -(newH - startH) / 2;
            }
          }

          // Global center shift based on rotated local offsets
          const globalShiftX = localShiftX * cos - localShiftY * sin;
          const globalShiftY = localShiftX * sin + localShiftY * cos;
          
          const startCx = interaction.startRect.x + interaction.startRect.width / 2;
          const startCy = interaction.startRect.y + interaction.startRect.height / 2;
          const newCx = startCx + globalShiftX;
          const newCy = startCy + globalShiftY;

          // Recompute AABB for snapping and selection overlay
          const aabbW = Math.abs(newW * Math.cos(rad)) + Math.abs(newH * Math.sin(rad));
          const aabbH = Math.abs(newW * Math.sin(rad)) + Math.abs(newH * Math.cos(rad));
          
          newRect.width = aabbW;
          newRect.height = aabbH;
          newRect.x = newCx - aabbW / 2;
          newRect.y = newCy - aabbH / 2;
          newRect.layoutWidth = newW;
          newRect.layoutHeight = newH;

          // Snapping (simplified for rotated elements: snap the AABB center/edges)
          const activeEdges: { x: number[], y: number[] } = { x: [], y: [] };
          if (handle.includes('w')) activeEdges.x.push(0);
          if (handle.includes('e')) activeEdges.x.push(2);
          if (handle.includes('n')) activeEdges.y.push(0);
          if (handle.includes('s')) activeEdges.y.push(2);

          const snap = getSnapping(newRect, sceneBoundsRef.current, selectedId ?? undefined, activeEdges);
          newRect.x = snap.x;
          newRect.y = snap.y;
          setGuides(snap.guides);
        } else {
          newRect.x = interaction.startRect.x + rawDx;
          newRect.y = interaction.startRect.y + rawDy;
          
          const boundsMap = new Map<string, DOMRect>();
          sceneBoundsRef.current.forEach(b => boundsMap.set(b.id, b.rect as any));
          
          const iframeRect = iframeRef.current?.getBoundingClientRect();
          if (iframeRect) {
             const artboardX = (e.clientX - iframeRect.left) / zoom;
             const artboardY = (e.clientY - iframeRect.top) / zoom;
             handleDragMove(artboardX, artboardY, boundsMap);
          } else {
             handleDragMove(e.clientX, e.clientY, boundsMap);
          }
          
          const snap = getSnapping(newRect, sceneBoundsRef.current, selectedId ?? undefined);
          newRect.x = snap.x;
          newRect.y = snap.y;
          newRect.width = interaction.startRect.width;
          newRect.height = interaction.startRect.height;
          setGuides(snap.guides);
        }

        latestRectRef.current = newRect;
        setCssVars(newRect);
        
        // Calculate unrotated delta for live preview sync
        const startW = interaction.startRect.layoutWidth || interaction.startRect.width;
        const startH = interaction.startRect.layoutHeight || interaction.startRect.height;
        const startCx = interaction.startRect.x + interaction.startRect.width / 2;
        const startCy = interaction.startRect.y + interaction.startRect.height / 2;
        const startUx = startCx - startW / 2;
        const startUy = startCy - startH / 2;

        const currentW = newRect.layoutWidth || newRect.width;
        const currentH = newRect.layoutHeight || newRect.height;
        const currentCx = newRect.x + newRect.width / 2;
        const currentCy = newRect.y + newRect.height / 2;
        const currentUx = currentCx - currentW / 2;
        const currentUy = currentCy - currentH / 2;

        const deltaUx = currentUx - startUx;
        const deltaUy = currentUy - startUy;
        
        if (selectedId) syncLivePosition(selectedId, deltaUx, deltaUy, interaction.type === 'resize', newRect);
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
        const state = useSelectionStore.getState();
        const computedStyles = state.computedStyles;
        const isAbsolute = computedStyles.position === 'absolute' || computedStyles.position === 'fixed';
        
        const styles: Record<string, string> = {};
        
        // Accurate coordinate commit with high-precision math
        const currentW = finalRect.layoutWidth || finalRect.width;
        const currentH = finalRect.layoutHeight || finalRect.height;
        const currentCx = finalRect.x + finalRect.width / 2;
        const currentCy = finalRect.y + finalRect.height / 2;

        // Unrotated top-left (center-compensated)
        const ux = currentCx - currentW / 2;
        const uy = currentCy - currentH / 2;

        // Apply high-precision drift correction
        const finalLeft = ux - driftRef.current.x;
        const finalTop = uy - driftRef.current.y;

        if (interaction.type === 'resize') {
           styles.width = `${currentW.toFixed(3)}px`;
           styles.height = `${currentH.toFixed(3)}px`;
           styles.left = `${finalLeft.toFixed(3)}px`;
           styles.top = `${finalTop.toFixed(3)}px`;

           if (!isAbsolute) {
             if (computedStyles.position === 'static' || !computedStyles.position || computedStyles.position === 'auto') {
               styles.position = 'relative';
             }
           }
        } else if (interaction.type === 'drag') {
           styles.left = `${finalLeft.toFixed(3)}px`;
           styles.top = `${finalTop.toFixed(3)}px`;

           if (!isAbsolute) {
             if (computedStyles.position === 'static' || !computedStyles.position || computedStyles.position === 'auto') {
               styles.position = 'relative';
             }
           }
        }

        console.log(`[ZENITH] COMMIT_STYLE | ID: ${selectedId} | TYPE: ${interaction.type} | FINAL_RECT:`, finalRect, "STYLES:", styles);
        
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

    const onBlur = () => {
      if (interactionRef.current) {
        console.log('[ZENITH] WINDOW_BLUR -> EMERGENCY_CLEANUP');
        onPointerUp(new PointerEvent('pointerup'));
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('blur', onBlur);

      // Failsafe: If we're still in an interaction state during unmount, force cleanup
      if (interactionRef.current) {
        console.warn('[ZENITH] UNMOUNT_CLEANUP | Force Artboard Unlock');
        exitGhostMode(selectedIdRef.current);
        setDragging(false);
        clearCssVars();
      }

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [interaction, zoom, selectedId, setRect, patchBatch, setDragging, iframeRef, handleDragMove, handleDragEnd]);

  return { interaction, guides, handleResizeStart, handleDragStart };
}
