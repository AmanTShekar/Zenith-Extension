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
