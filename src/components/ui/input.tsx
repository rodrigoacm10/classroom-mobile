import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Pressable,
} from 'react-native';

export type InputProps = TextInputProps & {
  label?: string;
  headerRight?: React.ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  rightAccessory?: React.ReactNode;
};

export function Input({
  label,
  headerRight,
  invalid = false,
  disabled = false,
  error,
  containerClassName = '',
  inputClassName = '',
  rightAccessory,
  onFocus,
  onBlur,
  editable,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const isEditable = editable !== undefined ? editable : !disabled;

  const hasError = invalid || Boolean(error);

  const getBorderColor = () => {
    if (hasError) return 'border-danger';
    if (isFocused) return 'border-ink';
    return 'border-control-border';
  };

  return (
    <View className={`flex-col gap-2 ${containerClassName}`}>
      {(label || headerRight) && (
        <View className="flex-row items-center justify-between">
          {label ? (
            <Text className="font-sans-semibold text-label text-ink">
              {label}
            </Text>
          ) : (
            <View />
          )}
          {headerRight}
        </View>
      )}

      <View
        className={`min-h-[48px] flex-row items-center rounded-sm border px-3.5 ${
          isEditable ? 'bg-paper' : 'bg-surface opacity-75'
        } ${getBorderColor()}`}
      >
        <TextInput
          editable={isEditable}
          className={`flex-1 py-3 font-sans text-body text-ink placeholder:text-muted ${inputClassName}`}
          placeholderTextColor="#5c5e63"
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightAccessory}
      </View>

      {error ? (
        <Text className="font-sans text-caption text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
