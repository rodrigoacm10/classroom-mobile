import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { TurmaDetalhesAluno } from '@/modules/turma';

export default function TurmaDetalhesRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <TurmaDetalhesAluno subjectClassId={id ?? ''} />;
}
