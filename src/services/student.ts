import { api } from '../lib/api-client';

export type StudentClassItem = {
  id: string;
  name: string;
  codeOrRoom: string;
  timeInfo: string;
  attendanceRate: number; // e.g. 94 for 94%
  isLive?: boolean;
  isAtRisk?: boolean;
  absencesCount?: number;
};

export type ActiveCallBannerData = {
  sessionId: string;
  subjectClassId: string;
  className: string;
  timeRemaining: string;
  expiresAt: string;
  roomName?: string;
} | null;

export type StudentDashboardData = {
  studentName: string;
  studentInitials: string;
  activeCall: ActiveCallBannerData;
  classesCount: number;
  averageAttendanceRate: number;
  atRiskCount: number;
  classes: StudentClassItem[];
};

export type StudentActiveSessionResponse = {
  session_id: string;
  subject_class_id: string;
  subject_class_name: string;
  discipline_name: string;
  opened_at: string;
  expires_at: string;
  room_name?: string | null;
  already_confirmed?: boolean;
};

export type StudentSubjectClassResponse = {
  enrollment_id: string;
  subject_class_id: string;
  name: string;
  discipline_name: string;
  room_id?: string | null;
  room_name?: string | null;
  professor_id?: string | null;
  professor_name?: string | null;
  attendance_rate: number;
  status: string;
  total_sessions: number;
  absences_count: number;
};

export type StudentMetricsResponse = {
  total_classes: number;
  average_attendance_rate: number;
  at_risk_count: number;
  classes_count: number;
};

export const DEFAULT_STUDENT_DATA: StudentDashboardData = {
  studentName: 'Aluno',
  studentInitials: 'AL',
  activeCall: null,
  classesCount: 0,
  averageAttendanceRate: 100,
  atRiskCount: 0,
  classes: [],
};

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'AL';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatTimeRemaining(expiresAtStr: string): string {
  try {
    const expiresAt = new Date(expiresAtStr).getTime();
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((expiresAt - now) / 1000));
    const minutes = Math.floor(diffSec / 60);
    const seconds = diffSec % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } catch {
    return '00:00';
  }
}

/**
 * Busca sessões de chamada abertas para as turmas do aluno autenticado.
 * GET /attendance-sessions/active/me
 */
export async function getStudentActiveSessions(): Promise<StudentActiveSessionResponse[]> {
  return api<StudentActiveSessionResponse[]>('/attendance-sessions/active/me');
}

/**
 * Lista as turmas ativas do aluno com taxas e contagem de faltas.
 * GET /members/me/subject-classes
 */
export async function getStudentSubjectClasses(): Promise<StudentSubjectClassResponse[]> {
  return api<StudentSubjectClassResponse[]>('/members/me/subject-classes');
}

/**
 * Obtém os indicadores de frequência e turmas em risco do aluno.
 * GET /members/me/metrics
 */
export async function getStudentMetrics(): Promise<StudentMetricsResponse> {
  return api<StudentMetricsResponse>('/members/me/metrics');
}

/**
 * Consolida todas as informações necessárias para a Home do aluno em tempo real.
 */
export async function getStudentDashboard(userProfileName?: string): Promise<StudentDashboardData> {
  const displayName = userProfileName ? userProfileName.split(' ')[0] : DEFAULT_STUDENT_DATA.studentName;
  const initials = userProfileName ? getInitials(userProfileName) : DEFAULT_STUDENT_DATA.studentInitials;

  try {
    // Executa as 3 consultas à API em paralelo via Promise.allSettled
    const [activeSessionsRes, studentClassesRes, studentMetricsRes] = await Promise.allSettled([
      getStudentActiveSessions(),
      getStudentSubjectClasses(),
      getStudentMetrics(),
    ]);

    const activeSessions = activeSessionsRes.status === 'fulfilled' ? activeSessionsRes.value : [];
    const studentClasses = studentClassesRes.status === 'fulfilled' ? studentClassesRes.value : [];
    const studentMetrics = studentMetricsRes.status === 'fulfilled' ? studentMetricsRes.value : null;

    let activeCall: ActiveCallBannerData = null;

    if (activeSessions.length > 0) {
      const first = activeSessions[0];
      if (!first.already_confirmed) {
        activeCall = {
          sessionId: first.session_id,
          subjectClassId: first.subject_class_id,
          className: first.subject_class_name || first.discipline_name || 'Chamada Aberta',
          timeRemaining: formatTimeRemaining(first.expires_at),
          expiresAt: first.expires_at,
          roomName: first.room_name ?? undefined,
        };
      }
    }

    const classes: StudentClassItem[] = studentClasses.map((item) => {
      const ratePercent = Math.round(item.attendance_rate * 100);
      const isLive = activeCall?.subjectClassId === item.subject_class_id;
      const isAtRisk = ratePercent < 75 && item.total_sessions > 0;

      const codeOrRoom = [item.name, item.room_name].filter(Boolean).join(' · ');

      let timeInfo =
        item.absences_count > 0
          ? `${item.absences_count} ${item.absences_count === 1 ? 'falta' : 'faltas'}${isAtRisk ? ' · Risco' : ''}`
          : item.total_sessions === 0
            ? 'Sem aulas'
            : 'Presença 100%';
      if (isLive) {
        timeInfo = 'Ao vivo';
      }

      return {
        id: item.subject_class_id,
        name: item.discipline_name || item.name,
        codeOrRoom,
        timeInfo,
        attendanceRate: ratePercent,
        isLive,
        isAtRisk,
        absencesCount: item.absences_count,
      };
    });

    let classesCount = classes.length;
    let averageAttendanceRate = 100;
    let atRiskCount = 0;

    // Se o endpoint de métricas consolidado retornou, prioriza a regra do servidor
    if (studentMetrics !== null) {
      classesCount = studentMetrics.total_classes;
      averageAttendanceRate = Math.round(studentMetrics.average_attendance_rate * 100);
      atRiskCount = studentMetrics.at_risk_count;
    } else if (classes.length > 0) {
      const sumRate = classes.reduce((acc, curr) => acc + curr.attendanceRate, 0);
      averageAttendanceRate = Math.round(sumRate / classes.length);
      atRiskCount = classes.filter((c) => c.isAtRisk).length;
    }

    return {
      studentName: displayName,
      studentInitials: initials,
      activeCall,
      classesCount,
      averageAttendanceRate,
      atRiskCount,
      classes,
    };
  } catch {
    return {
      studentName: displayName,
      studentInitials: initials,
      activeCall: null,
      classesCount: 0,
      averageAttendanceRate: 100,
      atRiskCount: 0,
      classes: [],
    };
  }
}
