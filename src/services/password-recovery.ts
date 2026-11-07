import { api } from '../lib/api-client';

export type MessageResponse = {
  message: string;
};

export type VerifyResetCodeResponse = {
  reset_token: string;
  token_type: string;
  expires_in: number;
};

/**
 * Solicita envio do código OTP de 6 dígitos para o e-mail informado.
 * Sempre resolve com sucesso para evitar enumeração de e-mails.
 */
export async function forgotPassword(email: string): Promise<MessageResponse> {
  return api<MessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    skipAuthRefresh: true,
  });
}

/**
 * Valida o código OTP de 6 dígitos.
 * Retorna o reset_token temporário (JWT) válido para redefinição.
 */
export async function verifyResetCode(
  email: string,
  code: string,
): Promise<VerifyResetCodeResponse> {
  return api<VerifyResetCodeResponse>('/auth/verify-reset-code', {
    method: 'POST',
    body: { email, code },
    skipAuthRefresh: true,
  });
}

/**
 * Define a nova senha do usuário utilizando o reset_token obtido.
 */
export async function resetPassword(
  resetToken: string,
  newPassword: string,
): Promise<MessageResponse> {
  return api<MessageResponse>('/auth/reset-password', {
    method: 'POST',
    body: { reset_token: resetToken, new_password: newPassword },
    skipAuthRefresh: true,
  });
}

export const passwordRecoveryService = {
  forgotPassword,
  verifyResetCode,
  resetPassword,
};
