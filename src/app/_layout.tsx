import { useSleepTimer } from '@/hooks/useSleepTimer';
import * as audioService from '@/services/audioService';
import { PlaybackService } from '@/services/playbackService';
import { useLibraryStore } from '@/store/libraryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';

// Module-level registration — runs synchronously before any component mounts.
// Must happen here (not inside a component) so RNTP's headless task is
// registered before the OS could invoke it.
TrackPlayer.registerPlaybackService(() => PlaybackService);

// Prevent splash from auto-hiding until fonts are ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    NDot57: require('@/assets/fonts/NDot57.ttf'), // uncomment when font file is added
  });

  const loadPersistedLibrary = useLibraryStore((s) => s.loadPersistedLibrary);
  const loadPersistedSettings = useSettingsStore((s) => s.loadPersistedSettings);

  useSleepTimer();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      loadPersistedSettings();
      loadPersistedLibrary();
      audioService.setup();
    }
  }, [fontsLoaded]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="player"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="album/[id]" />
        <Stack.Screen name="artist/[id]" />
        <Stack.Screen name="playlist/[id]" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
