import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelectionStore } from '../stores/useSelectionStore';
import { getSnapping } from '../utils/snapUtils';
import type { Rect } from '../utils/snapUtils';

export interface DragState {
  type: 'resize' | 'drag';
  handle?: string;
  startX: number;
  startY: number;
  startRect: Rect;
}

const DEADZONE_THRESHOLD = 3;
// Ghost sync to iframe: 100ms — pure CSS var write, no React, no layout
const GHOST_SYNC_THROTTLE_MS = 100;

export function useArtboardInteraction(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  zoom: number
) {
  const selectedId = useSelectionStore(state => state.selectedId);
  const selectedRect = useSelectionStore(state => state.rect);
  // patchBatch fires to code exactly ONCE on pointer-up
  const { patchBatch, setRect, setDragging } = useSelectionStore(state => state.actions);

  const [interaction, setInteraction] = useState<DragState | null>(null);
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

  const sceneBoundsRef = useRef<Array<{ id: string; rect: Rect }>>([]);
  const latestRectRef = useRef<Rect | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastGhostSyncRef = useRef<number>(0);
  const isActuallyMovingRef = useRef<boolean>(false);

  // ─── CSS Variable Paint Bypass ───────────────────────────────────────────────
  // The SelectionOverlay binds its transform to these vars in drag mode.
  // Zero React renders, zero store mutations, zero IPC during drag frames.
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

  // ─── Ghost Isolation: hide real element inside iframe during drag ─────────────
  // By making the element opacity:0 (via the existing preview-style channel),
  // the CSS layout slot is preserved (no flow collapse!) but the element is invisible.
  // The SelectionOverlay acts as the visible "ghost" during drag.
  const enterGhostMode = (id: string) => {
    // Send direct postMessage to iframe to hide the real element while keeping its layout slot
    iframeRef.current?.contentWindow?.postMessage({
      type: 'zenithPatchStyle',
      id,
      property: 'opacity',
      value: '0',
    }, '*');
  };

  const exitGhostMode = (id: string) => {
    // Restore visibility
    iframeRef.current?.contentWindow?.postMessage({
      type: 'zenithPatchStyle',
      id,
      property: 'opacity',
      value: '',
    }, '*');
  };

  // ─── Throttled ghost position sync to iframe ─────────────────────────────────
  // Once per 100ms, we sync the final position to the iframe via a lightweight
  // postMessage. The iframe responds by updating CSS vars on the ghost element
  // (handled by the Zenith bridge script). No React, no vdom involvement.
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

  // ─── Drag Start ──────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedRect || !selectedId) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    iframeRef.current?.contentWindow?.postMessage({ type: 'zenithRequestSceneBounds' }, '*');
    sceneBoundsRef.current = (window as any).__ZENITH_SCENE_BOUNDS__ || [];
    latestRectRef.current = { ...selectedRect };
    isActuallyMovingRef.current = false;

    // Seed vars at current position
    setCssVars(selectedRect);

    // Hide real element in iframe — its layout slot stays intact (no flow collapse)
    enterGhostMode(selectedId);
    setDragging(true);

    setInteraction({
      type: 'drag',
      startX: e.clientX,
      startY: e.clientY,
      startRect: { ...selectedRect },
    });
  }, [selectedRect, selectedId, iframeRef, setDragging]);

  // ─── Resize Start ────────────────────────────────────────────────────────────
  const handleResizeStart = useCallback((handle: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedRect || !selectedId) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    iframeRef.current?.contentWindow?.postMessage({ type: 'zenithRequestSceneBounds' }, '*');
    sceneBoundsRef.current = (window as any).__ZENITH_SCENE_BOUNDS__ || [];
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
  }, [selectedRect, selectedId, iframeRef, setDragging]);

  // ─── Move Handler ────────────────────────────────────────────────────────────
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
          const dx = rawDx;
          const dy = rawDy;

          if (handle.includes('e')) {
            newRect.width = Math.max(1, interaction.startRect.width + (isAltKey ? dx * 2 : dx));
            if (isAltKey) newRect.x = interaction.startRect.x - dx;
          } else if (handle.includes('w')) {
            newRect.width = Math.max(1, interaction.startRect.width - (isAltKey ? dx * 2 : dx));
            newRect.x = interaction.startRect.x + dx;
          }

          if (handle.includes('s')) {
            newRect.height = Math.max(1, interaction.startRect.height + (isAltKey ? dy * 2 : dy));
            if (isAltKey) newRect.y = interaction.startRect.y - dy;
          } else if (handle.includes('n')) {
            newRect.height = Math.max(1, interaction.startRect.height - (isAltKey ? dy * 2 : dy));
            newRect.y = interaction.startRect.y + dy;
          }

          if (isShiftKey) {
            const ratio = interaction.startRect.width / interaction.startRect.height;
            newRect.height = newRect.width / ratio;
            if (handle.includes('n')) newRect.y = interaction.startRect.y + (interaction.startRect.height - newRect.height);
            if (handle.includes('w')) newRect.x = interaction.startRect.x + (interaction.startRect.width - newRect.width);
          }

          const snap = getSnapping(newRect, sceneBoundsRef.current, selectedId ?? undefined);
          if (handle.includes('e')) newRect.width += (snap.x + newRect.width) - (newRect.x + newRect.width);
          if (handle.includes('s')) newRect.height += (snap.y + newRect.height) - (newRect.y + newRect.height);
        } else {
          newRect.x = interaction.startRect.x + rawDx;
          newRect.y = interaction.startRect.y + rawDy;
          const snap = getSnapping(newRect, sceneBoundsRef.current, selectedId ?? undefined);
          newRect.x = snap.x;
          newRect.y = snap.y;
          setGuides(snap.guides);
        }

        latestRectRef.current = newRect;

        // Only update CSS vars — overlay reads them via var() reference.
        // Zero store mutations, zero IPC, zero React re-renders per frame.
        setCssVars(newRect);

        // Throttled: sync ghost position to iframe at 100ms (pure CSS write, no React)
        if (selectedId) syncGhostPosition(selectedId, newRect);
      });
    };

    const onPointerUp = (e: PointerEvent) => {
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* already released */ }

      if (rafIdRef.current) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }

      const finalRect = latestRectRef.current;

      if (finalRect && isActuallyMovingRef.current && selectedId) {
        // Step 1: Sync store rect once
        setRect(finalRect);

        // Fetch current styles from store
        const computedStyles = useSelectionStore.getState().computedStyles;
        const isAbsolute = computedStyles.position === 'absolute' || computedStyles.position === 'fixed';
        const targetPosition = isAbsolute ? computedStyles.position : 'relative';
        
        const initialLeft = parseFloat(computedStyles.left) || 0;
        const initialTop = parseFloat(computedStyles.top) || 0;
        const initialWidth = parseFloat(computedStyles.width) || interaction.startRect.width;
        const initialHeight = parseFloat(computedStyles.height) || interaction.startRect.height;
        
        const dx = finalRect.x - interaction.startRect.x;
        const dy = finalRect.y - interaction.startRect.y;
        
        const finalLeft = Math.round(initialLeft + dx);
        const finalTop = Math.round(initialTop + dy);
        
        let dw = 0;
        let dh = 0;
        if (interaction.type === 'resize') {
           dw = finalRect.width - interaction.startRect.width;
           dh = finalRect.height - interaction.startRect.height;
        }

        // Step 1.5: Instantly patch layout into iframe to beat HMR and prevent RectSync snap-back
        iframeRef.current?.contentWindow?.postMessage({
          type: 'zenithPatchStyle',
          id: selectedId,
          property: 'position',
          value: targetPosition
        }, '*');
        iframeRef.current?.contentWindow?.postMessage({
          type: 'zenithPatchStyle',
          id: selectedId,
          property: 'left',
          value: `${finalLeft}px`
        }, '*');
        iframeRef.current?.contentWindow?.postMessage({
          type: 'zenithPatchStyle',
          id: selectedId,
          property: 'top',
          value: `${finalTop}px`
        }, '*');
        if (interaction.type === 'resize') {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'zenithPatchStyle',
            id: selectedId,
            property: 'width',
            value: `${Math.round(initialWidth + dw)}px`
          }, '*');
          iframeRef.current?.contentWindow?.postMessage({
            type: 'zenithPatchStyle',
            id: selectedId,
            property: 'height',
            value: `${Math.round(initialHeight + dh)}px`
          }, '*');
        }
        
        // Step 1.9: Restore element visibility AFTER moving it
        exitGhostMode(selectedId);

        // Step 3: Write to code exactly ONCE — this is the only IPC call during the whole gesture
        const batch: Record<string, string> = {
          position: targetPosition,
          top: `${finalTop}px`,
          left: `${finalLeft}px`,
        };
        if (interaction.type === 'resize') {
          batch.width = `${Math.round(initialWidth + dw)}px`;
          batch.height = `${Math.round(initialHeight + dh)}px`;
        }
        
        patchBatch(batch);
      } else if (selectedId) {
        // No actual move: restore visibility without writing code
        exitGhostMode(selectedId);
      }

      setDragging(false);
      setInteraction(null);
      setGuides({ x: [], y: [] });
      isActuallyMovingRef.current = false;
      clearCssVars();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      clearCssVars();
    };
  }, [interaction, zoom, selectedId, setRect, patchBatch, setDragging, iframeRef]);

  return { interaction, guides, handleResizeStart, handleDragStart };
}
