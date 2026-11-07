import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

type TurmaHeaderProps = {
  title: string;
  subtitle?: string;
};

export function TurmaHeader({ title, subtitle }: TurmaHeaderProps) {
  const router = useRouter();

  return (
    <View className="border-b border-border px-5 py-3.5 bg-paper">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(aluno)/(tabs)/historico');
            }
          }}
          hitSlop={10}
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

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-sans-bold text-heading text-ink tracking-tight"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              className="font-mono text-caption text-muted mt-0.5"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
