import React from 'react';
import { useSelectionStore } from '../stores';

export function HistoryPanel() {
  const history = useSelectionStore(state => state.history);
  const historyIndex = useSelectionStore(state => state.historyIndex);
  const actions = useSelectionStore(state => state.actions);

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">History</h3>
        <button 
          onClick={() => actions.discardLocalChanges()}

          className="text-[9px] uppercase font-bold text-red-400/60 hover:text-red-400 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-1 space-y-0.5">
          {history.length === 0 ? (
            <div className="p-8 text-center opacity-20 italic text-[10px]">No history yet</div>
          ) : (
            [...history].reverse().map((item, revIdx) => {
              const idx = history.length - 1 - revIdx;
              return (
                <button
                  key={`${item.timestamp}-${idx}`}
                  onClick={() => actions.jumpToHistory(idx)}
                  className={`w-full p-2 text-left rounded flex items-center gap-3 transition-all group ${
                    idx === historyIndex 
                    ? 'bg-accent/10 border-l-2 border-accent' 
                    : idx > historyIndex
                      ? 'opacity-40 border-l-2 border-transparent hover:bg-white/[0.02]'
                      : 'hover:bg-white/[0.03] border-l-2 border-transparent'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${idx <= historyIndex ? 'bg-accent' : 'bg-white/10'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] truncate leading-tight ${idx <= historyIndex ? 'text-white/90 font-medium' : 'text-white/30'}`}>
                      {item.label}
                    </p>
                    <p className="text-[8px] text-white/20 font-mono mt-0.5">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
