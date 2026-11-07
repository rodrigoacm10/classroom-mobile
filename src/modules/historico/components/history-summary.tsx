import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Text, View } from 'react-native';

import { ATTENDANCE_LIMIT_PERCENT } from '../mappers';

type HistorySummaryProps = {
  ratePercent: number;
  atRiskCount: number;
  streak: number;
};

function headline(atRiskCount: number): string {
  if (atRiskCount === 0) return 'Frequência em dia';
  return `${atRiskCount} ${atRiskCount === 1 ? 'turma em risco' : 'turmas em risco'}`;
}

function Gauge({ ratePercent }: { ratePercent: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const clamped = Math.max(0, Math.min(100, ratePercent));
  const belowLimit = clamped < ATTENDANCE_LIMIT_PERCENT;

  useEffect(() => {
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;
      if (reduceMotion) {
        progress.setValue(clamped);
        return;
      }
      Animated.timing(progress, {
        toValue: clamped,
        duration: 650,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();
    });

    return () => {
      cancelled = true;
    };
  }, [clamped, progress]);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Frequência geral ${clamped}%, mínimo ${ATTENDANCE_LIMIT_PERCENT}%`}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      className="pt-3"
    >
      <View className="h-2 rounded-full bg-surface overflow-hidden">
        <Animated.View
          style={{ width }}
          className={`h-full rounded-full ${belowLimit ? 'bg-danger' : 'bg-success'}`}
        />
      </View>

      <View
        pointerEvents="none"
        style={{ left: `${ATTENDANCE_LIMIT_PERCENT}%` }}
        className="absolute top-[7px] w-[2px] h-[18px] -ml-px bg-ink"
      />

      <View className="h-5 mt-2.5">
        <Text
          style={{ left: `${ATTENDANCE_LIMIT_PERCENT}%`, marginLeft: -40, width: 80 }}
          className="absolute text-center font-sans-semibold text-caption text-muted"
        >
          Mínimo {ATTENDANCE_LIMIT_PERCENT}%
        </Text>
      </View>
    </View>
  );
}

export function HistorySummary({ ratePercent, atRiskCount, streak }: HistorySummaryProps) {
  const belowLimit = ratePercent < ATTENDANCE_LIMIT_PERCENT;

  return (
    <View className="px-6 pt-1 pb-4">
      <Text className="font-sans-extrabold tracking-tight text-title text-ink">
        {headline(atRiskCount)}
      </Text>

      <View className="flex-row items-baseline justify-between pt-3">
        <Text className="font-sans-semibold text-label text-muted">Frequência geral</Text>
        <Text
          className={`font-mono-bold text-heading ${belowLimit ? 'text-danger' : 'text-success'}`}
        >
          {ratePercent}%
        </Text>
      </View>

      <Gauge ratePercent={ratePercent} />

      {streak >= 2 ? (
        <View className="flex-row items-baseline justify-between pt-1">
          <Text className="font-sans-semibold text-label text-muted">Sequência de presenças</Text>
          <Text className="font-mono-bold text-heading text-ink">{streak}</Text>
        </View>
      ) : null}
    </View>
  );
}
