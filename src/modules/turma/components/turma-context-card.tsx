import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { StudentSubjectClassResponse } from '@/services/student';

type TurmaContextCardProps = {
  subjectClass: StudentSubjectClassResponse;
};

function getInitials(name?: string | null): string {
  if (!name) return 'PR';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function TurmaContextCard({ subjectClass }: TurmaContextCardProps) {
  const professor = subjectClass.professor_name || 'Docente responsável não atribuído';
  const room = subjectClass.room_name || 'Sala não atribuída';

  return (
    <View className="rounded-sm border border-border bg-paper p-4 gap-4">
      <Text className="font-sans-bold text-label text-ink">
        Informações da Disciplina
      </Text>

      <View className="gap-3">
        {/* Professor Row */}
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-ink items-center justify-center shrink-0">
            <Text className="font-sans-bold text-caption text-accent">
              {getInitials(subjectClass.professor_name)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-mono text-[11px] text-muted uppercase">Professor(a)</Text>
            <Text numberOfLines={1} className="font-sans-bold text-body text-ink">
              {professor}
            </Text>
          </View>
        </View>

        {/* Room Row */}
        <View className="flex-row items-center gap-3 pt-2 border-t border-border">
          <View className="w-10 h-10 rounded-sm bg-surface border border-border items-center justify-center shrink-0">
            <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
              <Path
                d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z"
                stroke="#18191B"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View className="flex-1">
            <Text className="font-mono text-[11px] text-muted uppercase">Local das Aulas</Text>
            <Text numberOfLines={1} className="font-sans-bold text-body text-ink">
              {room}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
