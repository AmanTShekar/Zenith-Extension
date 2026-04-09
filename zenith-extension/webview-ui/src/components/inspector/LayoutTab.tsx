import { useSelectionStore } from '../../stores';
import { ScrubInput } from '../ScrubInput';

export function LayoutTab() {
  const { computedStyles } = useSelectionStore();
  const { patchStyle } = useSelectionStore(state => state.actions);

  const parse = (val: string) => parseFloat(val) || 0;

  const handleChange = (property: string, value: number) => {
    patchStyle(property, `${value}px`);
  };

  return (
    <div className="p-4 flex flex-col items-center">
      {/* Visual Box Model */}
      <div className="w-full aspect-square max-w-[280px] relative border border-white/5 bg-black/5 p-4 rounded-xl flex items-center justify-center">
         
         {/* Margin Layer */}
         <div className="absolute inset-0 border border-orange-500/20 bg-orange-500/5 rounded-xl pointer-events-none" />
         <div className="absolute top-2 left-1/2 -translate-x-1/2 scale-75">
            <ScrubInput 
              label="M" 
              value={parse(computedStyles.marginTop)} 
              onChange={(v) => handleChange('marginTop', v)} 
            />
         </div>
         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 scale-75">
            <ScrubInput 
              label="M" 
              value={parse(computedStyles.marginBottom)} 
              onChange={(v) => handleChange('marginBottom', v)} 
            />
         </div>
         <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 scale-75">
            <ScrubInput 
              label="M" 
              value={parse(computedStyles.marginLeft)} 
              onChange={(v) => handleChange('marginLeft', v)} 
            />
         </div>
         <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 scale-75">
            <ScrubInput 
              label="M" 
              value={parse(computedStyles.marginRight)} 
              onChange={(v) => handleChange('marginRight', v)} 
            />
         </div>

         {/* Border Layer */}
         <div className="w-full h-full relative border border-yellow-500/40 bg-yellow-500/5 rounded-lg flex items-center justify-center p-8 transition-all hover:bg-yellow-500/10">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 scale-[0.6]">
               <ScrubInput 
                  label="B" 
                  value={parse(computedStyles.borderTopWidth)} 
                  onChange={(v) => handleChange('borderTopWidth', v)} 
               />
            </div>
            
            {/* Padding Layer */}
            <div className="w-full h-full relative border border-green-500/40 bg-green-500/5 rounded-md flex items-center justify-center p-8 transition-all hover:bg-green-500/10">
                <div className="absolute top-1 left-1/2 -translate-x-1/2 scale-[0.6]">
                   <ScrubInput 
                      label="P" 
                      value={parse(computedStyles.paddingTop)} 
                      onChange={(v) => handleChange('paddingTop', v)} 
                   />
                </div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 scale-[0.6]">
                   <ScrubInput 
                      label="P" 
                      value={parse(computedStyles.paddingBottom)} 
                      onChange={(v) => handleChange('paddingBottom', v)} 
                   />
                </div>
                <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 scale-[0.6]">
                   <ScrubInput 
                      label="P" 
                      value={parse(computedStyles.paddingLeft)} 
                      onChange={(v) => handleChange('paddingLeft', v)} 
                   />
                </div>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 scale-[0.6]">
                   <ScrubInput 
                      label="P" 
                      value={parse(computedStyles.paddingRight)} 
                      onChange={(v) => handleChange('paddingRight', v)} 
                   />
                </div>

                {/* Content Area */}
                <div className="w-full h-full bg-accent/20 border border-accent/40 rounded-sm flex items-center justify-center shadow-inner overflow-hidden">
                    <span className="text-[11px] font-black text-accent/60 tracking-tighter">
                       {Math.round(parse(computedStyles.width))} × {Math.round(parse(computedStyles.height))}
                    </span>
                </div>
            </div>
         </div>
      </div>

      {/* Box Sizing & Display Info */}
      <div className="w-full mt-8 space-y-4">
         <div className="flex items-center justify-between group">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest group-hover:text-text-secondary transition-colors">Box Sizing</span>
            <span className="text-[11px] font-mono text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/20 uppercase">
               {computedStyles.boxSizing || 'border-box'}
            </span>
         </div>
         <div className="flex items-center justify-between group">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest group-hover:text-text-secondary transition-colors">Display</span>
            <span className="text-[11px] font-mono text-text-primary bg-elevated px-2 py-0.5 rounded border border-border-subtle uppercase">
               {computedStyles.display || 'block'}
            </span>
         </div>
      </div>
    </div>
  );
}
