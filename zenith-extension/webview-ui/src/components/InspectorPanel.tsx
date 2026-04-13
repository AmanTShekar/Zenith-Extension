import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StylesTab } from './inspector/StylesTab';
import { ComputedTab } from './inspector/ComputedTab';
import { LayoutTab } from './inspector/LayoutTab';
import { SelectionActions } from './inspector/SelectionActions';
import { useSelectionStore } from '../stores';

const TABS = ['Styles', 'Computed', 'Layout'] as const;
type Tab = typeof TABS[number];

export function InspectorPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('Styles');
  const { selectedId, elementSignature } = useSelectionStore();

  return (
    <aside id="right-sidebar" className="w-[300px] max-w-[35%] shrink-0 bg-base border-l border-white/5 flex flex-col h-full overflow-hidden z-[500]">
      {/* Tab Header — Ultra Minimalist */}
      <div className="flex bg-surface border-b border-white/5 h-[44px] p-1 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex flex-col items-center justify-center rounded transition-all relative group ${
              activeTab === tab 
              ? 'bg-white/[0.04] text-white' 
              : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]'
            }`}
          >
            <span className={`text-[9px] font-black uppercase tracking-[0.1em]`}>{tab}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {(!selectedId && !elementSignature) ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="space-y-4 opacity-20">
                 <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-8 h-px bg-white/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-white font-black text-[10px] uppercase tracking-[0.4em]">Standby</h3>
                    <p className="text-[9px] text-white font-medium uppercase tracking-widest">Awaiting Selection</p>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.1 }}
              className="h-full"
            >
              {activeTab === 'Styles' && <StylesTab />}
              {activeTab === 'Computed' && <ComputedTab />}
              {activeTab === 'Layout' && <LayoutTab />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(selectedId || elementSignature) && <SelectionActions />}
    </aside>
  );
}
