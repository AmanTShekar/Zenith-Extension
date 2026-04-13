import { motion } from 'framer-motion';
import { useSelectionStore } from '../stores';
import { vscode } from '../bridge';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
}

export function CanvasContextMenu({ x, y, visible, onClose }: ContextMenuProps) {
  const selectedId = useSelectionStore(state => state.selectedId);
  const elementSignature = useSelectionStore(state => state.elementSignature);
  const elementInfo = useSelectionStore(state => state.elementInfo);
  
  if (!visible || (!selectedId && !elementSignature)) return null;

  const handleAction = (type: string) => {
    vscode.postMessage({
        type: 'structuralOperation',
        operation: type,
        zenithId: selectedId,
        signature: elementSignature
    });
    onClose();
  };

  const menuItems = [
    { id: 'duplicate', label: 'Duplicate', icon: 'ph-copy', shortcut: 'Cmd+D' },
    { id: 'delete', label: 'Delete', icon: 'ph-trash', shortcut: 'Del', color: 'text-red-400' },
    { type: 'separator' },
    { id: 'group', label: 'Group Selection', icon: 'ph-rows', shortcut: 'Cmd+G' },
    { id: 'ungroup', label: 'Ungroup', icon: 'ph-grid-nine' },
    { type: 'separator' },
    { id: 'copy-style', label: 'Copy Style', icon: 'ph-swatches', shortcut: 'Alt+C' },
    { id: 'paste-style', label: 'Paste Style', icon: 'ph-paint-roller-brush', shortcut: 'Alt+V' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="fixed z-[1000] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-1.5 w-56 overflow-hidden"
      style={{ left: x, top: y }}
    >
        <div className="px-3 py-2 mb-1 border-b border-white/5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                {elementInfo?.tagName || 'Element'} Actions
            </div>
        </div>

        {menuItems.map((item, idx) => (
            item.type === 'separator' ? (
                <div key={`sep-${idx}`} className="h-[1px] bg-white/5 my-1" />
            ) : (
                <button
                    key={item.id}
                    onClick={() => handleAction(item.id!)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-all hover:bg-white/10 group ${item.color || 'text-white/70 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2.5">
                        <i className={`ph ${item.icon} text-sm opacity-50 group-hover:opacity-100`} />
                        <span>{item.label}</span>
                    </div>
                    {item.shortcut && (
                        <span className="text-[9px] font-mono text-white/20 tabular-nums">{item.shortcut}</span>
                    )}
                </button>
            )
        ))}
    </motion.div>
  );
}
