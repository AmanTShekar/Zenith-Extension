import React, { useState, useRef, useEffect } from 'react';
import { useExplorerStore, useSelectionStore, type TreeNode } from '../../stores';
import { clsx } from 'clsx';
import { vscode } from '../../bridge';

// ---------------------------------------------------------------------------
// Context Menu
// ---------------------------------------------------------------------------

interface MenuItem {
  label?: string;
  icon?: string;
  action?: () => void;
  shortcut?: string;
  danger?: boolean;
  type?: 'divider';
}

function ContextMenu({ x, y, node, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const send = (type: string, extra?: object) => {
    vscode.postMessage({ type, zenithId: node.id, ...extra });
    onClose();
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Select',
      icon: 'ph-cursor',
      action: () => {
        window.postMessage({ type: 'requestSelect', zenithId: node.id }, '*');
        onClose();
      },
    },
    { type: 'divider' },
    {
      label: 'Duplicate',
      icon: 'ph-copy',
      shortcut: '⌘D',
      action: () => send('structuralOperation', { operation: 'duplicate' }),
    },
    {
      label: 'Wrap in Div',
      icon: 'ph-frame-corners',
      action: () => send('structuralOperation', { operation: 'group', payload: { containerTag: 'div', containerAttributes: {} } }),
    },
    {
      label: 'Unwrap',
      icon: 'ph-arrow-square-out',
      action: () => send('structuralOperation', { operation: 'ungroup' }),
    },
    {
      label: 'Insert Child Div',
      icon: 'ph-plus-square',
      action: () => send('structuralOperation', {
        operation: 'insert',
        payload: { tagName: 'div', textContent: '', attributes: {}, position: { type: 'append' } },
      }),
    },
    { type: 'divider' },
    {
      label: 'Move Up',
      icon: 'ph-arrow-up',
      action: () => send('structuralOperation', { operation: 'moveUp' }),
    },
    {
      label: 'Move Down',
      icon: 'ph-arrow-down',
      action: () => send('structuralOperation', { operation: 'moveDown' }),
    },
    { type: 'divider' },
    {
      label: 'Delete Element',
      icon: 'ph-trash',
      shortcut: '⌦',
      danger: true,
      action: () => send('structuralOperation', { operation: 'delete' }),
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] bg-[#111] border border-white/10 rounded-lg shadow-2xl shadow-black/60 overflow-hidden py-1"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-1.5 border-b border-white/5 mb-1">
        <span className="text-[9px] font-mono text-white/30">&lt;{node.tagName}&gt;</span>
        {node.componentName && (
          <span className="ml-1.5 text-[9px] text-purple-400/60">{node.componentName}</span>
        )}
      </div>

      {menuItems.map((item, i) => {
        if (item.type === 'divider') {
          return <div key={i} className="h-px bg-white/5 my-1 mx-2" />;
        }
        return (
          <button
            key={item.label}
            onClick={item.action}
            className={clsx(
              'w-full flex items-center justify-between px-3 py-1.5 text-[11px] transition-colors',
              item.danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
            )}
          >
            <div className="flex items-center gap-2">
              <i className={`ph ${item.icon} text-[12px] opacity-70`} />
              {item.label}
            </div>
            {item.shortcut && (
              <span className="text-[9px] text-white/20 font-mono">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LayersPanel
// ---------------------------------------------------------------------------

export function LayersPanel() {
  const { tree, expandedIds, actions } = useExplorerStore();
  const selectedId = useSelectionStore(state => state.selectedId);
  const hiddenIds = useExplorerStore(state => state.hiddenIds);
  const lockedIds = useExplorerStore(state => state.lockedIds);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: TreeNode } | null>(null);

  const requestTree = () => {
    window.postMessage({ type: 'zenithRequestTree' }, '*');
  };

  React.useEffect(() => {
    requestTree();
  }, []);

  // Keyboard shortcuts for selected element
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName === 'INPUT') return;
        e.preventDefault();
        vscode.postMessage({ type: 'structuralOperation', operation: 'delete', zenithId: selectedId });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        vscode.postMessage({ type: 'structuralOperation', operation: 'duplicate', zenithId: selectedId });
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selectedId]);

  if (!tree || tree.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
          <i className="ph ph-tree-structure text-2xl text-white/20" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-white/60">No elements mapped</h3>
          <p className="text-xs text-white/40 mt-1">Connect to a live project to see the layer hierarchy.</p>
        </div>
        <button
          onClick={requestTree}
          className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/60 transition-colors border border-white/5"
        >
          Refresh Tree
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]" onClick={() => setContextMenu(null)}>
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Layers</h3>
        <div className="flex items-center gap-1">
          {selectedId && (
            <button
              onClick={() => vscode.postMessage({ type: 'structuralOperation', operation: 'delete', zenithId: selectedId })}
              title="Delete selected element"
              className="p-1 hover:bg-red-500/10 rounded text-white/30 hover:text-red-400 transition-colors"
            >
              <i className="ph ph-trash text-xs" />
            </button>
          )}
          <button
            onClick={requestTree}
            className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white/80 transition-colors"
            title="Refresh Tree"
          >
            <i className="ph ph-arrows-clockwise text-xs" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-2">
        {tree.map(node => (
          <TreeItem
            key={node.id}
            node={node}
            depth={0}
            expandedIds={expandedIds}
            selectedId={selectedId}
            hiddenIds={hiddenIds}
            lockedIds={lockedIds}
            toggleExpanded={actions.toggleExpanded}
            onContextMenu={(x, y, n) => setContextMenu({ x, y, node: n })}
          />
        ))}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TreeItem
// ---------------------------------------------------------------------------

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  expandedIds: Set<string>;
  selectedId: string | null;
  hiddenIds: Set<string>;
  lockedIds: Set<string>;
  toggleExpanded: (id: string) => void;
  onContextMenu: (x: number, y: number, node: TreeNode) => void;
}

function TreeItem({ 
  node, 
  depth, 
  expandedIds, 
  selectedId, 
  hiddenIds,
  lockedIds,
  toggleExpanded, 
  onContextMenu 
}: TreeItemProps) {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const isHidden = hiddenIds.has(node.id);
  const isLocked = lockedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const { actions } = useExplorerStore();

  const getIcon = (tag: string, isComponent: boolean) => {
    if (isComponent) return 'ph-diamond';
    switch (tag) {
      case 'div':
      case 'section':
      case 'main':
      case 'article':
        return 'ph-bounding-box';
      case 'img':      return 'ph-image';
      case 'p':
      case 'span':
      case 'h1':
      case 'h2':
      case 'h3':       return 'ph-text-t';
      case 'button':   return 'ph-hand-pointing';
      case 'input':
      case 'textarea': return 'ph-textbox';
      case 'svg':      return 'ph-vector-three';
      case 'nav':      return 'ph-list';
      case 'a':        return 'ph-link';
      case 'ul':
      case 'ol':       return 'ph-list-bullets';
      default:         return 'ph-cube';
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.isZenithElement) {
      window.postMessage({ type: 'requestSelect', zenithId: node.id }, '*');
    }
    toggleExpanded(node.id);
  };

  const handleCaretClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpanded(node.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e.clientX, e.clientY, node);
  };

  const isComponent = !!node.componentName;

  return (
    <div className="flex flex-col relative">
      {/* Vertical Nesting Guide */}
      {depth > 0 && (
        <div 
          className="absolute border-l border-white/5 top-0 bottom-0 pointer-events-none" 
          style={{ left: `${(depth) * 12 + 10}px` }} 
        />
      )}

      <div
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => {
            if (node.isZenithElement) {
                window.postMessage({ type: 'requestHover', zenithId: node.id }, '*');
            }
        }}
        onMouseLeave={() => {
            window.postMessage({ type: 'requestHoverClear' }, '*');
        }}
        className={clsx(
          'group flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-all relative border-l-2',
          isSelected
            ? 'bg-[#00f2ff]/10 border-[#00f2ff] text-[#00f2ff]'
            : 'border-transparent hover:bg-white/[0.03] text-white/40 hover:text-white/80'
        )}
        style={{ paddingLeft: `${(depth + 1) * 12}px` }}
      >
        <div className="w-4 h-4 flex items-center justify-center shrink-0" onClick={handleCaretClick}>
          {hasChildren && (
            <i className={clsx(
              'ph ph-caret-right text-[10px] transition-transform hover:text-white',
              isExpanded && 'rotate-90'
            )} />
          )}
        </div>

        {/* Photoshop-style Visibility Controls on the Left */}
        <div className="flex items-center gap-0.5 shrink-0 -ml-0.5 mr-1">
          <button
            onClick={e => { 
                e.stopPropagation(); 
                actions.toggleVisibility(node.id);
                vscode.postMessage({ type: 'toggleVisibility', zenithId: node.id, isHidden: !isHidden });
            }}
            className={clsx(
                "p-0.5 hover:bg-white/10 rounded transition-colors",
                isHidden ? "text-yellow-500 opacity-100" : "text-white/30 hover:text-white"
            )}
            title="Toggle Visibility"
            style={{ opacity: isHidden ? 1 : undefined }} // Ensure eye-slash is always visible if intentionally hidden
          >
            <i className={clsx("ph text-[12px]", isHidden ? "ph-eye-slash" : "ph-eye")} />
          </button>
          <button
            onClick={e => { 
                e.stopPropagation(); 
                actions.toggleLock(node.id);
                vscode.postMessage({ type: 'toggleLock', zenithId: node.id, isLocked: !isLocked });
            }}
            className={clsx(
                "p-0.5 hover:bg-white/10 rounded transition-colors",
                isLocked ? "text-red-500 opacity-100" : "text-white/30 hover:text-white"
            )}
            title="Lock Layer"
            style={{ opacity: isLocked ? 1 : undefined }}
          >
            <i className={clsx("ph text-[12px]", isLocked ? "ph-lock-simple-fill" : "ph-lock-simple")} />
          </button>
        </div>

        <i className={clsx(
          'ph text-[13px] shrink-0', 
          isComponent ? 'ph-fill text-purple-400' : 'opacity-40',
          getIcon(node.tagName, isComponent)
        )} />

        <div className="flex items-baseline gap-2 truncate flex-1 min-w-0 ml-1">
          {node.componentName ? (
            <>
              <span className={clsx(
                'text-[10.5px] font-bold truncate',
                isSelected ? 'text-[#00F0FF]' : 'text-purple-300'
              )}>
                {node.componentName}
              </span>
              <span className="text-[8px] opacity-20 font-mono tracking-tighter uppercase">{node.tagName}</span>
            </>
          ) : (
            <span className={clsx(
              'text-[10.5px] font-medium truncate',
              isSelected ? 'text-[#00F0FF]' : 'opacity-80',
              !node.isZenithElement && 'italic opacity-30 text-[9px]'
            )}>
              {node.tagName}
            </span>
          )}
        </div>

        {node.className && (
          <span className="text-[8px] opacity-20 group-hover:opacity-60 truncate font-mono shrink-0 max-w-[40px] mr-1">
            .{node.className.split(' ')[0]}
          </span>
        )}

        {isSelected && (
          <div className="w-1 h-1 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] animate-pulse shrink-0" />
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col">
          {node.children.map(child => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              hiddenIds={hiddenIds}
              lockedIds={lockedIds}
              toggleExpanded={toggleExpanded}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}

