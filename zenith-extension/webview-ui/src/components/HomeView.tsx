import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SurgicalDoctor } from './SurgicalDoctor';

export function HomeView({ 
  onStart, 
  projectName, 
  connectedServer,
  devServerUrl,
  detectedServers,
  manualUrl,
  setManualUrl,
  onConnect,
}: { 
  onStart: () => void; 
  projectName: string; 
  connectedServer: string | null;
  devServerUrl: string | null;
  detectedServers: string[];
  manualUrl: string;
  setManualUrl: (url: string) => void;
  onConnect: (url: string) => void;
}) {
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);
  const [isUrlPanelOpen, setIsUrlPanelOpen] = useState(detectedServers.length > 0);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-base selection:bg-accent/20 relative w-full h-full">
      {/* Ultra-Minimal Background */}
      <div className="absolute inset-0 canvas-grid opacity-[0.2]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-base" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full flex flex-col items-center gap-16 relative z-[60]"
      >
        {/* Minimalist Heading Center */}
        <header className="text-center space-y-4">
           <motion.div 
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="flex flex-col items-center gap-6"
           >
              <div className="space-y-1">
                 <h1 className="text-6xl font-black tracking-[-0.1em] text-white leading-none">ZENITH</h1>
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.8em] pl-1.5">Surgical Studio</p>
              </div>
           </motion.div>
        </header>

        {/* Main Action Hub */}
        <div className="w-full space-y-8">
           <div className="flex flex-col gap-4">
              <button 
                onClick={onStart}
                disabled={!devServerUrl && !connectedServer}
                className={`w-full h-20 rounded-2xl transition-all duration-500 flex items-center justify-between px-8 group ${ (devServerUrl || connectedServer) ? 'bg-white text-black hover:shadow-[0_0_80px_rgba(255,255,255,0.15)] active:scale-[0.98]' : 'bg-white/[0.02] text-white/10 cursor-not-allowed border border-white/5 opacity-50'}`}
              >
                 <div className="flex flex-col items-start gap-1">
                    <span className="text-[12px] font-black uppercase tracking-widest">{ (devServerUrl || connectedServer) ? 'Engage Session' : 'Engine Standby'}</span>
                    <span className="text-[9px] font-mono opacity-40">{projectName ? projectName.toUpperCase() : 'NO PROJECT LINKED'}</span>
                 </div>
                 <i className="ph-fill ph-arrow-right text-2xl" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => setIsDoctorOpen(true)}
                   className="h-14 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-accent/40 text-text-secondary hover:text-white transition-all flex items-center justify-center gap-3 group"
                 >
                    <i className="ph-fill ph-stethoscope text-lg group-hover:text-accent group-hover:drop-shadow-[0_0_5px_rgba(0,240,255,0.5)] transition-all" />
                    <span className="text-[10px] font-black uppercase tracking-wider">One-Click Doctor</span>
                 </button>
                 <button 
                   onClick={() => setIsUrlPanelOpen(!isUrlPanelOpen)}
                   className={`h-14 rounded-xl border transition-all flex items-center justify-center gap-3 group ${isUrlPanelOpen ? 'bg-accent/5 border-accent/20 text-accent' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-text-secondary hover:text-white'}`}
                 >
                    <i className="ph-fill ph-broadcast text-lg" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{isUrlPanelOpen ? 'Hide Hosts' : 'Switch Host'}</span>
                 </button>
              </div>
           </div>

           {/* URL Input & Detected Hub */}
           <AnimatePresence>
              {isUrlPanelOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-1 pr-1.5 flex items-center gap-2 bg-surface border border-border-normal rounded-xl focus-within:border-accent/30 transition-all">
                      <input 
                        type="text" 
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        className="flex-1 bg-transparent px-4 py-3 text-xs font-mono text-white focus:outline-none"
                        placeholder="http://localhost:5173"
                      />
                      <button 
                        onClick={() => { onConnect(manualUrl); onStart(); }}
                        className="px-6 py-2.5 rounded-lg bg-accent text-black text-[10px] font-black uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all"
                      >
                         Connect
                      </button>
                  </div>

                  {detectedServers.length > 0 && (
                    <div className="space-y-2">
                       {detectedServers.map(url => (
                         <button 
                           key={url}
                           onClick={() => { onConnect(url); onStart(); }}
                           className="w-full p-4 rounded-xl bg-white/[0.01] border border-border-subtle hover:border-accent/30 hover:bg-accent/5 flex items-center justify-between group transition-all"
                         >
                            <div className="flex items-center gap-4">
                               <div className="w-1.5 h-1.5 rounded-full bg-accent opacity-20 group-hover:opacity-100 group-hover:shadow-[0_0_10px_#00f0ff] transition-all" />
                               <span className="text-xs font-mono text-text-secondary group-hover:text-white transition-colors">{url}</span>
                            </div>
                            <i className="ph ph-arrow-up-right text-text-muted group-hover:text-accent transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                         </button>
                       ))}
                    </div>
                  )}
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        <footer className="w-full flex items-center justify-between pt-8 border-t border-border-subtle opacity-30">
           <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${connectedServer ? 'bg-accent shadow-[0_0_10px_#00f0ff]' : 'bg-red-500'}`} />
              <p className="text-[9px] font-black uppercase tracking-[0.2em]">{connectedServer ? 'Engine Online' : 'Engine Offline'}</p>
           </div>
           <p className="text-[9px] font-mono tracking-widest text-text-muted uppercase">Antigravity // v11.7.7</p>
        </footer>
      </motion.div>

      <SurgicalDoctor 
        isOpen={isDoctorOpen} 
        onClose={() => setIsDoctorOpen(false)} 
        connectedServer={connectedServer}
      />
    </div>
  );
}
