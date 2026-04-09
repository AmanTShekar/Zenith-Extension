import { create } from 'zustand';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
  deviceWidth: number;
  deviceHeight: number;
  deviceType: DeviceType;
  orientation: 'portrait' | 'landscape';
  viewMode: 'single' | 'multi';
  activeTool: 'select' | 'hand';
  actions: {
    setZoom: (zoom: number) => void;
    setPan: (x: number, y: number) => void;
    setDevice: (type: DeviceType, w: number, h: number) => void;
    setTool: (tool: 'select' | 'hand') => void;
    toggleOrientation: () => void;
    setViewMode: (mode: 'single' | 'multi') => void;
    fitView: () => void;
  };
}

export const useCanvasStore = create<CanvasState>((set) => ({
  zoom: 1,
  pan: { x: 0, y: 0 },
  deviceWidth: 1440,
  deviceHeight: 900,
  deviceType: 'desktop',
  orientation: 'landscape',
  viewMode: 'single',
  activeTool: 'select',
  actions: {
    setZoom: (zoom) => {
      if (typeof zoom !== 'number' || isNaN(zoom)) return;
      set({ zoom: Math.max(0.05, Math.min(10, zoom)) });
    },
    setPan: (x, y) => {
      if (typeof x !== 'number' || isNaN(x) || typeof y !== 'number' || isNaN(y)) return;
      set({ pan: { x, y } });
    },
    setDevice: (type, w, h) => set({ deviceType: type, deviceWidth: w, deviceHeight: h, orientation: w > h ? 'landscape' : 'portrait' }),
    setTool: (activeTool) => set({ activeTool }),
    toggleOrientation: () => set(state => ({
      orientation: state.orientation === 'portrait' ? 'landscape' : 'portrait',
      deviceWidth: state.deviceHeight,
      deviceHeight: state.deviceWidth
    })),
    setViewMode: (viewMode) => set({ viewMode }),
    fitView: () => set({ zoom: 1, pan: { x: 0, y: 0 } }),
  }
}));
