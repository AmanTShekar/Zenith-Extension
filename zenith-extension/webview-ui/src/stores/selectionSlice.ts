import type { StateCreator } from 'zustand';
import type { FiberInfo, HierarchyItem, InteractionState } from './types';
import { normalizeStyles } from './utils';

export interface SelectionSlice {
  selectedId: string | null;
  elementInfo: { id: string; tagName: string } | null;
  fiberInfo: FiberInfo | null;
  rect: { 
    x: number; 
    y: number; 
    width: number; 
    height: number;
    layoutWidth?: number;
    layoutHeight?: number;
    rotation?: number;
  } | null;
  computedStyles: Record<string, string>;
  activeState: InteractionState;
  currentStack: HierarchyItem[];
  
  selectionActions: {
    setSelected: (
      selectedId: string | null, 
      elementInfo: { id: string; tagName: string }, 
      rect: { 
        x: number; 
        y: number; 
        width: number; 
        height: number;
        layoutWidth?: number;
        layoutHeight?: number;
        rotation?: number;
      } | null, 
      styles: Record<string, string>, 
      stack: HierarchyItem[],
      fiberInfo?: FiberInfo | null
    ) => void;
    setRect: (rect: { 
      x: number; 
      y: number; 
      width: number; 
      height: number;
      layoutWidth?: number;
      layoutHeight?: number;
      rotation?: number;
    } | null) => void;
    setActiveState: (state: InteractionState) => void;
    setEditingText: (editing: boolean) => void;
  };
  isEditingText: boolean;
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
    setEditingText: (isEditingText) => set({ isEditingText }),
  },
  isEditingText: false,
});
