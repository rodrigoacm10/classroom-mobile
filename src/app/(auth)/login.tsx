import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { SecondaryScreen } from '@/components/ui/secondary-screen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { ApiError } from '@/lib/api-client';
import { login } from '@/services/auth';
import { listMyTenants, switchTenant } from '@/services/tenants';

type Phase = 'credentials' | 'resolving' | 'switching';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [phase, setPhase] = useState<Phase>('credentials');

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setError(null);
    setSuccess(false);
    setPending(true);
    setPhase('credentials');

    try {
      // 1. Authenticate (base token, client_type: "mobile")
      const result = await login(email.trim(), password);
      const baseToken = result.access_token;

      // 2. Resolve tenants
      setPhase('resolving');
      const tenants = await listMyTenants(baseToken);

      // Filter: only active and not deleted
      const activeTenants = tenants.filter((t) => t.active && !t.deleted);

      if (activeTenants.length === 0) {
        setError(
          'Sua conta não possui nenhuma instituição ativa vinculada. Acesse o painel web para criar ou ingressar em uma instituição.',
        );
        setPending(false);
        return;
      }

      if (activeTenants.length === 1) {
        // Auto-switch to tenant
        setPhase('switching');
        await switchTenant(activeTenants[0].id, baseToken);
        setSuccess(true);

        setTimeout(() => {
          router.replace('/');
        }, 500);
        return;
      }

      // Mais de uma instituição ativa — redireciona para a tela de escolha
      setSuccess(true);
      setTimeout(() => {
        router.replace('/');
      }, 500);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
      } else if (cause instanceof Error) {
        setError(cause.message);
      } else {
        setError(
          'Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.',
        );
      }
      setPending(false);
    }
  }

  const buttonLabel =
    phase === 'resolving'
      ? 'Verificando instituições…'
      : phase === 'switching'
        ? 'Entrando na instituição…'
        : pending
          ? 'Entrando…'
          : 'Entrar';

  const handleForgotPassword = () => {
    router.push({
      pathname: '/forgot-password',
      params: email.trim() ? { email: email.trim() } : {},
    });
  };

  const handleRegister = () => {
    router.push('/register');
  };

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
      {/* Page Title & Subtitle */}
      <View className="mb-8">
        <Text className="font-sans-black text-[32px] leading-9 tracking-tight text-ink">
          Entrar
        </Text>
        <Text className="font-sans text-body text-muted mt-3">
          Use a conta da instituição. A sessão fica salva neste aplicativo.
        </Text>
      </View>

      {/* Login Form */}
      <View className="flex-col gap-5">
        {/* E-mail field */}
        <Input
          label="E-mail"
          placeholder="seu.email@instituicao.edu.br"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoCorrect={false}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (error) setError(null);
          }}
          invalid={Boolean(error)}
          returnKeyType="next"
          accessibilityLabel="Campo de e-mail"
        />

        {/* Password field with forgot link and visibility toggle */}
        <Input
          label="Senha"
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (error) setError(null);
          }}
          invalid={Boolean(error)}
          returnKeyType="go"
          onSubmitEditing={handleLogin}
          headerRight={
            <Pressable
              onPress={handleForgotPassword}
              hitSlop={8}
              accessibilityRole="link"
            >
              <Text className="font-sans text-label text-muted active:text-ink active:underline">
                Esqueceu a senha?
              </Text>
            </Pressable>
          }
          rightAccessory={
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              className="px-2 py-1 justify-center active:opacity-70"
            >
              <Text className="font-sans-medium text-caption text-muted">
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </Text>
            </Pressable>
          }
          accessibilityLabel="Campo de senha"
        />

        {/* Feedback alerts */}
        {error ? (
          <Notice variant="danger">{error}</Notice>
        ) : null}

        {success ? (
          <Notice variant="success">
            Autenticado. A sessão foi configurada; abrindo o aplicativo a seguir.
          </Notice>
        ) : null}

        {/* Primary Action Button */}
        <Button
          variant="ink"
          size="lg"
          onPress={handleLogin}
          loading={pending}
          disabled={pending || !email.trim() || !password}
          className="mt-1"
          accessibilityLabel="Botão Entrar"
        >
          {buttonLabel}
        </Button>
      </View>

      {/* Bottom Registration CTA */}
      <View className="mt-8">
        <Text className="font-sans text-label text-muted">
          Ainda não tem conta ou recebeu um convite?{' '}
          <Text
            onPress={handleRegister}
            className="font-sans-semibold text-ink underline"
          >
            Criar conta no Locus
          </Text>
        </Text>
      </View>
    </SecondaryScreen>
  );
}
