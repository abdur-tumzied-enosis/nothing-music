import { create } from 'zustand';
import { Track, RepeatMode } from './types';

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  position: number;   // ms
  duration: number;   // ms
  shuffle: boolean;
  repeat: RepeatMode;

  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  seek: (ms: number) => void;
  skipNext: () => void;
  skipPrev: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setPosition: (ms: number) => void;
  setDuration: (ms: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  position: 0,
  duration: 0,
  shuffle: false,
  repeat: 'none',

  play: (track, queue) =>
    set({
      currentTrack: track,
      queue: queue ?? [track],
      queueIndex: queue ? queue.findIndex((t) => t.id === track.id) : 0,
      isPlaying: true,
      position: 0,
    }),

  pause: () => set({ isPlaying: false }),

  resume: () => set({ isPlaying: true }),

  seek: (ms) => set({ position: ms }),

  skipNext: () => {
    const { queue, queueIndex, repeat } = get();
    if (queue.length === 0) return;
    const nextIndex =
      repeat === 'all'
        ? (queueIndex + 1) % queue.length
        : Math.min(queueIndex + 1, queue.length - 1);
    set({ queueIndex: nextIndex, currentTrack: queue[nextIndex], position: 0 });
  },

  skipPrev: () => {
    const { queue, queueIndex, position } = get();
    if (queue.length === 0) return;
    if (position > 3000) {
      set({ position: 0 });
      return;
    }
    const prevIndex = Math.max(queueIndex - 1, 0);
    set({ queueIndex: prevIndex, currentTrack: queue[prevIndex], position: 0 });
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  cycleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none',
    })),

  setPosition: (ms) => set({ position: ms }),

  setDuration: (ms) => set({ duration: ms }),
}));
