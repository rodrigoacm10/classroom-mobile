import React from 'react';
import { View, Text } from 'react-native';

type NoticeVariant = 'danger' | 'success' | 'warn';

export type NoticeProps = {
  variant?: NoticeVariant;
  children: React.ReactNode;
  className?: string;
};

export function Notice({
  variant = 'danger',
  children,
  className = '',
}: NoticeProps) {
  const variantStyles: Record<NoticeVariant, string> = {
    danger: 'border-danger bg-danger-surface',
    success: 'border-success bg-success-surface',
    warn: 'border-warn bg-accent-surface',
  };

  return (
    <View
      className={`rounded-sm border px-4 py-3 ${variantStyles[variant]} ${className}`}
      accessibilityRole="alert"
    >
      {typeof children === 'string' ? (
        <Text className="font-sans text-label leading-[18px] text-ink">
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
