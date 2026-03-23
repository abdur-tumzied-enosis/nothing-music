import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from '@/services/playbackService';
import { useLibraryStore } from '@/store/libraryStore';
import * as audioService from '@/services/audioService';

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
    // NDot57: require('@/assets/fonts/NDot57.ttf'), // uncomment when font file is added
  });

  const loadPersistedLibrary = useLibraryStore((s) => s.loadPersistedLibrary);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      loadPersistedLibrary();
      audioService.setup();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
