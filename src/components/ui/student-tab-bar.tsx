import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

export type StudentTab = 'turmas' | 'chamada' | 'historico' | 'perfil';

type StudentTabBarProps = {
  activeTab: StudentTab;
  onTabChange: (tab: StudentTab) => void;
};

export function StudentTabBar({ activeTab, onTabChange }: StudentTabBarProps) {
  const inkColor = '#18191B';
  const mutedColor = '#5C5E63';

  return (
    <View className="w-full shrink-0 pt-2 px-2 bg-paper border-t border-border">
      <View className="flex-row w-full items-center justify-around">
        {/* Tab Turmas */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Turmas"
          accessibilityState={{ selected: activeTab === 'turmas' }}
          onPress={() => onTabChange('turmas')}
          className="flex-1 items-center justify-center h-12 gap-1 active:opacity-70"
        >
          <View className="items-center justify-center w-5 h-5">
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Rect
                x={3}
                y={4}
                width={7}
                height={7}
                rx={1.4}
                fill="none"
                stroke={activeTab === 'turmas' ? inkColor : mutedColor}
                strokeWidth={1.7}
              />
              <Rect
                x={12}
                y={4}
                width={7}
                height={7}
                rx={1.4}
                fill="none"
                stroke={activeTab === 'turmas' ? inkColor : mutedColor}
                strokeWidth={1.7}
              />
              <Rect
                x={3}
                y={13}
                width={7}
                height={5}
                rx={1.4}
                fill="none"
                stroke={activeTab === 'turmas' ? inkColor : mutedColor}
                strokeWidth={1.7}
              />
              <Rect
                x={12}
                y={13}
                width={7}
                height={5}
                rx={1.4}
                fill="none"
                stroke={activeTab === 'turmas' ? inkColor : mutedColor}
                strokeWidth={1.7}
              />
            </Svg>
          </View>
          <Text
            className={`text-caption ${
              activeTab === 'turmas'
                ? 'font-sans-bold text-ink'
                : 'font-sans-medium text-muted'
            }`}
          >
            Turmas
          </Text>
        </Pressable>

        {/* Tab Chamada */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Chamada"
          accessibilityState={{ selected: activeTab === 'chamada' }}
          onPress={() => onTabChange('chamada')}
          className="flex-1 items-center justify-center h-12 gap-1 active:opacity-70"
        >
          <View className="items-center justify-center w-5 h-5">
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Rect
                x={4}
                y={4}
                width={14}
                height={14}
                rx={2}
                fill="none"
                stroke={activeTab === 'chamada' ? inkColor : mutedColor}
                strokeWidth={1.7}
              />
              <Path
                d="M8 8h2.2M8 8v2.2M14 8h-2.2M14 8v2.2M8 14h2.2M8 14v-2.2M14 14h-2.2M14 14v-2.2"
                fill="none"
                stroke={activeTab === 'chamada' ? inkColor : mutedColor}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <Text
            className={`text-caption ${
              activeTab === 'chamada'
                ? 'font-sans-bold text-ink'
                : 'font-sans-medium text-muted'
            }`}
          >
            Chamada
          </Text>
        </Pressable>

        {/* Tab Histórico */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Histórico"
          accessibilityState={{ selected: activeTab === 'historico' }}
          onPress={() => onTabChange('historico')}
          className="flex-1 items-center justify-center h-12 gap-1 active:opacity-70"
        >
          <View className="items-center justify-center w-5 h-5">
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Path
                d="M4 16V9M10 16V6M16 16v-4"
                fill="none"
                stroke={activeTab === 'historico' ? inkColor : mutedColor}
                strokeWidth={1.7}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <Text
            className={`text-caption ${
              activeTab === 'historico'
                ? 'font-sans-bold text-ink'
                : 'font-sans-medium text-muted'
            }`}
          >
            Histórico
          </Text>
        </Pressable>

        {/* Tab Perfil */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Perfil"
          accessibilityState={{ selected: activeTab === 'perfil' }}
          onPress={() => onTabChange('perfil')}
          className="flex-1 items-center justify-center h-12 gap-1 active:opacity-70"
        >
          <View className="items-center justify-center w-5 h-5">
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Circle
                cx={11}
                cy={8}
                r={3}
                fill="none"
                stroke={activeTab === 'perfil' ? inkColor : mutedColor}
                strokeWidth={1.7}
              />
              <Path
                d="M5 17.5c.8-2.6 3-4 6-4s5.2 1.4 6 4"
                fill="none"
                stroke={activeTab === 'perfil' ? inkColor : mutedColor}
                strokeWidth={1.7}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <Text
            className={`text-caption ${
              activeTab === 'perfil'
                ? 'font-sans-bold text-ink'
                : 'font-sans-medium text-muted'
            }`}
          >
            Perfil
          </Text>
        </Pressable>
      </View>

      {/* Home Indicator */}
      <View className="w-full items-center justify-center pt-2 pb-1.5">
        <View className="w-[134px] h-[5px] rounded-full bg-ink" />
      </View>
    </View>
  );
}
