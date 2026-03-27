import TrackPlayer, {
  Event,
  State,
  Capability,
  RepeatMode as RNTPRepeatMode,
} from 'react-native-track-player';
import { usePlayerStore } from '@/store/playerStore';
import type { Track } from '@/store/types';

let _setupDone = false;
let _isLoadingQueue = false;

export async function setup() {
  if (_setupDone) return;
  try {
    await TrackPlayer.setupPlayer();
  } catch (e: unknown) {
    // On hot reload RNTP is already initialized — that's fine, continue.
    const msg = e instanceof Error ? e.message : String(e);
    if (!msg.includes('already')) {
      // Only warn in dev — remove before prod
      return;
    }
  }
  _setupDone = true;

  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
      Capability.Stop,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
    progressUpdateEventInterval: 1,
  });

  // Sync position + duration into the store
  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, ({ position, duration }) => {
    usePlayerStore.getState().setPosition(Math.floor(position * 1000));
    usePlayerStore.getState().setDuration(Math.floor(duration * 1000));
  });

  // Sync track changes triggered by lock screen / notification skip
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async ({ track: rnTrack, index }) => {
    if (_isLoadingQueue) return;
    if (!rnTrack || index === undefined) return;
    const { currentTrack, queue } = usePlayerStore.getState();
    if (currentTrack?.id !== rnTrack.id) {
      const ourTrack = queue[index] ?? null;
      if (ourTrack) {
        usePlayerStore.setState({ currentTrack: ourTrack, queueIndex: index, position: 0, duration: 0 });
      }
    }
  });

  // Sync play/pause state triggered by lock screen / notification / audio focus
  TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
    const isPlaying = state === State.Playing;
    if (isPlaying !== usePlayerStore.getState().isPlaying) {
      usePlayerStore.setState({ isPlaying });
    }
  });

  // Extract embedded ID3 artwork from audio files
  TrackPlayer.addEventListener(Event.MetadataCommonReceived, ({ artworkUri }) => {
    if (artworkUri) {
      const { currentTrack } = usePlayerStore.getState();
      if (currentTrack) {
        usePlayerStore.setState({
          currentTrack: { ...currentTrack, artworkUri },
        });
      }
    }
  });

  // End of queue
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    usePlayerStore.setState({ isPlaying: false, position: 0 });
  });

  TrackPlayer.addEventListener(Event.PlaybackError, ({ message }) => {
    usePlayerStore.setState({ isPlaying: false });
  });
}

function toRNTPTracks(tracks: Track[]) {
  return tracks.map((t) => {
    return {
      id: t.id,
      url: t.uri,
      title: t.title,
      artist: t.artist,
      album: t.album,
      duration: t.duration / 1000,
      artwork: t.artworkUri ?? undefined,
    };
  });
}

export async function loadQueue(track: Track, queue: Track[]) {
  const rnTracks = toRNTPTracks(queue);
  const startIndex = Math.max(0, queue.findIndex((t) => t.id === track.id));
  _isLoadingQueue = true;
  try {
    await TrackPlayer.reset();
    await TrackPlayer.add(rnTracks);
    if (startIndex > 0) await TrackPlayer.skip(startIndex);
  } finally {
    _isLoadingQueue = false;
  }
  await TrackPlayer.play();
}

export async function pause() {
  await TrackPlayer.pause();
}

export async function resume() {
  await TrackPlayer.play();
}

export async function seek(ms: number) {
  await TrackPlayer.seekTo(ms / 1000);
}

export async function skipNext() {
  await TrackPlayer.skipToNext();
}

export async function skipPrev(positionMs: number) {
  if (positionMs > 3000) {
    await TrackPlayer.seekTo(0);
  } else {
    await TrackPlayer.skipToPrevious();
  }
}

export async function setRepeatMode(mode: 'none' | 'one' | 'all') {
  const rnMode =
    mode === 'none' ? RNTPRepeatMode.Off : mode === 'one' ? RNTPRepeatMode.Track : RNTPRepeatMode.Queue;
  await TrackPlayer.setRepeatMode(rnMode);
}
