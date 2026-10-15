import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

export default function StudentTabsLayout() {
  const insets = useSafeAreaInsets();
  const inkColor = '#18191B';
  const mutedColor = '#5C5E63';

  const bottomInset = insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: inkColor,
        tabBarInactiveTintColor: mutedColor,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E4E4E4',
          borderTopWidth: 1,
          height: 56 + (bottomInset > 0 ? bottomInset : 8),
          paddingTop: 6,
          paddingBottom: bottomInset > 0 ? bottomInset : 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Archivo_600SemiBold',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Turmas',
          tabBarIcon: ({ color }) => (
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Rect
                x={3}
                y={4}
                width={7}
                height={7}
                rx={1.4}
                fill="none"
                stroke={color}
                strokeWidth={1.7}
              />
              <Rect
                x={12}
                y={4}
                width={7}
                height={7}
                rx={1.4}
                fill="none"
                stroke={color}
                strokeWidth={1.7}
              />
              <Rect
                x={3}
                y={13}
                width={7}
                height={5}
                rx={1.4}
                fill="none"
                stroke={color}
                strokeWidth={1.7}
              />
              <Rect
                x={12}
                y={13}
                width={7}
                height={5}
                rx={1.4}
                fill="none"
                stroke={color}
                strokeWidth={1.7}
              />
            </Svg>
          ),
        }}
      />

      <Tabs.Screen
        name="chamada"
        options={{
          title: 'Chamada',
          tabBarIcon: ({ color }) => (
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Rect
                x={4}
                y={4}
                width={14}
                height={14}
                rx={2}
                fill="none"
                stroke={color}
                strokeWidth={1.7}
              />
              <Path
                d="M8 8h2.2M8 8v2.2M14 8h-2.2M14 8v2.2M8 14h2.2M8 14v-2.2M14 14h-2.2M14 14v-2.2"
                fill="none"
                stroke={color}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            </Svg>
          ),
        }}
      />

      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => (
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Path
                d="M4 16V9M10 16V6M16 16v-4"
                fill="none"
                stroke={color}
                strokeWidth={1.7}
                strokeLinecap="round"
              />
            </Svg>
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Circle
                cx={11}
                cy={8}
                r={3}
                fill="none"
                stroke={color}
                strokeWidth={1.7}
              />
              <Path
                d="M5 17.5c.8-2.6 3-4 6-4s5.2 1.4 6 4"
                fill="none"
                stroke={color}
                strokeWidth={1.7}
                strokeLinecap="round"
              />
            </Svg>
          ),
        }}
      />
    </Tabs>
  );
}
