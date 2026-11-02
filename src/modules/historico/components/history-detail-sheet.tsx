import React, { useRef } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import type { HistoryEntry, HistoryStatus } from '../types';
import { StatusBadge } from './status-badge';

type HistoryDetailSheetProps = {
  entry: HistoryEntry | null;
  onClose: () => void;
};

function explanation(entry: HistoryEntry): string {
  const status: HistoryStatus = entry.status;

  switch (status) {
    case 'present':
      return entry.wasApproved
        ? 'O professor revisou seu registro e aprovou a presença.'
        : 'Sua presença foi confirmada dentro do raio da sala.';
    case 'review':
      return 'Seu registro ficou fora da validação automática (por exemplo, fora do raio da sala). O professor vai revisar e o resultado aparece aqui.';
    case 'rejected':
      return 'O professor revisou o registro e não aceitou a presença. Se acha que houve engano, fale com ele.';
    case 'absent':
      return 'Você não confirmou presença nesta chamada. Se foi um engano, fale com o professor.';
    case 'cancelled':
      return 'O professor cancelou esta chamada, então ela não entra na sua frequência.';
    case 'live':
      return 'Esta chamada está aberta agora. Confirme sua presença antes que ela feche.';
  }
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-baseline justify-between py-3 border-b border-border">
      <Text className="font-sans-semibold text-label text-muted">{label}</Text>
      <Text className="font-sans-semibold text-body text-ink">{value}</Text>
    </View>
  );
}

export function HistoryDetailSheet({ entry, onClose }: HistoryDetailSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Mantém o último conteúdo durante a animação de saída do sheet.
  const lastEntry = useRef<HistoryEntry | null>(entry);
  if (entry) lastEntry.current = entry;
  const shown = entry ?? lastEntry.current;

  return (
    <Modal
      visible={entry !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar detalhes"
          onPress={onClose}
          className="absolute inset-0 bg-ink/50"
        />

        {shown ? (
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
            className="bg-paper rounded-t-lg px-6 pt-3"
          >
            <View className="self-center w-10 h-1 rounded-full bg-border mb-5" />

            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1">
                <Text className="font-sans-extrabold tracking-tight text-heading text-ink">
                  {shown.discipline}
                </Text>
                <Text className="font-sans-medium text-label text-muted">{shown.classLabel}</Text>
              </View>
              <StatusBadge status={shown.status} />
            </View>

            <Text className="font-sans text-body text-ink pt-4 pb-3">{explanation(shown)}</Text>

            <View className="border-t border-border">
              <DetailLine label="Data" value={shown.fullDate} />
              <DetailLine label="Chamada aberta às" value={shown.time} />
              {shown.confirmedTime ? (
                <DetailLine label="Você confirmou às" value={shown.confirmedTime} />
              ) : null}
            </View>

            <View className="pt-5 gap-2">
              {shown.status === 'live' ? (
                <Button
                  onPress={() => {
                    onClose();
                    router.push('/chamada');
                  }}
                >
                  Confirmar presença
                </Button>
              ) : null}
              <Button variant="outline" onPress={onClose}>
                Fechar
              </Button>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
