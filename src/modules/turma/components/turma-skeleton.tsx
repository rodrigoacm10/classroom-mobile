import React from 'react';
import { View } from 'react-native';

export function TurmaSkeleton() {
  return (
    <View className="p-5 gap-5">
      {/* Hero Metric Skeleton */}
      <View className="h-44 rounded-sm bg-surface animate-pulse border border-border" />

      {/* Context Card Skeleton */}
      <View className="h-32 rounded-sm bg-surface animate-pulse border border-border" />

      {/* Timeline Header + Items Skeleton */}
      <View className="gap-2">
        <View className="h-5 w-36 rounded-sm bg-surface animate-pulse" />
        <View className="h-20 rounded-sm bg-surface animate-pulse border border-border" />
        <View className="h-20 rounded-sm bg-surface animate-pulse border border-border" />
      </View>
    </View>
  );
}
