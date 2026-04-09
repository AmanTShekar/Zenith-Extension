import { useState } from 'react';
import { useSelectionStore } from '../../stores';

export function ComputedTab() {
  const { computedStyles } = useSelectionStore();
  const [search, setSearch] = useState('');

  const filteredProperties = Object.entries(computedStyles).filter(([key]) =>
    key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Search Header */}
      <div className="p-3 border-b border-border-subtle bg-black/10">
        <div className="relative group">
          <i className="ph ph-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent" />
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-elevated border border-border-subtle rounded-md pl-9 pr-3 py-1.5 text-[11px] focus:outline-none focus:border-accent transition-all placeholder:text-text-muted/50"
          />
        </div>
      </div>

      {/* Property List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
        <div className="space-y-1">
          {filteredProperties.map(([key, value]) => (
            <div 
              key={key} 
              className="group flex flex-col py-1.5 border-b border-border-subtle/30 last:border-0 hover:bg-hover px-2 -mx-2 rounded transition-colors"
            >
              <span className="text-[10px] text-text-secondary group-hover:text-text-primary transition-colors font-mono tracking-tight">{key}</span>
              <span className="text-[11px] text-accent font-bold mt-0.5 truncate">{value?.toString() || 'none'}</span>
            </div>
          ))}
          {filteredProperties.length === 0 && (
            <div className="py-20 text-center opacity-30">
               <i className="ph ph-monitor-play text-3xl mb-2 opacity-50 block" />
               <span className="text-[9px] uppercase font-bold">No results found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
