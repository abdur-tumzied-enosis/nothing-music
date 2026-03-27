import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Returns haptic helpers that automatically no-op when the user has
 * disabled haptic feedback in Settings.
 *
 * Usage:
 *   const { light, medium } = useHaptics();
 *   <Pressable onPress={() => { light(); doSomething(); }} />
 */
export function useHaptics() {
  const enabled = useSettingsStore((s) => s.hapticFeedback);

  const light = () => {
    if (!enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const medium = () => {
    if (!enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const selection = () => {
    if (!enabled) return;
    Haptics.selectionAsync();
  };

  return { light, medium, selection };
}
