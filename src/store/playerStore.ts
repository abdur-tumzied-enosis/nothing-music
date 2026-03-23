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
    const idx = queue ? Math.max(0, queue.findIndex((t) => t.id === track.id)) : 0;
    set({ currentTrack: track, queue: q, queueIndex: idx, isPlaying: true, position: 0, duration: 0 });
    audioService.loadAndPlay(track.uri);
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
    const { queue, queueIndex, repeat } = get();
    if (!queue.length) return;
    const nextIndex =
      repeat === 'all'
        ? (queueIndex + 1) % queue.length
        : Math.min(queueIndex + 1, queue.length - 1);
    const nextTrack = queue[nextIndex];
    set({ queueIndex: nextIndex, currentTrack: nextTrack, position: 0, duration: 0, isPlaying: true });
    audioService.loadAndPlay(nextTrack.uri);
  },

  skipPrev: () => {
    const { queue, queueIndex, position } = get();
    if (!queue.length) return;
    if (position > 3000) {
      set({ position: 0 });
      audioService.seek(0);
      return;
    }
    const prevIndex = Math.max(queueIndex - 1, 0);
    const prevTrack = queue[prevIndex];
    set({ queueIndex: prevIndex, currentTrack: prevTrack, position: 0, duration: 0, isPlaying: true });
    audioService.loadAndPlay(prevTrack.uri);
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  cycleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none',
    })),

  setPosition: (ms) => set({ position: ms }),

  setDuration: (ms) => set({ duration: ms }),
}));

// Wire audio status updates back to the store after creation
audioService.setStatusCallback(({ positionMillis, durationMillis, didJustFinish }) => {
  const store = usePlayerStore.getState();
  store.setPosition(positionMillis);
  if (durationMillis !== undefined) store.setDuration(durationMillis);

  if (didJustFinish) {
    const { repeat, queue, queueIndex, currentTrack } = usePlayerStore.getState();
    if (repeat === 'one' && currentTrack) {
      usePlayerStore.getState().setPosition(0);
      audioService.loadAndPlay(currentTrack.uri);
    } else if (queueIndex < queue.length - 1 || repeat === 'all') {
      usePlayerStore.getState().skipNext();
    } else {
      // End of queue, no repeat — stop playback
      usePlayerStore.setState({ isPlaying: false, position: 0 });
    }
  }
});
