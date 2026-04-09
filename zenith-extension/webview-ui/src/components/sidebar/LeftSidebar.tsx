import { useState } from 'react';
import { useSelectionStore, useSystemStore } from '../../stores';
import { LayersPanel } from './LayersPanel';
import { ElementsPanel } from './ElementsPanel';
import { clsx } from 'clsx';

type SidebarTab = 'layers' | 'elements';

export function LeftSidebar() {
  const connectedServer = useSystemStore(state => state.connectedServer);
  const devServerUrl = useSystemStore(state => state.devServerUrl);
  const detectedServers = useSystemStore(state => state.detectedServers);
  const stagedCount = useSelectionStore(state => state.stagedCount);
  const [activeTab, setActiveTab] = useState<SidebarTab>('layers');

  // A connection is active if sidecar is connected OR a manual URL is set
  const isConnected = !!connectedServer || !!devServerUrl;
  const activeHost = connectedServer || devServerUrl;

  const TABS: { id: SidebarTab; label: string; icon: string; title: string }[] = [
    { id: 'layers',   label: 'Layers',     icon: 'ph-stack',        title: 'Layer hierarchy — click to select elements' },
    { id: 'elements', label: 'Elements',   icon: 'ph-plus-square',  title: 'Insert elements into selected parent' },
  ];

  return (
    <aside className="w-[260px] max-w-[30%] shrink-0 bg-[#0d0d0d]/90 backdrop-blur-xl border-r border-white/5 flex flex-col h-full overflow-hidden">
      
      {/* Tab Bar */}
      <div className="flex border-b border-white/5 shrink-0 bg-white/[0.02]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.title}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2',
              activeTab === tab.id
                ? 'border-[#00f2ff] text-[#00f2ff] bg-[#00f2ff]/5'
                : 'border-transparent text-white/20 hover:text-white/50 hover:bg-white/[0.03]'
            )}
          >
            <i className={clsx('ph text-[13px]', tab.icon)} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === 'layers' && <LayersPanel />}
        {activeTab === 'elements' && <ElementsPanel />}
      </div>

      {/* System & Network Footer */}
      <div className="bg-black/40 border-t border-border-subtle p-3 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
           <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">System</span>
           <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500/50'}`} />
        </div>

        <div className="space-y-2">
           <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between text-[10px]">
                 <span className="text-white/40">{connectedServer ? 'Sidecar' : 'Target'}</span>
                 <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                   {isConnected ? 'Connected' : 'Offline'}
                 </span>
              </div>
              {activeHost && (
                <div className="flex items-center justify-between text-[10px]">
                   <span className="text-white/30 font-mono truncate">{activeHost}</span>
                </div>
              )}
           </div>

           {stagedCount > 0 && (
             <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px]">
                <span className="text-blue-400 font-bold uppercase tracking-tight">Pending Sync</span>
                <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">{stagedCount}</span>
             </div>
           )}
        </div>

        {detectedServers.length > 0 && (
          <div className="space-y-1.5">
             <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Detected Hosts</span>
             <div className="flex flex-col gap-1">
                {detectedServers.map(url => (
                  <div key={url} className="flex items-center justify-between px-2 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.05] text-[10px]">
                     <div className="flex items-center gap-2 truncate">
                        <i className="ph ph-broadcast text-blue-400/60" />
                        <span className="text-white/60 truncate">{url.replace('http://', '').replace('https://', '')}</span>
                     </div>
                     <i className="ph ph-check-circle text-green-500/40" />
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </aside>
  );
}
