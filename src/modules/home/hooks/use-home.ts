import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { ApiError } from '@/lib/api-client';
import { getStoredAccessToken } from '@/lib/storage';
import { formatRemaining, getInitials } from '@/lib/utils';
import {
  getStudentActiveSessions,
  getStudentMetrics,
  getStudentSubjectClasses,
  type StudentActiveSessionResponse,
  type StudentMetricsResponse,
  type StudentSubjectClassResponse,
} from '@/services/student';
import { getMyProfile } from '@/services/user';
import { toActiveCall, toStudentClassItem } from '../mappers';
import type { StudentDashboardData } from '../types';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Erro ao carregar a home.';
}

export function useHome() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<StudentMetricsResponse | null>(null);
  const [subjectClasses, setSubjectClasses] = useState<StudentSubjectClassResponse[]>([]);
  const [activeSession, setActiveSession] = useState<StudentActiveSessionResponse | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  const load = useCallback(async () => {
    try {
      const storedToken = await getStoredAccessToken();
      if (!storedToken) {
        router.replace('/login');
        return;
      }

      setError(null);

      const [sessions, classes, metricsResult, profile] = await Promise.all([
        getStudentActiveSessions(),
        getStudentSubjectClasses(),
        getStudentMetrics(),
        getMyProfile().catch(() => null),
      ]);

      const openSession = sessions.find((session) => !session.already_confirmed) ?? null;

      setProfileName(profile?.name ?? null);
      setSubjectClasses(classes);
      setMetrics(metricsResult);
      setActiveSession(openSession);
      setTimeRemaining(openSession ? formatRemaining(openSession.expires_at) : '');
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

  useEffect(() => {
    const expiresAt = activeSession?.expires_at;
    if (!expiresAt) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = formatRemaining(expiresAt);
      setTimeRemaining(remaining);
      if (remaining === '00:00') {
        clearInterval(interval);
        load();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.expires_at, load]);

  async function refresh() {
    setRefreshing(true);
    await load();
  }

  const activeCall = activeSession ? toActiveCall(activeSession) : null;
  const classes = subjectClasses.map((item) =>
    toStudentClassItem(item, activeCall?.subjectClassId),
  );

  const firstName = profileName ? profileName.trim().split(/\s+/)[0] : 'Aluno';
  const initials = profileName ? getInitials(profileName) : 'AL';

  const dashboard: StudentDashboardData | null = metrics
    ? {
        studentName: firstName,
        studentInitials: initials,
        activeCall,
        classesCount: metrics.total_classes,
        averageAttendanceRate: Math.round(metrics.average_attendance_rate * 100),
        atRiskCount: metrics.at_risk_count,
        classes,
      }
    : null;

  return {
    loading,
    refreshing,
    dashboard,
    timeRemaining,
    refresh,
    error,
  };
}
