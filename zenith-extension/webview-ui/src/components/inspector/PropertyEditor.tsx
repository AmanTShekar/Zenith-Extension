import { DESIGN_SCHEMA, type PropertyDefinition } from '../../config/schema';
import { useSelectionStore } from '../../stores';
import { ScrubInput } from '../ScrubInput';
import { SpacingBox } from '../sidebar/properties/SpacingBox';

interface PropertyFieldProps {
  property: string;
  definition: PropertyDefinition;
  value: string;
  sectionValues: Record<string, string>; // for showWhen conditional logic
  onChange: (value: string) => void;
}

function PropertyField({ property, definition, value, sectionValues, onChange }: PropertyFieldProps) {
  const label = definition.label || property;

  // --- showWhen conditional visibility (Puck-style field gating) ---
  if (definition.showWhen) {
    const { field, value: requiredValue } = definition.showWhen;
    const currentValue = sectionValues[field] ?? '';
    if (currentValue !== requiredValue) return null;
  }

  switch (definition.type) {

    // --- Radio button group (new: for display, textAlign, flexDirection, etc.) ---
    case 'radio':
      return (
        <div className="flex items-center justify-between py-1 group px-4 hover:bg-white/[0.02] transition-colors">
          <span className="text-[10px] text-text-muted font-medium w-16 shrink-0 truncate">{label}</span>
          <div className="flex items-center gap-0.5 flex-1 justify-end flex-wrap">
            {definition.options?.map(opt => (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                title={opt.label}
                className={[
                  'px-2 py-0.5 text-[9px] rounded transition-all border',
                  value === opt.value
                    ? 'bg-blue-500/20 border-blue-500/60 text-blue-300 font-bold'
                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );

    // --- Select dropdown ---
    case 'select':
      return (
        <div className="flex items-center justify-between py-1 group px-4 hover:bg-white/[0.02] transition-colors">
          <span className="text-[10px] text-text-muted font-medium w-24 truncate">{label}</span>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent text-[10px] text-text-primary text-right outline-none cursor-pointer hover:text-blue-400 transition-colors min-w-0"
          >
            <option value="">Default</option>
            {definition.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );

    // --- Color picker with hex input + swatch ---
    case 'color':
      return (
        <div className="flex items-center justify-between py-1 group px-4 hover:bg-white/[0.02]">
          <span className="text-[10px] text-text-muted font-medium w-24 truncate">{label}</span>
          <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
            <input
              type="text"
              value={value || ''}
              placeholder="transparent"
              onChange={(e) => onChange(e.target.value)}
              className="bg-transparent text-[9px] font-mono text-text-primary text-right outline-none w-full min-w-0"
            />
            <div
              className="w-3.5 h-3.5 rounded-sm border border-white/10 shadow-sm relative overflow-hidden shrink-0"
              style={{ backgroundColor: value || 'transparent' }}
            >
              <input
                type="color"
                value={value && value.startsWith('#') ? value : '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {!value && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[length:4px_4px] bg-[position:0_0,0_2px,2px_2px,2px_0] opacity-20" />
              )}
            </div>
          </div>
        </div>
      );

    // --- Opacity / range slider ---
    case 'slider':
      return (
        <div className="flex items-center justify-between py-1 group px-4 hover:bg-white/[0.02]">
          <span className="text-[10px] text-text-muted font-medium w-24 truncate">{label}</span>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <input
              type="range"
              min={definition.min ?? 0}
              max={definition.max ?? 1}
              step={0.01}
              value={parseFloat(value) || 1}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 h-1 bg-white/5 rounded-full appearance-none accent-blue-500 cursor-pointer"
            />
            <span className="text-[9px] font-mono opacity-60 w-8 text-right">
              {Math.round((parseFloat(value) || 1) * 100)}%
            </span>
          </div>
        </div>
      );

    // --- Text / Number (with scrubbing) ---
    case 'text':
    case 'number':
    default: {
      // Helper to split a value like "16px" into { value: 16, unit: "px" }
      const splitValueUnit = (val: string) => {
        const match = val.match(/^([+-]?\d*(?:\.\d+)?)(.*)$/);
        if (!match) return { num: 0, unit: '' };
        return { num: parseFloat(match[1]) || 0, unit: match[2] };
      };

      const { num, unit } = splitValueUnit(value);

      // For text fields (width, height, etc.) preserve raw value if it's not a simple number
      if (definition.type === 'text' && value && isNaN(parseFloat(value)) && !value.match(/^\d/)) {
        return (
          <div className="flex items-center justify-between py-1 group px-4 hover:bg-white/[0.02]">
            <span className="text-[10px] text-text-muted font-medium w-24 truncate">{label}</span>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="—"
              className="flex-1 bg-transparent text-[10px] font-mono text-text-primary text-right outline-none border-b border-transparent focus:border-blue-500/40 transition-colors"
            />
          </div>
        );
      }

      const activeUnit = unit || definition.unit || '';

      return (
        <div className="flex items-center justify-between py-1 group px-4 hover:bg-white/[0.02]">
          <span className="text-[10px] text-text-muted font-medium w-24 truncate">{label}</span>
          <div className="flex items-center gap-1 flex-1 justify-end overflow-hidden">
            <ScrubInput
              value={num}
              unit={activeUnit}
              onChange={(val) => onChange(`${val}${activeUnit}`)}
              className="text-right"
            />
          </div>
        </div>
      );
    }
  }
}

export function PropertyEditor() {
  const computedStyles = useSelectionStore(state => state.computedStyles);
  const activeState = useSelectionStore(state => state.activeState);
  const stateStyles = useSelectionStore(state => state.stateStyles);
  const { patchStyle } = useSelectionStore(state => state.actions);

  return (
    <div className="flex flex-col pb-20">
      {Object.entries(DESIGN_SCHEMA).map(([sectionId, section]) => (
        <div key={sectionId} className="border-b border-white/5 last:border-0 pb-1">
          <div className="px-5 py-3 flex items-center justify-between group cursor-pointer">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-white/60 transition-colors">{section.title}</span>
            <i className="ph ph-caret-down text-[10px] text-white/10 group-hover:text-white/30 transition-transform" />
          </div>

          <div className="flex flex-col mb-2">
            {sectionId === 'spacing' ? (
              <SpacingBox />
            ) : (
              Object.entries(section.properties).map(([prop, def]) => {
                const isOverriddenInState = activeState !== 'base' && stateStyles[activeState]?.[prop] !== undefined;
                
                return (
                  <div key={prop} className="relative group">
                    <PropertyField
                      property={prop}
                      definition={def}
                      value={computedStyles[prop] ?? ''}
                      sectionValues={computedStyles}
                      onChange={(val) => patchStyle(prop, val)}
                    />
                    {isOverriddenInState && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[60%] bg-blue-500 rounded-r shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
