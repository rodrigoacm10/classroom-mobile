import React from 'react';
import { View, Text } from 'react-native';

import type { StudentClassItem } from '../types';
import { ClassRow } from './class-row';

type ClassListProps = {
  classes: StudentClassItem[];
};

export function ClassList({ classes }: ClassListProps) {
  return (
    <View className="pt-2 px-6 pb-8">
      <View className="flex-row items-baseline justify-between pt-2 pb-3">
        <Text className="font-sans-bold text-body text-ink">Neste semestre</Text>
        <Text className="font-sans-semibold text-caption text-muted">Limite 75%</Text>
      </View>

      <View className="border-t border-border">
        {classes.length === 0 ? (
          <View className="py-12 items-center justify-center">
            <Text className="font-sans-medium text-body text-muted text-center">
              Nenhuma turma matriculada neste semestre.
            </Text>
          </View>
        ) : (
          classes.map((item) => <ClassRow key={item.id} item={item} />)
        )}
      </View>
    </View>
  );
}
