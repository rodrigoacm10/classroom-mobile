export type StudentClassItem = {
  id: string;
  name: string;
  codeOrRoom: string;
  timeInfo: string;
  attendanceRate: number;
  isLive?: boolean;
  isAtRisk?: boolean;
  absencesCount?: number;
};

export type ActiveCallBanner = {
  sessionId: string;
  subjectClassId: string;
  className: string;
  timeRemaining: string;
  expiresAt: string;
  roomName?: string;
};

export type StudentDashboardData = {
  studentName: string;
  studentInitials: string;
  activeCall: ActiveCallBanner | null;
  classesCount: number;
  averageAttendanceRate: number;
  atRiskCount: number;
  classes: StudentClassItem[];
};
