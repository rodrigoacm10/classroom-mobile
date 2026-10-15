import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { SecondaryScreen } from '@/components/ui/secondary-screen';
import { RecoverySteps } from '@/components/ui/flow-steps';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { ApiError } from '@/lib/api-client';
import { forgotPassword, verifyResetCode } from '@/services/password-recovery';
import { setResetSessionToken } from '@/lib/reset-session';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{
    email?: string;
    code?: string;
  }>();

  const email = (searchParams.email || '').trim().toLowerCase();
  const initialCode = (searchParams.code || '').replace(/\D/g, '').slice(0, 6);

  const [digits, setDigits] = useState<string[]>(() => {
    if (initialCode.length === 6) {
      return initialCode.split('');
    }
    return ['', '', '', '', '', ''];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const hasAutoValidated = useRef(false);

  // Redireciona se não houver e-mail
  useEffect(() => {
    if (!email) {
      router.replace('/forgot-password');
    }
  }, [email, router]);

  // Timer de cooldown para reenvio
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const validateCode = useCallback(
    async (codeToValidate: string) => {
      if (!email) {
        router.replace('/forgot-password');
        return;
      }

      if (codeToValidate.length !== 6) {
        setError('Digite o código de verificação completo de 6 dígitos.');
        return;
      }

      setLoading(true);
      setError(null);
      setResendNotice(null);

      try {
        const { reset_token } = await verifyResetCode(email, codeToValidate);
        setResetSessionToken(reset_token);
        router.push('/reset-password');
      } catch (cause) {
        if (cause instanceof ApiError) {
          setError(cause.message);
        } else if (cause instanceof Error) {
          setError(cause.message);
        } else {
          setError(
            'Não foi possível validar o código com o servidor. Verifique sua conexão e tente novamente.',
          );
        }
        inputRefs.current[0]?.focus();
        setLoading(false);
      }
    },
    [email, router],
  );

  // Auto-validação se o código veio completo pela URL
  useEffect(() => {
    if (!hasAutoValidated.current && initialCode.length === 6 && email) {
      hasAutoValidated.current = true;
      validateCode(initialCode);
    }
  }, [initialCode, email, validateCode]);

  function handleDigitChange(index: number, value: string) {
    const clean = value.replace(/\D/g, '');
    const nextDigits = [...digits];

    if (!clean) {
      nextDigits[index] = '';
      setDigits(nextDigits);
      setError(null);
      return;
    }

    // Suporte a colar código completo no primeiro campo
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        nextDigits[i] = chars[i] || '';
      }
      setDigits(nextDigits);
      setError(null);

      const fullCode = nextDigits.join('');
      if (fullCode.length === 6) {
        validateCode(fullCode);
      } else {
        const nextIdx = Math.min(chars.length, 5);
        inputRefs.current[nextIdx]?.focus();
      }
      return;
    }

    nextDigits[index] = clean.slice(-1);
    setDigits(nextDigits);
    setError(null);

    // Avança para o próximo campo
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Se completou 6 dígitos, auto-valida
    const fullCode = nextDigits.join('');
    if (fullCode.length === 6) {
      validateCode(fullCode);
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const nextDigits = [...digits];
      nextDigits[index - 1] = '';
      setDigits(nextDigits);
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleResendCode() {
    if (cooldown > 0 || !email) return;

    setError(null);
    setResendNotice(null);

    try {
      await forgotPassword(email);
      setResendNotice('Um novo código de 6 dígitos foi enviado para o seu e-mail.');
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Não foi possível reenviar o código. Tente novamente mais tarde.');
    }
  }

  const fullCode = digits.join('');

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
      <RecoverySteps current={2} />

      <View className="mb-6">
        <Text className="font-sans-black text-[32px] leading-9 tracking-tight text-ink">
          Código de verificação
        </Text>
        {email ? (
          <View className="mt-3 flex-row flex-wrap items-center gap-1">
            <Text className="font-sans text-body text-muted">
              Enviamos o código de 6 dígitos para
            </Text>
            <Text className="font-sans-bold text-body text-ink">{email}</Text>
            <Pressable
              onPress={() =>
                router.replace({
                  pathname: '/forgot-password',
                  params: { email },
                })
              }
              hitSlop={8}
            >
              <Text className="font-sans text-caption text-ink underline">
                (Alterar e-mail)
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text className="font-sans text-body text-muted mt-3">
            Digite o código numérico de 6 dígitos enviado para seu e-mail.
          </Text>
        )}
      </View>

      <View className="flex-col gap-6">
        {/* 6 Digit Inputs */}
        <View className="flex-row items-center justify-between gap-2 py-2">
          {digits.map((digit, index) => {
            const isFilled = Boolean(digit);
            return (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(val) => handleDigitChange(index, val)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(index, nativeEvent.key)
                }
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
                editable={!loading}
                className={`h-14 w-12 text-center font-mono-bold text-title text-ink rounded-sm border ${
                  error
                    ? 'border-danger bg-paper'
                    : isFilled
                      ? 'border-ink bg-paper'
                      : 'border-control-border bg-paper'
                }`}
              />
            );
          })}
        </View>

        {/* Notices */}
        {error ? <Notice variant="danger">{error}</Notice> : null}
        {resendNotice ? <Notice variant="success">{resendNotice}</Notice> : null}

        {/* Primary Action Button */}
        <Button
          variant="ink"
          size="lg"
          onPress={() => validateCode(fullCode)}
          loading={loading}
          disabled={loading || fullCode.length !== 6}
          accessibilityLabel="Validar código de verificação"
        >
          {loading ? 'Validando código…' : 'Validar código'}
        </Button>

        {/* Resend Code Section */}
        <View className="items-center justify-center pt-2 gap-2">
          {cooldown > 0 ? (
            <Text className="font-sans text-caption text-muted">
              Não recebeu? Reenviar código em{' '}
              <Text className="font-mono-bold text-ink">{cooldown}s</Text>
            </Text>
          ) : (
            <Pressable
              onPress={handleResendCode}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text className="font-sans-semibold text-label text-ink underline">
                Reenviar código de verificação
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => router.push('/login')}
            hitSlop={8}
            className="mt-2"
          >
            <Text className="font-sans text-caption text-muted underline">
              Voltar para o login
            </Text>
          </Pressable>
        </View>
      </View>
    </SecondaryScreen>
  );
}
