import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Notice } from '@/components/ui/notice';
import { Button } from '@/components/ui/button';
import { HistoryDetailSheet } from '../../historico/components/history-detail-sheet';
import {
  TurmaHeader,
  TurmaLiveBanner,
  TurmaHeroMetric,
  TurmaContextCard,
  TurmaSessionsTimeline,
  TurmaSkeleton,
} from '../components';
import { useTurmaDetalhes } from '../hooks/use-turma-detalhes';

type TurmaDetalhesAlunoProps = {
  subjectClassId: string;
};

export function TurmaDetalhesAluno({ subjectClassId }: TurmaDetalhesAlunoProps) {
  const {
    loading,
    refreshing,
    error,
    data,
    selectedEntry,
    setSelectedEntry,
    refresh,
  } = useTurmaDetalhes(subjectClassId);

  const disciplineTitle =
    data?.subjectClass.discipline_name || data?.subjectClass.name || 'Detalhes da Turma';
  const classSubtitle = data?.subjectClass.name
    ? `Turma ${data.subjectClass.name}`
    : undefined;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-paper">
      <StatusBar style="dark" />

      {/* Top Header */}
      <TurmaHeader title={disciplineTitle} subtitle={classSubtitle} />

      {loading ? (
        <TurmaSkeleton />
      ) : error || !data ? (
        <View className="flex-1 p-6 items-center justify-center gap-4">
          <Notice variant="danger">
            {error ?? 'Não foi possível carregar os dados desta disciplina.'}
          </Notice>
          <Button variant="outline" size="md" onPress={refresh}>
            Tentar novamente
          </Button>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#18191B"
            />
          }
        >
          <View className="p-5 max-w-[560px] w-full self-center gap-5">
            {/* Live session banner se houver chamada aberta agora */}
            {data.activeSession ? (
              <TurmaLiveBanner activeSession={data.activeSession} />
            ) : null}

            {/* Focal Hero Metric Card */}
            <TurmaHeroMetric metrics={data.metrics} />

            {/* Context Card (Professor & Sala) */}
            <TurmaContextCard subjectClass={data.subjectClass} />

            {/* Timeline de Chamadas desta Turma */}
            <TurmaSessionsTimeline
              sessions={data.sessions}
              onSelectSession={(session) => setSelectedEntry(session)}
            />
          </View>
        </ScrollView>
      )}

      {/* Modal/Bottom Sheet de Detalhes da Chamada */}
      <HistoryDetailSheet
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </SafeAreaView>
  );
}
