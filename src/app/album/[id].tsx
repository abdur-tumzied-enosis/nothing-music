import { View, FlatList, StyleSheet, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';
import { NDivider } from '@/components/ui/NDivider';
import { ScreenFade } from '@/components/common/ScreenFade';
import { TrackRow } from '@/components/library/TrackRow';
import { Track } from '@/store/types';
import { formatTime } from '@/utils/formatTime';

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AlbumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  const album = useLibraryStore((s) => s.albums.find((a) => a.id === id));
  const allTracks = useLibraryStore((s) => s.tracks);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const play = usePlayerStore((s) => s.play);

  if (!album) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <NText variant="caption" color="secondary" uppercase>
            Album not found
          </NText>
        </View>
      </View>
    );
  }

  const tracks = allTracks.filter((t) => t.albumId === album.id);

  const handleTrackPress = (track: Track) => {
    play(track, tracks);
  };

  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);
  const totalMin = Math.floor(totalDuration / 60000);

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
        data={tracks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.albumHeader}>
            {/* Artwork */}
            <View
              style={[
                styles.artwork,
                { backgroundColor: colors.surfaceRaised },
              ]}
            >
              {album.artworkUri ? (
                <Image
                  source={{ uri: album.artworkUri }}
                  style={{ width: '100%', height: '100%', borderRadius: 8 }}
                />
              ) : (
                <NText variant="h1" color="disabled" ndot>
                  {album.title.charAt(0).toUpperCase()}
                </NText>
              )}
            </View>

            {/* Album meta */}
            <View style={styles.meta}>
              <NText variant="h3" numberOfLines={2} style={styles.title}>
                {album.title}
              </NText>
              <NText variant="body" color="secondary" numberOfLines={1}>
                {album.artist}
              </NText>
              <NText variant="caption" color="disabled" style={styles.stats}>
                {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} · {totalMin} min
              </NText>
            </View>

            {/* Play all button */}
            {tracks.length > 0 && (
              <Pressable
                onPress={() => handleTrackPress(tracks[0])}
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

            <NDivider style={styles.divider} />
          </View>
        }
        renderItem={({ item, index }) => (
          <TrackRow
            title={item.title}
            artist={item.artist}
            duration={formatDuration(item.duration)}
            trackNumber={item.trackNumber ?? (index + 1)}
            isPlaying={currentTrack?.id === item.id}
            onPress={() => handleTrackPress(item)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={styles.separator}>
            <NDivider />
          </View>
        )}
        contentContainerStyle={styles.listContent}
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
  albumHeader: {
    alignItems: 'center',
    paddingBottom: Spacing.s4,
  },
  artwork: {
    width: 200,
    height: 200,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    marginTop: Spacing.s4,
    alignItems: 'center',
    gap: Spacing.s1,
  },
  title: {
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  stats: {
    marginTop: Spacing.s1,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s2,
    marginTop: Spacing.s4,
    paddingVertical: Spacing.s2,
    paddingHorizontal: Spacing.s4,
    borderRadius: 6,
  },
  playAllLabel: {
    color: '#FFFFFF',
  },
  divider: {
    marginTop: Spacing.s4,
    width: '100%',
  },
  separator: {
    paddingHorizontal: Spacing.screenH,
  },
  listContent: {
    paddingBottom: Spacing.s8,
  },
});
