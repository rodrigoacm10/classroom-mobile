import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';

import { ApiError } from '@/lib/api-client';
import { getStoredAccessToken } from '@/lib/storage';
import {
  getStudentMetrics,
  getStudentSubjectClasses,
  type StudentAttendanceHistoryItem,
  type StudentMetricsResponse,
  type StudentSubjectClassResponse,
} from '@/services/student';
import { getStudentAttendanceHistory } from '@/services/student-history';
import {
  computeStreak,
  countEntries,
  groupByMonth,
  matchesFilter,
  toDisciplineRisk,
  toHistoryEntries,
} from '../mappers';
import type { HistoryEntry, HistoryFilter } from '../types';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Erro ao carregar o histórico.';
}

export function useHistorico() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<StudentMetricsResponse | null>(null);
  const [classes, setClasses] = useState<StudentSubjectClassResponse[]>([]);
  const [history, setHistory] = useState<StudentAttendanceHistoryItem[]>([]);

  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  const load = useCallback(async () => {
    try {
      const storedToken = await getStoredAccessToken();
      if (!storedToken) {
        router.replace('/login');
        return;
      }

      setError(null);

      const [metricsResult, classesResult, historyResult] = await Promise.all([
        getStudentMetrics(),
        getStudentSubjectClasses(),
        getStudentAttendanceHistory(),
      ]);

      setMetrics(metricsResult);
      setClasses(classesResult);
      setHistory(historyResult);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/login');
        return;
      }
      setError(errorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
  }

  const allEntries = useMemo(() => toHistoryEntries(history), [history]);
  const disciplines = useMemo(() => classes.map(toDisciplineRisk), [classes]);
  const streak = useMemo(() => computeStreak(allEntries), [allEntries]);

  const scopedEntries = useMemo(
    () =>
      selectedClassId
        ? allEntries.filter((entry) => entry.subjectClassId === selectedClassId)
        : allEntries,
    [allEntries, selectedClassId],
  );

  const counts = useMemo(() => countEntries(scopedEntries), [scopedEntries]);

  const sections = useMemo(
    () => groupByMonth(scopedEntries.filter((entry) => matchesFilter(entry, filter))),
    [scopedEntries, filter],
  );

  function toggleClass(subjectClassId: string) {
    setSelectedClassId((current) => (current === subjectClassId ? null : subjectClassId));
  }

  function clearClass() {
    setSelectedClassId(null);
  }

  const selectedClassName = selectedClassId
    ? (disciplines.find((d) => d.subjectClassId === selectedClassId)?.name ?? null)
    : null;

  return {
    loading,
    refreshing,
    error,
    refresh,
    hasData: metrics !== null,
    averageRatePercent: metrics ? Math.round(metrics.average_attendance_rate * 100) : 0,
    atRiskCount: metrics?.at_risk_count ?? 0,
    hasAnySessions: allEntries.length > 0,
    disciplines,
    streak,
    counts,
    sections,
    filter,
    setFilter,
    selectedClassId,
    selectedClassName,
    toggleClass,
    clearClass,
    selectedEntry,
    openEntry: setSelectedEntry,
    closeEntry: () => setSelectedEntry(null),
  };
}
