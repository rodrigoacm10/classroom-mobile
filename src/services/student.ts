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
