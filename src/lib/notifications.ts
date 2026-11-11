import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { api } from './api-client';
import { getOrCreateDeviceId, getStoredAccessToken, getStoredActiveTenantId } from './storage';

/** Evita um POST duplicado quando o listener dispara com o token que acabou de ser enviado. */
let lastSyncedToken: string | null = null;
/** Logout desliga a sincronização para o listener não regravar o token depois do DELETE. */
let pushSyncEnabled = true;
let syncQueue: Promise<void> = Promise.resolve();

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });
}

export type FCMTokenResponse = {
  device_id: string;
  platform: string;
  updated_at: string;
};

function readDeviceToken(data: unknown): string {
  if (typeof data === 'string') {
    return data;
  }
  return data == null ? '' : String(data);
}

function enqueueTokenSync(fcmToken: string): Promise<void> {
  const run = syncQueue.then(() => publishDevicePushToken(fcmToken));
  syncQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/**
 * Envia o token FCM atual para a API. O upsert é por aparelho, então o mesmo
 * device_id substitui o token anterior quando o Firebase rotaciona.
 */
async function publishDevicePushToken(fcmToken: string): Promise<void> {
  if (!pushSyncEnabled || !fcmToken || fcmToken === lastSyncedToken) {
    return;
  }

  const activeTenantId = await getStoredActiveTenantId();

  if (!pushSyncEnabled || !activeTenantId) {
    return;
  }

  const deviceId = await getOrCreateDeviceId();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  await api<FCMTokenResponse>('/fcm-tokens', {
    method: 'POST',
    body: {
      device_id: deviceId,
      fcm_token: fcmToken,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      app_version: appVersion,
    },
  });

  if (pushSyncEnabled) {
    lastSyncedToken = fcmToken;
  }

  if (__DEV__) {
    console.log('[Push] Token FCM registrado com sucesso na API.');
  }
}

/**
 * Solicita permissão de notificação, obtém o token FCM nativo do aparelho
 * e o registra no backend (`POST /fcm-tokens`) para a instituição ativa.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  pushSyncEnabled = true;

  if (Platform.OS === 'web') {
    return null;
  }

  if (!Device.isDevice) {
    if (__DEV__) {
      console.log('[Push] Notificações push FCM requerem um dispositivo físico.');
    }
    return null;
  }

  try {
    // 1. Verifica se há sessão e tenant selecionada antes de registrar na API
    const [accessToken, activeTenantId] = await Promise.all([
      getStoredAccessToken(),
      getStoredActiveTenantId(),
    ]);

    if (!accessToken || !activeTenantId) {
      return null;
    }

    // 2. Configura canal de alta prioridade no Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('chamadas', {
        name: 'Chamadas e Presença',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFC400',
        enableLights: true,
        enableVibrate: true,
        sound: 'default',
      });
    }

    // 3. Solicita permissão ao usuário (Android 13+ e iOS)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      if (__DEV__) {
        console.log('[Push] Permissão de notificações negada pelo usuário.');
      }
      return null;
    }

    // 4. Obtém o token FCM nativo do dispositivo (usado diretamente pelo Firebase Admin no backend)
    const pushTokenData = await Notifications.getDevicePushTokenAsync();
    const fcmToken = readDeviceToken(pushTokenData.data);

    if (!fcmToken) {
      return null;
    }

    await enqueueTokenSync(fcmToken);
    return fcmToken;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Push] Não foi possível registrar o token FCM:', error);
    }
    return null;
  }
}

/**
 * Observa a rotação do token FCM enquanto o app está aberto e reenvia o valor novo.
 * Não chame getDevicePushTokenAsync aqui: isso dispara o listener de novo.
 */
export function subscribeToPushTokenChanges(): Notifications.EventSubscription | null {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return null;
  }

  return Notifications.addPushTokenListener((deviceToken) => {
    const fcmToken = readDeviceToken(deviceToken.data);
    if (!fcmToken) {
      return;
    }
    void enqueueTokenSync(fcmToken).catch((error: unknown) => {
      if (__DEV__) {
        console.warn('[Push] Não foi possível atualizar o token FCM:', error);
      }
    });
  });
}

/**
 * Remove o token FCM associado a este dispositivo na API ao realizar logout.
 * Se o access token expirou, o cliente renova com o refresh token antes do DELETE.
 */
export async function unregisterPushNotificationsAsync(): Promise<void> {
  pushSyncEnabled = false;
  lastSyncedToken = null;
  await syncQueue;

  if (Platform.OS === 'web' || !Device.isDevice) {
    return;
  }

  try {
    const activeTenantId = await getStoredActiveTenantId();
    if (!activeTenantId) {
      return;
    }

    const deviceId = await getOrCreateDeviceId();
    await api<void>(`/fcm-tokens/${encodeURIComponent(deviceId)}`, {
      method: 'DELETE',
    });

    if (__DEV__) {
      console.log('[Push] Token FCM removido com sucesso no logout.');
    }
  } catch {
    // Falha silenciosa para não bloquear o logout do usuário
  }
}

