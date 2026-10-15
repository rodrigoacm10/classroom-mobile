import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { SecondaryScreen } from '@/components/ui/secondary-screen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { ApiError } from '@/lib/api-client';
import { registerUser } from '@/services/user';
import { login } from '@/services/auth';
import {
  acceptInvite,
  getInvite,
  listMyTenants,
  switchTenant,
  InviteStatusResponse,
} from '@/services/tenants';

type Phase =
  | 'form'
  | 'registering'
  | 'authenticating'
  | 'accepting_invite'
  | 'resolving_tenants'
  | 'switching'
  | 'success_empty';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  aluno: 'Aluno',
  coordenador: 'Coordenador',
};

const requestAccessUrl = `mailto:contato@locus.app?subject=${encodeURIComponent(
  'Quero levar o Locus para minha instituição',
)}&body=${encodeURIComponent(
  [
    'Instituição:',
    'Cidade / estado:',
    'Quantas turmas por período:',
    'Quem vai conduzir a chamada:',
    'Telefone ou WhatsApp:',
    '',
  ].join('\n'),
)}`;

export default function RegisterScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{
    token?: string;
    invite?: string;
    email?: string;
  }>();

  const initialToken = searchParams.token || searchParams.invite || '';
  const initialEmail = searchParams.email || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteToken, setInviteToken] = useState(initialToken);
  const [showInviteField, setShowInviteField] = useState(Boolean(initialToken));

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [inviteDetails, setInviteDetails] = useState<InviteStatusResponse | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');

  // Valida o convite caso um token tenha vindo por parâmetro
  useEffect(() => {
    const trimmed = initialToken.trim();
    if (!trimmed) return;

    let isMounted = true;
    getInvite(trimmed)
      .then((data) => {
        if (!isMounted) return;
        setInviteDetails(data);
        if (data.email) {
          setEmail((prev) => prev || data.email);
        }
        if (data.status === 'expired') {
          setInviteError('Este convite já expirou. Peça um novo envio à coordenação.');
        } else if (data.status === 'revoked') {
          setInviteError('Este convite foi revogado pela administração.');
        } else if (data.status === 'accepted') {
          setInviteError('Este convite já foi aceito anteriormente.');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setInviteDetails(null);
        setInviteError('Código de convite não encontrado ou inválido.');
      });

    return () => {
      isMounted = false;
    };
  }, [initialToken]);

  async function handleVerifyInvite(tokenToVerify: string) {
    const trimmed = tokenToVerify.trim();
    if (!trimmed) {
      setInviteDetails(null);
      setInviteError(null);
      return;
    }

    setLoadingInvite(true);
    setInviteError(null);

    try {
      const data = await getInvite(trimmed);
      setInviteDetails(data);
      if (data.email) {
        setEmail((prev) => prev || data.email);
      }
      if (data.status === 'expired') {
        setInviteError('Este convite já expirou. Peça um novo envio à coordenação.');
      } else if (data.status === 'revoked') {
        setInviteError('Este convite foi revogado pela administração.');
      } else if (data.status === 'accepted') {
        setInviteError('Este convite já foi aceito anteriormente.');
      }
    } catch {
      setInviteDetails(null);
      setInviteError('Código de convite não encontrado ou inválido.');
    } finally {
      setLoadingInvite(false);
    }
  }

  async function handleRegister() {
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const cleanToken = inviteToken.trim();

    if (trimmedName.length < 2) {
      setError('Por favor, informe seu nome completo (mínimo de 2 caracteres).');
      return;
    }

    if (!trimmedEmail) {
      setError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (inviteDetails?.email && inviteDetails.email.toLowerCase() !== trimmedEmail) {
      setError(
        `Este convite foi emitido especificamente para o e-mail ${inviteDetails.email}. Utilize esse endereço para continuar.`,
      );
      return;
    }

    setPending(true);
    setPhase('registering');

    try {
      // 1. Cadastra o usuário
      await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      // 2. Autentica no aplicativo móvel
      setPhase('authenticating');
      const loginRes = await login(trimmedEmail, password);
      const baseToken = loginRes.access_token;

      // 3. Se houver convite pendente, aceita-o imediatamente
      if (cleanToken && (!inviteDetails || inviteDetails.status === 'pending')) {
        setPhase('accepting_invite');
        try {
          await acceptInvite(cleanToken, baseToken);
        } catch {
          // Não impede o fluxo se o convite já tiver sido processado
        }
      }

      // 4. Resolve instituições ativas
      setPhase('resolving_tenants');
      const tenants = await listMyTenants(baseToken);
      const activeTenants = tenants.filter((t) => t.active && !t.deleted);

      if (activeTenants.length === 1) {
        // Conexão direta com a única instituição
        setPhase('switching');
        await switchTenant(activeTenants[0].id, baseToken);
        router.replace('/');
        return;
      }

      if (activeTenants.length > 1) {
        // Múltiplas instituições
        router.replace('/');
        return;
      }

      // Usuário sem instituição no momento
      setPending(false);
      setPhase('success_empty');
    } catch (cause) {
      setPending(false);
      setPhase('form');

      if (cause instanceof ApiError) {
        if (cause.status === 409 || cause.message?.includes('já cadastrado')) {
          setError(
            'Este e-mail já possui uma conta no Locus. Se esta conta for sua, você pode entrar direto.',
          );
        } else {
          setError(cause.message);
        }
      } else if (cause instanceof Error) {
        setError(cause.message);
      } else {
        setError(
          'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        );
      }
    }
  }

  const buttonLabel =
    phase === 'registering'
      ? 'Criando sua conta…'
      : phase === 'authenticating'
        ? 'Autenticando…'
        : phase === 'accepting_invite'
          ? 'Vinculando convite…'
          : phase === 'resolving_tenants' || phase === 'switching'
            ? 'Conectando à instituição…'
            : 'Criar conta';

  const isEmailConflict = error?.includes('já possui uma conta');

  // Tela de boas-vindas quando o usuário cria conta avulsa sem instituição
  if (phase === 'success_empty') {
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
        <View className="rounded-sm border border-border bg-surface p-6">
          <View className="flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-full bg-accent items-center justify-center">
              <Text className="font-sans-bold text-ink text-body">✓</Text>
            </View>
            <Text className="font-sans-bold text-heading text-ink">
              Conta criada com sucesso!
            </Text>
          </View>

          <Text className="font-sans text-body text-muted mt-4">
            Bem-vindo(a), <Text className="font-sans-bold text-ink">{name.trim()}</Text>. Seu acesso foi registrado com o e-mail{' '}
            <Text className="font-sans-bold text-ink">{email.trim()}</Text>.
          </Text>

          <View className="mt-6 rounded-sm border border-border bg-paper p-4 gap-3">
            <Text className="font-sans-semibold text-body text-ink">
              Próximos passos:
            </Text>
            <View className="gap-2.5">
              <View className="flex-row items-start gap-2">
                <Text className="font-mono font-bold text-ink">•</Text>
                <Text className="font-sans text-label leading-[18px] text-muted flex-1">
                  <Text className="font-sans-bold text-ink">Já foi convidado(a) por e-mail? </Text>
                  Abra o link de convite enviado pela sua instituição para vincular sua turma e salas.
                </Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="font-mono font-bold text-ink">•</Text>
                <Text className="font-sans text-label leading-[18px] text-muted flex-1">
                  <Text className="font-sans-bold text-ink">Ainda aguarda inclusão? </Text>
                  Informe à coordenação que sua conta já está ativa com o e-mail informado.
                </Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="font-mono font-bold text-ink">•</Text>
                <Text className="font-sans text-label leading-[18px] text-muted flex-1">
                  <Text className="font-sans-bold text-ink">Quer levar o Locus para sua faculdade ou escola? </Text>
                  Nossa equipe configura a primeira turma e as salas georreferenciadas para você.
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-6 flex-col gap-3">
            <Button
              variant="ink"
              size="md"
              onPress={() => router.replace('/')}
            >
              Ir para o Início
            </Button>
            <Button
              variant="outline"
              size="md"
              onPress={() => Linking.openURL(requestAccessUrl).catch(() => {})}
            >
              Falar com o suporte
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
      {/* Title & Subtitle */}
      <View className="mb-8">
        <Text className="font-sans-black text-[32px] leading-9 tracking-tight text-ink">
          Criar sua conta
        </Text>
        <Text className="font-sans text-body text-muted mt-3">
          Cadastre seus dados de acesso ao Locus. Se você já recebeu um convite da sua
          instituição, poderá vinculá-lo agora ou após o cadastro.
        </Text>
      </View>

      <View className="flex-col gap-5">
        {/* Invite Detected Banner */}
        {inviteDetails && !inviteError ? (
          <View className="flex-col gap-2 rounded-sm border border-accent bg-accent-surface p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans-bold text-caption text-ink tracking-caps uppercase">
                Convite identificado
              </Text>
              <View className="rounded-sm bg-ink px-2 py-0.5">
                <Text className="font-mono text-[11px] font-semibold text-on-ink uppercase">
                  {roleLabels[inviteDetails.role] ?? inviteDetails.role}
                </Text>
              </View>
            </View>
            <Text className="font-sans text-body text-ink">
              Você está se cadastrando para ingressar em{' '}
              <Text className="font-sans-bold">{inviteDetails.tenant_name}</Text>.
            </Text>
          </View>
        ) : null}

        {/* Invite Error Notice */}
        {inviteError ? (
          <View className="rounded-sm border border-warn bg-surface p-4">
            <Text className="font-sans-semibold text-label text-warn">
              Aviso sobre o convite:
            </Text>
            <Text className="font-sans text-label text-muted mt-1">
              {inviteError}
            </Text>
            <Text className="font-sans text-caption text-muted mt-2">
              Você ainda pode prosseguir criando sua conta normalmente abaixo.
            </Text>
          </View>
        ) : null}

        {/* Full Name */}
        <Input
          label="Nome completo"
          placeholder="Ex: Prof. Helena Matos"
          autoCapitalize="words"
          autoComplete="name"
          disabled={pending}
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (error) setError(null);
          }}
          accessibilityLabel="Campo de nome completo"
        />

        {/* Email */}
        <Input
          label="E-mail institucional ou pessoal"
          placeholder="seu.email@instituicao.edu.br"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoCorrect={false}
          disabled={pending || (Boolean(inviteDetails?.email) && !inviteError)}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (error) setError(null);
          }}
          headerRight={
            inviteDetails?.email ? (
              <Text className="font-sans text-caption text-muted">
                E-mail do convite
              </Text>
            ) : null
          }
          accessibilityLabel="Campo de e-mail"
        />

        {/* Password */}
        <View className="flex-col gap-1.5">
          <Input
            label="Senha de acesso"
            placeholder="Mínimo de 8 caracteres"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            disabled={pending}
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (error) setError(null);
            }}
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
            accessibilityLabel="Campo de senha"
          />
          <Text className="font-sans text-caption text-muted">
            Use no mínimo 8 caracteres com letras e números para maior segurança.
          </Text>
        </View>

        {/* Confirm Password */}
        <Input
          label="Confirmar senha"
          placeholder="Digite a mesma senha"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          disabled={pending}
          value={confirmPassword}
          onChangeText={(val) => {
            setConfirmPassword(val);
            if (error) setError(null);
          }}
          invalid={Boolean(confirmPassword && password !== confirmPassword)}
          error={
            confirmPassword && password !== confirmPassword
              ? 'As senhas não coincidem.'
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
          accessibilityLabel="Campo de confirmação de senha"
        />

        {/* Accordion: Token de convite opcional */}
        <View className="pt-1">
          {!showInviteField ? (
            <Pressable
              onPress={() => setShowInviteField(true)}
              hitSlop={8}
              accessibilityRole="button"
              className="self-start py-1"
            >
              <Text className="font-sans-medium text-label text-muted underline">
                + Já possui um código ou token de convite?
              </Text>
            </Pressable>
          ) : (
            <View className="rounded-sm border border-border bg-surface p-4 gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-semibold text-label text-ink">
                  Token de convite da instituição (opcional)
                </Text>
                {loadingInvite ? (
                  <Text className="font-sans text-caption text-muted">
                    Validando…
                  </Text>
                ) : null}
              </View>

              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <Input
                    placeholder="Cole o código do convite aqui"
                    autoCapitalize="none"
                    autoCorrect={false}
                    disabled={pending}
                    value={inviteToken}
                    onChangeText={setInviteToken}
                    onBlur={() => handleVerifyInvite(inviteToken)}
                  />
                </View>
                <Button
                  variant="outline"
                  size="md"
                  onPress={() => handleVerifyInvite(inviteToken)}
                  disabled={pending || !inviteToken.trim() || loadingInvite}
                >
                  Validar
                </Button>
              </View>

              <Text className="font-sans text-caption text-muted">
                Se você recebeu um link com token, ele vincula sua conta automaticamente à
                instituição após o cadastro.
              </Text>
            </View>
          )}
        </View>

        {/* Terms notice */}
        <Text className="font-sans text-caption text-muted leading-4">
          Ao criar sua conta, você concorda com os{' '}
          <Text
            onPress={() =>
              WebBrowser.openBrowserAsync('https://locus.app/termos').catch(() => {})
            }
            className="text-ink underline"
          >
            Termos de Uso
          </Text>{' '}
          e com a{' '}
          <Text
            onPress={() =>
              WebBrowser.openBrowserAsync('https://locus.app/privacidade').catch(() => {})
            }
            className="text-ink underline"
          >
            Política de Privacidade
          </Text>{' '}
          do Locus.
        </Text>

        {/* Error Notice */}
        {error ? (
          <View className="rounded-sm border border-danger bg-danger-surface p-4 gap-2">
            <Text className="font-sans text-label text-ink">{error}</Text>
            {isEmailConflict ? (
              <Pressable
                onPress={() => router.push(`/login`)}
                hitSlop={8}
                accessibilityRole="link"
              >
                <Text className="font-sans-semibold text-label text-ink underline">
                  Clique aqui para entrar com esta conta →
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* Submit button */}
        <Button
          variant="ink"
          size="lg"
          onPress={handleRegister}
          loading={pending}
          disabled={pending || !name.trim() || !email.trim() || !password || !confirmPassword}
          className="mt-1"
          accessibilityLabel="Botão Criar conta"
        >
          {buttonLabel}
        </Button>

        {/* Link to login */}
        <View className="mt-2 items-center">
          <Text className="font-sans text-label text-muted">
            Já tem uma conta no Locus?{' '}
            <Text
              onPress={() => router.push('/login')}
              className="font-sans-semibold text-ink underline"
            >
              Fazer login
            </Text>
          </Text>
        </View>
      </View>

      {/* Institutional section */}
      <View className="mt-10 rounded-sm border border-border bg-surface p-6">
        <Text className="font-sans-bold text-heading text-ink">
          Quer implantar o Locus na sua instituição?
        </Text>
        <Text className="font-sans text-body text-muted mt-2">
          A instituição, os perímetros geográficos das salas e as primeiras turmas
          são configurados com o suporte da nossa equipe. Conte quantas turmas você tem
          e nós preparamos tudo.
        </Text>
        <View className="mt-4">
          <Button
            variant="outline"
            size="md"
            onPress={() => Linking.openURL(requestAccessUrl).catch(() => {})}
          >
            Solicitar acesso institucional
          </Button>
        </View>
      </View>

      <Text className="font-sans text-caption text-muted mt-6 text-center">
        O professor e a coordenação usam o Locus no navegador. O aluno confirma presença
        pelo aplicativo no próprio smartphone.
      </Text>
    </SecondaryScreen>
  );
}
