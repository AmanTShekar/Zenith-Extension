import { useSelectionStore, useSystemStore, useLogStore, useCanvasStore } from '../stores';
import { vscode } from '../bridge';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export function AuditPanel() {
  const selectedId = useSelectionStore(state => state.selectedId);
  const entries = useLogStore(state => state.entries);
  const devServerUrl = useSystemStore(state => state.devServerUrl);
  const latency = useSystemStore(state => state.latency);
  const stagedCount = useSelectionStore(state => state.stagedCount);
  const pan = useCanvasStore(state => state.pan);
  const zoom = useCanvasStore(state => state.zoom);
  const { fitView } = useCanvasStore(state => state.actions);

  const runDoctor = () => {
    vscode.postMessage({ type: 'healSession' });
    vscode.postMessage({ type: 'log', text: 'Doctor: Triggering autonomous health scan...', level: 'warn' });
  };

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute top-4 left-4 z-[9999] w-80 bg-[#080808]/90 backdrop-blur-3xl border border-white/5 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      {/* Header with Corner Accents */}
      <div className="relative p-4 border-b border-white/[0.03] bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="absolute top-0 left-0 w-4 h-[1px] bg-accent/40" />
        <div className="absolute top-0 left-0 w-[1px] h-4 bg-accent/40" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_#00f0ff]" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-accent animate-ping opacity-20" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Studio Doctor</span>
              <span className="text-[8px] text-white/30 font-mono uppercase tracking-tighter">Diagnostic Core v42.0</span>
            </div>
          </div>
          <button 
            onClick={runDoctor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-black hover:bg-[#F2F2F2] active:scale-95 transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] group"
          >
            <i className="ph-fill ph-syringe text-[12px] group-hover:rotate-45 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Heal</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.03] space-y-1">
             <div className="text-[7px] font-black text-white/20 uppercase tracking-widest">VFS Buffer</div>
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-accent/80 uppercase tracking-tight">Synced</span>
                <span className="text-[9px] font-mono text-white/30">{stagedCount} Ops</span>
             </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.03] space-y-1">
             <div className="text-[7px] font-black text-white/20 uppercase tracking-widest">IPC Bridge</div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                   <span className="text-[10px] font-bold text-green-400/80 uppercase tracking-tight">Active</span>
                </div>
                <span className="text-[9px] font-mono text-white/30">{latency}ms</span>
             </div>
          </div>
        </div>

        {/* Global Persistence Status */}
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[7px] font-black text-accent uppercase tracking-widest">Staging Buffer</span>
                <span className="text-[11px] font-bold text-white tracking-tight">{stagedCount} Pending Mutations</span>
            </div>
            <button 
                onClick={() => vscode.postMessage({ type: 'commit' })}
                disabled={stagedCount === 0}
                className="px-3 py-1 rounded bg-accent/20 border border-accent/30 text-accent text-[8px] font-black uppercase tracking-widest hover:bg-accent hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
                Commit
            </button>
        </div>

        {/* Selection Metadata */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Selection Hash</span>
            <button onClick={() => fitView()} className="text-[8px] text-accent/60 hover:text-accent font-black uppercase tracking-widest transition-colors">Recalibrate View</button>
          </div>
          <div className="p-2.5 rounded-lg bg-black border border-white/[0.03] font-mono text-[9px] break-all leading-relaxed text-white/60">
            {selectedId ? (
              <span className="text-accent/80 font-bold">{selectedId}</span>
            ) : (
              <span className="italic text-white/20">Awaiting target selection...</span>
            )}
          </div>
        </div>

        {/* Trace Stream */}
        <div className="space-y-2">
           <div className="flex items-center justify-between px-1">
             <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Audit Stream</span>
             <button onClick={() => vscode.postMessage({ type: 'openTraceLog' })} className="text-[8px] text-white/30 hover:text-white uppercase font-black transition-colors">Full Source</button>
           </div>
           <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
             {entries.slice(-6).reverse().map(log => (
               <div 
                 key={log.id} 
                 className={clsx(
                   "p-2 rounded border-l-2 text-[9px] leading-tight flex flex-col gap-0.5 transition-colors",
                   log.level === 'error' ? 'bg-red-500/5 border-red-500 text-red-200/70' : 
                   log.level === 'warn' ? 'bg-yellow-500/5 border-yellow-500 text-yellow-200/70' : 
                   'bg-white/[0.02] border-accent/20 text-white/50'
                 )}
               >
                 <div className="flex justify-between items-center opacity-40 text-[7px] uppercase font-black tracking-tighter">
                   <span>{log.level}</span>
                   <span>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                 </div>
                 <div className="truncate">{log.message}</div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Footer Connectivity Bar */}
      <div className="px-4 py-2 border-t border-white/[0.03] bg-black flex items-center justify-between">
         <div className="flex items-center gap-2">
            <i className="ph ph-hard-drive-fill text-[10px] text-white/20" />
            <span className="text-[8px] font-mono text-white/20 truncate max-w-[140px]">{devServerUrl || 'OFFLINE'}</span>
         </div>
         <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-black uppercase text-white/20 tracking-widest leading-none">VFS</span>
            <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
         </div>
      </div>
    </motion.div>
  );
}
