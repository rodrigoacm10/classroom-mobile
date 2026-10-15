import React from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Logo } from '@/components/ui/logo';
import { Notice } from '@/components/ui/notice';
import { CallBanner, ClassList, HomeHeader, HomeStats } from '../components';
import { useHome } from '../hooks';

export function HomeAluno() {
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

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#18191B" />
        }
      >
        {error ? (
          <View className="px-6 pt-4">
            <Notice>{error}</Notice>
          </View>
        ) : null}

        <HomeHeader
          studentName={dashboard.studentName}
          studentInitials={dashboard.studentInitials}
        />

        <CallBanner call={dashboard.activeCall} timeRemaining={timeRemaining} />

        <HomeStats
          classesCount={dashboard.classesCount}
          averageAttendanceRate={dashboard.averageAttendanceRate}
          atRiskCount={dashboard.atRiskCount}
        />

        <ClassList classes={dashboard.classes} />
      </ScrollView>
    </SafeAreaView>
  );
}
