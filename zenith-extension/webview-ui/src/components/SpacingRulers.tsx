import React from 'react';
import { useCanvasStore } from '../stores';

interface SpacingRulersProps {
  rect: { x: number; y: number; width: number; height: number };
  color?: string;
}

export const SpacingRulers: React.FC<SpacingRulersProps> = ({ rect, color = '#00f2ff' }) => {
  const zoom = useCanvasStore(state => state.zoom);
  const pan = useCanvasStore(state => state.pan);

  // Parent or Viewport distances
  // For now we visualize distances to the "zero" of the artboard
  const topDistance = Math.max(0, rect.y);
  const leftDistance = Math.max(0, rect.x);

  const styleBase = {
    pointerEvents: 'none' as const,
    zIndex: 9998,
    position: 'absolute' as const,
    opacity: 0.6,
  };

  return (
    <>
      {/* Top Distance */}
      {topDistance > 0 && (
        <div 
          style={{
            ...styleBase,
            top: 0,
            left: rect.x + rect.width / 2,
            width: 1,
            height: rect.y,
            background: `repeating-linear-gradient(to bottom, ${color}, ${color} 2px, transparent 2px, transparent 4px)`
          }}
        >
           <div className="absolute top-1/2 left-2 px-1 py-0.5 bg-black/80 text-[8px] text-white rounded font-mono">
             {Math.round(topDistance)}
           </div>
        </div>
      )}

      {/* Left Distance */}
      {leftDistance > 0 && (
        <div 
          style={{
            ...styleBase,
            top: rect.y + rect.height / 2,
            left: 0,
            width: rect.x,
            height: 1,
            background: `repeating-linear-gradient(to right, ${color}, ${color} 2px, transparent 2px, transparent 4px)`
          }}
        >
           <div className="absolute left-1/2 top-2 px-1 py-0.5 bg-black/80 text-[8px] text-white rounded font-mono -translate-x-1/2">
             {Math.round(leftDistance)}
           </div>
        </div>
      )}
    </>
  );
};
