import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { usePlayerStore } from '@/store/playerStore';

/**
 * Mounts a 1-second interval that tracks the sleep timer countdown.
 * When the timer expires it pauses playback and clears the end time.
 *
 * Mount this once at the root layout so it runs regardless of which screen is active.
 * Returns `remaining` in milliseconds (null = timer not active).
 */
export function useSleepTimer() {
  const sleepTimerEndTime = useSettingsStore((s) => s.sleepTimerEndTime);
  const cancelSleepTimer = useSettingsStore((s) => s.cancelSleepTimer);
  const pause = usePlayerStore((s) => s.pause);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!sleepTimerEndTime) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const diff = sleepTimerEndTime - Date.now();
      if (diff <= 0) {
        pause();
        cancelSleepTimer();
        setRemaining(null);
      } else {
        setRemaining(diff);
      }
    };

    tick(); // run immediately so UI shows remaining time right away
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sleepTimerEndTime]);

  return { remaining };
}
