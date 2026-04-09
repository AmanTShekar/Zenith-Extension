import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function HomeView({ 
  onStart, 
  projectName, 
  connectedServer,
  devServerUrl,
  detectedServers,
  manualUrl,
  setManualUrl,
  onConnect,
  onPopOut,
}: { 
  onStart: () => void; 
  projectName: string;
  connectedServer: string | null;
  devServerUrl: string | null;
  detectedServers: string[];
  manualUrl: string;
  setManualUrl: (url: string) => void;
  onConnect: (url: string) => void;
  onPopOut: () => void;
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#050505] selection:bg-white/20 relative w-full h-full overflow-y-auto">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full flex flex-col items-center gap-12 relative z-[60] my-auto"
      >
        {/* Minimalist Heading Center */}
        <header className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="flex flex-col items-center justify-center gap-6"
          >
             <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center text-black text-3xl shadow-[0_0_80px_rgba(255,255,255,0.2)]">
                <i className="ph-fill ph-cube" />
             </div>
             <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-[-0.06em] text-white leading-none">ZENITH</h1>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Universal Design OS</p>
             </div>
          </motion.div>
          
          <AnimatePresence>
            {(connectedServer || devServerUrl) && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center justify-center gap-2"
              >
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-white/50">
                   <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
                   <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                      {projectName || (devServerUrl ? 'Target Linked' : 'Workspace Linked')}
                   </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Action Center - Focused on Sessions */}
        <div className="w-full relative space-y-8">
           <div className="w-full h-[px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

           <AnimatePresence mode="wait">
             <motion.div 
               key="unified-actions"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-8"
             >
                {/* 1. Primary Session Controls (TOP) */}
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={onStart}
                    disabled={!devServerUrl}
                    className={`w-full h-16 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group ${devServerUrl ? 'bg-white text-black hover:bg-white/90' : 'bg-white/5 text-white/5 opacity-30 cursor-default border border-white/5'}`}
                  >
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Start Design Session</span>
                     <i className="ph-fill ph-monitor text-xl group-hover:scale-110 transition-transform" />
                  </button>
                  <div className="flex items-center gap-2">
                     <button onClick={onPopOut} className="flex-1 h-11 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] text-white/30 text-[8px] font-black uppercase tracking-widest transition-all">New Window</button>
                     <button onClick={() => setIsRevealed(!isRevealed)} className={`flex-1 h-11 rounded-lg border transition-all text-[8px] font-black uppercase tracking-widest ${isRevealed ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/[0.02] border-white/5 text-white/30'}`}>
                        {isRevealed ? 'Hide Search' : 'Switch Host'}
                     </button>
                  </div>
                </div>

                {/* 2. Host Search / Manual Connection */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2 bg-white/[0.02] p-2 rounded-xl border border-white/10 w-full group focus-within:border-white/20 transition-all">
                         <input 
                           type="text" 
                           value={manualUrl}
                           onChange={(e) => setManualUrl(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               onConnect(manualUrl);
                               onStart();
                             }
                           }}
                           className="bg-transparent pl-2 py-2 text-xs text-white focus:outline-none flex-1 font-mono placeholder:text-white/5"
                           placeholder="Enter host URL..."
                         />
                         <button 
                           onClick={() => {
                             onConnect(manualUrl);
                             onStart();
                           }} 
                           className="h-10 px-4 rounded-lg bg-white text-black font-black uppercase tracking-widest text-[9px] hover:bg-[#00f2ff] transition-all"
                         >
                            Connect
                         </button>
                      </div>
                      <p className="text-[8px] font-black text-white/5 uppercase tracking-[0.3em]">Engine Host Search</p>
                  </div>

                  {isRevealed && detectedServers.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <div className="text-[8px] font-black text-white/10 uppercase tracking-widest text-center mb-2">Detected Hosts</div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {detectedServers.map(url => (
                          <button
                            key={url}
                            onClick={() => {
                              onConnect(url);
                              onStart();
                              setIsRevealed(false);
                            }}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 transition-all flex items-center justify-between group"
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-1 h-1 rounded-full bg-blue-500/40 group-hover:bg-blue-400" />
                                <span className="text-[11px] font-bold text-white/20 group-hover:text-white/70 transition-all font-mono tracking-tight">{url.replace('http://', '').replace('https://', '')}</span>
                             </div>
                             <i className="ph ph-arrow-right text-white/10 group-hover:text-blue-400 text-xs transition-all" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
             </motion.div>
           </AnimatePresence>
        </div>

        <footer className="mt-4">
           <p className="text-[8px] font-black text-white/5 uppercase tracking-[0.4em]">Zenith v4.2.1 Stabilized</p>
        </footer>
      </motion.div>
    </div>
  );
}
