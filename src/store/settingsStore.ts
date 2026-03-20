import { create } from 'zustand';
import { ThemeMode, SortOrder } from './types';

interface SettingsStore {
  themeMode: ThemeMode;
  sortOrder: SortOrder;
  showTabLabels: boolean;
  hapticFeedback: boolean;
  sleepTimerMinutes: number | null;

  setThemeMode: (mode: ThemeMode) => void;
  setSortOrder: (order: SortOrder) => void;
  setShowTabLabels: (show: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;
  setSleepTimer: (minutes: number | null) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  themeMode: 'dark',
  sortOrder: 'az',
  showTabLabels: false,
  hapticFeedback: true,
  sleepTimerMinutes: null,

  setThemeMode: (mode) => set({ themeMode: mode }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setShowTabLabels: (show) => set({ showTabLabels: show }),
  setHapticFeedback: (enabled) => set({ hapticFeedback: enabled }),
  setSleepTimer: (minutes) => set({ sleepTimerMinutes: minutes }),
}));
