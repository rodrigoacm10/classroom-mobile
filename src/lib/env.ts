import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Resolves the backend API URL.
 * Supports EXPO_PUBLIC_API_URL from environment.
 * In development:
 * - Android emulator maps host localhost to 10.0.2.2.
 * - iOS simulator or web connects to localhost.
 */
export function getApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Development host fallback
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000';
    }
  }

  return 'http://localhost:8000';
}

export const apiUrl = getApiUrl();
