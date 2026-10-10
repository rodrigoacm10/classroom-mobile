/**
 * Armazenamento em memória do ticket temporário de redefinição de senha (JWT).
 * Evita passar o token via query params ou persistir em logs desnecessariamente.
 */

let inMemoryResetToken: string | null = null;

export function setResetSessionToken(token: string | null): void {
  inMemoryResetToken = token;
}

export function getResetSessionToken(): string | null {
  return inMemoryResetToken;
}

export function clearResetSessionToken(): void {
  inMemoryResetToken = null;
}
