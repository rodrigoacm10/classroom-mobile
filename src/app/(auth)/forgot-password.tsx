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
import { forgotPassword } from '@/services/password-recovery';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(searchParams.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Informe o e-mail institucional cadastrado.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(cleanEmail);
      router.push({
        pathname: '/verify-code',
        params: { email: cleanEmail },
      });
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
      } else if (cause instanceof Error) {
        setError(cause.message);
      } else {
        setError(
          'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        );
      }
    } finally {
      setLoading(false);
    }
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
      <RecoverySteps current={1} />

      <View className="mb-6">
        <Text className="font-sans-black text-[32px] leading-9 tracking-tight text-ink">
          Recuperar senha
        </Text>
        <Text className="font-sans text-body text-muted mt-3">
          Informe o e-mail cadastrado na sua instituição. Enviaremos um código de 6
          dígitos para você criar sua nova senha.
        </Text>
      </View>

      <View className="flex-col gap-5">
        <Input
          label="E-mail institucional"
          placeholder="nome@instituicao.edu.br"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoCorrect={false}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (error) setError(null);
          }}
          disabled={loading}
          invalid={Boolean(error)}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          accessibilityLabel="Campo de e-mail institucional"
        />

        {/* Informational Callout */}
        <View className="flex-row items-start gap-3 rounded-sm border border-border bg-surface px-4 py-3.5">
          <Text className="text-base">✉️</Text>
          <Text className="font-sans text-label leading-[18px] text-muted flex-1">
            Enviaremos um código de 6 dígitos válido por{' '}
            <Text className="font-sans-semibold text-ink">15 minutos</Text>. Após
            confirmar o código, você poderá criar uma nova senha imediatamente.
          </Text>
        </View>

        {error ? <Notice variant="danger">{error}</Notice> : null}

        <Button
          variant="ink"
          size="lg"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !email.trim()}
          className="mt-1"
          accessibilityLabel="Enviar código de verificação"
        >
          {loading ? 'Enviando código…' : 'Enviar código de verificação'}
        </Button>

        <View className="flex-row items-center justify-between border-t border-border pt-5">
          <Text className="font-sans text-label text-muted">
            Lembrou sua senha?
          </Text>
          <Pressable
            onPress={() => router.push('/login')}
            hitSlop={8}
            accessibilityRole="link"
          >
            <Text className="font-sans-semibold text-label text-ink underline">
              Voltar para o login
            </Text>
          </Pressable>
        </View>
      </View>
    </SecondaryScreen>
  );
}
