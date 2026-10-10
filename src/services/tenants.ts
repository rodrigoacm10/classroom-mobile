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

export type InviteStatusResponse = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  email: string;
  role: 'admin' | 'professor' | 'aluno' | 'coordenador';
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
};

export type TenantMemberResponse = {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'professor' | 'aluno' | 'coordenador';
  created_at: string;
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

/**
 * Consulta os detalhes de um convite a partir do token (Endpoint público).
 */
export async function getInvite(token: string): Promise<InviteStatusResponse> {
  return api<InviteStatusResponse>(`/invites/${token}`, {
    skipAuthRefresh: true,
  });
}

/**
 * Aceita um convite para ingressar em uma instituição.
 * Requer autenticação do usuário.
 */
export async function acceptInvite(
  token: string,
  authToken?: string,
): Promise<TenantMemberResponse> {
  const tokenToUse = authToken ?? (await getStoredAccessToken());
  return api<TenantMemberResponse>(`/invites/${token}/accept`, {
    method: 'POST',
    headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {},
    skipAuthRefresh: true,
  });
}

export const tenantService = {
  listMyTenants,
  switchTenant,
  getInvite,
  acceptInvite,
};
