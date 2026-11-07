import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from './logo';

type SecondaryScreenProps = {
  children: React.ReactNode;
  onPressLogo?: () => void;
  onPressPrivacy?: () => void;
  onPressTerms?: () => void;
  onPressContact?: () => void;
};

export function SecondaryScreen({
  children,
  onPressLogo,
  onPressPrivacy,
  onPressTerms,
  onPressContact,
}: SecondaryScreenProps) {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className="flex-1 bg-paper"
    >
      {/* Header */}
      <View className="border-b border-border px-6 py-4">
        <View className="max-w-[480px] w-full self-center">
          <Logo onPress={onPressLogo} />
        </View>
      </View>

      {/* Main Content with Keyboard handling */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <View className="flex-1 justify-center px-6 py-8">
            <View className="w-full max-w-[480px] self-center">
              {children}
            </View>
          </View>

          {/* Footer */}
          <View className="border-t border-border px-6 py-5">
            <View className="w-full max-w-[480px] self-center flex-row flex-wrap items-center justify-between gap-y-2">
              <Text className="font-mono text-caption text-muted">
                © 2026 Locus
              </Text>
              <View className="flex-row items-center gap-4">
                <Pressable
                  onPress={onPressPrivacy}
                  hitSlop={8}
                  accessibilityRole="link"
                >
                  <Text className="font-sans text-caption text-muted active:text-ink">
                    Privacidade
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onPressTerms}
                  hitSlop={8}
                  accessibilityRole="link"
                >
                  <Text className="font-sans text-caption text-muted active:text-ink">
                    Termos
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onPressContact}
                  hitSlop={8}
                  accessibilityRole="link"
                >
                  <Text className="font-sans text-caption text-muted active:text-ink">
                    Contato
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
