import type { StudentSubjectClassResponse } from '@/services/student';
import type { StudentClassItem } from '../types';

/** Converte uma turma da API para a linha da home. */
export function toStudentClassItem(
  item: StudentSubjectClassResponse,
  liveSubjectClassId?: string,
): StudentClassItem {
  const ratePercent = Math.round(item.attendance_rate * 100);
  const isLive = liveSubjectClassId === item.subject_class_id;
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
}
