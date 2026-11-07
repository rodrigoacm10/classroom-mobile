import React from 'react';
import { View, Text } from 'react-native';

export type ScreenHeaderProps = {
  /**
   * Texto superior de contexto/saudação (ex: "Olá, Marina" ou "Registro de frequência").
   */
  kicker?: string;

  /**
   * Título principal em destaque (ex: "Minhas turmas", "Confirmar presença").
   */
  title: string;

  /**
   * Elemento opcional à direita (ex: Avatar de perfil, botão de ação, badge).
   */
  rightAction?: React.ReactNode;

  /**
   * Se verdadeiro, adiciona uma linha divisória na parte inferior.
   */
  borderBottom?: boolean;

  /**
   * Classes adicionais para o container do cabeçalho.
   */
  className?: string;
};

export function ScreenHeader({
  kicker,
  title,
  rightAction,
  borderBottom = false,
  className = '',
}: ScreenHeaderProps) {
  return (
    <View
      className={`flex-row items-center justify-between pt-5 pb-4 px-6 ${
        borderBottom ? 'border-b border-border' : ''
      } ${className}`}
    >
      <View className="flex-col gap-1 flex-1 mr-3">
        {kicker && (
          <Text className="font-sans-semibold uppercase tracking-caps text-caption text-muted">
            {kicker}
          </Text>
        )}
        <Text className="font-sans-extrabold tracking-tight text-title text-ink">
          {title}
        </Text>
      </View>

      {rightAction && <View className="shrink-0">{rightAction}</View>}
    </View>
  );
}
