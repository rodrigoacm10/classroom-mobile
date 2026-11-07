import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { ApiError } from '@/lib/api-client';
import { formatRemaining } from '@/lib/utils';
import {
  getStudentActiveSessions,
  confirmStudentAttendance,
  type StudentActiveSessionResponse,
} from '@/services/student';
import {
  getStudentDeviceLocation,
  getDeviceMetadata,
  LocationServiceError,
} from '@/lib/location';
import { getOrCreateDeviceId } from '@/lib/storage';

export default function ChamadaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string }>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSession, setActiveSession] = useState<StudentActiveSessionResponse | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingPhase, setSubmittingPhase] = useState<'idle' | 'location' | 'sending'>('idle');
  const [confirmed, setConfirmed] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const loadSession = useCallback(async () => {
    try {
      const sessions = await getStudentActiveSessions();
      let target: StudentActiveSessionResponse | null = null;

      if (params.sessionId) {
        target = sessions.find((s) => s.session_id === params.sessionId) ?? null;
      }
      if (!target) {
        target = sessions.find((s) => !s.already_confirmed) ?? sessions[0] ?? null;
      }

      setActiveSession(target);
      if (target?.already_confirmed) {
        setConfirmed(true);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/login');
        return;
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.sessionId, router]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Atualiza contador a cada 1 segundo
  useEffect(() => {
    if (!activeSession) return;

    const updateTimer = () => {
      setTimeRemaining(formatRemaining(activeSession.expires_at));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // Cursor piscante
  useEffect(() => {
    const timer = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  const handleDigitChange = (val: string, index: number) => {
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const newDigits = [...digits];
    newDigits[index] = cleaned.slice(-1);
    setDigits(newDigits);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    }
  };

  const handleEvidencePress = () => {
    if (evidencePhoto) {
      Alert.alert(
        'Evidência anexada',
        'Deseja remover ou substituir a foto de evidência?',
        [
          {
            text: 'Remover',
            style: 'destructive',
            onPress: () => setEvidencePhoto(null),
          },
          {
            text: 'Substituir foto',
            onPress: () => setEvidencePhoto('evidencia_presenca.jpg'),
          },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Adicionar foto de evidência',
        'Opcional para fins de auditoria quando solicitado pelo professor.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Anexar foto',
            onPress: () => setEvidencePhoto('evidencia_presenca.jpg'),
          },
        ]
      );
    }
  };

  const handleConfirm = async () => {
    if (!activeSession) return;

    const code = digits.join('').toUpperCase();
    if (code.length < 6) {
      Alert.alert('Código incompleto', 'Por favor, digite os 6 caracteres do código da aula.');
      return;
    }

    setSubmitting(true);
    setSubmittingPhase('location');

    try {
      // 1. Obtém a localização GPS real do aluno com alta precisão
      const loc = await getStudentDeviceLocation();

      // 2. Coleta identificador seguro e metadados do aparelho
      setSubmittingPhase('sending');
      const deviceId = await getOrCreateDeviceId();
      const deviceInfo = getDeviceMetadata();

      // 3. Envia para a API validar código e raio da sala
      const record = await confirmStudentAttendance(
        activeSession.subject_class_id,
        activeSession.session_id,
        {
          day_code: code,
          latitude: loc.latitude,
          longitude: loc.longitude,
          gps_accuracy_meters: loc.accuracy ?? 5.0,
          device_id: deviceId,
          device_info: deviceInfo,
        },
      );

      setConfirmed(true);

      if (!record.within_radius) {
        Alert.alert(
          'Presença em análise',
          `Sua presença foi confirmada a aproximadamente ${Math.round(
            record.distance_meters,
          )}m da sala. Como ultrapassou o raio permitido, ela foi marcada como irregular para revisão do professor.`,
        );
      } else {
        Alert.alert('Sucesso!', 'Sua presença foi confirmada dentro da sala de aula com sucesso.');
      }
    } catch (err) {
      if (err instanceof LocationServiceError) {
        Alert.alert('Localização necessária', err.message);
      } else if (err instanceof ApiError) {
        Alert.alert('Atenção', err.message);
      } else if (err instanceof Error) {
        Alert.alert('Atenção', err.message);
      } else {
        Alert.alert('Atenção', 'Não foi possível confirmar a presença.');
      }
    } finally {
      setSubmitting(false);
      setSubmittingPhase('idle');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-paper items-center justify-center">
        <ActivityIndicator size="large" color="#18191B" />
      </SafeAreaView>
    );
  }

  // Estado vazio: Nenhuma chamada aberta no momento
  if (!activeSession) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadSession();
              }}
              tintColor="#18191B"
            />
          }
        >
          <View className="w-16 h-16 rounded-2xl bg-surface items-center justify-center mb-4">
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={9} stroke="#5C5E63" strokeWidth={1.8} />
              <Path d="M12 7v5l3 3" stroke="#5C5E63" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </View>
          <Text className="font-sans-bold text-heading text-ink text-center mb-2">
            Nenhuma chamada aberta
          </Text>
          <Text className="font-sans text-body text-muted text-center mb-6 max-w-[280px]">
            Não há nenhuma chamada ativa para as suas turmas no momento. Quando o professor abrir, ela aparecerá aqui.
          </Text>
          <Pressable
            onPress={() => {
              setLoading(true);
              loadSession();
            }}
            className="h-11 px-6 rounded-xl bg-ink items-center justify-center active:opacity-80"
          >
            <Text className="font-sans-bold text-paper text-body">Atualizar</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const classLabel = [activeSession.subject_class_name, activeSession.room_name]
    .filter(Boolean)
    .join(' · ');

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadSession();
            }}
            tintColor="#18191B"
          />
        }
      >
        {/* Navigation Header */}
        <View className="flex-row items-center pt-2 pb-3 px-5 gap-3">
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(aluno)/(tabs)');
              }
            }}
            hitSlop={8}
            className="w-9 h-9 items-center justify-center -ml-1 active:opacity-60"
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path
                d="M12.5 4.5L7 10l5.5 5.5"
                stroke="#18191B"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>

          <View className="flex-1 gap-0.5">
            <Text className="font-sans-semibold uppercase tracking-caps text-caption text-muted">
              {timeRemaining ? `Fecha em ${timeRemaining}` : 'Chamada aberta'}
            </Text>
            <Text className="font-sans-extrabold tracking-tight text-heading text-ink">
              Confirmar presença
            </Text>
          </View>
        </View>

        {/* Class details */}
        <View className="pb-4 gap-1 px-5">
          <Text className="font-sans-bold text-ink text-body">
            {activeSession.discipline_name || activeSession.subject_class_name}
          </Text>
          <Text className="font-sans-medium text-muted text-caption">
            {classLabel}
          </Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/turma/[id]',
                params: { id: activeSession.subject_class_id },
              })
            }
            hitSlop={6}
            className="flex-row items-center gap-1 mt-0.5 active:opacity-70 self-start"
          >
            <Text className="font-sans-semibold text-caption text-ink underline">
              Ver frequência e detalhes da turma →
            </Text>
          </Pressable>
        </View>

        {/* Status / Geo Card */}
        <View className="pb-4 px-5">
          <View
            className={`flex-row items-center w-full py-[14px] px-4 rounded-2xl gap-[14px] ${
              confirmed ? 'bg-success-surface' : 'bg-surface'
            }`}
          >
            <View
              className={`w-[48px] h-[48px] shrink-0 items-center justify-center rounded-full bg-paper border-2 ${
                confirmed ? 'border-success' : 'border-border'
              }`}
            >
              <View
                className={`w-[14px] h-[14px] rounded-full shrink-0 ${
                  confirmed ? 'bg-success' : 'bg-ink'
                }`}
              />
            </View>
            <View className="flex-1 gap-0.5">
              <Text
                className={`font-sans-bold text-body ${
                  confirmed ? 'text-success' : 'text-ink'
                }`}
              >
                {confirmed ? 'Presença confirmada' : 'Aguardando validação'}
              </Text>
              <Text className="font-sans-medium text-muted text-caption">
                {confirmed
                  ? 'Sua presença já foi registrada nesta chamada'
                  : activeSession.room_name
                  ? `Validação de GPS ativa para ${activeSession.room_name}`
                  : 'Validação de código e geolocalização ativa'}
              </Text>
            </View>
          </View>
        </View>

        {/* Code Section */}
        {!confirmed ? (
          <View className="pt-1 pb-5 gap-3 px-5">
            <View className="gap-1">
              <Text className="font-sans-bold text-ink text-body">
                Código do dia
              </Text>
              <Text className="font-sans text-muted text-caption">
                Digite os 6 caracteres que o professor exibiu
              </Text>
            </View>

            <View className="flex-row justify-between w-full gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const isFocused = focusedIndex === index;
                const hasValue = !!digits[index];

                const boxBorderClass = isFocused
                  ? 'bg-accent-surface border-accent'
                  : 'bg-paper border-border';

                return (
                  <Pressable
                    key={index}
                    onPress={() => {
                      inputRefs.current[index]?.focus();
                      setFocusedIndex(index);
                    }}
                    className={`flex-1 h-[70px] rounded-xl items-center justify-center border-2 ${boxBorderClass}`}
                  >
                    {isFocused && !hasValue ? (
                      <View
                        className={`w-[2px] h-[24px] rounded-[1px] bg-ink ${
                          cursorVisible ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    ) : hasValue ? (
                      <Text className="font-mono-bold text-[24px] text-ink">
                        {digits[index]}
                      </Text>
                    ) : null}

                    <TextInput
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      value={digits[index]}
                      onChangeText={(val) => handleDigitChange(val, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => {
                        if (focusedIndex === index) {
                          setFocusedIndex(null);
                        }
                      }}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={1}
                      selectTextOnFocus
                      caretHidden
                      className="absolute inset-0 opacity-0"
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Evidence Section */}
        {!confirmed ? (
          <View className="pb-4 gap-[10px] px-5">
            <Text className="font-sans-bold text-ink text-body">
              Evidência
            </Text>

            <Pressable
              onPress={handleEvidencePress}
              style={{ borderStyle: 'dashed' }}
              className="flex-row items-center w-full py-[14px] px-4 rounded-2xl gap-[14px] border-[1.5px] border-border bg-paper active:bg-surface"
            >
              <View className="w-11 h-11 shrink-0 items-center justify-center rounded-[12px] bg-surface">
                <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
                  <Rect
                    x={3}
                    y={6}
                    width={16}
                    height={13}
                    rx={2}
                    stroke="#18191B"
                    strokeWidth={1.6}
                  />
                  <Path
                    d="M8 6l1.3-2h3.4L14 6"
                    stroke="#18191B"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                  />
                  <Circle
                    cx={11}
                    cy={12.5}
                    r={2.6}
                    stroke="#18191B"
                    strokeWidth={1.6}
                  />
                </Svg>
              </View>

              <View className="flex-1 gap-0.5">
                <Text className="font-sans-semibold text-ink text-[14px] leading-[20px]">
                  {evidencePhoto ? 'evidencia_presenca.jpg' : 'Adicionar foto'}
                </Text>
                <Text className="font-sans text-muted text-caption">
                  {evidencePhoto
                    ? 'Foto anexada · Toque para alterar'
                    : 'Opcional · só se pedirem auditoria'}
                </Text>
              </View>

              <Text className="font-sans-bold text-ink text-caption shrink-0">
                {evidencePhoto ? 'Alterar' : 'Abrir'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Submit Button & Disclaimer */}
        <View className="pt-2 pb-8 gap-[10px] px-5">
          {!confirmed ? (
            <Pressable
              onPress={handleConfirm}
              disabled={submitting}
              className="w-full h-[52px] rounded-2xl items-center justify-center bg-ink active:opacity-90 disabled:opacity-60"
              accessibilityRole="button"
              accessibilityLabel="Confirmar presença"
            >
              {submitting ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text className="font-sans-bold text-paper text-body">
                    {submittingPhase === 'location' ? 'Obtendo GPS…' : 'Validando presença…'}
                  </Text>
                </View>
              ) : (
                <Text className="font-sans-bold text-paper text-body">
                  Confirmar presença
                </Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.replace('/(aluno)/(tabs)')}
              className="w-full h-[52px] rounded-2xl items-center justify-center bg-surface border border-border active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Voltar ao início"
            >
              <Text className="font-sans-bold text-ink text-body">
                Voltar para o início
              </Text>
            </Pressable>
          )}

          <Text className="font-sans text-muted text-caption">
            A confirmação valida código do dia e geolocalização no raio da sala.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
