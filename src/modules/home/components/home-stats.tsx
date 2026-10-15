import React from 'react';
import { View, Text } from 'react-native';

type HomeStatsProps = {
  classesCount: number;
  averageAttendanceRate: number;
  atRiskCount: number;
};

type StatCellProps = {
  label: string;
  value: string;
  valueClassName: string;
  className: string;
};

function StatCell({ label, value, valueClassName, className }: StatCellProps) {
  return (
    <View className={className}>
      <Text className="font-sans-semibold uppercase tracking-caps text-caption text-muted">
        {label}
      </Text>
      <Text className={`font-mono-medium text-[32px] leading-9 tracking-tight ${valueClassName}`}>
        {value}
      </Text>
    </View>
  );
}

export function HomeStats({ classesCount, averageAttendanceRate, atRiskCount }: HomeStatsProps) {
  return (
    <View className="flex-row pt-5 pb-3 px-6">
      <StatCell
        label="Turmas"
        value={classesCount.toString().padStart(2, '0')}
        valueClassName="text-ink"
        className="flex-1 pr-4 gap-1 border-r border-border"
      />
      <StatCell
        label="Frequência"
        value={`${averageAttendanceRate}%`}
        valueClassName="text-success"
        className="flex-1 px-4 gap-1"
      />
      <StatCell
        label="Em risco"
        value={atRiskCount.toString().padStart(2, '0')}
        valueClassName="text-danger"
        className="flex-1 pl-4 gap-1 border-l border-border"
      />
    </View>
  );
}
