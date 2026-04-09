import { clsx } from 'clsx';
import { useSelectionStore, useCanvasStore, useSystemStore } from '../stores';
import { vscode } from '../bridge';
import { motion } from 'framer-motion';

export function Toolbar({ 
  projectName, 
  surgicalMode, 
  houdiniActive, 
  connectedServer, 
  onToggleSurgical,
  onHome,
  onOpenQuickStart,
  onPublish: onPropPublish,
}: { 
  projectName: string;
  surgicalMode: boolean; 
  houdiniActive: boolean;
  connectedServer: string | null;
  onToggleSurgical: () => void;
  onHome: () => void;
  onOpenQuickStart: () => void;
  onPublish: () => void;
}) {
  const liveSave = useSelectionStore(state => state.liveSave);
  const stagedCount = useSelectionStore(state => state.stagedCount);
  const historyIndex = useSelectionStore(state => state.historyIndex);
  const history = useSelectionStore(state => state.history);
  const { toggleLiveSave, undo, redo, commitAll } = useSelectionStore(state => state.actions);

  const {
      deviceType, viewMode, activeTool, actions: { setDevice, setTool, setViewMode }
  } = useCanvasStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasChanges = stagedCount > 0 || liveSave;

  const onPublish = () => {
      onPropPublish();
      commitAll();
  };

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-3 py-1.5 bg-[#121212]/40 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* Home & Status */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/10">
        <button 
          onClick={onHome}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          <i className="ph-bold ph-house-line text-sm" />
        </button>
        <span className="text-[9px] font-black text-white/40 tracking-widest uppercase truncate max-w-[80px] hidden sm:inline">{projectName}</span>
      </div>

      {/* Primary Tools */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setTool('select')}
          className={clsx(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all",
            activeTool === 'select' ? "bg-white text-black shadow-xl" : "text-white/30 hover:text-white hover:bg-white/5"
          )}
        >
          <i className="ph-fill ph-cursor-click text-lg" />
        </button>
        <button 
          onClick={() => setTool('hand')}
          className={clsx(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all",
            activeTool === 'hand' ? "bg-white text-black shadow-xl" : "text-white/30 hover:text-white hover:bg-white/5"
          )}
        >
          <i className="ph-fill ph-hand-grabbing text-lg" />
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Viewport Controls */}
      <div className="flex items-center gap-1">
         <button 
          onClick={() => setDevice('mobile', 390, 844)}
          className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            deviceType === 'mobile' ? "text-[#00f2ff] bg-[#00f2ff]/10" : "text-white/20 hover:text-white"
          )}
        >
          <i className="ph-bold ph-device-mobile text-sm" />
        </button>
        <button 
          onClick={() => setDevice('desktop', 1440, 900)}
          className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            deviceType === 'desktop' ? "text-[#00f2ff] bg-[#00f2ff]/10" : "text-white/20 hover:text-white"
          )}
        >
          <i className="ph-bold ph-desktop text-sm" />
        </button>
        <button 
          onClick={() => setViewMode(viewMode === 'single' ? 'multi' : 'single')}
          className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all ml-1",
            viewMode === 'multi' ? "bg-blue-500 text-white" : "text-white/20 hover:text-white"
          )}
        >
          <i className="ph-bold ph-squares-four text-sm" />
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Operations */}
      <div className="flex items-center gap-1.5 pl-1">
        <div className="flex items-center gap-0.5 bg-white/5 rounded-full p-0.5">
          <button 
             onClick={undo}
             disabled={!canUndo}
             title="Undo (Ctrl+Z)"
             className={clsx(
               "w-8 h-8 flex items-center justify-center rounded-full transition-all",
               canUndo ? "text-white/80 hover:text-white hover:bg-white/10 cursor-pointer" : "text-white/10 cursor-not-allowed"
             )}
          >
             <i className="ph-bold ph-arrow-u-up-left text-sm" />
          </button>
          
          <button 
             onClick={redo}
             disabled={!canRedo}
             title="Redo (Ctrl+Shift+Z)"
             className={clsx(
               "w-8 h-8 flex items-center justify-center rounded-full transition-all",
               canRedo ? "text-white/80 hover:text-white hover:bg-white/10 cursor-pointer" : "text-white/10 cursor-not-allowed"
             )}
          >
             <i className="ph-bold ph-arrow-u-up-right text-sm" />
          </button>
        </div>

        <button 
          onClick={onToggleSurgical}
          className={clsx(
            "h-9 px-4 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
            surgicalMode ? "bg-[#00f2ff] text-black shadow-[0_0_20px_rgba(0,242,255,0.4)]" : "text-white/40 bg-white/5 hover:bg-white/10"
          )}
        >
          <i className="ph-fill ph-lightning text-sm" />
          <span className="hidden lg:inline">Surgical</span>
        </button>

        <button 
          className={clsx(
            "h-9 px-5 flex items-center gap-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all",
            hasChanges 
              ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95" 
              : "bg-white/5 text-white/5 cursor-not-allowed"
          )}
          onClick={onPublish}
          disabled={!hasChanges}
        >
           Commit
        </button>
      </div>
    </motion.div>
  );
}
