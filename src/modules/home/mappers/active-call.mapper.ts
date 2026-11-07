import { formatRemaining } from '@/lib/utils';
import type { StudentActiveSessionResponse } from '@/services/student';
import type { ActiveCallBanner } from '../types';

/** Converte a sessão aberta da API para o banner da home. */
export function toActiveCall(session: StudentActiveSessionResponse): ActiveCallBanner {
  return {
    sessionId: session.session_id,
    subjectClassId: session.subject_class_id,
    className: session.subject_class_name || session.discipline_name || 'Chamada Aberta',
    timeRemaining: formatRemaining(session.expires_at),
    expiresAt: session.expires_at,
    roomName: session.room_name ?? undefined,
  };
}
