import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';
import { NDivider } from '@/components/ui/NDivider';
import { ScreenFade } from '@/components/common/ScreenFade';
import { SectionHeader } from '@/components/common/SectionHeader';
import { AlbumCard } from '@/components/library/AlbumCard';
import { TrackRow } from '@/components/library/TrackRow';
import { Track, Album } from '@/store/types';

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  const artist = useLibraryStore((s) => s.artists.find((a) => a.id === id));
  const allTracks = useLibraryStore((s) => s.tracks);
  const allAlbums = useLibraryStore((s) => s.albums);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const play = usePlayerStore((s) => s.play);

  if (!artist) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <NText variant="caption" color="secondary" uppercase>
            Artist not found
          </NText>
        </View>
      </View>
    );
  }

  const artistTracks = allTracks.filter((t) => t.artistId === artist.id);
  const artistAlbums = allAlbums.filter((a) => artistTracks.some((t) => t.albumId === a.id));

  // Group tracks by album for display
  const tracksByAlbum: Record<string, Track[]> = {};
  for (const track of artistTracks) {
    if (!tracksByAlbum[track.albumId]) {
      tracksByAlbum[track.albumId] = [];
    }
    tracksByAlbum[track.albumId].push(track);
  }

  const handleTrackPress = (track: Track) => {
    play(track, artistTracks);
  };

  const handleAlbumPress = (album: Album) => {
    router.push(`/album/${album.id}`);
  };

  const handlePlayAll = () => {
    if (artistTracks.length > 0) {
      play(artistTracks[0], artistTracks);
    }
  };

  return (
    <ScreenFade>
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => ''}
        ListHeaderComponent={
          <View>
            {/* Artist meta */}
            <View style={styles.artistMeta}>
              <NText variant="h2" numberOfLines={2} style={styles.artistName}>
                {artist.name}
              </NText>
              <NText variant="caption" color="secondary">
                {artist.albumCount} {artist.albumCount === 1 ? 'album' : 'albums'} ·{' '}
                {artist.trackCount} {artist.trackCount === 1 ? 'track' : 'tracks'}
              </NText>
            </View>

            {/* Play all */}
            {artistTracks.length > 0 && (
              <Pressable
                onPress={handlePlayAll}
                style={({ pressed }) => [
                  styles.playAllBtn,
                  { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Feather name="play" size={16} color="#FFFFFF" />
                <NText variant="micro" style={styles.playAllLabel} uppercase>
                  Play All
                </NText>
              </Pressable>
            )}

            {/* Albums section */}
            {artistAlbums.length > 0 && (
              <>
                <SectionHeader title="Albums" style={styles.sectionHeader} />
                <FlatList
                  data={artistAlbums}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.albumsList}
                  renderItem={({ item }) => (
                    <AlbumCard album={item} onPress={() => handleAlbumPress(item)} />
                  )}
                />
              </>
            )}

            {/* All tracks section */}
            <SectionHeader title="All Tracks" style={styles.sectionHeader} />
          </View>
        }
        renderItem={null}
        showsVerticalScrollIndicator={false}
      />

      {/* Separate FlatList for tracks so it scrolls independently */}
      <FlatList
        data={artistTracks}
        keyExtractor={(item) => item.id}
        style={styles.tracksList}
        renderItem={({ item, index }) => (
          <TrackRow
            title={item.title}
            artist={item.album}
            duration={formatDuration(item.duration)}
            trackNumber={item.trackNumber ?? undefined}
            isPlaying={currentTrack?.id === item.id}
            onPress={() => handleTrackPress(item)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={styles.separator}>
            <NDivider />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenH,
    paddingTop: Spacing.s4,
    paddingBottom: Spacing.s2,
  },
  artistMeta: {
    paddingHorizontal: Spacing.screenH,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s3,
    gap: Spacing.s1,
  },
  artistName: {
    letterSpacing: -0.5,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s2,
    marginHorizontal: Spacing.screenH,
    paddingVertical: Spacing.s2,
    paddingHorizontal: Spacing.s4,
    borderRadius: 6,
  },
  playAllLabel: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.screenH,
    paddingTop: Spacing.s4,
    paddingBottom: Spacing.s2,
  },
  albumsList: {
    paddingHorizontal: Spacing.screenH,
    paddingBottom: Spacing.s3,
    gap: Spacing.s3,
  },
  tracksList: {
    flex: 1,
  },
  separator: {
    paddingHorizontal: Spacing.screenH,
  },
});
