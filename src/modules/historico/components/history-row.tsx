import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { HistoryEntry } from '../types';
import { STATUS_STYLES, StatusBadge } from './status-badge';

type HistoryRowProps = {
  entry: HistoryEntry;
  onPress: (entry: HistoryEntry) => void;
};

export function HistoryRow({ entry, onPress }: HistoryRowProps) {
  const isCancelled = entry.status === 'cancelled';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.discipline}, ${entry.fullDate}, ${entry.time}, ${STATUS_STYLES[entry.status].label}`}
      onPress={() => onPress(entry)}
      className="flex-row items-center min-h-[64px] gap-3 px-6 border-b border-border active:bg-surface/60"
    >
      <View className="w-10 items-center shrink-0">
        <Text
          className={`font-mono-bold text-[18px] leading-6 ${
            isCancelled ? 'text-muted' : 'text-ink'
          }`}
        >
          {entry.day}
        </Text>
        <Text className="font-sans-semibold text-[10px] leading-3 tracking-caps text-muted">
          {entry.weekday}
        </Text>
      </View>

      <View className="flex-1 gap-0.5 py-2.5">
        <Text
          numberOfLines={1}
          className={`font-sans-semibold text-[14px] leading-5 ${
            isCancelled ? 'text-muted' : 'text-ink'
          }`}
        >
          {entry.discipline}
        </Text>
        <Text numberOfLines={1} className="font-sans-medium text-caption text-muted">
          {entry.classLabel} · {entry.time}
        </Text>
      </View>

      <StatusBadge status={entry.status} />
    </Pressable>
  );
}
