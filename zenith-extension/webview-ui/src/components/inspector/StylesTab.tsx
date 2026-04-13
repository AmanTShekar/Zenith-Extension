import { useSelectionStore } from '../../stores';
import { PropertyEditor } from './PropertyEditor';
import { StateBar } from './StateBar';

export function StylesTab() {
  const { elementInfo, elementSignature } = useSelectionStore();

  if (!elementInfo && !elementSignature) return null;

  const tagName = elementInfo?.tagName || elementSignature?.tag || 'div';
  const displayId = elementInfo?.id || 'Universal';

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
      {/* Element header — Minified */}
      <div className="px-4 py-3 bg-white/[0.01] border-b border-white/[0.03]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-1 rounded-full ${displayId === 'Universal' ? 'bg-white/20' : 'bg-accent'}`} />
            <span className="text-white font-black text-[11px] uppercase tracking-wider">&lt;{tagName}&gt;</span>
          </div>
          <span className="text-text-muted font-mono text-[8px] tracking-tighter">#{displayId.substring(0, 8)}</span>
        </div>
      </div>

      {/* Interaction State Selector */}
      <StateBar />

      {/* Property Editor */}
      <PropertyEditor />
    </div>
  );
}

