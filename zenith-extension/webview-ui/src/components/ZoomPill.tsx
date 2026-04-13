import React from 'react';
import { useCanvasStore } from '../stores';

export function ZoomPill() {
  const { zoom, actions } = useCanvasStore();
  
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[5000] flex items-center gap-3 px-4 py-2 bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.6)] group">
      <button 
        onClick={() => {
            // v11.9 Restoration: Match user preferred "Home" coordinates
            actions.setPan(-7, -75);
            actions.setZoom(0.65);
        }}
        className="text-white/30 hover:text-white transition-all p-1 active:scale-90"
        title="Fit to Screen"
      >
        <i className="ph ph-corners-out text-xs" />
      </button>

      <button 
        onClick={() => {
            actions.setZoom(0.65);
            actions.setPan(-7, -75);
        }}
        className="text-white/30 hover:text-white transition-all p-1 active:scale-90"
        title="Mechanical Home (Zenith Master)"
      >
        <i className="ph ph-house text-xs" />
      </button>

      <button 
        onClick={() => actions.setZoom(zoom / 1.1)}
        className="text-white/30 hover:text-white transition-all p-1 active:scale-90"
        title="Zoom Out (-)"
      >
        <i className="ph ph-minus text-xs" />
      </button>
      
      <div 
        className="flex items-center gap-1.5 min-w-[55px] justify-center border-x border-white/5 px-4 cursor-pointer hover:bg-white/5 rounded-lg py-1 transition-all"
        onClick={() => {
            actions.setZoom(0.65);
            actions.setPan(-7, -75);
        }}
        title="Reset Zoom (Cmd+0)"
      >
        <span className="text-[11px] font-mono font-black text-accent tracking-tighter">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <button 
        onClick={() => actions.setZoom(zoom * 1.1)}
        className="text-white/30 hover:text-white transition-all p-1 active:scale-90"
        title="Zoom In (+)"
      >
        <i className="ph ph-plus text-xs" />
      </button>
    </div>
  );
}
