import { View, StyleSheet, Pressable, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { usePlayerStore } from '@/store/playerStore';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';
import { DotProgress } from '@/components/player/DotProgress';
import { formatTime } from '@/utils/formatTime';

const { width } = Dimensions.get('window');
const ART_SIZE = width - Spacing.screenH * 2;

export default function PlayerScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);

  const pause = usePlayerStore((s) => s.pause);
  const resume = usePlayerStore((s) => s.resume);
  const seek = usePlayerStore((s) => s.seek);
  const skipNext = usePlayerStore((s) => s.skipNext);
  const skipPrev = usePlayerStore((s) => s.skipPrev);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);

  if (!currentTrack) {
    router.back();
    return null;
  }

  const shuffleColor = shuffle ? colors.accent : colors.textSecondary;
  const repeatColor = repeat !== 'none' ? colors.accent : colors.textSecondary;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather name="chevron-down" size={24} color={colors.textSecondary} />
        </Pressable>
        <NText variant="caption" color="secondary" uppercase>
          Now Playing
        </NText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Album art */}
      <View
        style={[
          styles.art,
          {
            width: ART_SIZE,
            height: ART_SIZE,
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.border,
          },
        ]}
      >
        {currentTrack.artworkUri ? (
          <Image
            source={{ uri: currentTrack.artworkUri }}
            style={{ width: '100%', height: '100%', borderRadius: 8 }}
          />
        ) : null}
      </View>

      {/* Track metadata */}
      <View style={styles.meta}>
        <NText variant="h2" numberOfLines={1} style={styles.trackTitle}>
          {currentTrack.title}
        </NText>
        <NText variant="body" color="secondary" numberOfLines={1}>
          {currentTrack.artist}
        </NText>
      </View>

      {/* Seek section */}
      <View style={styles.seekSection}>
        <DotProgress position={position} duration={duration} onSeek={seek} />
        <View style={styles.timestamps}>
          <NText variant="caption" color="disabled" ndot>
            {formatTime(position)}
          </NText>
          <NText variant="caption" color="disabled" ndot>
            {formatTime(duration)}
          </NText>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Shuffle */}
        <Pressable
          onPress={toggleShuffle}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather name="shuffle" size={20} color={shuffleColor} />
        </Pressable>

        {/* Skip previous */}
        <Pressable
          onPress={skipPrev}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather name="skip-back" size={28} color={colors.textPrimary} />
        </Pressable>

        {/* Play / Pause — the ONE accent element */}
        <Pressable
          onPress={() => (isPlaying ? pause() : resume())}
          style={({ pressed }) => [
            styles.playBtn,
            { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name={isPlaying ? 'pause' : 'play'} size={28} color="#FFFFFF" />
        </Pressable>

        {/* Skip next */}
        <Pressable
          onPress={skipNext}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather name="skip-forward" size={28} color={colors.textPrimary} />
        </Pressable>

        {/* Repeat */}
        <Pressable
          onPress={cycleRepeat}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <View>
            <Feather name="repeat" size={20} color={repeatColor} />
            {repeat === 'one' && (
              <View style={[styles.repeatOneBadge, { backgroundColor: colors.accent }]}>
                <NText variant="micro" style={styles.repeatOneText}>
                  1
                </NText>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.screenH,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.s4,
  },
  headerSpacer: {
    width: 24,
  },
  art: {
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: Spacing.s5,
  },
  meta: {
    marginTop: Spacing.s5,
    gap: Spacing.s1,
  },
  trackTitle: {
    letterSpacing: -0.5,
  },
  seekSection: {
    marginTop: Spacing.s5,
  },
  timestamps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.s6,
    paddingHorizontal: Spacing.s2,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneBadge: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    width: 12,
    height: 12,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneText: {
    fontSize: 8,
    color: '#FFFFFF',
  },
});
