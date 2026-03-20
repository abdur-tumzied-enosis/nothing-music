import { useSettingsStore } from '@/store/settingsStore';
import { Colors } from '@/theme/colors';
import { ThemeMode } from '@/store/types';

export function useTheme() {
  const mode = useSettingsStore((s) => s.themeMode);
  const colors = Colors[mode];
  return { colors, mode } as { colors: (typeof Colors)[ThemeMode]; mode: ThemeMode };
}
