import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/global';

export default function ChamadaScreen() {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const inputRefs = React.useRef<Array<TextInput | null>>([]);

  const handleDigitChange = (val: string, index: number) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    const newDigits = [...digits];
    newDigits[index] = cleaned.slice(-1);
    setDigits(newDigits);

    if (cleaned && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    const code = digits.join('');
    if (code.length < 4) {
      Alert.alert('Código incompleto', 'Por favor, digite os 4 dígitos do código da aula.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setConfirmed(true);
      setTimeout(() => {
        setConfirmed(false);
        setDigits(['', '', '', '']);
      }, 2500);
    }, 800);
  };

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader
          kicker="FECHA EM 08:12"
          title="Confirmar presença"
          borderBottom
          className="px-0"
        />

        {/* Class details */}
        <View className="py-4 border-b border-border">
          <Text className="font-sans-bold text-heading text-ink">
            Algoritmos e Estruturas de Dados
          </Text>
          <Text className="font-sans text-body text-muted mt-0.5">
            T01 · Lab 204 · Profª Ana Ribeiro
          </Text>
        </View>

        {/* Geo Radar Card */}
        <View className="mt-5 p-4 rounded-md bg-surface border border-border flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full bg-success-surface items-center justify-center">
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="9" stroke="#1E7A44" strokeWidth="2" />
              <Circle cx="12" cy="12" r="4" stroke="#1E7A44" strokeWidth="2" />
              <Circle cx="12" cy="12" r="1.5" fill="#1E7A44" />
            </Svg>
          </View>
          <View className="flex-1">
            <Text className="font-sans-bold text-body text-ink">
              Dentro do raio da sala
            </Text>
            <Text className="font-sans text-caption text-muted mt-0.5">
              Precisão GPS ~6m · Sala conectada
            </Text>
          </View>
        </View>

        {/* Code Section */}
        <View className="mt-6">
          <Text className="font-sans-bold text-body text-ink">
            Código do dia
          </Text>
          <Text className="font-sans text-caption text-muted mt-0.5">
            Digite os 4 dígitos que o professor exibiu
          </Text>

          <View className="flex-row justify-between gap-3 mt-4">
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                className={`flex-1 h-20 rounded-md items-center justify-center border-2 ${
                  digits[index] ? 'border-ink bg-paper' : 'border-border bg-surface'
                }`}
              >
                <TextInput
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  value={digits[index]}
                  onChangeText={(val) => handleDigitChange(val, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  className="w-full h-full text-center font-mono-bold text-[36px] text-ink"
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>
        </View>

        {confirmed && (
          <View className="mt-6 p-4 rounded-md bg-success-surface border border-success items-center">
            <Text className="font-sans-bold text-body text-success">
              ✓ Presença confirmada com sucesso!
            </Text>
          </View>
        )}

        {/* Footer Actions */}
        <View className="mt-8 gap-3 pb-8">
          <Button
            variant="ink"
            size="lg"
            onPress={handleConfirm}
            disabled={submitting || confirmed}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : confirmed ? (
              'Confirmado!'
            ) : (
              'Confirmar presença'
            )}
          </Button>

          <Text className="font-sans text-caption text-muted text-center">
            A confirmação só é validada com o código correto e GPS dentro do raio da sala.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
