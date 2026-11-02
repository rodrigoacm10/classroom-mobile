import React from 'react';
import { View } from 'react-native';

function Block({ className }: { className: string }) {
  return <View className={`bg-surface rounded-sm ${className}`} />;
}

export function HistorySkeleton() {
  return (
    <View
      accessible
      accessibilityLabel="Carregando histórico"
      accessibilityRole="progressbar"
      className="pt-2"
    >
      <View className="px-6 gap-3 pb-6">
        <Block className="h-7 w-44" />
        <Block className="h-4 w-full" />
        <Block className="h-2 w-full" />
      </View>

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          className="flex-row items-center h-[64px] gap-3 px-6 border-b border-border"
        >
          <Block className="h-8 w-10" />
          <View className="flex-1 gap-2">
            <Block className="h-4 w-3/4" />
            <Block className="h-3 w-1/2" />
          </View>
          <Block className="h-6 w-20" />
        </View>
      ))}
    </View>
  );
}
