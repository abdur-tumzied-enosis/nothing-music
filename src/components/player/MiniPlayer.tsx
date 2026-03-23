import { View, Pressable, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { usePlayerStore } from '@/store/playerStore';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';

export function MiniPlayer() {
  const { colors } = useTheme();
  const router = useRouter();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const pause = usePlayerStore((s) => s.pause);
  const resume = usePlayerStore((s) => s.resume);

  const translateY = useSharedValue(64);

  useEffect(() => {
    if (currentTrack) {
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.2, 0, 0, 1),
      });
    }
  }, [currentTrack?.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!currentTrack) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <Animated.View style={[animatedStyle, { backgroundColor: colors.surface }]}>
      {/* Thin progress line */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.textPrimary, width: `${progress * 100}%` },
          ]}
        />
      </View>

      <View style={[styles.row, { borderTopColor: colors.border }]}>
        {/* Art + meta — tap opens full player */}
        <Pressable
          onPress={() => router.push('/player')}
          style={({ pressed }) => [styles.info, { opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={[styles.art, { backgroundColor: colors.surfaceRaised }]} />
          <View style={styles.meta}>
            <NText variant="body" numberOfLines={1} style={styles.title}>
              {currentTrack.title}
            </NText>
            <NText variant="caption" color="secondary" numberOfLines={1}>
              {currentTrack.artist}
            </NText>
          </View>
        </Pressable>

        {/* Play / Pause */}
        <Pressable
          onPress={() => (isPlaying ? pause() : resume())}
          hitSlop={8}
          style={({ pressed }) => [styles.playBtn, { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 }]}
        >
          <Feather name={isPlaying ? 'pause' : 'play'} size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 1,
  },
  progressFill: {
    height: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenH,
    paddingVertical: Spacing.s3,
    gap: Spacing.s3,
    borderTopWidth: 1,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
  },
  art: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    letterSpacing: -0.3,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
