import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeIOS,
  InterruptionModeAndroid,
} from 'expo-av';

type StatusCallback = (opts: {
  positionMillis: number;
  durationMillis: number | undefined;
  isPlaying: boolean;
  didJustFinish: boolean;
}) => void;

let _sound: Audio.Sound | null = null;
let _onStatus: StatusCallback | null = null;
let _initialized = false;

export function setStatusCallback(cb: StatusCallback) {
  _onStatus = cb;
}

async function ensureInit() {
  if (_initialized) return;
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
  });
  _initialized = true;
}

function handleStatus(status: AVPlaybackStatus) {
  if (!status.isLoaded) return;
  _onStatus?.({
    positionMillis: status.positionMillis,
    durationMillis: status.durationMillis,
    isPlaying: status.isPlaying,
    didJustFinish: status.didJustFinish ?? false,
  });
}

export async function loadAndPlay(uri: string) {
  await ensureInit();
  if (_sound) {
    await _sound.unloadAsync();
    _sound = null;
  }
  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true, progressUpdateIntervalMillis: 500 },
    handleStatus,
  );
  _sound = sound;
}

export async function pause() {
  await _sound?.pauseAsync();
}

export async function resume() {
  await _sound?.playAsync();
}

export async function seek(ms: number) {
  await _sound?.setPositionAsync(ms);
}

export async function unload() {
  if (_sound) {
    await _sound.unloadAsync();
    _sound = null;
  }
}
