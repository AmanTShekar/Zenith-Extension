import { DESIGN_SCHEMA, type PropertyDefinition } from '../../config/schema';
import { useSelectionStore } from '../../stores';
import { ScrubInput } from '../ScrubInput';
import { SpacingBox } from '../sidebar/properties/SpacingBox';
import { clsx } from 'clsx';

interface PropertyFieldProps {
  property: string;
  definition: PropertyDefinition;
  value: string;
  sectionValues: Record<string, string>; // for showWhen conditional logic
  onChange: (value: string) => void;
  onCommit?: (value: string) => void;
}

const getIcon = (val: string) => {
  switch (val) {
    case 'row': return 'ph-arrow-right';
    case 'column': return 'ph-arrow-down';
    case 'flex-start': return 'ph-align-left-simple';
    case 'center': return 'ph-align-center-simple';
    case 'flex-end': return 'ph-align-right-simple';
    case 'space-between': return 'ph-arrows-out-line-horizontal';
    case 'left': return 'ph-text-align-left';
    case 'right': return 'ph-text-align-right';
    case 'justify': return 'ph-text-align-justify';
    default: return null;
  }
};

function PropertyField({ property, definition, value, sectionValues, onChange, onCommit }: PropertyFieldProps) {
  const label = definition.label || property;

  // --- showWhen conditional visibility (Puck-style field gating) ---
  if (definition.showWhen) {
    const { field, value: requiredValue } = definition.showWhen;
    const currentValue = sectionValues[field] ?? '';
    if (currentValue !== requiredValue) return null;
  }

  switch (definition.type) {

    // --- Visual Radio/Icon Toggle (for Layout/Text Alignment) ---
    case 'radio':
      return (
        <div className="flex items-center justify-between py-1 group px-4 hover:bg-white/[0.02] transition-colors">
          <span className="text-[10px] text-text-muted font-medium w-16 shrink-0 truncate uppercase tracking-tighter opacity-60">
            {label}
          </span>
          <div className="flex items-center gap-0.5 flex-1 justify-end flex-wrap">
            {definition.options?.map(opt => {
              const isSelected = value === opt.value;
              const icon = getIcon(opt.value);

              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    onCommit?.(opt.value);
                  }}
                  title={opt.label}
                  className={clsx(
                    'p-1.5 rounded transition-all',
                    isSelected
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-white/20 hover:text-white/60 hover:bg-white/5 border border-transparent'
                  )}
                >
                  {icon ? <i className={clsx('ph ph-bold text-[12px]', icon)} /> : <span className="text-[9px] px-1">{opt.label}</span>}
                </button>
              );
            })}
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
            onChange={(e) => {
              onChange(e.target.value);
              onCommit?.(e.target.value);
            }}
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
              onBlur={(e) => onCommit?.(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onCommit?.(e.currentTarget.value)}
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
                onBlur={(e) => onCommit?.(e.target.value)}
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
              onMouseUp={(e) => onCommit?.(e.currentTarget.value)}
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
              onBlur={(e) => onCommit?.(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onCommit?.(e.currentTarget.value)}
              placeholder="—"
              className="flex-1 bg-transparent text-[10px] font-mono text-text-primary text-right outline-none border-b border-transparent focus:border-blue-500/40 transition-colors"
            />
          </div>
        );
      }

      const activeUnit = unit || definition.unit || (definition.type === 'number' ? '' : 'px');

      return (
        <div className="flex items-center justify-between py-1 group px-4 hover:bg-white/[0.02]">
          <span className="text-[10px] text-text-muted font-medium w-24 truncate">{label}</span>
          <div className="flex items-center gap-1 flex-1 justify-end overflow-hidden">
            <ScrubInput
              value={num}
              unit={activeUnit}
              onChange={(val) => {
                const finalVal = `${val}${activeUnit}`;
                onChange(finalVal);
              }}
              onCommit={(val) => {
                const finalVal = `${val}${activeUnit}`;
                onCommit?.(finalVal);
              }}
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
                      onChange={(val) => {
                        // v11.3: Visual Hot-Path — Instant feedback without sidecar round-trip
                        useSelectionStore.getState().actions.previewStyle(prop, val);
                      }}
                      onCommit={(val) => {
                        // v11.3: Persistent Stage — Single RPC after interaction finishes
                        useSelectionStore.getState().actions.patchStyle(prop, val);
                      }}
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
