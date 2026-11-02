import React from 'react';
import { DimensionValue, Pressable, Text, View } from 'react-native';

import type { DisciplineRisk } from '../types';

import Svg, { Path } from 'react-native-svg';

type DisciplineRiskListProps = {
  disciplines: DisciplineRisk[];
  selectedClassId: string | null;
  onToggle: (subjectClassId: string) => void;
  onClear: () => void;
  onOpenDetails?: (subjectClassId: string) => void;
};

function DisciplineRow({
  item,
  selected,
  onToggle,
  onOpenDetails,
}: {
  item: DisciplineRisk;
  selected: boolean;
  onToggle: () => void;
  onOpenDetails?: (subjectClassId: string) => void;
}) {
  const fillWidth: DimensionValue = `${Math.min(item.ratePercent, 100)}%`;

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${item.name}, ${item.ratePercent}%, ${item.hint}`}
        accessibilityHint={selected ? 'Toque para remover o filtro' : 'Toque para filtrar as chamadas'}
        onPress={onToggle}
        className={`flex-row items-center min-h-[60px] gap-3 px-6 border-b border-border ${
          selected ? 'bg-accent-surface' : 'active:bg-surface/60'
        }`}
      >
        <View
          className={`w-1.5 h-8 rounded-[3px] shrink-0 ${
            selected ? 'bg-ink' : item.isAtRisk ? 'bg-danger' : 'bg-border'
          }`}
        />

        <View className="flex-1 gap-0.5 py-2">
          <Text numberOfLines={1} className="font-sans-semibold text-[14px] leading-5 text-ink">
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            className={`font-sans-medium text-caption ${item.isAtRisk ? 'text-danger' : 'text-muted'}`}
          >
            {item.hint}
          </Text>
        </View>

        {item.hasSessions ? (
          <View className="w-14 shrink-0 items-end gap-1.5">
            <Text
              className={`font-mono-bold text-[16px] leading-5 ${
                item.isAtRisk ? 'text-danger' : 'text-success'
              }`}
            >
              {item.ratePercent}%
            </Text>
            <View className="w-7 h-1 rounded-full bg-surface overflow-hidden">
              <View
                style={{ width: fillWidth }}
                className={`h-full rounded-full ${item.isAtRisk ? 'bg-danger' : 'bg-success'}`}
              />
            </View>
          </View>
        ) : null}

        {onOpenDetails ? (
          <Pressable
            hitSlop={8}
            onPress={() => onOpenDetails(item.subjectClassId)}
            className="w-8 h-8 items-center justify-center -mr-2 active:opacity-60"
            accessibilityRole="button"
            accessibilityLabel={`Ver detalhes de ${item.name}`}
          >
            <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
              <Path
                d="M7.5 4.5L13 10l-5.5 5.5"
                stroke="#8A8C91"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        ) : null}
      </Pressable>

      {/* Ação rápida quando a disciplina está selecionada no filtro */}
      {selected && onOpenDetails ? (
        <Pressable
          onPress={() => onOpenDetails(item.subjectClassId)}
          className="flex-row items-center justify-between px-6 py-2.5 bg-accent-surface border-b border-border active:opacity-80"
        >
          <Text className="font-sans-bold text-caption text-ink">
            Ver página completa desta disciplina
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="font-sans-bold text-[11px] text-ink uppercase">Abrir</Text>
            <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
              <Path
                d="M7.5 4.5L13 10l-5.5 5.5"
                stroke="#18191B"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

export function DisciplineRiskList({
  disciplines,
  selectedClassId,
  onToggle,
  onClear,
  onOpenDetails,
}: DisciplineRiskListProps) {
  if (disciplines.length === 0) return null;

  return (
    <View className="pt-2">
      <View className="flex-row items-center justify-between px-6 pt-2 pb-2 min-h-[44px]">
        <Text className="font-sans-bold text-body text-ink">Por disciplina</Text>
        {selectedClassId ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar filtro de disciplina"
            onPress={onClear}
            hitSlop={8}
            className="min-h-[44px] justify-center active:opacity-70"
          >
            <Text className="font-sans-bold text-label text-ink underline">Limpar filtro</Text>
          </Pressable>
        ) : (
          <Text className="font-sans-semibold text-caption text-muted">
            Toque para filtrar
          </Text>
        )}
      </View>

      <View className="border-t border-border">
        {disciplines.map((item) => (
          <DisciplineRow
            key={item.subjectClassId}
            item={item}
            selected={item.subjectClassId === selectedClassId}
            onToggle={() => onToggle(item.subjectClassId)}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </View>
    </View>
  );
}
