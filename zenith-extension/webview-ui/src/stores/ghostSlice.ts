import { StateCreator } from 'zustand';
import { SelectionSignature } from './useSelectionStore';

export interface GhostSlice {
  elementSignature: SelectionSignature | null;
  hoverRect: { x: number; y: number; width: number; height: number } | null;
  hoverTag: string | null;
  isDragging: boolean;
  
  ghostActions: {
    setSelectedUniversal: (
      signature: SelectionSignature, 
      rect: { x: number; y: number; width: number; height: number }, 
      styles: Record<string, string>
    ) => void;
    setHover: (rect: { x: number; y: number; width: number; height: number } | null, tag?: string) => void;
    setDragging: (isDragging: boolean) => void;
  };
}

export const createGhostSlice: StateCreator<GhostSlice> = (set) => ({
  elementSignature: null,
  hoverRect: null,
  hoverTag: null,
  isDragging: false,
  
  ghostActions: {
    setDragging: (isDragging) => set({ isDragging }),
    setHover: (hoverRect, tag) => set({ hoverRect, hoverTag: tag ?? null }),
    setSelectedUniversal: (elementSignature, rect, computedStyles) => {
      const normalizedStyles = normalizeStyles(computedStyles);
      set({
        elementSignature,
        hoverRect: rect, // Use the provided rect for ghost
        isDragging: false,
        // We'll trust the main store to clear the selection slice state
      });
    }
  }
});
