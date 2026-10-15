import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { getStoredAccessToken } from '@/lib/storage';
import { getMyProfile, UserProfileResponse } from '@/services/user';
import { listMyTenants, MyTenantResponse } from '@/services/tenants';
import { logout } from '@/services/auth';
import { Button } from '@/components/ui/button';

export default function PerfilScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [tenant, setTenant] = useState<MyTenantResponse | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = await getStoredAccessToken();
        if (!token) {
          router.replace('/login');
          return;
        }

        try {
          const user = await getMyProfile();
          setProfile(user);
        } catch {
          // Fallback
        }

        try {
          const tenants = await listMyTenants(token);
          const current = tenants.find((t) => t.active && !t.deleted) || tenants[0];
          if (current) {
            setTenant(current);
          }
        } catch {
          // Fallback
        }
      } catch {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.replace('/login');
  }

  function getInitials(name?: string) {
    if (!name) return 'MC';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-paper items-center justify-center p-6">
        <ActivityIndicator size="small" color="#18191B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-2 pb-6 items-center border-b border-border">
          <View className="w-16 h-16 rounded-full bg-ink items-center justify-center mb-3">
            <Text className="font-sans-bold text-accent text-section-sm">
              {getInitials(profile?.name)}
            </Text>
          </View>

          <Text className="font-sans-extrabold text-heading text-ink text-center">
            {profile?.name ?? 'Marina Costa'}
          </Text>
          <Text className="font-sans text-caption text-muted text-center mt-0.5">
            {profile?.email ?? 'marina.costa@universidade.edu.br'}
          </Text>
        </View>

        {/* Institution Info Card */}
        <View className="mt-5 p-4 rounded-md bg-surface border border-border">
          <Text className="font-mono text-caption text-muted">
            INSTITUIÇÃO ATIVA
          </Text>
          <Text className="font-sans-bold text-body text-ink mt-1">
            {tenant?.name ?? 'Universidade Tecnológica Locus'}
          </Text>
          <Text className="font-mono text-caption text-muted mt-1">
            Papel: {(tenant?.role ?? 'ALUNO').toUpperCase()}
          </Text>
        </View>

        {/* Preferences / Account Actions */}
        <View className="mt-6 gap-3 pb-8">
          <Button
            variant="outline"
            size="md"
            onPress={() => router.push('/login')}
          >
            Trocar Instituição / Conta
          </Button>

          <Button
            variant="danger"
            size="md"
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? <ActivityIndicator color="#ffffff" /> : 'Sair da Conta'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
