import React from 'react';

interface SnapGuidesProps {
  guides: { x: number[]; y: number[] };
  artboardRect: { width: number; height: number };
}

export const SnapGuides: React.FC<SnapGuidesProps> = ({ guides, artboardRect }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[99999]">
      <svg width={artboardRect.width} height={artboardRect.height} className="w-full h-full">
        {guides.x.map((x, i) => (
          <line
            key={`x-${i}`}
            x1={x}
            y1={0}
            x2={x}
            y2={artboardRect.height}
            stroke="#ff00ff"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.8"
          />
        ))}
        {guides.y.map((y, i) => (
          <line
            key={`y-${i}`}
            x1={0}
            y1={y}
            x2={artboardRect.width}
            y2={y}
            stroke="#ff00ff"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.8"
          />
        ))}
      </svg>
    </div>
  );
};
