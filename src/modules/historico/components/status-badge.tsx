import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import type { HistoryStatus } from '../types';

type StatusStyle = {
  label: string;
  container: string;
  text: string;
  color: string;
};

export const STATUS_STYLES: Record<HistoryStatus, StatusStyle> = {
  present: {
    label: 'Presente',
    container: 'bg-success-surface border-success/30',
    text: 'text-success',
    color: '#1e7a44',
  },
  review: {
    label: 'Em análise',
    container: 'bg-accent-surface border-warn/40',
    text: 'text-warn',
    color: '#b45309',
  },
  rejected: {
    label: 'Rejeitada',
    container: 'bg-paper border-danger',
    text: 'text-danger',
    color: '#c42b1c',
  },
  absent: {
    label: 'Falta',
    container: 'bg-danger-surface border-danger/30',
    text: 'text-danger',
    color: '#c42b1c',
  },
  cancelled: {
    label: 'Cancelada',
    container: 'bg-surface border-border',
    text: 'text-muted',
    color: '#5c5e63',
  },
  live: {
    label: 'Ao vivo',
    container: 'bg-accent border-accent',
    text: 'text-ink',
    color: '#18191b',
  },
};

function Glyph({ status, color }: { status: HistoryStatus; color: string }) {
  const common = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      {status === 'present' && <Path d="M2.5 6.3l2.4 2.4 4.6-5" {...common} />}
      {status === 'review' && (
        <>
          <Circle cx={6} cy={6} r={4.2} {...common} />
          <Path d="M6 3.8V6l1.5 1" {...common} />
        </>
      )}
      {(status === 'absent' || status === 'rejected') && (
        <Path d="M3 3l6 6M9 3l-6 6" {...common} />
      )}
      {status === 'cancelled' && <Path d="M3 6h6" {...common} />}
      {status === 'live' && <Circle cx={6} cy={6} r={2.6} fill={color} />}
    </Svg>
  );
}

type StatusBadgeProps = {
  status: HistoryStatus;
};

/** Estado nunca só por cor: glifo + rótulo. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <View
      accessible
      accessibilityLabel={style.label}
      className={`flex-row items-center gap-1.5 px-2 py-1 rounded-sm border ${style.container}`}
    >
      <Glyph status={status} color={style.color} />
      <Text className={`font-mono-bold text-caption uppercase ${style.text}`}>{style.label}</Text>
    </View>
  );
}
