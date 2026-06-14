// store/themeStore.ts
// Manual dark mode toggle — follows device by default, manual override when toggled
import { create } from 'zustand';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: 'system',
  setMode: (mode: ThemeMode) => set({ mode }),
  toggleMode: () => {
    const current = get().mode;
    // Cycle: system → light → dark → system
    const next: ThemeMode = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
    set({ mode: next });
  },
}));
