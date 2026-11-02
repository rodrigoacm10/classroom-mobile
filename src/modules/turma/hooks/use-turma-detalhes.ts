import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';

import { ApiError } from '@/lib/api-client';
import {
  getStudentSubjectClasses,
  getStudentActiveSessions,
  type StudentSubjectClassResponse,
  type StudentActiveSessionResponse,
} from '@/services/student';
import { getStudentAttendanceHistory } from '@/services/student-history';
import { toHistoryEntries } from '../../historico/mappers/history.mapper';
import type { HistoryEntry } from '../../historico/types';
import type {
  TurmaDetalhesData,
  TurmaCalculatedMetrics,
  TurmaRiskLevel,
} from '../types';

function calculateMetrics(subjectClass: StudentSubjectClassResponse): TurmaCalculatedMetrics {
  const ratePercent = Math.round((subjectClass.attendance_rate ?? 1) * 100);
  const totalSessions = subjectClass.total_sessions ?? 0;
  const absencesCount = subjectClass.absences_count ?? 0;
  const presencesCount = Math.max(0, totalSessions - absencesCount);

  let riskLevel: TurmaRiskLevel = 'safe';
  let riskLabel = 'Presença Regular';
  let riskMessage = '';

  if (totalSessions === 0) {
    riskLevel = 'safe';
    riskLabel = 'Início de Semestre';
    riskMessage =
      'Nenhuma chamada foi computada ainda nesta disciplina. Seu histórico começará na primeira aula!';
  } else if (ratePercent >= 80) {
    riskLevel = 'safe';
    riskLabel = 'Frequência Regular';
    riskMessage =
      absencesCount === 0
        ? 'Frequência impecável! Nenhuma falta registrada até o momento.'
        : 'Presença saudável e bem acima do limite legal exigido de 75%.';
  } else if (ratePercent >= 75) {
    riskLevel = 'alert';
    riskLabel = 'Atenção';
    riskMessage =
      'Você está próximo da margem mínima de 75%. Evite faltar nas próximas sessões para não entrar em risco.';
  } else {
    riskLevel = 'critical';
    riskLabel = 'Risco de Reprovação';
    riskMessage =
      'Taxa de presença abaixo do mínimo exigido de 75%. Procure a coordenação ou o docente para orientações.';
  }

  return {
    ratePercent,
    totalSessions,
    absencesCount,
    presencesCount,
    riskLevel,
    riskLabel,
    riskMessage,
  };
}

export function useTurmaDetalhes(subjectClassId: string) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TurmaDetalhesData | null>(null);

  // Seleção de sessão para visualização no modal/sheet
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  const loadTurmaData = useCallback(async () => {
    setError(null);
    try {
      const [classes, activeSessions, historyItems] = await Promise.all([
        getStudentSubjectClasses(),
        getStudentActiveSessions().catch(() => [] as StudentActiveSessionResponse[]),
        getStudentAttendanceHistory().catch(() => []),
      ]);

      const foundClass = classes.find(
        (c) => c.subject_class_id === subjectClassId || c.enrollment_id === subjectClassId,
      );

      if (!foundClass) {
        setError('Disciplina ou turma não encontrada no seu semestre atual.');
        setData(null);
        return;
      }

      // Verifica se há chamada ativa no momento para esta turma
      const activeForThisClass =
        activeSessions.find((s) => s.subject_class_id === foundClass.subject_class_id) ?? null;

      // Filtra chamadas históricas apenas desta turma
      const classHistoryItems = historyItems.filter(
        (item) => item.subject_class_id === foundClass.subject_class_id,
      );
      const formattedSessions = toHistoryEntries(classHistoryItems);

      const metrics = calculateMetrics(foundClass);

      setData({
        subjectClass: foundClass,
        activeSession: activeForThisClass,
        sessions: formattedSessions,
        metrics,
      });
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        router.replace('/login');
        return;
      }
      if (cause instanceof Error) {
        setError(cause.message);
      } else {
        setError('Não foi possível carregar os detalhes da turma. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [subjectClassId, router]);

  useEffect(() => {
    loadTurmaData();
  }, [loadTurmaData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTurmaData();
  }, [loadTurmaData]);

  return {
    loading,
    refreshing,
    error,
    data,
    selectedEntry,
    setSelectedEntry,
    refresh: handleRefresh,
  };
}
