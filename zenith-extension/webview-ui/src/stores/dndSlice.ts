import type { StateCreator } from 'zustand';
import type { SelectionSignature } from './types';

export interface DndSlice {
  isDragging: boolean;
  draggedIdentifier: string | null;
  dropTargetId: string | null;
  dropTargetRect: { x: number; y: number; width: number; height: number } | null;
  insertionRect: { x: number; y: number; width: number; height: number } | null;
  insertionIndex: number;
  isDropTargetInvalid: boolean;
  
  dndActions: {
    startDragging: (identifier: string) => void;
    setDropTarget: (
      parentId: string | null, 
      index: number, 
      rect: { x: number; y: number; width: number; height: number } | null,
      insertionRect: { x: number; y: number; width: number; height: number } | null,
      isInvalid?: boolean
    ) => void;
    stopDragging: () => void;
  };
}

export const createDndSlice: StateCreator<DndSlice> = (set) => ({
  isDragging: false,
  draggedIdentifier: null,
  dropTargetId: null,
  dropTargetRect: null,
  insertionRect: null,
  insertionIndex: -1,
  isDropTargetInvalid: false,
  
  dndActions: {
    startDragging: (draggedIdentifier) => set({ 
      isDragging: true, 
      draggedIdentifier,
      dropTargetId: null,
      dropTargetRect: null,
      insertionRect: null,
      insertionIndex: -1,
      isDropTargetInvalid: false
    }),
    
    setDropTarget: (dropTargetId, insertionIndex, dropTargetRect, insertionRect, isInvalid = false) => set({ 
      dropTargetId, 
      insertionIndex,
      dropTargetRect,
      insertionRect,
      isDropTargetInvalid: isInvalid
    }),
    
    stopDragging: () => set({ 
      isDragging: false, 
      draggedIdentifier: null,
      dropTargetId: null,
      insertionRect: null,
      insertionIndex: -1,
      isDropTargetInvalid: false
    })
  }
});
