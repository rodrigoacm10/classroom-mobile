import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Logo } from '../components/ui/logo';
import { Button } from '../components/ui/button';
import { getStoredAccessToken } from '../lib/storage';
import { logout } from '../services/auth';
import { listMyTenants, MyTenantResponse } from '../services/tenants';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [tenants, setTenants] = useState<MyTenantResponse[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const storedToken = await getStoredAccessToken();
        if (!storedToken) {
          if (isMounted) {
            router.replace('/login');
          }
          return;
        }

        if (isMounted) {
          setToken(storedToken);
        }

        try {
          const myTenants = await listMyTenants(storedToken);
          if (isMounted) {
            setTenants(myTenants);
          }
        } catch {
          // Token might have expired or endpoint failed
        }
      } catch {
        if (isMounted) {
          router.replace('/login');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    setLoading(true);
    await logout();
    router.replace('/login');
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-paper items-center justify-center p-6">
        <Logo />
        <ActivityIndicator size="small" color="#18191b" className="mt-6" />
      </SafeAreaView>
    );
  }

  const activeTenant = tenants.find((t) => t.active && !t.deleted);

  return (
    <SafeAreaView className="flex-1 bg-paper justify-between p-6">
      <View className="items-center mt-8">
        <Logo />
        <Text className="font-sans-bold text-section-sm text-ink mt-6 text-center">
          Painel Locus
        </Text>
        <Text className="font-sans text-body text-muted text-center mt-2 max-w-[320px]">
          {activeTenant
            ? `Conectado à instituição ${activeTenant.name}.`
            : 'Sessão ativa autenticada no aplicativo.'}
        </Text>

        {activeTenant && (
          <View className="mt-6 px-4 py-3 rounded-sm bg-surface border border-border w-full max-w-[340px]">
            <Text className="font-mono text-caption text-muted">
              INSTITUIÇÃO
            </Text>
            <Text className="font-sans-semibold text-body text-ink mt-0.5">
              {activeTenant.name}
            </Text>
            <Text className="font-mono text-caption text-muted mt-1">
              Papel: {activeTenant.role.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View className="w-full max-w-[340px] self-center gap-3 mb-6">
        <Button
          variant="outline"
          size="lg"
          onPress={() => router.push('/login')}
        >
          Trocar Conta
        </Button>
        <Button
          variant="ink"
          size="lg"
          onPress={handleLogout}
        >
          Sair da Conta
        </Button>
      </View>
    </SafeAreaView>
  );
}
