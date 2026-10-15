import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  DimensionValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { ScreenHeader } from '@/components/global';
import { Logo } from '@/components/ui/logo';
import { Notice } from '@/components/ui/notice';
import { useHome } from '../hooks';

export function HomeAluno() {
  const router = useRouter();
  const { loading, refreshing, dashboard, timeRemaining, refresh, error } = useHome();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-paper items-center justify-center p-6">
        <StatusBar style="dark" />
        <Logo />
        <ActivityIndicator size="small" color="#18191B" className="mt-6" />
      </SafeAreaView>
    );
  }

  if (!dashboard) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#18191B" />
          }
        >
          {error ? (
            <View className="px-6 pt-6">
              <Notice>{error}</Notice>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const activeCall = dashboard.activeCall;

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#18191B"
          />
        }
      >
        {error ? (
          <View className="px-6 pt-4">
            <Notice>{error}</Notice>
          </View>
        ) : null}

        <ScreenHeader
          kicker={`Olá, ${dashboard.studentName}`}
          title="Minhas turmas"
          rightAction={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Meu Perfil"
              onPress={() => router.push('/(aluno)/(tabs)/perfil')}
              className="w-9 h-9 rounded-full bg-ink items-center justify-center active:opacity-80"
            >
              <Text className="font-sans-bold text-accent text-label">
                {dashboard.studentInitials}
              </Text>
            </Pressable>
          }
        />

        {activeCall && (
          <View className="flex-row items-center justify-between py-3.5 px-6 bg-accent">
            <View className="flex-row items-center flex-1 gap-2.5 mr-2">
              <View className="w-2 h-2 rounded-full bg-ink shrink-0" />
              <View className="flex-1">
                <Text className="font-sans-bold text-[11px] leading-4 uppercase tracking-caps text-ink">
                  Chamada aberta
                </Text>
                <Text
                  numberOfLines={1}
                  className="font-sans-bold text-[14px] leading-5 text-ink"
                >
                  {activeCall.className} · {timeRemaining || activeCall.timeRemaining}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirmar presença"
              onPress={() => router.push('/chamada')}
              className="h-6 px-3 rounded-md bg-ink items-center justify-center active:opacity-80 shrink-0"
            >
              <Text className="font-sans-bold text-caption text-paper">
                Confirmar
              </Text>
            </Pressable>
          </View>
        )}

        <View className="flex-row pt-5 pb-3 px-6">
          <View className="flex-1 pr-4 gap-1 border-r border-border">
            <Text className="font-sans-semibold uppercase tracking-caps text-caption text-muted">
              Turmas
            </Text>
            <Text className="font-mono-medium text-[32px] leading-9 tracking-tight text-ink">
              {dashboard.classesCount.toString().padStart(2, '0')}
            </Text>
          </View>

          <View className="flex-1 px-4 gap-1">
            <Text className="font-sans-semibold uppercase tracking-caps text-caption text-muted">
              Frequência
            </Text>
            <Text className="font-mono-medium text-[32px] leading-9 tracking-tight text-success">
              {dashboard.averageAttendanceRate}%
            </Text>
          </View>

          <View className="flex-1 pl-4 gap-1 border-l border-border">
            <Text className="font-sans-semibold uppercase tracking-caps text-caption text-muted">
              Em risco
            </Text>
            <Text className="font-mono-medium text-[32px] leading-9 tracking-tight text-danger">
              {dashboard.atRiskCount.toString().padStart(2, '0')}
            </Text>
          </View>
        </View>

        <View className="pt-2 px-6 pb-8">
          <View className="flex-row items-baseline justify-between pt-2 pb-3">
            <Text className="font-sans-bold text-body text-ink">
              Neste semestre
            </Text>
            <Text className="font-sans-semibold text-caption text-muted">
              Limite 75%
            </Text>
          </View>

          <View className="border-t border-border">
            {dashboard.classes.length === 0 ? (
              <View className="py-12 items-center justify-center">
                <Text className="font-sans-medium text-body text-muted text-center">
                  Nenhuma turma matriculada neste semestre.
                </Text>
              </View>
            ) : (
              dashboard.classes.map((item) => {
                const isDanger = item.isAtRisk || item.attendanceRate < 75;
                const fillWidthPct: DimensionValue = `${Math.min(item.attendanceRate, 100)}%`;

                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Turma ${item.name}`}
                    onPress={() => {
                      if (item.isLive) {
                        router.push('/chamada');
                      }
                    }}
                    className="flex-row items-center h-[68px] gap-3 border-b border-border active:bg-surface/50"
                  >
                    <View
                      className={`w-1.5 h-9 rounded-[3px] shrink-0 ${
                        item.isLive
                          ? 'bg-accent'
                          : isDanger
                            ? 'bg-danger'
                            : 'bg-ink'
                      }`}
                    />

                    <View className="flex-1 gap-0.5">
                      <Text
                        numberOfLines={1}
                        className="font-sans-semibold text-[14px] leading-5 text-ink"
                      >
                        {item.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className={`text-caption ${
                          isDanger
                            ? 'font-sans-medium text-danger'
                            : 'font-sans-medium text-muted'
                        }`}
                      >
                        {item.codeOrRoom} · {item.timeInfo}
                      </Text>
                    </View>

                    <View className="w-14 shrink-0 items-end gap-1.5">
                      <Text
                        className={`font-mono-bold text-[16px] leading-5 ${
                          isDanger ? 'text-danger' : 'text-success'
                        }`}
                      >
                        {item.attendanceRate}%
                      </Text>
                      <View className="w-7 h-1 rounded-full bg-surface overflow-hidden">
                        <View
                          style={{ width: fillWidthPct }}
                          className={`h-full rounded-full ${
                            isDanger ? 'bg-danger' : 'bg-success'
                          }`}
                        />
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
