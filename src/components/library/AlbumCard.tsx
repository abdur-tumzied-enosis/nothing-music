import { memo } from 'react';
import { Pressable, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';
import { Album } from '@/store/types';

interface AlbumCardProps {
  album: Album;
  onPress?: () => void;
}

export const AlbumCard = memo(function AlbumCard({ album, onPress }: AlbumCardProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = (width - Spacing.screenH * 2 - Spacing.s3) / 2;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.6 : 1, width: cardWidth }]}
    >
      {/* Artwork placeholder */}
      <View
        style={[
          styles.artwork,
          { width: cardWidth, height: cardWidth, backgroundColor: colors.surfaceRaised },
        ]}
      >
        <NText variant="h2" color="disabled" ndot>
          {album.title.charAt(0).toUpperCase()}
        </NText>
      </View>

      <View style={styles.meta}>
        <NText variant="body" color="primary" numberOfLines={1} style={styles.title}>
          {album.title}
        </NText>
        <NText variant="caption" color="secondary" numberOfLines={1}>
          {album.trackCount} {album.trackCount === 1 ? 'track' : 'tracks'}
        </NText>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: Spacing.s2,
  },
  artwork: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    gap: 2,
  },
  title: {
    letterSpacing: -0.3,
  },
});
