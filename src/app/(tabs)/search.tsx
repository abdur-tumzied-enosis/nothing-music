import { useState, useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';
import { NDivider } from '@/components/ui/NDivider';
import { SectionHeader } from '@/components/common/SectionHeader';
import { TrackRow } from '@/components/library/TrackRow';
import { AlbumCard } from '@/components/library/AlbumCard';
import { ArtistCard } from '@/components/library/ArtistCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Track, Album, Artist } from '@/store/types';

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type ResultSection = { type: 'tracks'; data: Track[] } | { type: 'albums'; data: Album[] } | { type: 'artists'; data: Artist[] };

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const tracks = useLibraryStore((s) => s.tracks);
  const albums = useLibraryStore((s) => s.albums);
  const artists = useLibraryStore((s) => s.artists);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const play = usePlayerStore((s) => s.play);

  const handleTrackPress = useCallback(
    (track: Track) => {
      play(track, tracks);
    },
    [play, tracks]
  );

  const handleAlbumPress = useCallback(
    (albumId: string) => {
      router.push(`/album/${albumId}`);
    },
    [router]
  );

  const handleArtistPress = useCallback(
    (artistId: string) => {
      router.push(`/artist/${artistId}`);
    },
    [router]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return [];

    const matchedTracks = tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );

    const matchedAlbums = albums.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q)
    );

    const matchedArtists = artists.filter(
      (a) => a.name.toLowerCase().includes(q)
    );

    const sections: ResultSection[] = [];
    if (matchedTracks.length > 0) sections.push({ type: 'tracks', data: matchedTracks });
    if (matchedAlbums.length > 0) sections.push({ type: 'albums', data: matchedAlbums });
    if (matchedArtists.length > 0) sections.push({ type: 'artists', data: matchedArtists });

    return sections;
  }, [query, tracks, albums, artists]);

  const isEmpty = query.trim().length > 0 && results.length === 0;
  const hasQuery = query.trim().length > 0;

  const renderSection = ({ item }: { item: ResultSection }) => {
    if (item.type === 'tracks') {
      return (
        <View>
          <SectionHeader title="Tracks" style={styles.sectionHeader} />
          {item.data.slice(0, 5).map((track) => (
            <TrackRow
              key={track.id}
              title={track.title}
              artist={track.artist}
              duration={formatDuration(track.duration)}
              trackNumber={track.trackNumber ?? undefined}
              isPlaying={currentTrack?.id === track.id}
              onPress={() => handleTrackPress(track)}
            />
          ))}
          {item.data.length > 5 && (
            <NText variant="caption" color="secondary" style={styles.showMore}>
              + {item.data.length - 5} more tracks
            </NText>
          )}
        </View>
      );
    }

    if (item.type === 'albums') {
      return (
        <View>
          <SectionHeader title="Albums" style={styles.sectionHeader} />
          <FlatList
            data={item.data.slice(0, 4)}
            keyExtractor={(a) => a.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.albumsRow}
            renderItem={({ item: album }) => (
              <AlbumCard album={album} onPress={() => handleAlbumPress(album.id)} />
            )}
          />
        </View>
      );
    }

    // artists
    return (
      <View>
        <SectionHeader title="Artists" style={styles.sectionHeader} />
        {item.data.slice(0, 5).map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onPress={() => handleArtistPress(artist.id)}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <NText variant="caption" color="secondary" uppercase>
          Search
        </NText>
      </View>

      {/* Search input */}
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Feather name="search" size={16} color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tracks, albums, artists"
          placeholderTextColor={colors.textDisabled}
          style={[styles.input, { color: colors.textPrimary }]}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Feather name="x" size={14} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <NDivider />

      {/* Results */}
      {!hasQuery ? (
        <View style={styles.promptContainer}>
          <NText variant="caption" color="secondary" uppercase>
            Search your music
          </NText>
        </View>
      ) : isEmpty ? (
        <View style={styles.emptyContainer}>
          <EmptyState message={`No results for "${query}"`} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.type}
          renderItem={renderSection}
          ItemSeparatorComponent={() => <View style={styles.sectionGap} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.screenH,
    paddingTop: Spacing.s4,
    paddingBottom: Spacing.s3,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.screenH,
    marginBottom: Spacing.s3,
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s2,
    borderRadius: 6,
    borderWidth: 1,
    gap: Spacing.s2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  promptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: Spacing.s2,
    paddingBottom: Spacing.s8,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.screenH,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s1,
  },
  sectionGap: {
    height: Spacing.s2,
  },
  albumsRow: {
    paddingHorizontal: Spacing.screenH,
    paddingBottom: Spacing.s2,
  },
  showMore: {
    paddingHorizontal: Spacing.screenH,
    paddingVertical: Spacing.s2,
  },
});
