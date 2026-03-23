import { create } from 'zustand';
import { Track, RepeatMode } from './types';
import * as audioService from '@/services/audioService';

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

  play: (track, queue) => {
    const q = queue ?? [track];
    const idx = Math.max(0, q.findIndex((t) => t.id === track.id));
    set({ currentTrack: track, queue: q, queueIndex: idx, isPlaying: true, position: 0, duration: 0 });
    audioService.loadQueue(track, q);
  },

  pause: () => {
    set({ isPlaying: false });
    audioService.pause();
  },

  resume: () => {
    set({ isPlaying: true });
    audioService.resume();
  },

  seek: (ms) => {
    set({ position: ms });
    audioService.seek(ms);
  },

  skipNext: () => {
    // Optimistic update for immediate UI response; event confirms it
    const { queue, queueIndex, repeat } = get();
    if (!queue.length) return;
    const nextIndex =
      repeat === 'all' ? (queueIndex + 1) % queue.length : Math.min(queueIndex + 1, queue.length - 1);
    set({ currentTrack: queue[nextIndex], queueIndex: nextIndex, position: 0, duration: 0, isPlaying: true });
    audioService.skipNext();
  },

  skipPrev: () => {
    const { queue, queueIndex, position } = get();
    if (!queue.length) return;
    if (position > 3000) {
      set({ position: 0 });
    } else {
      const prevIndex = Math.max(queueIndex - 1, 0);
      set({ currentTrack: queue[prevIndex], queueIndex: prevIndex, position: 0, duration: 0, isPlaying: true });
    }
    audioService.skipPrev(position);
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  cycleRepeat: () => {
    const next =
      get().repeat === 'none' ? 'all' : get().repeat === 'all' ? 'one' : 'none';
    set({ repeat: next });
    audioService.setRepeatMode(next);
  },

  setPosition: (ms) => set({ position: ms }),

  setDuration: (ms) => set({ duration: ms }),
}));
