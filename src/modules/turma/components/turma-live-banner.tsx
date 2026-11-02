import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { formatRemaining } from '@/lib/utils';
import type { StudentActiveSessionResponse } from '@/services/student';

type TurmaLiveBannerProps = {
  activeSession: StudentActiveSessionResponse;
};

export function TurmaLiveBanner({ activeSession }: TurmaLiveBannerProps) {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      setTimeRemaining(formatRemaining(activeSession.expires_at));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const isConfirmed = activeSession.already_confirmed;

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: '/chamada',
          params: { sessionId: activeSession.session_id },
        });
      }}
      accessibilityRole="button"
      accessibilityLabel={`Chamada ao vivo aberta. ${
        isConfirmed ? 'Presença confirmada' : 'Toque para responder chamada agora'
      }`}
      className={`rounded-sm p-4 border transition-all ${
        isConfirmed
          ? 'bg-success-surface border-success/30'
          : 'bg-accent-surface border-accent'
      }`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-2.5 flex-1">
          {/* Pulsing Live Dot */}
          <View className="relative flex items-center justify-center w-3 h-3">
            <View
              className={`w-2.5 h-2.5 rounded-full ${
                isConfirmed ? 'bg-success' : 'bg-accent'
              }`}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text
                className={`font-sans-bold text-[13px] uppercase tracking-wider ${
                  isConfirmed ? 'text-success' : 'text-ink'
                }`}
              >
                {isConfirmed ? 'Presença Registrada' : 'Chamada ao Vivo Aberta'}
              </Text>
              {timeRemaining && !isConfirmed ? (
                <Text className="font-mono text-caption text-muted">
                  · {timeRemaining}
                </Text>
              ) : null}
            </View>

            <Text className="font-sans text-caption text-ink mt-0.5" numberOfLines={1}>
              {isConfirmed
                ? 'Sua presença já foi validada nesta sessão.'
                : 'A aula está em andamento. Toque para responder agora.'}
            </Text>
          </View>
        </View>

        <View className="shrink-0 flex-row items-center gap-1 bg-ink px-3 py-1.5 rounded-sm">
          <Text className="font-sans-bold text-caption text-accent">
            {isConfirmed ? 'Ver chamada' : 'Responder'}
          </Text>
          <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
            <Path
              d="M7.5 4.5L13 10l-5.5 5.5"
              stroke="#D4FF00"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>
    </Pressable>
  );
}
