import { api } from '../lib/api-client';
import {
  clearAllStoredAuth,
  getStoredAccessToken,
  setStoredAccessToken,
  setStoredRefreshToken,
} from '../lib/storage';

export type LoginMobileResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type MessageResponse = {
  message: string;
};

export async function login(email: string, password: string): Promise<LoginMobileResponse> {
  const result = await api<LoginMobileResponse>('/auth/login', {
    method: 'POST',
    body: { email, password, client_type: 'mobile' },
    skipAuthRefresh: true,
  });

  await setStoredAccessToken(result.access_token);
  if (result.refresh_token) {
    await setStoredRefreshToken(result.refresh_token);
  }

  return result;
}

export async function logout(): Promise<void> {
  try {
    const token = await getStoredAccessToken();
    await api<MessageResponse>('/auth/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      skipAuthRefresh: true,
    });
  } catch {
    // Non-blocking on network failure
  } finally {
    await clearAllStoredAuth();
  }
}

export const authService = {
  login,
  logout,
};
