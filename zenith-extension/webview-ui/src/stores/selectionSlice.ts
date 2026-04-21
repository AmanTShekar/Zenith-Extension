import { StateCreator } from 'zustand';
import { FiberInfo, HierarchyItem, InteractionState } from './useSelectionStore';
import { normalizeStyles } from './utils';

export interface SelectionSlice {
  selectedId: string | null;
  elementInfo: { id: string; tagName: string } | null;
  fiberInfo: FiberInfo | null;
  rect: { x: number; y: number; width: number; height: number } | null;
  computedStyles: Record<string, string>;
  activeState: InteractionState;
  currentStack: HierarchyItem[];
  
  selectionActions: {
    setSelected: (
      selectedId: string | null, 
      elementInfo: { id: string; tagName: string }, 
      rect: { x: number; y: number; width: number; height: number } | null, 
      styles: Record<string, string>, 
      stack: HierarchyItem[],
      fiberInfo?: FiberInfo | null
    ) => void;
    setRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;
    setActiveState: (state: InteractionState) => void;
  };
}

export const createSelectionSlice: StateCreator<SelectionSlice> = (set) => ({
  selectedId: null,
  elementInfo: null,
  fiberInfo: null,
  rect: null,
  computedStyles: {},
  activeState: 'base',
  currentStack: [],
  
  selectionActions: {
    setSelected: (selectedId, elementInfo, rect, computedStyles, currentStack, fiberInfo) => {
      const normalizedStyles = normalizeStyles(computedStyles || {});
      set({ 
        selectedId, 
        elementInfo, 
        rect, 
        computedStyles: normalizedStyles, 
        currentStack,
        fiberInfo: fiberInfo || null,
        activeState: 'base',
      });
    },
    setRect: (rect) => set({ rect }),
    setActiveState: (activeState) => set({ activeState }),
  }
});
