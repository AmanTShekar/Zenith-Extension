// ---------------------------------------------------------------------------
// Zenith Ghost-ID Types
// ---------------------------------------------------------------------------

/**
 * A Ghost-ID uniquely identifies a JSX element in the source.
 * Format: `{relativePath}:{line}:{column}`
 *
 * Examples:
 *   - `src/components/Button.tsx:14:6`
 *   - `src/App.tsx:8:4`
 */
export type GhostId = string;

/**
 * Configuration for the Zenith Vite plugin.
 */
export interface ZenithPluginOptions {
  /** Project root directory. Defaults to Vite's root. */
  root?: string;

  /**
   * Glob patterns for files to include. Defaults to common JSX/TSX paths.
   * Example: `['src/**\/*.tsx', 'src/**\/*.jsx']`
   */
  include?: string[];

  /**
   * Glob patterns for files to exclude.
   * `node_modules` is always excluded.
   */
  exclude?: string[]

  /** The attribute name injected into JSX elements. Default: `data-zenith-id`. */
  attributeName?: string;

  /** Enable writing to `.zenith/` shadow directory. Default: `false`. */
  shadow?: boolean;

  /** The port the Zenith sidecar is listening on for HMR signals. Default: `4321`. */
  sidecarPort?: number;
}

/**
 * An entry in the ghost-id manifest mapping IDs to source locations.
 */
export interface GhostManifestEntry {
  /** The ghost ID. */
  id: GhostId;
  /** Element tag name (e.g., `div`, `Button`, `MyComponent`). */
  tagName: string;
  /** Relative file path. */
  file: string;
  /** 1-indexed line number. */
  line: number;
  /** 0-indexed column offset. */
  column: number;
  /** Whether this element is within a dynamic logic zone (loop/ternary). */
  isLogicLocked: boolean;
}

/**
 * Result of injecting ghost IDs into a source file.
 */
export interface InjectionResult {
  /** The transformed source code. */
  code: string;
  /** Source map (as a JSON-serializable object). */
  map: object | null;
  /** All ghost IDs injected in this file. */
  entries: GhostManifestEntry[];
}

// ---------------------------------------------------------------------------
// Bridge postMessage payload types (new — v3.11)
// ---------------------------------------------------------------------------

/**
 * One entry in the React fiber component stack.
 * Populated by walking __reactFiber up the DOM node's fiber tree.
 */
export interface FiberStackEntry {
  /** Relative file path (forward-slashes). Empty string if unknown. */
  file: string;
  /** 1-indexed source line number. */
  line: number;
  /** 0-indexed source column. */
  col: number;
  /** Tag name (native) or component display name. */
  name: string;
  /** True if this is a React component (function/class), false for native elements. */
  isComponent: boolean;
}

/**
 * postMessage payload sent when the user clicks an element in the preview.
 * type: 'zenithSelect'
 */
export interface ZenithSelectEvent {
  type: 'zenithSelect';
  /** Ghost ID from data-zenith-id on the deepest matching DOM element. */
  zenithId: GhostId;
  /**
   * Full React fiber component stack — deepest element first.
   * Use this to let the user pick which level to edit.
   */
  zenithStack: FiberStackEntry[];
  /** Tag name + optional #id of the clicked DOM element. */
  element: string;
  /** className string of the clicked DOM element. */
  className: string;
  /** Bounding rect of the clicked element in viewport coordinates. */
  rect: { x: number; y: number; w: number; h: number };
}

/**
 * postMessage payload sent when the user commits an inline text edit.
 * type: 'zenithTextEdit'
 * Triggered on blur or Enter after double-clicking an element.
 */
export interface ZenithTextEditEvent {
  type: 'zenithTextEdit';
  zenithId: GhostId;
  zenithStack: FiberStackEntry[];
  newText: string;
  oldText: string;
}

/**
 * postMessage payload sent FROM the extension INTO the preview iframe.
 * type: 'zenithPatchStyle'
 * Applies an inline style immediately — zero HMR delay.
 */
export interface ZenithPatchStyleEvent {
  type: 'zenithPatchStyle';
  zenithId: GhostId;
  /** CSS property name (camelCase, e.g. 'backgroundColor'). */
  property: string;
  /** New CSS value string (e.g. '#ff0000', '16px'). */
  value: string;
}

/**
 * postMessage sent FROM the extension after HMR completes for a patched file.
 * Instructs the bridge to clean up optimistic inline styles.
 * type: 'zenithHmrComplete'
 */
export interface ZenithHmrCompleteEvent {
  type: 'zenithHmrComplete';
}
