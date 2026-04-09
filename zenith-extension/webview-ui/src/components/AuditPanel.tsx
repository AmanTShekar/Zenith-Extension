import { useSelectionStore, useSystemStore, useLogStore, useCanvasStore } from '../stores';
import { vscode } from '../bridge';

export function AuditPanel() {
  const selectedId = useSelectionStore(state => state.selectedId);
  const fiberInfo = useSelectionStore(state => state.fiberInfo);
  const entries = useLogStore(state => state.entries);
  const devServerUrl = useSystemStore(state => state.devServerUrl); // [W6] fix: use hook not getState()
  
  const pan = useCanvasStore(state => state.pan);
  const zoom = useCanvasStore(state => state.zoom);
  const { fitView } = useCanvasStore(state => state.actions);

  return (
    <div className="absolute top-4 left-4 z-[9999] bg-[#1a1a1a]/90 backdrop-blur-md border border-cyan-500/30 p-4 rounded-lg shadow-2xl pointer-events-none font-mono text-xs max-w-sm animate-in fade-in slide-in-from-left-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
        <span className="text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Zenith Deep Audit</span>
      </div>
      <div className="space-y-4">
        {/* Viewport Data */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-black/40 rounded border border-white/5">
           <div>
             <div className="text-[8px] text-white/30 uppercase">Pos_X</div>
             <div className={isNaN(pan.x) ? 'text-red-500' : 'text-cyan-200'}>{Math.round(pan.x) || 0}</div>
           </div>
           <div>
             <div className="text-[8px] text-white/30 uppercase">Pos_Y</div>
             <div className={isNaN(pan.y) ? 'text-red-500' : 'text-cyan-200'}>{Math.round(pan.y) || 0}</div>
           </div>
           <div>
             <div className="text-[8px] text-white/30 uppercase">Scale</div>
             <div className="text-purple-300">{Math.round(zoom * 100)}%</div>
           </div>
        </div>

        <div>
          <div className="text-white/40 mb-1">STABLE_PATH_ID</div>
          <div className="text-cyan-200 break-all">{selectedId || 'NO_SELECTION'}</div>
        </div>

        <div>
          <div className="text-white/40 mb-1 uppercase text-[8px]">Active_Target</div>
          <div className="text-cyan-400/60 truncate text-[9px]">{devServerUrl || 'NO_URL'}</div>
        </div>

        <div>
          <div className="text-white/40 mb-1 flex justify-between items-center">
            <span>IPC_BRIDGE_PULSE</span>
            <div className="flex gap-2 pointer-events-auto">
              <button 
                onClick={() => fitView()}
                className="text-[9px] bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded text-cyan-400 hover:bg-cyan-500/20 cursor-pointer"
              >
                Reset View
              </button>
              <button 
                onClick={() => vscode.postMessage({ type: 'openTraceLog' })}
                className="text-cyan-400 hover:text-cyan-300 hover:underline transition-all cursor-pointer"
              >
                History
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mt-2 max-h-32 overflow-y-auto pr-1">
            {entries.slice(-10).reverse().map(log => (
              <div 
                key={log.id} 
                className={`p-1.5 rounded bg-black/40 border-l-2 text-[9px] leading-tight flex flex-col gap-0.5 ${
                  log.level === 'error' ? 'border-red-500' : 
                  log.level === 'warn' ? 'border-yellow-500' : 'border-cyan-500/50'
                }`}
              >
                <div className="flex justify-between items-center opacity-40 text-[7px] uppercase font-bold">
                  <span>{log.level}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-white/70 overflow-hidden text-ellipsis">{log.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
