import { Pressable, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';

interface TrackRowProps {
  title: string;
  artist: string;
  duration: string; // pre-formatted mm:ss
  trackNumber?: number;
  isPlaying?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function TrackRow({
  title,
  artist,
  duration,
  trackNumber,
  isPlaying = false,
  onPress,
  style,
}: TrackRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: isPlaying ? colors.surfaceRaised : 'transparent',
          opacity: pressed ? 0.6 : 1,
        },
        style,
      ]}
    >
      {/* Track number / playing indicator */}
      <View style={styles.leading}>
        {isPlaying ? (
          <Feather name="volume-2" size={14} color={colors.accent} />
        ) : trackNumber != null ? (
          <NText variant="micro" color="disabled" ndot>
            {String(trackNumber).padStart(2, '0')}
          </NText>
        ) : (
          <NText variant="micro" color="disabled">
            {'—'}
          </NText>
        )}
      </View>

      {/* Title + artist */}
      <View style={styles.meta}>
        <NText
          variant="body"
          color={isPlaying ? 'accent' : 'primary'}
          numberOfLines={1}
          style={styles.title}
        >
          {title}
        </NText>
        <NText variant="caption" color="secondary" numberOfLines={1}>
          {artist}
        </NText>
      </View>

      {/* Duration */}
      <NText variant="caption" color="disabled" ndot>
        {duration}
      </NText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenH,
    paddingVertical: Spacing.s3,
    gap: Spacing.s3,
  },
  leading: {
    width: 24,
    alignItems: 'center',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    letterSpacing: -0.3,
  },
});
