import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenHeader } from '@/components/global';

type HomeHeaderProps = {
  studentName: string;
  studentInitials: string;
};

export function HomeHeader({ studentName, studentInitials }: HomeHeaderProps) {
  const router = useRouter();

  return (
    <ScreenHeader
      kicker={`Olá, ${studentName}`}
      title="Minhas turmas"
      rightAction={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Meu Perfil"
          onPress={() => router.push('/(aluno)/(tabs)/perfil')}
          className="w-9 h-9 rounded-full bg-ink items-center justify-center active:opacity-80"
        >
          <Text className="font-sans-bold text-accent text-label">{studentInitials}</Text>
        </Pressable>
      }
    />
  );
}
