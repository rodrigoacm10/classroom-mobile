import type {
  StudentActiveSessionResponse,
  StudentSubjectClassResponse,
} from '@/services/student';
import type { HistoryEntry } from '../historico/types';

export type TurmaRiskLevel = 'safe' | 'alert' | 'critical';

export type TurmaCalculatedMetrics = {
  ratePercent: number;
  totalSessions: number;
  absencesCount: number;
  presencesCount: number;
  riskLevel: TurmaRiskLevel;
  riskLabel: string;
  riskMessage: string;
};

export type TurmaDetalhesData = {
  subjectClass: StudentSubjectClassResponse;
  activeSession: StudentActiveSessionResponse | null;
  sessions: HistoryEntry[];
  metrics: TurmaCalculatedMetrics;
};
