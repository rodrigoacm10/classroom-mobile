import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

import {
  registerForPushNotificationsAsync,
  subscribeToPushTokenChanges,
} from '@/lib/notifications';

export default function AlunoLayout() {
  const router = useRouter();
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // 1. Registra o token FCM na API ao entrar na área autenticada do aluno
    //    e acompanha a rotação enquanto a sessão permanece aberta.
    registerForPushNotificationsAsync();
    const tokenSubscription = subscribeToPushTokenChanges();

    const handleNotificationData = (data?: Record<string, unknown>) => {
      if (!data) return;
      if (data.type === 'ATTENDANCE_OPENED') {
        const dayCode = typeof data.day_code === 'string' ? data.day_code : undefined;
        router.push({
          pathname: '/(aluno)/(tabs)/chamada',
          params: dayCode ? { dayCode } : undefined,
        });
      }
    };

    // 2. Caso o app estivesse fechado (cold start) e tenha sido aberto pelo toque no push
    Notifications.getLastNotificationResponseAsync()
      .then((lastResponse) => {
        if (lastResponse) {
          handleNotificationData(lastResponse.notification.request.content.data);
        }
      })
      .catch(() => {});

    // 3. Caso o app esteja em primeiro ou segundo plano e o aluno toque na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationData(response.notification.request.content.data);
      },
    );

    return () => {
      tokenSubscription?.remove();
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="turma/[id]" />
    </Stack>
  );
}
