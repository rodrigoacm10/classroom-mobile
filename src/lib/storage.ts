import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'locus_access_token';
const REFRESH_TOKEN_KEY = 'locus_refresh_token';
const TENANT_ID_KEY = 'locus_active_tenant_id';

// In-memory cache for fast sync access
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function getStoredAccessToken(): Promise<string | null> {
  if (memoryAccessToken) return memoryAccessToken;
  if (await isSecureStoreAvailable()) {
    try {
      const val = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      memoryAccessToken = val;
      return val;
    } catch {
      return null;
    }
  }
  return null;
}

export function getStoredAccessTokenSync(): string | null {
  return memoryAccessToken;
}

export async function setStoredAccessToken(token: string | null): Promise<void> {
  memoryAccessToken = token;
  if (await isSecureStoreAvailable()) {
    try {
      if (token) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      }
    } catch {
      // Ignore secure store write errors
    }
  }
}

export async function getStoredRefreshToken(): Promise<string | null> {
  if (memoryRefreshToken) return memoryRefreshToken;
  if (await isSecureStoreAvailable()) {
    try {
      const val = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      memoryRefreshToken = val;
      return val;
    } catch {
      return null;
    }
  }
  return null;
}

export async function setStoredRefreshToken(token: string | null): Promise<void> {
  memoryRefreshToken = token;
  if (await isSecureStoreAvailable()) {
    try {
      if (token) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch {
      // Ignore
    }
  }
}

export async function getStoredActiveTenantId(): Promise<string | null> {
  if (await isSecureStoreAvailable()) {
    try {
      return await SecureStore.getItemAsync(TENANT_ID_KEY);
    } catch {
      return null;
    }
  }
  return null;
}

export async function setStoredActiveTenantId(tenantId: string | null): Promise<void> {
  if (await isSecureStoreAvailable()) {
    try {
      if (tenantId) {
        await SecureStore.setItemAsync(TENANT_ID_KEY, tenantId);
      } else {
        await SecureStore.deleteItemAsync(TENANT_ID_KEY);
      }
    } catch {
      // Ignore
    }
  }
}

export async function clearAllStoredAuth(): Promise<void> {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  if (await isSecureStoreAvailable()) {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(TENANT_ID_KEY);
    } catch {
      // Ignore
    }
  }
}
