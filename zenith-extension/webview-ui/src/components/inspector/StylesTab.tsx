import { useSelectionStore } from '../../stores';
import { PropertyEditor } from './PropertyEditor';
import { StateBar } from './StateBar';

export function StylesTab() {
  const { elementInfo, elementSignature } = useSelectionStore();

  if (!elementInfo && !elementSignature) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-20 pointer-events-none grayscale translate-y-20">
        <i className="ph ph-selection-all text-4xl mb-4" />
        <span className="text-[11px] uppercase tracking-widest font-bold">Select an element</span>
      </div>
    );
  }

  const tagName = elementInfo?.tagName || elementSignature?.tag || 'div';
  const displayId = elementInfo?.id || 'Universal';

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Element header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
            <span className="text-white font-black text-[14px] tracking-tight">&lt;{tagName}&gt;</span>
          </div>
          <span className="text-white/20 font-mono text-[9px] bg-white/5 px-2 py-1 rounded border border-white/5">#{displayId.substring(0, 8)}</span>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-accent/40 via-accent/5 to-transparent mt-4" />
      </div>

      {/* Interaction State Selector — Onlook-style */}
      <StateBar />

      {/* Property Editor */}
      <PropertyEditor />
    </div>
  );
}

