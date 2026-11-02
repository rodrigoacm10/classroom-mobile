import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_700Bold,
} from '@expo-google-fonts/ibm-plex-mono';

import { getOrCreateDeviceId } from '@/lib/storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
    IBMPlexMono_400Regular,
    IBMPlexMono_700Bold,
  });

  useEffect(() => {
    // Garante a geração e persistência do ID exclusivo do aparelho na inicialização
    getOrCreateDeviceId().catch(() => {});
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="select-tenant" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(aluno)" />
    </Stack>
  );
}
