import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Redirect } from 'expo-router';

import { getStoredAccessToken } from '@/lib/storage';
import { getMyProfile, UserProfileResponse } from '@/services/user';
import { Logo } from '@/components/ui/logo';

export default function IndexGatekeeper() {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const token = await getStoredAccessToken();
        if (!token) {
          if (isMounted) {
            setIsAuthenticated(false);
            setChecking(false);
          }
          return;
        }

        try {
          const profile = await getMyProfile();
          if (isMounted) {
            setRole(profile.role ?? 'aluno');
          }
        } catch {
          // If token fails, assume student default or unauthenticated
        }

        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (checking) {
    return (
      <SafeAreaView className="flex-1 bg-paper items-center justify-center p-6">
        <StatusBar style="dark" />
        <Logo />
        <ActivityIndicator size="small" color="#18191B" className="mt-6" />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Redireciona para o grupo de rotas de acordo com a role
  return <Redirect href="/(aluno)/(tabs)" />;
}
