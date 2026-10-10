import { api } from '../lib/api-client';
import {
  getStoredAccessToken,
  setStoredAccessToken,
  setStoredActiveTenantId,
} from '../lib/storage';

export type MyTenantResponse = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  deleted: boolean;
  role: 'admin' | 'professor' | 'aluno' | 'coordenador';
  created_at: string;
};

export type SwitchTenantResponse = {
  access_token: string;
  token_type: string;
};

/**
 * Fetch the tenants the current user belongs to.
 */
export async function listMyTenants(token?: string): Promise<MyTenantResponse[]> {
  const tokenToUse = token ?? (await getStoredAccessToken());
  return api<MyTenantResponse[]>('/tenants/me', {
    headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {},
  });
}

/**
 * Exchange the base token for a tenant-scoped token.
 */
export async function switchTenant(
  tenantId: string,
  token?: string,
): Promise<SwitchTenantResponse> {
  const tokenToUse = token ?? (await getStoredAccessToken());
  const res = await api<SwitchTenantResponse>('/auth/switch-tenant', {
    method: 'POST',
    body: { tenant_id: tenantId },
    headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {},
    skipAuthRefresh: true,
  });

  await setStoredAccessToken(res.access_token);
  await setStoredActiveTenantId(tenantId);
  return res;
}

export const tenantService = {
  listMyTenants,
  switchTenant,
};
