import { memo } from 'react';
import { Pressable, View, StyleSheet, useWindowDimensions, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useLibraryStore } from '@/store/libraryStore';
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

  const allTracks = useLibraryStore((s) => s.tracks);
  const getArtwork = useLibraryStore((s) => s.getArtwork);
  const [artworkUri, setArtworkUri] = useState<string | null>(null);

  useEffect(() => {
    const firstTrack = allTracks.find((t) => t.albumId === album.id);
    if (firstTrack) {
      getArtwork(firstTrack.id).then(setArtworkUri);
    }
  }, [album.id]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.6 : 1, width: cardWidth }]}
    >
      {/* Artwork */}
      <View
        style={[
          styles.artwork,
          { width: cardWidth, height: cardWidth, backgroundColor: colors.surfaceRaised },
        ]}
      >
        {artworkUri ? (
          <Image source={{ uri: artworkUri }} style={{ width: '100%', height: '100%', borderRadius: 4 }} />
        ) : (
          <NText variant="h2" color="disabled" ndot>
            {album.title.charAt(0).toUpperCase()}
          </NText>
        )}
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
