import { api } from '../lib/api-client';

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

export type AttendanceSessionStatus = 'open' | 'closed' | 'cancelled';
export type AttendanceRecordStatus = 'regular' | 'irregular' | 'approved' | 'rejected';

/**
 * Uma chamada (sessão) da turma do aluno, com o registro dele quando existe.
 * `record_status` nulo em sessão encerrada significa falta.
 * Contrato proposto para o futuro GET /members/me/attendance-history.
 */
export type StudentAttendanceHistoryItem = {
  session_id: string;
  subject_class_id: string;
  subject_class_name: string;
  discipline_name: string;
  room_name: string | null;
  opened_at: string;
  session_status: AttendanceSessionStatus;
  record_status: AttendanceRecordStatus | null;
  confirmed_at: string | null;
};

/** GET /attendance-sessions/active/me */
export async function getStudentActiveSessions(): Promise<StudentActiveSessionResponse[]> {
  return api<StudentActiveSessionResponse[]>('/attendance-sessions/active/me');
}

/** GET /members/me/subject-classes */
export async function getStudentSubjectClasses(): Promise<StudentSubjectClassResponse[]> {
  return api<StudentSubjectClassResponse[]>('/members/me/subject-classes');
}

/** GET /members/me/metrics */
export async function getStudentMetrics(): Promise<StudentMetricsResponse> {
  return api<StudentMetricsResponse>('/members/me/metrics');
}

export type ConfirmAttendancePayload = {
  day_code: string;
  latitude: number;
  longitude: number;
  gps_accuracy_meters?: number | null;
  device_id?: string | null;
  device_info?: Record<string, unknown> | null;
};

export type AttendanceRecordResponse = {
  id: string;
  session_id: string;
  tenant_member_id: string;
  confirmed_at: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  within_radius: boolean;
  record_status: AttendanceRecordStatus;
};

/** POST /subject-classes/{subject_class_id}/attendance-sessions/{session_id}/confirm */
export async function confirmStudentAttendance(
  subjectClassId: string,
  sessionId: string,
  payload: ConfirmAttendancePayload,
): Promise<AttendanceRecordResponse> {
  return api<AttendanceRecordResponse>(
    `/subject-classes/${subjectClassId}/attendance-sessions/${sessionId}/confirm`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

