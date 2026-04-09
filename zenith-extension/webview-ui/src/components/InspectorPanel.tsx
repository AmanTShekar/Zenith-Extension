import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StylesTab } from './inspector/StylesTab';
import { ComputedTab } from './inspector/ComputedTab';
import { LayoutTab } from './inspector/LayoutTab';
import { useSelectionStore } from '../stores';

const TABS = ['Styles', 'Computed', 'Layout'] as const;
type Tab = typeof TABS[number];

export function InspectorPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('Styles');
  const { selectedId, elementSignature } = useSelectionStore();

  return (
    <aside id="right-sidebar" className="w-[300px] max-w-[35%] shrink-0 bg-[#0A0A0A] border-l border-white/5 flex flex-col h-full overflow-hidden shadow-[-20px_0_100px_rgba(0,0,0,0.8)] z-[500]">
      {/* Tab Header — High Fidelity */}
      <div className="flex bg-[#0D0D0D] border-b border-white/5 h-[56px] p-2 gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex flex-col items-center justify-center rounded-xl transition-all relative group ${
              activeTab === tab 
              ? 'bg-white/[0.07] text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)]' 
              : 'text-white/20 hover:text-white/50 hover:bg-white/[0.03]'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-[0.1em] transition-all ${activeTab === tab ? 'scale-105' : 'scale-100'}`}>{tab}</span>
            {activeTab === tab && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 rounded-xl border border-white/10 ring-1 ring-white/5 pointer-events-none"
              />
            )}
            {/* Hover indicator */}
            {activeTab !== tab && (
                <div className="absolute bottom-1 w-0 h-[2px] bg-white/10 group-hover:w-4 transition-all rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <AnimatePresence mode="wait">
          {(!selectedId && !elementSignature) ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 flex items-center justify-center text-white/10 shadow-2xl rotate-3">
                  <i className="ph ph-hand-pointing text-4xl" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 animate-bounce">
                  <i className="ph-fill ph-cursor-click text-lg" />
                </div>
              </div>
              <h3 className="text-white/80 font-black text-xs uppercase tracking-widest mb-2">Editor Ready</h3>
              <p className="text-[10px] leading-relaxed text-white/30 font-medium max-w-[160px]">
                Select any component on the canvas to begin surgically editing styles.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {activeTab === 'Styles' && <StylesTab />}
              {activeTab === 'Computed' && <ComputedTab />}
              {activeTab === 'Layout' && <LayoutTab />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
