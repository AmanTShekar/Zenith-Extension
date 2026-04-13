import { useSelectionStore } from '../../stores';
import { vscode } from '../../bridge';

export function SelectionActions() {
  const selectedId = useSelectionStore(state => state.selectedId);
  const elementSignature = useSelectionStore(state => state.elementSignature);
  const elementInfo = useSelectionStore(state => state.elementInfo);
  
  if (!selectedId && !elementSignature) return null;

  const handleAction = (type: string) => {
    vscode.postMessage({
        type: 'structuralOperation',
        operation: type,
        zenithId: selectedId,
        signature: elementSignature
    });
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
    <div className="border-t border-white/10 bg-[#0A0A0A]/60 backdrop-blur-xl p-2 mt-auto">
        <div className="px-3 py-2 mb-1 border-b border-white/5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                {elementInfo?.tagName || 'Element'} Actions
            </div>
        </div>

        <div className="grid grid-cols-1 gap-0.5">
            {menuItems.map((item, idx) => (
                item.type === 'separator' ? (
                    <div key={`sep-${idx}`} className="h-[1px] bg-white/5 my-1 mx-2" />
                ) : (
                    <button
                        key={item.id}
                        onClick={() => handleAction(item.id!)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-all hover:bg-white/10 group ${item.color || 'text-white/70 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2.5">
                            <i className={`ph ${item.icon} text-sm opacity-50 group-hover:opacity-100 transition-opacity`} />
                            <span>{item.label}</span>
                        </div>
                        {item.shortcut && (
                            <span className="text-[9px] font-mono text-white/20 tabular-nums">{item.shortcut}</span>
                        )}
                    </button>
                )
            ))}
        </div>
    </div>
  );
}
