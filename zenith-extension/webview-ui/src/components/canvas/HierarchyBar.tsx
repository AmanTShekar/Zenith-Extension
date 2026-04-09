import React from 'react';
import { useSelectionStore } from '../../stores';
import { clsx } from 'clsx';

export interface HierarchyItem {
  id: string;
  tagName: string;
  className: string;
  componentName?: string;
}

export function HierarchyBar() {
  const currentStack = useSelectionStore(state => state.currentStack) as HierarchyItem[];
  const selectedId = useSelectionStore(state => state.selectedId);
  const elementSignature = useSelectionStore(state => state.elementSignature);

  if (!Array.isArray(currentStack) || currentStack.length === 0) {
    return (
      <div className="h-8 bg-black/40 border-t border-white/5 flex items-center px-4">
        <span className="text-[10px] text-white/10 uppercase tracking-widest font-black">
          {selectedId ? "Loading Context..." : "No Selection"}
        </span>
      </div>
    );
  }

  // Reverse stack to show root on left, selection on right
  const stack = [...currentStack].reverse();

  return (
    <div className="h-8 bg-black/40 border-t border-white/5 flex items-center px-2 shrink-0 overflow-x-auto no-scrollbar backdrop-blur-md">
      {stack.map((item, index) => (
        <React.Fragment key={item.id + index}>
          {index > 0 && (
            <i className="ph ph-caret-right text-[10px] text-white/20 mx-1" />
          )}
          <button
            onClick={() => {
              window.postMessage({ 
                type: 'requestSelect', 
                zenithId: item.id 
              }, '*');
            }}
            className={clsx(
              "px-1.5 py-0.5 rounded hover:bg-white/10 transition-all flex items-center gap-1 group",
              item.id === selectedId ? "bg-blue-500/20 text-blue-400" : "text-white/40 hover:text-white/80"
            )}
          >
            <span className="text-[10px] font-mono leading-none lowercase group-hover:text-blue-400">
              {item.tagName}
            </span>
            {item.className && (
              <span className="text-[9px] opacity-40 group-hover:opacity-100 max-w-[100px] truncate leading-none">
                .{item.className.split(' ')[0]}
              </span>
            )}
          </button>
        </React.Fragment>
      ))}
      
      {elementSignature && (
        <div className="flex items-center">
            <i className="ph ph-caret-right text-[10px] text-white/20 mx-1" />
            <div className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
                <i className="ph ph-lightning-fill text-[8px]" />
                <span className="text-[10px] font-mono leading-none capitalize italic">
                    {elementSignature.tag}
                </span>
            </div>
        </div>
      )}
    </div>
  );
}
