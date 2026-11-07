import React from 'react';
import { View, Text, Pressable } from 'react-native';

type LogoProps = {
  inverted?: boolean;
  compact?: boolean;
  onPress?: () => void;
};

export function Logo({ inverted = false, compact = false, onPress }: LogoProps) {
  const content = (
    <View className="flex-row items-center gap-2.5">
      <View
        className={`shrink-0 items-center justify-center rounded-sm bg-accent ${
          compact ? 'w-5 h-5' : 'w-7 h-7'
        }`}
      >
        <View
          className={`shrink-0 rounded-full bg-ink ${
            compact ? 'w-2 h-2' : 'w-2.5 h-2.5'
          }`}
        />
      </View>
      <Text
        className={`font-sans-black tracking-tight ${
          inverted ? 'text-on-ink' : 'text-ink'
        } ${compact ? 'text-body leading-[18px]' : 'text-[20px] leading-6'}`}
      >
        Locus
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Locus"
        className="active:opacity-80 min-h-[44px] justify-center"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
