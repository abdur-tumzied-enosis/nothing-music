import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, SortOrder } from './types';

const SETTINGS_KEY = 'nmusic_settings';

interface PersistedSettings {
  themeMode: ThemeMode;
  sortOrder: SortOrder;
  showTabLabels: boolean;
  hapticFeedback: boolean;
  sleepTimerMinutes: number | null;
}

interface SettingsStore extends PersistedSettings {
  // Sleep timer runtime state (not persisted — resets on restart)
  sleepTimerEndTime: number | null;

  setThemeMode: (mode: ThemeMode) => void;
  setSortOrder: (order: SortOrder) => void;
  setShowTabLabels: (show: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;
  setSleepTimerMinutes: (minutes: number | null) => void;
  startSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  loadPersistedSettings: () => Promise<void>;
}

async function saveSettings(state: SettingsStore) {
  const payload: PersistedSettings = {
    themeMode: state.themeMode,
    sortOrder: state.sortOrder,
    showTabLabels: state.showTabLabels,
    hapticFeedback: state.hapticFeedback,
    sleepTimerMinutes: state.sleepTimerMinutes,
  };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  themeMode: 'dark',
  sortOrder: 'az',
  showTabLabels: false,
  hapticFeedback: true,
  sleepTimerMinutes: null,
  sleepTimerEndTime: null,

  setThemeMode: (mode) => {
    set({ themeMode: mode });
    saveSettings(get());
  },
  setSortOrder: (order) => {
    set({ sortOrder: order });
    saveSettings(get());
  },
  setShowTabLabels: (show) => {
    set({ showTabLabels: show });
    saveSettings(get());
  },
  setHapticFeedback: (enabled) => {
    set({ hapticFeedback: enabled });
    saveSettings(get());
  },
  setSleepTimerMinutes: (minutes) => {
    set({ sleepTimerMinutes: minutes });
    saveSettings(get());
  },

  startSleepTimer: (minutes) => {
    const endTime = Date.now() + minutes * 60 * 1000;
    set({ sleepTimerMinutes: minutes, sleepTimerEndTime: endTime });
    saveSettings(get());
  },

  cancelSleepTimer: () => {
    set({ sleepTimerEndTime: null });
  },

  loadPersistedSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const saved: Partial<PersistedSettings> = JSON.parse(raw);
      set({
        themeMode: saved.themeMode ?? 'dark',
        sortOrder: saved.sortOrder ?? 'az',
        showTabLabels: saved.showTabLabels ?? false,
        hapticFeedback: saved.hapticFeedback ?? true,
        sleepTimerMinutes: saved.sleepTimerMinutes ?? null,
      });
    } catch {
      // ignore parse errors — defaults remain
    }
  },
}));
