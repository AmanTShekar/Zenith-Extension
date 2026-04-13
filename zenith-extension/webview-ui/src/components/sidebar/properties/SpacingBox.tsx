import { useSelectionStore } from '../../../stores';
import { useState } from 'react';
import { clsx } from 'clsx';

interface ScrubInputProps {
  prop: string;
  className: string;
  isLinked?: boolean;
}

function ScrubInput({ prop, className, isLinked }: ScrubInputProps) {
  const computedStyles = useSelectionStore(state => state.computedStyles);
  const { patchStyle, previewStyle } = useSelectionStore(state => state.actions);
  const [isScrubbing, setIsScrubbing] = useState(false);
  
  const rawValue = computedStyles[prop] || '0px';
  const unit = rawValue.match(/[a-z%]+$/)?.[0] || 'px';
  const numValue = parseFloat(rawValue) || 0;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsScrubbing(true);
    const startY = e.clientY;
    const startVal = numValue;
    let lastAppliedVal: number = startVal;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = (startY - moveEvent.clientY) * (moveEvent.shiftKey ? 10 : 1);
      const newVal = Math.max(0, startVal + delta);
      lastAppliedVal = newVal;
      
      const valStr = `${newVal}${unit}`;
      if (isLinked) {
          const type = prop.startsWith('padding') ? 'padding' : 'margin';
          ['Top', 'Right', 'Bottom', 'Left'].forEach(side => {
              previewStyle(`${type}${side}`, valStr);
          });
      } else {
          previewStyle(prop, valStr);
      }
    };

    const onMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      // PERSIST TO CODE ONLY ON RELEASE
      const valStr = `${lastAppliedVal}${unit}`;
      if (isLinked) {
          const type = prop.startsWith('padding') ? 'padding' : 'margin';
          ['Top', 'Right', 'Bottom', 'Left'].forEach(side => {
              patchStyle(`${type}${side}`, valStr);
          });
      } else {
          patchStyle(prop, valStr);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div 
        className={clsx(
            "flex items-center justify-center cursor-ns-resize select-none",
            className
        )}
        onMouseDown={handleMouseDown}
    >
      <input
        type="text"
        value={Math.round(numValue)}
        onChange={(e) => patchStyle(prop, e.target.value + unit)}
        className={clsx(
            "bg-transparent text-[10px] w-8 text-center outline-none focus:text-blue-400 font-bold transition-all",
            isScrubbing ? "text-blue-400 scale-125" : "text-white/40"
        )}
      />
    </div>
  );
}

export function SpacingBox() {
  const [linkMargin, setLinkMargin] = useState(false);
  const [linkPadding, setLinkPadding] = useState(false);

  return (
    <div className="px-5 py-4 pb-6 select-none">
      <div className="relative aspect-[4/3] w-full mx-auto border border-white/5 rounded-2xl bg-white/[0.02] p-8 group transition-all hover:bg-white/[0.04]">
        
        {/* Margin Section */}
        <div className="absolute top-2 left-3 flex items-center gap-2">
            <span className="text-[8px] uppercase font-black tracking-widest text-white/20">Margin</span>
            <button 
                onClick={() => setLinkMargin(!linkMargin)}
                className={clsx("p-0.5 rounded transition-all", linkMargin ? "text-blue-500 bg-blue-500/10" : "text-white/10 hover:text-white/30")}
            >
                <i className={clsx("ph ph-link-simple text-[10px]", linkMargin ? "ph-fill" : "")} />
            </button>
        </div>

        <ScrubInput prop="marginTop" isLinked={linkMargin} className="absolute top-1.5 left-1/2 -translate-x-1/2" />
        <ScrubInput prop="marginBottom" isLinked={linkMargin} className="absolute bottom-1.5 left-1/2 -translate-x-1/2" />
        <ScrubInput prop="marginLeft" isLinked={linkMargin} className="absolute left-1.5 top-1/2 -translate-y-1/2" />
        <ScrubInput prop="marginRight" isLinked={linkMargin} className="absolute right-1.5 top-1/2 -translate-y-1/2" />

        {/* Padding Box */}
        <div className="w-full h-full border border-blue-500/20 rounded-xl bg-blue-500/[0.03] relative p-8 group/padding transition-all hover:bg-blue-500/[0.06] shadow-inner">
            <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className="text-[8px] uppercase font-black tracking-widest text-blue-500/40">Padding</span>
                <button 
                    onClick={() => setLinkPadding(!linkPadding)}
                    className={clsx("p-0.5 rounded transition-all", linkPadding ? "text-blue-500 bg-blue-500/10" : "text-white/10 hover:text-white/30")}
                >
                    <i className={clsx("ph ph-link-simple text-[10px]", linkPadding ? "ph-fill" : "")} />
                </button>
            </div>

            <ScrubInput prop="paddingTop" isLinked={linkPadding} className="absolute top-1.5 left-1/2 -translate-x-1/2" />
            <ScrubInput prop="paddingBottom" isLinked={linkPadding} className="absolute bottom-1.5 left-1/2 -translate-x-1/2" />
            <ScrubInput prop="paddingLeft" isLinked={linkPadding} className="absolute left-1.5 top-1/2 -translate-y-1/2" />
            <ScrubInput prop="paddingRight" isLinked={linkPadding} className="absolute right-1.5 top-1/2 -translate-y-1/2" />

            {/* Content Placeholder */}
            <div className="w-full h-full border border-blue-500/10 rounded-lg border-dashed flex items-center justify-center bg-blue-500/[0.01]">
                <div className="w-1.5 h-1.5 bg-blue-500/40 rounded-full animate-pulse" />
            </div>
        </div>
      </div>
    </div>
  );
}
