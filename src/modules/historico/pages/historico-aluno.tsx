import React from 'react';
import { RefreshControl, SectionList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { ScreenHeader } from '@/components/global';
import { Notice } from '@/components/ui/notice';
import {
  DisciplineRiskList,
  HistoryDetailSheet,
  HistoryEmpty,
  HistoryRow,
  HistorySkeleton,
  HistorySummary,
  StatusFilter,
} from '../components';
import { useHistorico } from '../hooks';
import type { HistoryEntry } from '../types';

export function HistoricoAluno() {
  const router = useRouter();
  const {
    loading,
    refreshing,
    error,
    refresh,
    hasData,
    averageRatePercent,
    atRiskCount,
    hasAnySessions,
    disciplines,
    streak,
    counts,
    sections,
    filter,
    setFilter,
    selectedClassId,
    toggleClass,
    clearClass,
    selectedEntry,
    openEntry,
    closeEntry,
  } = useHistorico();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <ScreenHeader title="Histórico" />
        <HistorySkeleton />
      </SafeAreaView>
    );
  }

  const hasClasses = disciplines.length > 0;

  function handleOpen(entry: HistoryEntry) {
    if (entry.status === 'live') {
      router.push('/chamada');
      return;
    }
    openEntry(entry);
  }

  function resetFilters() {
    setFilter('all');
    clearClass();
  }

  const emptyVariant = !hasClasses ? 'no-classes' : !hasAnySessions ? 'no-sessions' : 'no-results';

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#18191B" />}
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Histórico" />

            {error ? (
              <View className="px-6 pb-4">
                <Notice>{error}</Notice>
              </View>
            ) : null}

            {hasData && hasClasses ? (
              <>
                <HistorySummary
                  ratePercent={averageRatePercent}
                  atRiskCount={atRiskCount}
                  streak={streak}
                />
                <DisciplineRiskList
                  disciplines={disciplines}
                  selectedClassId={selectedClassId}
                  onToggle={toggleClass}
                  onClear={clearClass}
                  onOpenDetails={(id) =>
                    router.push({
                      pathname: '/turma/[id]',
                      params: { id },
                    })
                  }
                />
                {hasAnySessions ? (
                  <StatusFilter filter={filter} counts={counts} onChange={setFilter} />
                ) : null}
              </>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-baseline justify-between px-6 py-2.5 bg-paper border-y border-border">
            <Text className="font-sans-bold text-label text-ink">{section.title}</Text>
            {section.summary ? (
              <Text className="font-mono-bold text-caption text-muted">{section.summary}</Text>
            ) : null}
          </View>
        )}
        renderItem={({ item }) => <HistoryRow entry={item} onPress={handleOpen} />}
        ListEmptyComponent={
          error && !hasData ? null : (
            <HistoryEmpty variant={emptyVariant} onResetFilters={resetFilters} />
          )
        }
      />

      <HistoryDetailSheet entry={selectedEntry} onClose={closeEntry} />
    </SafeAreaView>
  );
}
