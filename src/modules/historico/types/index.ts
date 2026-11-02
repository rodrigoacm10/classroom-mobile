/** Resultado de uma chamada, do ponto de vista do aluno. */
export type HistoryStatus =
  | 'present'
  | 'review'
  | 'rejected'
  | 'absent'
  | 'cancelled'
  | 'live';

export type HistoryFilter = 'all' | 'present' | 'absent' | 'review';

export type HistoryEntry = {
  id: string;
  subjectClassId: string;
  discipline: string;
  /** Ex.: "T01 · Sala 204" */
  classLabel: string;
  status: HistoryStatus;
  /** True quando a presença foi aprovada pelo professor após revisão. */
  wasApproved: boolean;
  openedAt: string;
  /** Dia do mês, ex.: "10" */
  day: string;
  /** Dia da semana abreviado, ex.: "SEX" */
  weekday: string;
  /** Ex.: "10 de outubro de 2026" */
  fullDate: string;
  /** Horário da chamada, ex.: "08:15" */
  time: string;
  /** Horário em que o aluno confirmou, quando houve registro. */
  confirmedTime: string | null;
};

export type HistorySection = {
  key: string;
  /** Ex.: "Outubro de 2026" */
  title: string;
  /** Ex.: "18 de 20 aulas" */
  summary: string;
  data: HistoryEntry[];
};

export type HistoryCounts = {
  all: number;
  present: number;
  absent: number;
  review: number;
};

export type DisciplineRisk = {
  subjectClassId: string;
  name: string;
  ratePercent: number;
  isAtRisk: boolean;
  hasSessions: boolean;
  /** Margem prática: quantas faltas ainda cabem, ou quantas presenças faltam para sair do risco. */
  hint: string;
};
