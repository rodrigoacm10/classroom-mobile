import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  GestureResponderEvent,
} from 'react-native';

type ButtonVariant = 'ink' | 'accent' | 'outline';
type ButtonSize = 'md' | 'lg';

export type ButtonProps = {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  accessibilityLabel?: string;
};

export function Button({
  children,
  onPress,
  variant = 'ink',
  size = 'lg',
  disabled = false,
  loading = false,
  className = '',
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseStyle = 'items-center justify-center rounded-sm flex-row';

  const variantStyles: Record<ButtonVariant, string> = {
    ink: 'bg-ink active:bg-ink/90',
    accent: 'bg-accent active:opacity-90',
    outline: 'border border-control-border bg-paper active:bg-surface',
  };

  const textVariantStyles: Record<ButtonVariant, string> = {
    ink: 'text-on-ink font-sans-semibold',
    accent: 'text-ink font-sans-semibold',
    outline: 'text-ink font-sans-medium',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    md: 'min-h-[44px] px-4',
    lg: 'min-h-[52px] px-6',
  };

  const textSizeStyles: Record<ButtonSize, string> = {
    md: 'text-label',
    lg: 'text-body',
  };

  const spinnerColor = variant === 'ink' ? '#ffffff' : '#18191b';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`
        ${baseStyle}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled ? 'opacity-60' : 'active:opacity-85'}
        ${className}
      `}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color={spinnerColor} />
          {typeof children === 'string' ? (
            <Text
              className={`${textVariantStyles[variant]} ${textSizeStyles[size]}`}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      ) : typeof children === 'string' ? (
        <Text
          className={`${textVariantStyles[variant]} ${textSizeStyles[size]}`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
