import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Resolves the backend API URL.
 * Priority:
 * 1. EXPO_PUBLIC_API_URL from .env
 * 2. Automatic host IP detection via Expo/Metro (hostUri: e.g. 192.168.15.53:8081)
 * 3. Fallbacks for Android Emulator (10.0.2.2) and iOS Simulator / Web (localhost)
 */
export function getApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    // Detect host machine IP automatically from Expo bundler connection
    const hostUri =
      Constants.expoConfig?.hostUri ??
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ??
      Constants.experienceUrl;

    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:8000`;
      }
    }

    // Android official emulator loopback gateway fallback
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000';
    }
  }

  return 'http://localhost:8000';
}

export const apiUrl = getApiUrl();
