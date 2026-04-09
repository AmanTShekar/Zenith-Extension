import { create } from 'zustand';
import { vscode } from '../bridge';

interface LogEntry {
  id: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  timestamp: number;
  data?: any;
}

interface LogState {
  entries: LogEntry[];
  actions: {
    add: (level: LogEntry['level'], message: string, data?: any) => void;
    clear: () => void;
  }
}

export const useLogStore = create<LogState>((set) => ({
  entries: [],
  actions: {
    add: (level, message, data) => {
      const id = Math.random().toString(36).substring(7);
      const entry = { id, timestamp: Date.now(), level, message, data };
      set((state) => ({
        entries: [entry, ...state.entries].slice(0, 100)
      }));
      // Stream to extension for Flight Recorder
      vscode.postMessage({ type: 'zenithLog', entry });
    },
    clear: () => set({ entries: [] }),
  }
}));
