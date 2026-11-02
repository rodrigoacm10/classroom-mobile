import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import type { HistoryCounts, HistoryFilter } from '../types';

type StatusFilterProps = {
  filter: HistoryFilter;
  counts: HistoryCounts;
  onChange: (filter: HistoryFilter) => void;
};

type Option = { key: HistoryFilter; label: string; count: number };

export function StatusFilter({ filter, counts, onChange }: StatusFilterProps) {
  const options: Option[] = [
    { key: 'all', label: 'Todas', count: counts.all },
    { key: 'present', label: 'Presenças', count: counts.present },
    { key: 'absent', label: 'Faltas', count: counts.absent },
  ];

  // "Em análise" só aparece quando há algo a resolver (ou enquanto está selecionado).
  if (counts.review > 0 || filter === 'review') {
    options.push({ key: 'review', label: 'Em análise', count: counts.review });
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-6 py-3"
      accessibilityRole="tablist"
    >
      {options.map((option) => {
        const selected = option.key === filter;

        return (
          <Pressable
            key={option.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.label}, ${option.count}`}
            onPress={() => onChange(option.key)}
            hitSlop={{ top: 4, bottom: 4 }}
            className={`h-9 flex-row items-center gap-2 px-3 rounded-sm border ${
              selected ? 'bg-ink border-ink' : 'bg-surface border-border active:bg-border/60'
            }`}
          >
            <Text
              className={`text-caption uppercase font-sans-bold ${
                selected ? 'text-paper' : 'text-muted'
              }`}
            >
              {option.label}
            </Text>
            <Text
              className={`font-mono-bold text-caption ${selected ? 'text-paper' : 'text-ink'}`}
            >
              {option.count}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
