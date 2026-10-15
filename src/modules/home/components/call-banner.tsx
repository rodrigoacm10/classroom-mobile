import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import type { ActiveCallBanner as ActiveCall } from '../types';

type CallBannerProps = {
  call: ActiveCall | null;
  timeRemaining: string;
};

function NoActiveCallBanner() {
  return (
    <View className="flex-row items-center py-3.5 px-6 bg-surface border-y border-border">
      <View className="w-2 h-2 rounded-full bg-muted/40 shrink-0 mr-2.5" />
      <View className="flex-1 gap-0.5">
        <Text className="font-sans-bold text-[11px] leading-4 uppercase tracking-caps text-muted">
          Chamada em tempo real
        </Text>
        <Text numberOfLines={2} className="font-sans-semibold text-[14px] leading-5 text-ink">
          Nenhuma chamada em andamento no momento
        </Text>
      </View>
    </View>
  );
}

export function CallBanner({ call, timeRemaining }: CallBannerProps) {
  const router = useRouter();

  if (!call) {
    return <NoActiveCallBanner />;
  }

  return (
    <View className="flex-row items-center justify-between py-3.5 px-6 bg-accent">
      <View className="flex-row items-center flex-1 gap-2.5 mr-2">
        <View className="w-2 h-2 rounded-full bg-ink shrink-0" />
        <View className="flex-1">
          <Text className="font-sans-bold text-[11px] leading-4 uppercase tracking-caps text-ink">
            Chamada aberta
          </Text>
          <Text numberOfLines={1} className="font-sans-bold text-[14px] leading-5 text-ink">
            {call.className} · {timeRemaining || call.timeRemaining}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Confirmar presença"
        onPress={() => router.push('/chamada')}
        className="h-6 px-3 rounded-md bg-ink items-center justify-center active:opacity-80 shrink-0"
      >
        <Text className="font-sans-bold text-caption text-paper">Confirmar</Text>
      </Pressable>
    </View>
  );
}
