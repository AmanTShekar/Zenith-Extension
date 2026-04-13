import { create } from 'zustand';

interface SystemState {
  connectedServer: string | null;
  devServerUrl: string | null;
  detectedServers: string[];
  projectName: string;
  theme: 'dark' | 'light';
  debugMode: boolean;
  isSpacePressed: boolean;
  sandboxPort: number;
  notifications: Array<{ id: string; type: 'info' | 'error' | 'success'; message: string }>;
  actions: {
    setConnectedServer: (url: string | null) => void;
    setDevServerUrl: (url: string | null) => void;
    setDetectedServers: (urls: string[] | ((prev: string[]) => string[])) => void;
    setProjectName: (name: string) => void;
    setTheme: (theme: 'dark' | 'light') => void;
    toggleDebugMode: () => void;
    setIsSpacePressed: (pressed: boolean) => void;
    setSandboxPort: (port: number) => void;
    addNotification: (type: 'info' | 'error' | 'success', message: string) => void;
    removeNotification: (id: string) => void;
  };
}

export const useSystemStore = create<SystemState>((set) => ({
  connectedServer: null,
  devServerUrl: null,
  detectedServers: [],
  projectName: 'Zenith Project',
  theme: 'dark',
  debugMode: false,
  isSpacePressed: false,
  sandboxPort: 3111,
  notifications: [],
  actions: {
    setConnectedServer: (connectedServer) => set({ connectedServer }),
    setDevServerUrl: (devServerUrl) => set({ devServerUrl }),
    setDetectedServers: (update) => set((state) => ({ 
      detectedServers: typeof update === 'function' ? update(state.detectedServers) : update 
    })),
    setProjectName: (projectName) => set({ projectName }),
    setTheme: (theme) => set({ theme }),
    toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),
    setIsSpacePressed: (isSpacePressed) => set({ isSpacePressed }),
    setSandboxPort: (sandboxPort) => set({ sandboxPort }),
    addNotification: (type, message) => {
      const id = Math.random().toString(36).substring(7);
      set((state) => ({
        notifications: [...state.notifications, { id, type, message }],
      }));
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, 3000);
    },
    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
  }
}));
