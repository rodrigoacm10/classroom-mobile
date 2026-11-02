import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export type StudentLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export class LocationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocationServiceError';
  }
}

/**
 * Obtém a localização GPS real do aluno com alta precisão para validação de presença.
 */
export async function getStudentDeviceLocation(): Promise<StudentLocation> {
  // 1. Verifica se os serviços de GPS/Localização estão ativados no dispositivo
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      throw new LocationServiceError(
        'O GPS ou serviço de localização está desativado no seu aparelho. Ative o GPS para confirmar a presença.',
      );
    }
  } catch (err) {
    if (err instanceof LocationServiceError) throw err;
    // Em alguns ambientes web hasServicesEnabledAsync pode não ser suportado, segue para permissões
  }

  // 2. Solicita ou verifica a permissão de localização em primeiro plano
  const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

  if (status !== Location.PermissionStatus.GRANTED) {
    if (!canAskAgain) {
      throw new LocationServiceError(
        'Acesso à localização bloqueado nas configurações do aparelho. Permita o acesso à localização para o Locus nas configurações para poder confirmar sua presença.',
      );
    }
    throw new LocationServiceError(
      'É obrigatório permitir o acesso à localização do aparelho para confirmar que você está na sala de aula.',
    );
  }

  // 3. Tenta obter a posição atual com alta precisão
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy ?? null,
    };
  } catch (posError) {
    // 4. Se falhar (ex: dentro de salas/prédios sem sinal GPS direto), tenta a última posição conhecida
    try {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        return {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          accuracy: lastKnown.coords.accuracy ?? null,
        };
      }
    } catch {
      // Ignora erro do fallback e lança o erro amigável abaixo
    }

    // 5. Fallback web nativo se disponível
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy ?? null,
            });
          },
          (navErr) => {
            reject(
              new LocationServiceError(
                'Não foi possível obter a sua localização atual. Verifique sua conexão e sinal de GPS e tente novamente.',
              ),
            );
          },
          { enableHighAccuracy: true, timeout: 8000 },
        );
      });
    }

    throw new LocationServiceError(
      'Não foi possível obter a sua localização atual com precisão. Verifique o sinal do seu GPS e tente novamente.',
    );
  }
}

/**
 * Obtém os metadados do aparelho para auditoria e segurança contra fraudes.
 */
export function getDeviceMetadata(): Record<string, unknown> {
  return {
    brand: Device.brand ?? 'unknown',
    manufacturer: Device.manufacturer ?? 'unknown',
    modelName: Device.modelName ?? 'unknown',
    osName: Device.osName ?? Platform.OS,
    osVersion: Device.osVersion ?? 'unknown',
    deviceType: Device.deviceType ?? 'phone',
    platform: Platform.OS,
  };
}
