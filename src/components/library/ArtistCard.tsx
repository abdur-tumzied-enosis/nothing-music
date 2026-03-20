import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';
import { Artist } from '@/store/types';

interface ArtistCardProps {
  artist: Artist;
  onPress?: () => void;
}

export function ArtistCard({ artist, onPress }: ArtistCardProps) {
  const { colors } = useTheme();

  const subtitle = [
    `${artist.albumCount} ${artist.albumCount === 1 ? 'album' : 'albums'}`,
    `${artist.trackCount} ${artist.trackCount === 1 ? 'track' : 'tracks'}`,
  ].join(' · ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      {/* Avatar placeholder */}
      <View style={[styles.avatar, { backgroundColor: colors.surfaceRaised }]}>
        <NText variant="caption" color="disabled" ndot>
          {artist.name.charAt(0).toUpperCase()}
        </NText>
      </View>

      <View style={styles.meta}>
        <NText variant="body" color="primary" numberOfLines={1} style={styles.name}>
          {artist.name}
        </NText>
        <NText variant="caption" color="secondary" numberOfLines={1}>
          {subtitle}
        </NText>
      </View>
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  name: {
    letterSpacing: -0.3,
  },
});
