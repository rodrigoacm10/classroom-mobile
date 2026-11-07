import { api } from '../lib/api-client';

export type UserProfileResponse = {
  id: string;
  name: string;
  email: string;
  tenant_id: string | null;
  role: 'admin' | 'professor' | 'aluno' | 'coordenador' | null;
  created_at: string;
};

export type CreateUserData = {
  name: string;
  email: string;
  password: string;
};

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  tenant_id?: string | null;
  role?: 'admin' | 'professor' | 'aluno' | 'coordenador' | null;
  created_at: string;
};

/**
 * Retorna os dados do perfil do usuário autenticado (/users/me).
 */
export async function getMyProfile(): Promise<UserProfileResponse> {
  return api<UserProfileResponse>('/users/me');
}

/**
 * Cria um novo usuário no sistema (/users/).
 * Endpoint público, sem necessidade de autenticação prévia.
 */
export async function registerUser(data: CreateUserData): Promise<UserResponse> {
  return api<UserResponse>('/users/', {
    method: 'POST',
    body: data,
    skipAuthRefresh: true,
  });
}

export const userService = {
  getMyProfile,
  registerUser,
};
