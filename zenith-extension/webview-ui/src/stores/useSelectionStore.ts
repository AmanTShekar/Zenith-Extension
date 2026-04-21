import { create } from 'zustand';
import { vscode } from '../bridge';
import { normalizeStyles } from './utils';
import { createGhostSlice } from './ghostSlice';
import type { GhostSlice } from './ghostSlice';
import { createSelectionSlice } from './selectionSlice';
import type { SelectionSlice } from './selectionSlice';
import { createDndSlice } from './dndSlice';
import type { DndSlice } from './dndSlice';

import type { SelectionSignature, FiberInfo, HierarchyItem, InteractionState } from './types';

interface SelectionState extends SelectionSlice, GhostSlice, DndSlice {
  stateStyles: Record<InteractionState, Record<string, string>>;
  measurementData: { 
    top?: number; left?: number; right?: number; bottom?: number;
    parentRect?: { width: number; height: number };
  } | null;
  auditIssues: Array<{ level: 'warn' | 'error'; message: string; type: string }>;
  liveSave: boolean;
  stagedCount: number;
  history: Array<{ 
    label: string; 
    styles?: Record<string, string>; 
    type?: string;
    timestamp: number;
  }>;
  historyIndex: number;
  
  actions: SelectionSlice['selectionActions'] & GhostSlice['ghostActions'] & DndSlice['dndActions'] & {
    toggleLiveSave: () => void;
    setStagedCount: (count: number) => void;
    patchStyle: (property: string, value: string) => void;
    previewStyle: (property: string, value: string) => void;
    patchBatch: (styles: Record<string, string>) => void;
    previewBatch: (styles: Record<string, string>) => void;
    deleteNode: (id: string) => void;
    duplicateNode: (id: string) => void;
    moveNode: (id: string, parentId: string, oldOrder: string[], newOrder: string[]) => void;
    reparentNodes: (identifier: string, newParentId: string, index: number) => void;
    updateText: (id: string, text: string) => void;
    groupNodes: (ids: string[], containerTag: string) => void;
    commitAll: () => void;
    clearCommits: () => void;
    undo: () => void;
    redo: () => void;
    jumpToHistory: (index: number) => void;
    discardLocalChanges: () => void;
    requestHeal: (source?: string) => void;
  };
}

const MAX_HISTORY_LENGTH = 50;

export const useSelectionStore = create<SelectionState>((set, get, ...args) => {
  const selectionSlice = createSelectionSlice(set, get, ...args);
  const ghostSlice = createGhostSlice(set, get, ...args);
  const dndSlice = createDndSlice(set, get, ...args);

  return {
    ...selectionSlice,
    ...ghostSlice,
    ...dndSlice,
    stateStyles: { base: {}, hover: {}, focus: {}, active: {}, disabled: {} },
    measurementData: null,
    auditIssues: [],
    liveSave: false,
    stagedCount: 0,
    history: [],
    historyIndex: -1,
    
    actions: {
      ...selectionSlice.selectionActions,
      ...ghostSlice.ghostActions,
      ...dndSlice.dndActions,

      setSelected: (selectedId, elementInfo, rect, computedStyles, currentStack, fiberInfo) => {
        selectionSlice.selectionActions.setSelected(selectedId, elementInfo, rect, computedStyles, currentStack, fiberInfo);
        set({ elementSignature: null }); // Clear ghost signature on real selection
      },

      setSelectedUniversal: (signature, rect, styles) => {
        ghostSlice.ghostActions.setSelectedUniversal(signature, rect, styles);
        set({ selectedId: null, elementInfo: null, currentStack: [], fiberInfo: null }); // Clear real selection
      },

      toggleLiveSave: () => set(state => ({ liveSave: !state.liveSave })),
      setStagedCount: (count) => set({ stagedCount: count }),
      
      patchStyle: (property, propertyValue) => {
        const state = get();
        const activeState = state.activeState;
        const newStyles = { ...state.computedStyles, [property]: propertyValue };
        
        let newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({
          label: `Set ${property} to ${propertyValue}`,
          styles: newStyles,
          timestamp: Date.now()
        });
        
        if (newHistory.length > MAX_HISTORY_LENGTH) {
          newHistory = newHistory.slice(-MAX_HISTORY_LENGTH);
        }

        const newStateStyles = { ...state.stateStyles };
        newStateStyles[activeState] = { ...newStateStyles[activeState], [property]: propertyValue };

        set({ 
          computedStyles: newStyles,
          stateStyles: newStateStyles,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          stagedCount: state.stagedCount + 1 
        });

        vscode.patchStyleThrottled({
          type: 'patchStyle',
          zenithId: state.selectedId,
          signature: state.elementSignature,
          property,
          value: propertyValue,
          interactionState: activeState,
        });
      },

      previewStyle: (property, value) => {
        const newStyles = { ...get().computedStyles, [property]: value };
        set({ computedStyles: newStyles });
        window.dispatchEvent(new CustomEvent('zenith-preview-style', {
          detail: { zenithId: get().selectedId, property, value }
        }));
      },

      previewBatch: (styles) => {
        if (get().isDragging) return;
        const newStyles = { ...get().computedStyles, ...styles };
        set({ computedStyles: newStyles });
        window.dispatchEvent(new CustomEvent('zenith-preview-style', {
          detail: { zenithId: get().selectedId, styles }
        }));
      },

      patchBatch: (styles) => {
        const state = get();
        const newStyles = { ...state.computedStyles, ...styles };
        
        let newHistory = state.history.slice(0, state.historyIndex + 1);
        const props = Object.keys(styles);
        newHistory.push({
          label: props.length > 2 ? `Batch update ${props.length} styles` : `Update ${props.join(', ')}`,
          styles: newStyles,
          timestamp: Date.now()
        });
        
        if (newHistory.length > MAX_HISTORY_LENGTH) {
          newHistory = newHistory.slice(-MAX_HISTORY_LENGTH);
        }
        
        const newStateStyles = { ...state.stateStyles };
        const activeState = state.activeState;
        newStateStyles[activeState] = { ...newStateStyles[activeState], ...styles };

        set({ 
          computedStyles: newStyles,
          stateStyles: newStateStyles,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          stagedCount: state.stagedCount + Object.keys(styles).length 
        });

        vscode.patchBatchThrottled({
          type: 'zenithBatchPatch',
          zenithId: state.selectedId,
          signature: state.elementSignature,
          styles,
          interactionState: activeState,
        });
      },

      deleteNode: (id) => {
        vscode.postMessage({ type: 'deleteNode', id });
        if (get().selectedId === id) set({ selectedId: null, rect: null });
      },

      duplicateNode: (id) => {
        vscode.postMessage({ type: 'duplicateNode', id });
      },

      moveNode: (id, parentId, oldOrder, newOrder) => {
        vscode.postMessage({ type: 'moveNode', id, parentId, oldOrder, newOrder });
      },

      reparentNodes: (identifier, newParentId, index) => {
        vscode.postMessage({
          type: 'structuralOperation',
          operation: {
            zenithId: identifier,
            reparent: { newParentId, index }
          }
        });
      },

      updateText: (id, text) => {
        vscode.postMessage({
          type: 'structuralOperation',
          operation: {
            zenithId: id,
            contentUpdate: { text }
          }
        });
      },

      groupNodes: (ids, containerTag) => {
        vscode.postMessage({ type: 'groupNodes', ids, containerTag });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const nextIndex = state.historyIndex - 1;
          const entry = state.history[nextIndex];
          const prevStyles = entry.styles || {};
          set({ computedStyles: prevStyles, historyIndex: nextIndex });
          
          vscode.postMessage({
            type: 'zenithBatchPatch',
            zenithId: state.selectedId,
            signature: state.elementSignature,
            styles: prevStyles,
            isUndo: true
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const nextIndex = state.historyIndex + 1;
          const entry = state.history[nextIndex];
          const nextStyles = entry.styles || {};
          set({ computedStyles: nextStyles, historyIndex: nextIndex });

          vscode.postMessage({
            type: 'zenithBatchPatch',
            zenithId: state.selectedId,
            signature: state.elementSignature,
            styles: nextStyles,
            isRedo: true
          });
        }
      },

      commitAll: () => {
        vscode.postMessage({ type: 'commitAll' });
        set({ 
          stagedCount: 0,
          history: get().selectedId ? [{ label: 'Baseline', styles: get().computedStyles, timestamp: Date.now() }] : [],
          historyIndex: get().selectedId ? 0 : -1
        });
      },

      clearCommits: () => {
          // No-op or implementation if needed
      },

      jumpToHistory: (index) => {
        const state = get();
        if (index >= 0 && index < state.history.length) {
          const entry = state.history[index];
          const styles = entry.styles || {};
          set({ computedStyles: styles, historyIndex: index });

          vscode.postMessage({
            type: 'zenithBatchPatch',
            zenithId: state.selectedId,
            signature: state.elementSignature,
            styles,
            isJump: true
          });
        }
      },

      discardLocalChanges: () => {
        set({ 
          stagedCount: 0,
          history: [],
          historyIndex: -1,
          computedStyles: {},
          stateStyles: { base: {}, hover: {}, focus: {}, active: {}, disabled: {} }
        });
      },

      requestHeal: (source = 'unknown') => {
        vscode.postMessage({ type: 'healSession', source });
      }
    }
  };
});
