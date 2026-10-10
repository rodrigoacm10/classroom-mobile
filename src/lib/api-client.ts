import { getApiUrl } from './env';
import {
  clearAllStoredAuth,
  getStoredAccessToken,
  getStoredActiveTenantId,
  getStoredRefreshToken,
  setStoredAccessToken,
  setStoredRefreshToken,
} from './storage';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<string> | null = null;

export type RefreshMobileResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

/**
 * Renews access token using mobile refresh token payload.
 */
export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = await getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const response = await fetch(`${getApiUrl()}/auth/refresh`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const data = (await response.json()) as RefreshMobileResponse;
      let finalAccessToken = data.access_token;
      await setStoredAccessToken(finalAccessToken);
      if (data.refresh_token) {
        await setStoredRefreshToken(data.refresh_token);
      }

      // Se o usuário já estava em uma instituição selecionada, revalida o escopo
      const activeTenantId = await getStoredActiveTenantId();
      if (activeTenantId) {
        try {
          const switchRes = await fetch(`${getApiUrl()}/auth/switch-tenant`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${finalAccessToken}`,
            },
            body: JSON.stringify({ tenant_id: activeTenantId }),
          });

          if (switchRes.ok) {
            const switchData = (await switchRes.json()) as { access_token: string };
            finalAccessToken = switchData.access_token;
            await setStoredAccessToken(finalAccessToken);
          }
        } catch {
          // Mantém o base token se a requisição de switch falhar temporariamente
        }
      }

      return finalAccessToken;
    } catch (err) {
      await clearAllStoredAuth();
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  _isRetry?: boolean;
  skipAuthRefresh?: boolean;
};

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers = {}, _isRetry, skipAuthRefresh, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (body !== undefined && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const isAuthRoute =
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/refresh') ||
    path.startsWith('/auth/forgot-password') ||
    path.startsWith('/auth/verify-reset-code') ||
    path.startsWith('/auth/reset-password');

  if (!requestHeaders['Authorization'] && !isAuthRoute) {
    let token = await getStoredAccessToken();
    if (!token && !skipAuthRefresh) {
      try {
        token = await refreshAccessToken();
      } catch {
        // Not authenticated
      }
    }
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Handle 401 with silent token refresh
  if (response.status === 401 && !_isRetry && !skipAuthRefresh && !isAuthRoute) {
    try {
      const newToken = await refreshAccessToken();
      const retryHeaders = {
        ...requestHeaders,
        Authorization: `Bearer ${newToken}`,
      };
      return api<T>(path, {
        ...options,
        headers: retryHeaders,
        _isRetry: true,
      });
    } catch {
      await clearAllStoredAuth();
      throw new ApiError(401, 'Sessão expirada. Faça login novamente.');
    }
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      detail?: string | { msg?: string }[];
    } | null;

    const detail = payload?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? (detail[0]?.msg ?? response.statusText)
          : response.statusText || 'Erro ao processar requisição';

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
