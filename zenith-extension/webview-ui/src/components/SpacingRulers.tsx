import React from 'react';
import { clsx } from 'clsx';
import { useCanvasStore } from '../stores';

interface SpacingRulersProps {
  rect: { x: number; y: number; width: number; height: number };
  color?: string;
}

const LineSegment = ({ distance, axis, pos, rect, color, styleBase }: { 
  distance: number; 
  axis: 'x' | 'y'; 
  pos: number;
  rect: { x: number; y: number; width: number; height: number };
  color: string;
  styleBase: React.CSSProperties;
}) => {
  if (distance <= 0) return null;

  const isY = axis === 'y';
  return (
    <div 
      style={{
        ...styleBase,
        top: isY ? (pos < rect.y ? 0 : rect.y + rect.height) : rect.y + rect.height / 2,
        left: isY ? rect.x + rect.width / 2 : (pos < rect.x ? 0 : rect.x + rect.width),
        width: isY ? 1 : distance,
        height: isY ? distance : 1,
        background: `repeating-linear-gradient(${isY ? 'to bottom' : 'to right'}, ${color}, ${color} 2px, transparent 2px, transparent 4px)`
      }}
    >
       <div className={clsx(
         "absolute px-1 py-0.5 bg-black/90 text-[7px] text-white rounded-[2px] font-mono border border-white/10 shadow-lg whitespace-nowrap",
         isY ? "left-2 top-1/2 -translate-y-1/2" : "top-2 left-1/2 -translate-x-1/2"
       )}>
         {Math.round(distance)}
       </div>
    </div>
  );
};

export const SpacingRulers: React.FC<SpacingRulersProps> = ({ rect, color = '#00F0FF' }) => {
  const zoom = useCanvasStore(state => state.zoom);
  const pan = useCanvasStore(state => state.pan);

  // v11.3: Ghost Rulers — Precise distances to all artboard boundaries
  const artboardWidth = 1440; 
  const artboardHeight = 900;

  const distances = {
    top: rect.y,
    bottom: artboardHeight - (rect.y + rect.height),
    left: rect.x,
    right: artboardWidth - (rect.x + rect.width),
  };

  const styleBase: React.CSSProperties = {
    pointerEvents: 'none',
    zIndex: 9998,
    position: 'absolute',
    opacity: 0.8,
  };

  return (
    <>
      <LineSegment distance={distances.top} axis="y" pos={0} rect={rect} color={color} styleBase={styleBase} />
      <LineSegment distance={distances.bottom} axis="y" pos={rect.y + rect.height} rect={rect} color={color} styleBase={styleBase} />
      <LineSegment distance={distances.left} axis="x" pos={0} rect={rect} color={color} styleBase={styleBase} />
      <LineSegment distance={distances.right} axis="x" pos={rect.x + rect.width} rect={rect} color={color} styleBase={styleBase} />
    </>
  );
};
