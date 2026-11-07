import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { HistoryEntry } from '../../historico/types';
import { StatusBadge } from '../../historico/components/status-badge';

type TurmaSessionsTimelineProps = {
  sessions: HistoryEntry[];
  onSelectSession: (session: HistoryEntry) => void;
};

export function TurmaSessionsTimeline({
  sessions,
  onSelectSession,
}: TurmaSessionsTimelineProps) {
  if (sessions.length === 0) {
    return (
      <View className="rounded-sm border border-border bg-surface p-6 items-center justify-center gap-2">
        <Text className="font-sans-bold text-body text-ink text-center">
          Nenhuma chamada registrada
        </Text>
        <Text className="font-sans text-caption text-muted text-center max-w-[280px]">
          As chamadas realizadas pelo professor nesta disciplina aparecerão aqui com data e status.
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-sm border border-border bg-paper overflow-hidden">
      <View className="px-4 py-3 border-b border-border bg-surface flex-row items-center justify-between">
        <Text className="font-sans-bold text-label text-ink">
          Histórico de Aulas
        </Text>
        <Text className="font-mono text-caption text-muted">
          {sessions.length} {sessions.length === 1 ? 'chamada' : 'chamadas'}
        </Text>
      </View>

      <View className="divide-y divide-border">
        {sessions.map((session) => {
          return (
            <Pressable
              key={session.id}
              onPress={() => onSelectSession(session)}
              accessibilityRole="button"
              accessibilityLabel={`Chamada de ${session.fullDate}, status ${session.status}`}
              className="p-4 flex-row items-center justify-between gap-3 active:bg-surface/60 transition-colors"
            >
              {/* Date Box */}
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-12 h-12 rounded-sm bg-surface border border-border items-center justify-center shrink-0">
                  <Text className="font-mono-bold text-body text-ink leading-none">
                    {session.day}
                  </Text>
                  <Text className="font-mono text-[10px] text-muted uppercase mt-0.5">
                    {session.weekday}
                  </Text>
                </View>

                <View className="flex-1 gap-0.5">
                  <Text
                    numberOfLines={1}
                    className="font-sans-semibold text-body text-ink"
                  >
                    {session.fullDate}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="font-mono text-caption text-muted">
                      Início: {session.time}
                    </Text>
                    {session.confirmedTime ? (
                      <>
                        <Text className="font-mono text-caption text-muted">·</Text>
                        <Text className="font-mono text-caption text-success font-medium">
                          Confirmou às {session.confirmedTime}
                        </Text>
                      </>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Status Badge + Chevron */}
              <View className="flex-row items-center gap-2 shrink-0">
                <StatusBadge status={session.status} />
                <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
                  <Path
                    d="M7.5 4.5L13 10l-5.5 5.5"
                    stroke="#8A8C91"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
