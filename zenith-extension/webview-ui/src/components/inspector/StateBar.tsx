import { useSelectionStore, type InteractionState } from '../../stores';

const STATES: { id: InteractionState; label: string; icon: string; color: string }[] = [
  { id: 'base',     label: 'Base',     icon: 'ph-circle',         color: 'text-white/60' },
  { id: 'hover',    label: 'Hover',    icon: 'ph-cursor',         color: 'text-yellow-400' },
  { id: 'focus',    label: 'Focus',    icon: 'ph-eye',            color: 'text-blue-400' },
  { id: 'active',   label: 'Active',   icon: 'ph-hand-tap',       color: 'text-purple-400' },
  { id: 'disabled', label: 'Disabled', icon: 'ph-prohibit',       color: 'text-red-400' },
];

/**
 * StateBar — Interaction State Selector
 *
 * Lets the user switch editing context between Base, Hover, Focus, Active, Disabled.
 * When a non-base state is active, all style patches are tagged with the state
 * so the extension host can apply them as pseudo-class rules.
 *
 * Inspired by Onlook's interaction state switcher.
 */
export function StateBar() {
  const activeState = useSelectionStore(state => state.activeState);
  const stateStyles = useSelectionStore(state => state.stateStyles);
  const setActiveState = useSelectionStore(state => state.actions.setActiveState);

  return (
    <div className="px-3 py-2 border-b border-white/5 bg-black/20">
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black text-white/25 uppercase tracking-[0.18em]">State</span>
        {activeState !== 'base' && (
          <button
            onClick={() => setActiveState('base')}
            className="text-[8px] text-white/30 hover:text-white/60 transition-colors"
          >
            Reset to base
          </button>
        )}
      </div>

      {/* State buttons */}
      <div className="flex items-center gap-1">
        {STATES.map(({ id, label, icon, color }) => {
          const isActive = activeState === id;
          const hasOverrides = Object.keys(stateStyles[id] ?? {}).length > 0;

          return (
            <button
              key={id}
              onClick={() => setActiveState(id)}
              title={`Edit ${label} state`}
              className={[
                'relative flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium transition-all border flex-1 justify-center',
                isActive
                  ? `bg-white/[0.08] border-white/20 ${color}`
                  : 'bg-transparent border-transparent text-white/30 hover:text-white/60 hover:bg-white/[0.04]',
              ].join(' ')}
            >
              <i className={`ph ${icon} text-[10px]`} />
              <span>{label}</span>
              {/* Dot indicating this state has overrides */}
              {hasOverrides && (
                <span
                  className={[
                    'absolute top-0.5 right-0.5 w-1 h-1 rounded-full',
                    id === 'hover'    ? 'bg-yellow-400' :
                    id === 'focus'    ? 'bg-blue-400'   :
                    id === 'active'   ? 'bg-purple-400' :
                    id === 'disabled' ? 'bg-red-400'    : 'bg-white/40',
                  ].join(' ')}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active state hint */}
      {activeState !== 'base' && (
        <div className="mt-2 px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-[9px] text-white/40 flex items-center gap-1.5">
          <i className="ph ph-info text-[10px] opacity-60" />
          Styles below apply to <span className="font-bold text-white/70">:{activeState}</span> pseudo-class
        </div>
      )}
    </div>
  );
}
