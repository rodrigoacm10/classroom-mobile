import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Svg, { Path } from 'react-native-svg';

import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { ApiError } from '@/lib/api-client';
import { getStoredActiveTenantId } from '@/lib/storage';
import {
  listMyTenants,
  switchTenant,
  MyTenantResponse,
} from '@/services/tenants';
import { logout } from '@/services/auth';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  aluno: 'Aluno',
  coordenador: 'Coordenador',
};

function getInstitutionInitials(name?: string): string {
  if (!name) return 'IN';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function SelectTenantScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tenants, setTenants] = useState<MyTenantResponse[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const canGoBack = router.canGoBack();

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [fetchedTenants, currentId] = await Promise.all([
        listMyTenants(),
        getStoredActiveTenantId(),
      ]);

      const validTenants = fetchedTenants.filter((t) => t.active && !t.deleted);
      setTenants(validTenants);
      setActiveTenantId(currentId);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        router.replace('/login');
        return;
      }
      if (cause instanceof Error) {
        setError(cause.message);
      } else {
        setError('Não foi possível carregar suas instituições. Tente novamente.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSwitchTenant(tenant: MyTenantResponse) {
    if (switchingId) return;

    setError(null);
    setSwitchingId(tenant.id);

    try {
      await switchTenant(tenant.id);
      setActiveTenantId(tenant.id);

      // Conexão bem sucedida — navega direto para o início da instituição
      router.replace('/');
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
      } else if (cause instanceof Error) {
        setError(cause.message);
      } else {
        setError('Não foi possível alternar de instituição. Verifique sua conexão.');
      }
      setSwitchingId(null);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.replace('/login');
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-paper">
      <StatusBar style="dark" />

      {/* Header com Navegação e Logo */}
      <View className="border-b border-border px-6 py-3.5 bg-paper">
        <View className="max-w-[480px] w-full self-center flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            {canGoBack ? (
              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                className="w-10 h-10 items-center justify-center -ml-2 rounded-sm active:bg-surface"
                accessibilityRole="button"
                accessibilityLabel="Voltar"
              >
                <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                  <Path
                    d="M12.5 4.5L7 10l5.5 5.5"
                    stroke="#18191B"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
            ) : null}
            <Logo onPress={() => {}} />
          </View>

          <Pressable
            onPress={handleLogout}
            disabled={loggingOut || switchingId !== null}
            hitSlop={8}
            accessibilityRole="button"
            className="px-2 py-1 active:opacity-70"
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#18191B" />
            ) : (
              <Text className="font-sans-medium text-caption text-muted hover:text-ink">
                Sair da conta
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor="#18191B"
          />
        }
      >
        <View className="flex-1 px-6 py-8">
          <View className="w-full max-w-[480px] self-center gap-6">
            {/* Título da Tela */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-black text-[28px] sm:text-[32px] leading-tight text-ink">
                  Suas instituições
                </Text>
                {tenants.length > 0 ? (
                  <View className="rounded-full bg-surface px-2.5 py-0.5 border border-border">
                    <Text className="font-mono text-caption text-muted">
                      {tenants.length} {tenants.length === 1 ? 'disponível' : 'disponíveis'}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text className="font-sans text-body text-muted leading-relaxed">
                Escolha o ambiente institucional que deseja acessar agora. Seus dados, turmas e
                frequências serão filtrados por ele.
              </Text>
            </View>

            {/* Aviso de Erro se houver */}
            {error ? <Notice variant="danger">{error}</Notice> : null}

            {/* Estado de Carregamento Inicial */}
            {loading ? (
              <View className="py-12 items-center justify-center gap-3">
                <ActivityIndicator size="large" color="#18191B" />
                <Text className="font-sans text-caption text-muted">
                  Carregando suas instituições…
                </Text>
              </View>
            ) : tenants.length === 0 ? (
              /* Estado Vazio */
              <View className="rounded-sm border border-border bg-surface p-6 gap-4">
                <View className="w-10 h-10 rounded-full bg-paper border border-border items-center justify-center">
                  <Text className="text-lg">🏛️</Text>
                </View>

                <View className="gap-1">
                  <Text className="font-sans-bold text-heading text-ink">
                    Nenhuma instituição vinculada
                  </Text>
                  <Text className="font-sans text-body text-muted">
                    Sua conta ainda não possui nenhuma instituição ativa. Se você foi convidado por
                    e-mail, acerte o link do convite ou informe à coordenação.
                  </Text>
                </View>

                <View className="pt-2 gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    onPress={() => {
                      setLoading(true);
                      loadData();
                    }}
                  >
                    Tentar novamente
                  </Button>
                  <Button
                    variant="ink"
                    size="md"
                    onPress={handleLogout}
                  >
                    Entrar com outra conta
                  </Button>
                </View>
              </View>
            ) : (
              /* Lista de Instituições */
              <View className="gap-3">
                {tenants.map((tenant) => {
                  const isActive = tenant.id === activeTenantId;
                  const isSwitchingThis = switchingId === tenant.id;
                  const isSwitchingAny = switchingId !== null;
                  const roleLabel = roleLabels[tenant.role] ?? tenant.role;

                  return (
                    <Pressable
                      key={tenant.id}
                      onPress={() => handleSwitchTenant(tenant)}
                      disabled={isSwitchingAny}
                      accessibilityRole="button"
                      accessibilityLabel={`Instituição ${tenant.name}, papel ${roleLabel}${
                        isActive ? ', atualmente ativa' : ''
                      }`}
                      className={`min-h-[82px] rounded-sm p-4 border transition-all ${
                        isActive
                          ? 'border-ink bg-surface/80'
                          : 'border-border bg-paper active:bg-surface/60'
                      }`}
                    >
                      <View className="flex-row items-center gap-3.5">
                        {/* Monograma / Avatar */}
                        <View
                          className={`w-12 h-12 rounded-sm items-center justify-center shrink-0 ${
                            isActive ? 'bg-ink' : 'bg-surface border border-border'
                          }`}
                        >
                          <Text
                            className={`font-sans-bold text-[16px] ${
                              isActive ? 'text-accent' : 'text-ink'
                            }`}
                          >
                            {getInstitutionInitials(tenant.name)}
                          </Text>
                        </View>

                        {/* Informações da Instituição */}
                        <View className="flex-1 gap-1">
                          <View className="flex-row items-center justify-between gap-2">
                            <Text
                              numberOfLines={1}
                              className="font-sans-bold text-body text-ink flex-1"
                            >
                              {tenant.name}
                            </Text>

                            {/* Badge de Ativa */}
                            {isActive ? (
                              <View className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-full bg-success-surface border border-success/30">
                                <View className="w-1.5 h-1.5 rounded-full bg-success" />
                                <Text className="font-sans-bold text-[11px] text-success uppercase">
                                  Ativa
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          <View className="flex-row items-center gap-2">
                            <View className="rounded-sm bg-surface px-1.5 py-0.5 border border-border">
                              <Text className="font-mono text-[11px] font-semibold text-muted uppercase">
                                {roleLabel}
                              </Text>
                            </View>
                            {tenant.slug ? (
                              <Text
                                numberOfLines={1}
                                className="font-mono text-caption text-muted flex-1"
                              >
                                {tenant.slug}
                              </Text>
                            ) : null}
                          </View>
                        </View>

                        {/* Indicador de Ação / Loading */}
                        <View className="shrink-0 w-8 items-center justify-center">
                          {isSwitchingThis ? (
                            <ActivityIndicator size="small" color="#18191B" />
                          ) : (
                            <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
                              <Path
                                d="M7.5 4.5L13 10l-5.5 5.5"
                                stroke={isActive ? '#18191B' : '#8A8C91'}
                                strokeWidth={1.8}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </Svg>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Link Informativo */}
            <View className="mt-4 pt-4 border-t border-border gap-2">
              <Text className="font-sans text-caption text-muted leading-relaxed">
                Você pode alternar entre suas instituições a qualquer momento através da aba{' '}
                <Text className="font-sans-semibold text-ink">Perfil</Text>.
              </Text>
              <Text className="font-sans text-caption text-muted">
                Precisa vincular uma nova instituição?{' '}
                <Text
                  onPress={() =>
                    Linking.openURL('mailto:contato@locus.app?subject=Vincular%20nova%20instituição').catch(() => {})
                  }
                  className="font-sans-medium text-ink underline"
                >
                  Fale com o suporte
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Rodapé Padrão */}
        <View className="border-t border-border px-6 py-5 bg-paper">
          <View className="w-full max-w-[480px] self-center flex-row flex-wrap items-center justify-between gap-y-2">
            <Text className="font-mono text-caption text-muted">Locus Classroom</Text>
            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={() =>
                  WebBrowser.openBrowserAsync('https://locus.app/privacidade').catch(() => {})
                }
                hitSlop={6}
              >
                <Text className="font-sans text-caption text-muted hover:text-ink">
                  Privacidade
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  WebBrowser.openBrowserAsync('https://locus.app/termos').catch(() => {})
                }
                hitSlop={6}
              >
                <Text className="font-sans text-caption text-muted hover:text-ink">
                  Termos
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
