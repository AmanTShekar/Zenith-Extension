import { clsx } from 'clsx';
import { useSelectionStore, useCanvasStore, useSystemStore } from '../stores';
import { motion, AnimatePresence } from 'framer-motion';

export function Toolbar({ 
  projectName, 
  surgicalMode, 
  onToggleSurgical,
  onHome,
  onPublish: onPropPublish,
}: { 
  projectName: string;
  surgicalMode: boolean; 
  onToggleSurgical: () => void;
  onHome: () => void;
  onPublish: () => void;
}) {
  const liveSave = useSelectionStore(state => state.liveSave);
  const stagedCount = useSelectionStore(state => state.stagedCount);
  const historyIndex = useSelectionStore(state => state.historyIndex);
  const history = useSelectionStore(state => state.history);
  const { undo, redo, commitAll } = useSelectionStore(state => state.actions);
  const connectedServer = useSystemStore(state => state.connectedServer);
  const previewMode = useSystemStore(state => state.previewMode);

  const {
      deviceType, 
      activeTool,
      actions: { setDevice, setTool }
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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[1000] flex items-center h-12 px-1.5 bg-black/40 backdrop-blur-2xl border border-white/[0.04] rounded-xl shadow-2xl"
    >
      {/* Home / Breadcrumb */}
      <div className="flex items-center gap-2 px-2 border-r border-white/5">
        <button 
          onClick={onHome}
          className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-secondary hover:text-white transition-all active:scale-95"
          title="Back to Studio Hub"
        >
          <i className="ph-fill ph-house-line text-lg" />
        </button>
        <div className="h-4 w-px bg-white/5" />
        <span className="text-[10px] font-black text-text-secondary tracking-widest uppercase truncate max-w-[120px] px-1">{projectName || 'UNNAMED'}</span>
      </div>

      {/* Engine Status */}
      <div className="flex items-center gap-1 px-3 border-r border-white/5 group relative cursor-help">
         <div className={`w-1.5 h-1.5 rounded-full ${connectedServer ? 'bg-accent shadow-[0_0_8px_#00f0ff]' : 'bg-red-500 animate-pulse'}`} />
         <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{connectedServer ? 'Active' : 'Offline'}</span>
      </div>

      {/* Viewport & Device Controls */}
      <div className="flex items-center gap-1 px-2 border-r border-white/5">
        <button 
          onClick={() => setDevice('mobile', 390, 844)}
          className={clsx(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
            deviceType === 'mobile' ? "text-accent bg-accent/10 shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "text-text-muted hover:text-text-secondary hover:bg-white/5"
          )}
        >
          <i className="ph ph-device-mobile text-base" />
        </button>
        <button 
          onClick={() => setDevice('desktop', 1440, 900)}
          className={clsx(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
            deviceType === 'desktop' ? "text-accent bg-accent/10 shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "text-text-muted hover:text-text-secondary hover:bg-white/5"
          )}
        >
          <i className="ph ph-desktop text-base" />
        </button>
      </div>

      {/* Main Creative Tools (Merged from FloatingToolbar) */}
      <div className="flex items-center gap-1 px-2 border-r border-white/5">
        {[
          { id: 'select', icon: 'ph-cursor', label: 'Select (V)' },
          { id: 'hand',   icon: 'ph-hand-grabbing', label: 'Hand (H)' },
          { id: 'text',   icon: 'ph-text-t', label: 'Text (T)' },
          { id: 'insert', icon: 'ph-plus-circle', label: 'Insert (I)' },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => setTool(tool.id as any)}
            title={tool.label}
            className={clsx(
              "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
              activeTool === tool.id 
                ? "bg-accent text-black shadow-lg" 
                : "text-text-muted hover:text-white hover:bg-white/5"
            )}
          >
            <i className={clsx("ph ph-bold", tool.icon)} />
          </button>
        ))}
      </div>

      {/* History Controls (Undo/Redo) */}
      <div className="flex items-center gap-0.5 px-2 border-r border-white/5">
          <button 
              onClick={undo}
              disabled={!canUndo}
              className={clsx(
                "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                canUndo ? "text-text-secondary hover:text-white hover:bg-white/5" : "text-white/5"
              )}
          >
              <i className="ph ph-arrow-u-up-left" />
          </button>
          <button 
              onClick={redo}
              disabled={!canRedo}
              className={clsx(
                "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                canRedo ? "text-text-secondary hover:text-white hover:bg-white/5" : "text-white/5"
              )}
          >
              <i className="ph ph-arrow-u-up-right" />
          </button>
      </div>

      {/* Main Mode Toggle & Preview */}
      <div className="flex items-center gap-2 pl-2 pr-1">
        <button 
          onClick={() => useSystemStore.getState().actions.togglePreview()}
          className={clsx(
            "h-8 px-3 rounded-lg flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all",
            previewMode 
              ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
              : "text-text-secondary bg-white/5 hover:bg-white/10"
          )}
          title={previewMode ? "Exit Preview" : "Enter Interactive Preview"}
        >
          <i className={clsx("ph-fill text-sm", previewMode ? "ph-stop" : "ph-play")} />
          {previewMode ? "Stop" : "Preview"}
        </button>

        <div className="h-4 w-px bg-white/5 mx-1" />

        <button 
          onClick={onToggleSurgical}
          className={clsx(
            "h-8 px-4 rounded-lg flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all",
            surgicalMode 
              ? "bg-accent text-black shadow-[0_0_20px_rgba(0,240,255,0.2)]" 
              : "text-text-secondary bg-white/5 hover:bg-white/10"
          )}
        >
          <i className={`ph-fill ph-syringe text-sm transition-transform ${surgicalMode ? 'rotate-45' : ''}`} />
          Surgical
        </button>

        <AnimatePresence mode="popLayout">
          {hasChanges && (
            <motion.button 
              initial={{ x: 20, opacity: 0, width: 0 }}
              animate={{ x: 0, opacity: 1, width: 'auto' }}
              exit={{ x: 20, opacity: 0, width: 0 }}
              className="h-8 px-4 flex items-center gap-2 rounded-lg bg-white text-black hover:bg-[#F2F2F2] active:scale-95 font-black text-[9px] uppercase tracking-[0.2em] relative overflow-hidden shrink-0"
              onClick={onPublish}
            >
               <motion.div 
                 layoutId="pulse"
                 className="absolute inset-0 bg-accent/20 animate-pulse pointer-events-none"
               />
               <span className="relative z-10 flex items-center gap-2">
                 <i className="ph-fill ph-check-circle text-xs" />
                 Commit
               </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
