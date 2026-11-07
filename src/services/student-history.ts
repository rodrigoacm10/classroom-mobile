import { api } from '../lib/api-client';
import type { StudentAttendanceHistoryItem } from './student';

export type PaginatedAttendanceHistoryResponse = {
  items: StudentAttendanceHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

/**
 * Consulta o histórico de chamadas do aluno autenticado na API.
 */
export async function getStudentAttendanceHistory(): Promise<StudentAttendanceHistoryItem[]> {
  const response = await api<PaginatedAttendanceHistoryResponse>(
    '/attendance-sessions/history/me?page=1&page_size=100',
  );
  return response.items;
}
