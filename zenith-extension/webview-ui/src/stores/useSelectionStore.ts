import { create } from 'zustand';
import { vscode } from '../bridge';
import { normalizeStyles } from './utils';

export interface SelectionSignature {
  tag: string;
  classes: string[];
  textContent: string;
  xpath: string;
}

export interface FiberInfo {
  name: string;
  source?: { fileName: string; lineNumber: number; columnNumber: number };
  owner?: { name: string; source: FiberInfo['source'] };
}

export interface HierarchyItem {
  id: string;
  tagName: string;
  className: string;
  componentName?: string;
}

export type InteractionState = 'base' | 'hover' | 'focus' | 'active' | 'disabled';

interface SelectionState {
  selectedId: string | null;
  elementSignature: SelectionSignature | null;
  fiberInfo: FiberInfo | null;
  elementInfo: { id: string; tagName: string } | null;
  rect: { x: number; y: number; width: number; height: number } | null;
  hoverRect: { x: number; y: number; width: number; height: number } | null;
  hoverTag: string | null;
  computedStyles: Record<string, string>;
  stateStyles: Record<InteractionState, Record<string, string>>;
  activeState: InteractionState;
  currentStack: HierarchyItem[];
  measurementData: { 
    top?: number; left?: number; right?: number; bottom?: number;
    parentRect?: { width: number; height: number };
  } | null;
  isDragging: boolean;
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
  
  actions: {
    toggleLiveSave: () => void;
    setStagedCount: (count: number) => void;
    setActiveState: (state: InteractionState) => void;
    setSelected: (
      id: string | null, 
      elementInfo: { id: string; tagName: string }, 
      rect: { x: number; y: number; width: number; height: number } | null, 
      styles: Record<string, string>, 
      stack: HierarchyItem[],
      fiberInfo?: FiberInfo | null
    ) => void;
    setSelectedUniversal: (
      signature: SelectionSignature, 
      rect: { x: number; y: number; width: number; height: number }, 
      styles: Record<string, string>
    ) => void;
    setHover: (rect: { x: number; y: number; width: number; height: number } | null, tag?: string) => void;
    setRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;
    patchStyle: (property: string, value: string) => void;
    previewStyle: (property: string, value: string) => void;
    patchBatch: (styles: Record<string, string>) => void;
    previewBatch: (styles: Record<string, string>) => void;
    setDragging: (isDragging: boolean) => void;
    deleteNode: (id: string) => void;
    duplicateNode: (id: string) => void;
    moveNode: (id: string, parentId: string, oldOrder: string[], newOrder: string[]) => void;
    groupNodes: (ids: string[], containerTag: string) => void;
    commitAll: () => void;
    clearCommits: () => void;
    undo: () => void;
    redo: () => void;
  };
}

const MAX_HISTORY_LENGTH = 50;

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedId: null,
  elementSignature: null,
  fiberInfo: null,
  elementInfo: null,
  rect: null,
  hoverRect: null,
  hoverTag: null,
  computedStyles: {},
  stateStyles: { base: {}, hover: {}, focus: {}, active: {}, disabled: {} },
  activeState: 'base',
  currentStack: [],
  measurementData: null,
  isDragging: false,
  auditIssues: [],
  liveSave: false,
  stagedCount: 0,
  history: [],
  historyIndex: -1,
  
  actions: {
    setDragging: (isDragging) => set({ isDragging }),
    toggleLiveSave: () => set(state => ({ liveSave: !state.liveSave })),
    setStagedCount: (count) => set({ stagedCount: count }),
    setActiveState: (activeState) => set({ activeState }),
    
    setSelected: (selectedId, elementInfo, rect, computedStyles, currentStack, fiberInfo) => {
      const normalizedStyles = normalizeStyles(computedStyles || {});
      set({ 
        selectedId, 
        elementInfo, 
        rect, 
        computedStyles: normalizedStyles, 
        currentStack,
        fiberInfo: fiberInfo || null,
        elementSignature: null,
        history: [{ label: 'Baseline', styles: normalizedStyles, timestamp: Date.now() }],
        historyIndex: 0,
        activeState: 'base',
        stateStyles: { base: {}, hover: {}, focus: {}, active: {}, disabled: {} }
      });
    },

    setSelectedUniversal: (elementSignature, rect, computedStyles) => {
      const normalizedStyles = normalizeStyles(computedStyles);
      set({
        elementSignature,
        rect,
        computedStyles: normalizedStyles,
        selectedId: null,
        elementInfo: null,
        currentStack: [],
        history: [{ label: 'Baseline', styles: normalizedStyles, timestamp: Date.now() }],
        historyIndex: 0,
        activeState: 'base',
        stateStyles: { base: {}, hover: {}, focus: {}, active: {}, disabled: {} }
      });
    },


    setHover: (hoverRect, tag) => set({ hoverRect, hoverTag: tag ?? null }),
    setRect: (rect) => set({ rect }),
    
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
      
      // Enforce Photoshop-style memory limits
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

      vscode.postMessage({
        type: 'patchStyle',
        zenithId: state.selectedId,
        signature: state.elementSignature,
        property,
        value: propertyValue,
        interactionState: activeState,
      });
    },

    previewStyle: (property: string, value: string) => {
      const state = get();
      const newStyles = { ...state.computedStyles, [property]: value };
      set({ computedStyles: newStyles });

      window.dispatchEvent(new CustomEvent('zenith-preview-style', {
        detail: { zenithId: state.selectedId, property, value }
      }));
    },

    previewBatch: (styles: Record<string, string>) => {
      if (get().isDragging) return;
      const state = get();
      const newStyles = { ...state.computedStyles, ...styles };
      set({ computedStyles: newStyles });

      window.dispatchEvent(new CustomEvent('zenith-preview-style', {
        detail: { zenithId: state.selectedId, styles }
      }));
    },

    patchBatch: (styles: Record<string, string>) => {
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

      vscode.postMessage({
        type: 'zenithBatchPatch',
        zenithId: state.selectedId,
        signature: state.elementSignature,
        styles,
        interactionState: activeState,
      });
    },

    deleteNode: (id: string) => {
      vscode.postMessage({ type: 'deleteNode', id });
      if (get().selectedId === id) set({ selectedId: null, rect: null });
    },

    duplicateNode: (id: string) => {
      vscode.postMessage({ type: 'duplicateNode', id });
    },

    moveNode: (id: string, parentId: string, oldOrder: string[], newOrder: string[]) => {
      vscode.postMessage({ type: 'moveNode', id, parentId, oldOrder, newOrder });
    },

    groupNodes: (ids: string[], containerTag: string) => {
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
      // Reset history on commit as the current state is now the "base"
      set({ 
        stagedCount: 0,
        history: get().selectedId ? [{ label: 'Baseline', styles: get().computedStyles, timestamp: Date.now() }] : [],
        historyIndex: get().selectedId ? 0 : -1
      });
    },

    jumpToHistory: (index: number) => {
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
      // v12.6 Stabilization: Pure state reset — DO NOT trigger healSession IPC here
      set({ 
        stagedCount: 0,
        history: [],
        historyIndex: -1,
        computedStyles: {},
        stateStyles: { base: {}, hover: {}, focus: {}, active: {}, disabled: {} }
      });
    },
    requestHeal: (source: string = 'unknown') => {
      // v12.6 Stabilization: Dedicated IPC trigger for manual healing
      vscode.postMessage({ type: 'healSession', source });
    }
  }
}));

