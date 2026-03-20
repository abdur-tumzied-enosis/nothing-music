import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { useLibraryStore } from '@/store/libraryStore';

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
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  );
}
