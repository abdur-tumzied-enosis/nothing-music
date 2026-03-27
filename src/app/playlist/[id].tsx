import { useState } from 'react';
import { View, FlatList, StyleSheet, Pressable, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';
import { NButton } from '@/components/ui/NButton';
import { NDivider } from '@/components/ui/NDivider';
import { ScreenFade } from '@/components/common/ScreenFade';
import { TrackRow } from '@/components/library/TrackRow';
import { EmptyState } from '@/components/common/EmptyState';
import { Track } from '@/store/types';

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  const playlist = useLibraryStore((s) => s.playlists.find((p) => p.id === id));
  const allTracks = useLibraryStore((s) => s.tracks);
  const removeFromPlaylist = useLibraryStore((s) => s.removeFromPlaylist);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const play = usePlayerStore((s) => s.play);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!playlist) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <NText variant="caption" color="secondary" uppercase>
            Playlist not found
          </NText>
        </View>
      </View>
    );
  }

  const playlistTracks = playlist.trackIds
    .map((tid) => allTracks.find((t) => t.id === tid))
    .filter((t): t is Track => t != null);

  const handleTrackPress = (track: Track) => {
    play(track, playlistTracks);
  };

  const handleRemoveTrack = (trackId: string) => {
    removeFromPlaylist(playlist.id, trackId);
  };

  const handleDeletePlaylist = () => {
    deletePlaylist(playlist.id);
    router.back();
  };

  const totalDuration = playlistTracks.reduce((sum, t) => sum + t.duration, 0);
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
        <Pressable
          onPress={() => setShowDeleteConfirm(true)}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather name="trash-2" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Playlist meta */}
      <View style={styles.playlistMeta}>
        <NText variant="h2" numberOfLines={2} style={styles.playlistName}>
          {playlist.name}
        </NText>
        <NText variant="caption" color="secondary">
          {playlistTracks.length} {playlistTracks.length === 1 ? 'track' : 'tracks'} · {totalMin} min
        </NText>
      </View>

      {/* Play all */}
      {playlistTracks.length > 0 && (
        <Pressable
          onPress={() => handleTrackPress(playlistTracks[0])}
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

      {/* Track list */}
      {playlistTracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState message="No tracks in this playlist" />
        </View>
      ) : (
        <FlatList
          data={playlistTracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.trackRowContainer}>
              <View style={styles.trackRowWrapper}>
                <TrackRow
                  title={item.title}
                  artist={item.artist}
                  duration={formatDuration(item.duration)}
                  trackNumber={index + 1}
                  isPlaying={currentTrack?.id === item.id}
                  onPress={() => handleTrackPress(item)}
                />
              </View>
              <Pressable
                onPress={() => handleRemoveTrack(item.id)}
                hitSlop={8}
                style={({ pressed }) => [styles.removeBtn, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Feather name="x" size={14} color={colors.textSecondary} />
              </Pressable>
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View style={styles.separator}>
              <NDivider />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <Modal transparent visible animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDeleteConfirm(false)}
          >
            <View
              style={[styles.modalBox, { backgroundColor: colors.surfaceRaised }]}
              onStartShouldSetResponder={() => true}
            >
              <NText variant="h3" style={styles.modalTitle}>
                Delete Playlist?
              </NText>
              <NText variant="body" color="secondary" style={styles.modalBody}>
                "{playlist.name}" will be removed permanently.
              </NText>
              <View style={styles.modalActions}>
                <NButton
                  label="Cancel"
                  variant="ghost"
                  size="sm"
                  onPress={() => setShowDeleteConfirm(false)}
                />
                <NButton
                  label="Delete"
                  variant="danger"
                  size="sm"
                  onPress={handleDeletePlaylist}
                />
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenH,
    paddingTop: Spacing.s4,
    paddingBottom: Spacing.s2,
  },
  playlistMeta: {
    paddingHorizontal: Spacing.screenH,
    paddingBottom: Spacing.s3,
    gap: Spacing.s1,
  },
  playlistName: {
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
  divider: {
    marginTop: Spacing.s3,
    marginBottom: Spacing.s2,
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: Spacing.s8,
  },
  separator: {
    paddingHorizontal: Spacing.screenH,
  },
  trackRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackRowWrapper: {
    flex: 1,
  },
  removeBtn: {
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: 280,
    borderRadius: 8,
    padding: Spacing.s5,
    gap: Spacing.s3,
  },
  modalTitle: {
    letterSpacing: -0.3,
  },
  modalBody: {},
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.s2,
    marginTop: Spacing.s2,
  },
});
