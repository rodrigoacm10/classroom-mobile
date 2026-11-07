import React from 'react';
import { View, Text, Pressable, DimensionValue } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import type { StudentClassItem } from '../types';

export function ClassRow({ item }: { item: StudentClassItem }) {
  const router = useRouter();
  const isDanger = item.isAtRisk || item.attendanceRate < 75;
  const fillWidthPct: DimensionValue = `${Math.min(item.attendanceRate, 100)}%`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Turma ${item.name}, taxa de presença ${item.attendanceRate}%. Toque para ver detalhes.`}
      onPress={() => {
        router.push({
          pathname: '/turma/[id]',
          params: { id: item.id },
        });
      }}
      className="flex-row items-center h-[68px] gap-3 border-b border-border active:bg-surface/50"
    >
      <View
        className={`w-1.5 h-9 rounded-[3px] shrink-0 ${
          item.isLive ? 'bg-accent' : isDanger ? 'bg-danger' : 'bg-ink'
        }`}
      />

      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className="font-sans-semibold text-[14px] leading-5 text-ink">
          {item.name}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-caption ${
            isDanger ? 'font-sans-medium text-danger' : 'font-sans-medium text-muted'
          }`}
        >
          {item.codeOrRoom} · {item.timeInfo}
        </Text>
      </View>

      <View className="flex-row items-center gap-2 shrink-0">
        <View className="w-14 items-end gap-1.5">
          <Text
            className={`font-mono-bold text-[16px] leading-5 ${
              isDanger ? 'text-danger' : 'text-success'
            }`}
          >
            {item.attendanceRate}%
          </Text>
          <View className="w-7 h-1 rounded-full bg-surface overflow-hidden">
            <View
              style={{ width: fillWidthPct }}
              className={`h-full rounded-full ${isDanger ? 'bg-danger' : 'bg-success'}`}
            />
          </View>
        </View>

        <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
          <Path
            d="M7.5 4.5L13 10l-5.5 5.5"
            stroke="#8A8C91"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </Pressable>
  );
}
