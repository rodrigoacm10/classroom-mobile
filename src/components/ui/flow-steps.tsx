import React from 'react';
import { View, Text } from 'react-native';

export type Step = {
  label: string;
};

export type FlowStepsProps = {
  steps: Step[];
  /** 1-indexed current step */
  current: number;
};

export function FlowSteps({ steps, current }: FlowStepsProps) {
  return (
    <View className="mb-6 flex-row items-center justify-start flex-wrap gap-y-2">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < current;
        const isActive = stepNumber === current;
        const isLast = index === steps.length - 1;

        return (
          <View key={step.label} className="flex-row items-center">
            {/* Step dot + label */}
            <View className="flex-row items-center gap-1.5">
              <View
                className={`w-6 h-6 items-center justify-center rounded-full ${
                  isDone || isActive
                    ? 'bg-ink'
                    : 'border border-control-border bg-paper'
                }`}
              >
                <Text
                  className={`text-[11px] font-sans-bold ${
                    isDone || isActive ? 'text-on-ink' : 'text-muted'
                  }`}
                >
                  {isDone ? '✓' : stepNumber}
                </Text>
              </View>

              <Text
                className={`font-sans text-caption ${
                  isActive || isDone ? 'text-ink font-sans-semibold' : 'text-muted'
                }`}
              >
                {step.label}
              </Text>
            </View>

            {/* Connector line */}
            {!isLast && (
              <View
                className={`mx-2 h-[1px] w-5 sm:w-8 ${
                  isDone ? 'bg-ink' : 'bg-border'
                }`}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const RECOVERY_STEPS: Step[] = [
  { label: 'E-mail' },
  { label: 'Código' },
  { label: 'Nova senha' },
];

export function RecoverySteps({ current }: { current: 1 | 2 | 3 }) {
  return <FlowSteps steps={RECOVERY_STEPS} current={current} />;
}
