import React from 'react';
import { View, Text, DimensionValue } from 'react-native';

import type { TurmaCalculatedMetrics } from '../types';

type TurmaHeroMetricProps = {
  metrics: TurmaCalculatedMetrics;
};

export function TurmaHeroMetric({ metrics }: TurmaHeroMetricProps) {
  const {
    ratePercent,
    totalSessions,
    absencesCount,
    presencesCount,
    riskLevel,
    riskLabel,
    riskMessage,
  } = metrics;

  const barWidth: DimensionValue = `${Math.min(ratePercent, 100)}%`;

  const isCritical = riskLevel === 'critical';
  const isAlert = riskLevel === 'alert';

  const statusColorClass = isCritical
    ? 'text-danger'
    : isAlert
    ? 'text-warning'
    : 'text-success';

  const statusBadgeBg = isCritical
    ? 'bg-danger-surface border-danger/30'
    : isAlert
    ? 'bg-warning-surface border-warning/30'
    : 'bg-success-surface border-success/30';

  const fillBg = isCritical ? 'bg-danger' : isAlert ? 'bg-warning' : 'bg-ink';

  return (
    <View className="rounded-sm border border-border bg-surface p-5 gap-5">
      {/* Top Level: Number + Status Badge */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="gap-1">
          <Text className="font-mono text-caption text-muted uppercase tracking-wider">
            Frequência acumulada
          </Text>
          <View className="flex-row items-baseline gap-1.5">
            <Text className={`font-mono-bold text-[40px] leading-none ${statusColorClass}`}>
              {ratePercent}
            </Text>
            <Text className="font-mono text-heading text-muted">%</Text>
          </View>
        </View>

        <View className={`px-2.5 py-1 rounded-full border ${statusBadgeBg}`}>
          <Text
            className={`font-sans-bold text-[11px] uppercase tracking-wider ${statusColorClass}`}
          >
            {riskLabel}
          </Text>
        </View>
      </View>

      {/* Thermometer / Dual Progress Bar */}
      <View className="gap-2">
        <View className="relative h-2 w-full bg-paper border border-border rounded-full overflow-hidden">
          {/* Fill Bar */}
          <View style={{ width: barWidth }} className={`h-full rounded-full ${fillBg}`} />
        </View>

        {/* Legend with the 75% mark */}
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-[11px] text-muted">0%</Text>
          <View className="flex-row items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-muted" />
            <Text className="font-mono text-[11px] text-muted">
              Mínimo exigido: <Text className="font-mono-bold text-ink">75%</Text>
            </Text>
          </View>
          <Text className="font-mono text-[11px] text-muted">100%</Text>
        </View>
      </View>

      {/* Grid of 3 Counters */}
      <View className="flex-row items-stretch border-t border-border pt-4">
        <View className="flex-1 items-center gap-0.5 border-r border-border pr-2">
          <Text className="font-mono text-caption text-muted uppercase">Presenças</Text>
          <Text className="font-mono-bold text-[20px] text-ink leading-tight">
            {presencesCount}
          </Text>
        </View>

        <View className="flex-1 items-center gap-0.5 border-r border-border px-2">
          <Text className="font-mono text-caption text-muted uppercase">Faltas</Text>
          <Text
            className={`font-mono-bold text-[20px] leading-tight ${
              absencesCount > 0 ? (isCritical ? 'text-danger' : 'text-ink') : 'text-muted'
            }`}
          >
            {absencesCount}
          </Text>
        </View>

        <View className="flex-1 items-center gap-0.5 pl-2">
          <Text className="font-mono text-caption text-muted uppercase">Total Aulas</Text>
          <Text className="font-mono-bold text-[20px] text-ink leading-tight">
            {totalSessions}
          </Text>
        </View>
      </View>

      {/* Guidance Message Callout */}
      {riskMessage ? (
        <View className="rounded-sm bg-paper p-3 border border-border">
          <Text className="font-sans text-caption text-muted leading-relaxed">
            {riskMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
