import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ScreenHeader } from '@/components/global';

type HistoryRecord = {
  id: string;
  discipline: string;
  classCode: string;
  date: string;
  time: string;
  status: 'presente' | 'ausente' | 'justificada';
};

const MOCK_HISTORY: HistoryRecord[] = [
  {
    id: 'h-1',
    discipline: 'Algoritmos e Estruturas de Dados',
    classCode: 'T01',
    date: '10 Out, 2026',
    time: '08:15',
    status: 'presente',
  },
  {
    id: 'h-2',
    discipline: 'Banco de Dados',
    classCode: 'T02',
    date: '09 Out, 2026',
    time: '10:05',
    status: 'presente',
  },
  {
    id: 'h-3',
    discipline: 'Redes de Computadores',
    classCode: 'T01',
    date: '08 Out, 2026',
    time: '19:10',
    status: 'ausente',
  },
  {
    id: 'h-4',
    discipline: 'Engenharia de Software',
    classCode: 'N01',
    date: '07 Out, 2026',
    time: '21:02',
    status: 'presente',
  },
  {
    id: 'h-5',
    discipline: 'Fábrica de Software',
    classCode: 'N02',
    date: '06 Out, 2026',
    time: '20:00',
    status: 'presente',
  },
];

export default function HistoricoScreen() {
  const [filter, setFilter] = useState<'todos' | 'presente' | 'ausente'>('todos');

  const filtered = MOCK_HISTORY.filter((item) => {
    if (filter === 'todos') return true;
    return item.status === filter;
  });

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader
          kicker="Registro de frequência"
          title="Histórico de Chamadas"
          className="px-0"
        />

        {/* Filter Chips */}
        <View className="flex-row gap-2 py-3">
          {(['todos', 'presente', 'ausente'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-sm border ${
                filter === tab
                  ? 'bg-ink border-ink'
                  : 'bg-surface border-border'
              }`}
            >
              <Text
                className={`text-caption uppercase font-sans-bold ${
                  filter === tab ? 'text-paper' : 'text-muted'
                }`}
              >
                {tab === 'todos' ? 'Todas' : tab === 'presente' ? 'Presenças' : 'Faltas'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Records list */}
        <View className="border-t border-border mt-2 pb-8">
          {filtered.map((record) => {
            const isPresent = record.status === 'presente';

            return (
              <View
                key={record.id}
                className="flex-row items-center justify-between py-3.5 border-b border-border"
              >
                <View className="flex-1 pr-3">
                  <Text className="font-sans-semibold text-[14px] leading-5 text-ink">
                    {record.discipline}
                  </Text>
                  <Text className="font-sans-medium text-caption text-muted mt-0.5">
                    {record.classCode} · {record.date} às {record.time}
                  </Text>
                </View>

                <View
                  className={`px-2.5 py-1 rounded-sm border ${
                    isPresent
                      ? 'bg-success-surface border-success/30'
                      : 'bg-danger-surface border-danger/30'
                  }`}
                >
                  <Text
                    className={`font-mono-bold text-caption uppercase ${
                      isPresent ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {isPresent ? 'Presente' : 'Ausente'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
