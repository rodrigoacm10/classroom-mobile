import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-paper items-center justify-center p-6">
      <View className="items-center gap-3">
        {/* Logo Locus */}
        <View className="flex-row items-center gap-2.5">
          <View className="w-7 h-7 rounded-sm bg-accent items-center justify-center">
            <View className="w-2.5 h-2.5 rounded-full bg-ink" />
          </View>
          <Text className="font-sans-black text-title text-ink tracking-tight">
            Locus
          </Text>
        </View>

        <Text className="font-sans-bold text-section-sm text-ink text-center mt-2">
          Olá mundo!
        </Text>

        <Text className="font-sans text-body text-muted text-center max-w-[280px]">
          Design system sincronizado com a versão web. Tokens de cores, tipografia e NativeWind configurados.
        </Text>

        <View className="flex-row items-center gap-2 mt-4 px-3 py-1.5 rounded-md bg-surface border border-border">
          <Text className="font-mono text-caption text-ink">
            Archivo & IBM Plex Mono
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
