import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { SecondaryScreen } from '@/components/ui/secondary-screen';
import { RecoverySteps } from '@/components/ui/flow-steps';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { ApiError } from '@/lib/api-client';
import { resetPassword } from '@/services/password-recovery';
import { clearResetSessionToken, getResetSessionToken } from '@/lib/reset-session';

function getPasswordStrength(password: string): {
  level: 0 | 1 | 2 | 3;
  label: string;
  color: string;
} {
  if (password.length === 0) return { level: 0, label: '', color: '' };
  if (password.length < 6) return { level: 1, label: 'Muito curta', color: 'bg-danger' };
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const extras = [hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  if (password.length >= 12 && extras >= 2)
    return { level: 3, label: 'Forte', color: 'bg-success' };
  if (password.length >= 8 && extras >= 1)
    return { level: 2, label: 'Média', color: 'bg-warn' };
  return { level: 1, label: 'Fraca', color: 'bg-danger' };
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ reset_token?: string }>();

  const token = searchParams.reset_token || getResetSessionToken() || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(newPassword);

  // Se não houver token de reset
  if (!token && !success) {
    return (
      <SecondaryScreen
        onPressLogo={() => router.replace('/')}
        onPressPrivacy={() =>
          WebBrowser.openBrowserAsync('https://locus.app/privacidade').catch(() => {})
        }
        onPressTerms={() =>
          WebBrowser.openBrowserAsync('https://locus.app/termos').catch(() => {})
        }
        onPressContact={() =>
          WebBrowser.openBrowserAsync('mailto:contato@locus.app').catch(() => {})
        }
      >
        <View className="rounded-sm border border-border bg-surface p-6 gap-4">
          <View className="w-10 h-10 rounded-full bg-paper border border-border items-center justify-center">
            <Text className="text-lg">⚠️</Text>
          </View>

          <View className="gap-1">
            <Text className="font-sans-bold text-heading text-ink">
              Sessão expirada ou não encontrada
            </Text>
            <Text className="font-sans text-body text-muted">
              Inicie o processo novamente para receber um novo código de verificação.
            </Text>
          </View>

          <Button
            variant="ink"
            size="md"
            onPress={() => router.replace('/forgot-password')}
          >
            Iniciar recuperação de senha
          </Button>
        </View>
      </SecondaryScreen>
    );
  }

  async function handleResetPassword() {
    setError(null);

    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas digitadas não coincidem. Verifique e tente novamente.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      clearResetSessionToken();
      setSuccess(true);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
      } else if (cause instanceof Error) {
        setError(cause.message);
      } else {
        setError(
          'Não foi possível redefinir sua senha. Verifique sua conexão e tente novamente.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // Tela de Sucesso
  if (success) {
    return (
      <SecondaryScreen
        onPressLogo={() => router.replace('/')}
        onPressPrivacy={() =>
          WebBrowser.openBrowserAsync('https://locus.app/privacidade').catch(() => {})
        }
        onPressTerms={() =>
          WebBrowser.openBrowserAsync('https://locus.app/termos').catch(() => {})
        }
        onPressContact={() =>
          WebBrowser.openBrowserAsync('mailto:contato@locus.app').catch(() => {})
        }
      >
        <View className="items-center text-center py-6">
          <View className="w-16 h-16 rounded-full bg-success-surface items-center justify-center mb-6">
            <Text className="text-3xl text-success font-sans-bold">✓</Text>
          </View>

          <Text className="font-sans-black text-[28px] sm:text-[34px] leading-8 text-ink text-center">
            Senha alterada!
          </Text>

          <Text className="font-sans text-body text-muted text-center mt-3 max-w-[320px]">
            Sua nova senha foi salva. Por segurança, todas as outras sessões foram
            encerradas. Você já pode entrar com a nova senha.
          </Text>

          <View className="w-full max-w-[340px] mt-8">
            <Button
              variant="ink"
              size="lg"
              onPress={() => router.replace('/login')}
            >
              Fazer login agora
            </Button>
          </View>
        </View>
      </SecondaryScreen>
    );
  }

  return (
    <SecondaryScreen
      onPressLogo={() => router.replace('/')}
      onPressPrivacy={() =>
        WebBrowser.openBrowserAsync('https://locus.app/privacidade').catch(() => {})
      }
      onPressTerms={() =>
        WebBrowser.openBrowserAsync('https://locus.app/termos').catch(() => {})
      }
      onPressContact={() =>
        WebBrowser.openBrowserAsync('mailto:contato@locus.app').catch(() => {})
      }
    >
      <RecoverySteps current={3} />

      <View className="mb-6">
        <Text className="font-sans-black text-[32px] leading-9 tracking-tight text-ink">
          Criar nova senha
        </Text>
        <Text className="font-sans text-body text-muted mt-3">
          Defina sua nova credencial de acesso institucional.
        </Text>
      </View>

      <View className="flex-col gap-5">
        {/* Nova Senha */}
        <View className="flex-col gap-2">
          <Input
            label="Nova senha institucional"
            placeholder="Mínimo de 6 caracteres"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect={false}
            value={newPassword}
            onChangeText={(val) => {
              setNewPassword(val);
              if (error) setError(null);
            }}
            disabled={loading}
            rightAccessory={
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={8}
                accessibilityRole="button"
                className="px-2 py-1 justify-center active:opacity-70"
              >
                <Text className="font-sans-medium text-caption text-muted">
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Text>
              </Pressable>
            }
          />

          {/* Password Strength Indicator */}
          {newPassword.length > 0 && (
            <View className="flex-row items-center gap-2 pt-1">
              <View className="flex-1 flex-row gap-1 h-1.5">
                <View
                  className={`flex-1 rounded-full ${
                    strength.level >= 1 ? strength.color : 'bg-border'
                  }`}
                />
                <View
                  className={`flex-1 rounded-full ${
                    strength.level >= 2 ? strength.color : 'bg-border'
                  }`}
                />
                <View
                  className={`flex-1 rounded-full ${
                    strength.level >= 3 ? strength.color : 'bg-border'
                  }`}
                />
              </View>
              <Text className="font-sans text-caption text-muted">
                {strength.label}
              </Text>
            </View>
          )}
        </View>

        {/* Confirmar Nova Senha */}
        <Input
          label="Confirmar nova senha"
          placeholder="Digite a mesma senha"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          autoCorrect={false}
          value={confirmPassword}
          onChangeText={(val) => {
            setConfirmPassword(val);
            if (error) setError(null);
          }}
          disabled={loading}
          invalid={Boolean(confirmPassword && newPassword !== confirmPassword)}
          error={
            confirmPassword && newPassword !== confirmPassword
              ? 'As senhas digitadas não coincidem.'
              : undefined
          }
          rightAccessory={
            <Pressable
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              hitSlop={8}
              accessibilityRole="button"
              className="px-2 py-1 justify-center active:opacity-70"
            >
              <Text className="font-sans-medium text-caption text-muted">
                {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
              </Text>
            </Pressable>
          }
        />

        {error ? <Notice variant="danger">{error}</Notice> : null}

        <Button
          variant="ink"
          size="lg"
          onPress={handleResetPassword}
          loading={loading}
          disabled={loading || !newPassword || !confirmPassword}
          className="mt-2"
          accessibilityLabel="Salvar nova senha"
        >
          {loading ? 'Salvando nova senha…' : 'Salvar nova senha'}
        </Button>
      </View>
    </SecondaryScreen>
  );
}
