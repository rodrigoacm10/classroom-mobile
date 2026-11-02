import React from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

type HistoryEmptyProps = {
  variant: 'no-classes' | 'no-sessions' | 'no-results';
  onResetFilters?: () => void;
};

const COPY: Record<HistoryEmptyProps['variant'], { title: string; body: string }> = {
  'no-classes': {
    title: 'Nenhuma turma por aqui',
    body: 'Quando você for matriculado em uma turma, as chamadas dela aparecem neste histórico.',
  },
  'no-sessions': {
    title: 'Nenhuma chamada ainda',
    body: 'Suas presenças e faltas aparecem aqui depois da primeira chamada de uma das suas turmas.',
  },
  'no-results': {
    title: 'Nada com esse filtro',
    body: 'Nenhuma chamada corresponde à disciplina e ao status escolhidos.',
  },
};

export function HistoryEmpty({ variant, onResetFilters }: HistoryEmptyProps) {
  const copy = COPY[variant];

  return (
    <View className="px-6 py-12 items-center gap-2">
      <Text className="font-sans-bold text-heading text-ink text-center">{copy.title}</Text>
      <Text className="font-sans-medium text-body text-muted text-center">{copy.body}</Text>
      {variant === 'no-results' && onResetFilters ? (
        <Button variant="outline" size="md" onPress={onResetFilters} className="mt-4">
          Limpar filtros
        </Button>
      ) : null}
    </View>
  );
}
