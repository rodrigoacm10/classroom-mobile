import type {
  StudentAttendanceHistoryItem,
  StudentSubjectClassResponse,
} from '@/services/student';
import type {
  DisciplineRisk,
  HistoryCounts,
  HistoryEntry,
  HistoryFilter,
  HistorySection,
  HistoryStatus,
} from '../types';

/** Limite de frequência exigido (mesmo valor usado pela API em `at_risk`). */
export const ATTENDANCE_LIMIT_PERCENT = 75;

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function resolveStatus(item: StudentAttendanceHistoryItem): HistoryStatus {
  if (item.session_status === 'cancelled') return 'cancelled';

  switch (item.record_status) {
    case 'regular':
    case 'approved':
      return 'present';
    case 'irregular':
      return 'review';
    case 'rejected':
      return 'rejected';
    default:
      return item.session_status === 'open' ? 'live' : 'absent';
  }
}

export function toHistoryEntry(item: StudentAttendanceHistoryItem): HistoryEntry {
  const opened = new Date(item.opened_at);
  const confirmed = item.confirmed_at ? new Date(item.confirmed_at) : null;

  return {
    id: item.session_id,
    subjectClassId: item.subject_class_id,
    discipline: item.discipline_name || item.subject_class_name,
    classLabel: [item.subject_class_name, item.room_name].filter(Boolean).join(' · '),
    status: resolveStatus(item),
    wasApproved: item.record_status === 'approved',
    openedAt: item.opened_at,
    day: pad(opened.getDate()),
    weekday: WEEKDAYS[opened.getDay()],
    fullDate: `${opened.getDate()} de ${MONTHS[opened.getMonth()]} de ${opened.getFullYear()}`,
    time: formatTime(opened),
    confirmedTime: confirmed ? formatTime(confirmed) : null,
  };
}

/** Mais recentes primeiro. */
export function toHistoryEntries(items: StudentAttendanceHistoryItem[]): HistoryEntry[] {
  return items
    .map(toHistoryEntry)
    .sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
}

export function matchesFilter(entry: HistoryEntry, filter: HistoryFilter): boolean {
  switch (filter) {
    case 'present':
      return entry.status === 'present';
    case 'absent':
      return entry.status === 'absent' || entry.status === 'rejected';
    case 'review':
      return entry.status === 'review';
    default:
      return true;
  }
}

export function countEntries(entries: HistoryEntry[]): HistoryCounts {
  return {
    all: entries.length,
    present: entries.filter((e) => matchesFilter(e, 'present')).length,
    absent: entries.filter((e) => matchesFilter(e, 'absent')).length,
    review: entries.filter((e) => matchesFilter(e, 'review')).length,
  };
}

/** Aulas que entram na conta de frequência (exclui canceladas e chamadas abertas). */
function isCounted(entry: HistoryEntry): boolean {
  return entry.status !== 'cancelled' && entry.status !== 'live';
}

export function groupByMonth(entries: HistoryEntry[]): HistorySection[] {
  const sections: HistorySection[] = [];

  for (const entry of entries) {
    const opened = new Date(entry.openedAt);
    const key = `${opened.getFullYear()}-${pad(opened.getMonth() + 1)}`;
    let section = sections.find((s) => s.key === key);

    if (!section) {
      section = {
        key,
        title: capitalize(`${MONTHS[opened.getMonth()]} de ${opened.getFullYear()}`),
        summary: '',
        data: [],
      };
      sections.push(section);
    }
    section.data.push(entry);
  }

  for (const section of sections) {
    const counted = section.data.filter(isCounted);
    const present = counted.filter((e) => e.status === 'present').length;
    section.summary =
      counted.length === 0
        ? ''
        : `${present} de ${counted.length} ${counted.length === 1 ? 'aula' : 'aulas'}`;
  }

  return sections;
}

/**
 * Presenças consecutivas, da mais recente para trás.
 * Cancelada, aberta e "em análise" não contam nem quebram; falta e rejeitada quebram.
 */
export function computeStreak(entries: HistoryEntry[]): number {
  let streak = 0;

  for (const entry of entries) {
    if (entry.status === 'present') {
      streak += 1;
    } else if (entry.status === 'absent' || entry.status === 'rejected') {
      break;
    }
  }

  return streak;
}

/**
 * Margem em relação ao limite, com base nas aulas realizadas até agora.
 * p presenças em T aulas: ainda cabem floor((4p - 3T) / 3) faltas; em risco,
 * faltam 3T - 4p presenças seguidas para voltar a 75%.
 */
export function toDisciplineRisk(item: StudentSubjectClassResponse): DisciplineRisk {
  const total = item.total_sessions;
  const present = Math.max(0, total - item.absences_count);
  const ratePercent = Math.round(item.attendance_rate * 100);
  const name = item.discipline_name || item.name;

  if (total === 0) {
    return {
      subjectClassId: item.subject_class_id,
      name,
      ratePercent,
      isAtRisk: false,
      hasSessions: false,
      hint: 'Sem aulas ainda',
    };
  }

  const isAtRisk = present * 100 < ATTENDANCE_LIMIT_PERCENT * total;

  let hint: string;
  if (isAtRisk) {
    const needed = 3 * total - 4 * present;
    hint = `Em risco: faltam ${needed} ${needed === 1 ? 'presença seguida' : 'presenças seguidas'}`;
  } else {
    const spare = Math.floor((4 * present - 3 * total) / 3);
    hint =
      spare <= 0
        ? 'No limite: não pode faltar'
        : `Pode faltar mais ${spare} ${spare === 1 ? 'aula' : 'aulas'}`;
  }

  return {
    subjectClassId: item.subject_class_id,
    name,
    ratePercent,
    isAtRisk,
    hasSessions: true,
    hint,
  };
}
