import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';
import { NChip } from '@/components/ui/NChip';
import { NDivider } from '@/components/ui/NDivider';
import { NButton } from '@/components/ui/NButton';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingDots } from '@/components/common/LoadingDots';
import { SectionHeader } from '@/components/common/SectionHeader';
import { TrackRow } from '@/components/library/TrackRow';
import { AlbumCard } from '@/components/library/AlbumCard';
import { ArtistCard } from '@/components/library/ArtistCard';
import { Track } from '@/store/types';

type Tab = 'tracks' | 'albums' | 'artists';

const TABS: { key: Tab; label: string }[] = [
  { key: 'tracks', label: 'Tracks' },
  { key: 'albums', label: 'Albums' },
  { key: 'artists', label: 'Artists' },
];

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LibraryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('tracks');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  const tracks = useLibraryStore((s) => s.tracks);
  const albums = useLibraryStore((s) => s.albums);
  const artists = useLibraryStore((s) => s.artists);
  const playlists = useLibraryStore((s) => s.playlists);
  const isScanning = useLibraryStore((s) => s.isScanning);
  const permissionDenied = useLibraryStore((s) => s.permissionDenied);
  const scanError = useLibraryStore((s) => s.scanError);
  const scanLibrary = useLibraryStore((s) => s.scanLibrary);
  const addPlaylist = useLibraryStore((s) => s.addPlaylist);
  const addToPlaylist = useLibraryStore((s) => s.addToPlaylist);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const recentlyPlayed = usePlayerStore((s) => s.recentlyPlayed);
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

  const handlePlaylistPress = useCallback(
    (playlistId: string) => {
      router.push(`/playlist/${playlistId}`);
    },
    [router]
  );

  const handleCreatePlaylist = useCallback(() => {
    const name = newPlaylistName.trim();
    if (!name) return;
    addPlaylist(name);
    setNewPlaylistName('');
    setShowCreateModal(false);
  }, [newPlaylistName, addPlaylist]);

  const handleAddToPlaylist = useCallback(
    (trackId: string) => {
      setSelectedTrackId(trackId);
      setShowAddToPlaylist(true);
    },
    []
  );

  const handleConfirmAddToPlaylist = useCallback(
    (playlistId: string) => {
      if (selectedTrackId) {
        addToPlaylist(playlistId, selectedTrackId);
      }
      setShowAddToPlaylist(false);
      setSelectedTrackId(null);
    },
    [selectedTrackId, addToPlaylist]
  );

  const isEmpty = tracks.length === 0;

  const renderContent = () => {
    if (isScanning) {
      return (
        <View style={styles.center}>
          <LoadingDots />
          <NText variant="caption" color="secondary" uppercase style={styles.scanningLabel}>
            Scanning library
          </NText>
        </View>
      );
    }

    if (permissionDenied) {
      return (
        <EmptyState
          message={"Media permission required.\nA development build is needed to access audio files."}
          ctaLabel="Try Again"
          onCta={scanLibrary}
        />
      );
    }

    if (scanError) {
      return (
        <EmptyState
          message="Scan failed. Check storage permissions and try again."
          ctaLabel="Retry"
          onCta={scanLibrary}
        />
      );
    }

    if (isEmpty) {
      return (
        <EmptyState
          message="No music found on this device"
          ctaLabel="Scan Library"
          onCta={scanLibrary}
        />
      );
    }

    if (activeTab === 'tracks') {
      return (
        <FlatList
          key="tracks"
          data={tracks}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            recentlyPlayed.length > 0 ? (
              <View>
                <SectionHeader title="Recently Played" style={styles.sectionHeader} />
                <FlatList
                  data={recentlyPlayed}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentlyList}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handleTrackPress(item)}
                      style={({ pressed }) => [
                        styles.recentlyCard,
                        { backgroundColor: colors.surfaceRaised, opacity: pressed ? 0.6 : 1 },
                      ]}
                    >
                      <View style={[styles.recentlyArt, { backgroundColor: colors.border }]}>
                        <Feather name="music" size={16} color={colors.textSecondary} />
                      </View>
                      <NText variant="micro" numberOfLines={1} style={styles.recentlyTitle}>
                        {item.title}
                      </NText>
                      <NText variant="micro" color="secondary" numberOfLines={1}>
                        {item.artist}
                      </NText>
                    </Pressable>
                  )}
                />
                <SectionHeader title="All Tracks" style={styles.sectionHeader} />
              </View>
            ) : playlists.length > 0 ? (
              <View>
                <SectionHeader title="Playlists" style={styles.sectionHeader} />
                <View style={styles.playlistsRow}>
                  {playlists.slice(0, 5).map((pl) => (
                    <Pressable
                      key={pl.id}
                      onPress={() => handlePlaylistPress(pl.id)}
                      style={({ pressed }) => [
                        styles.playlistChip,
                        { backgroundColor: colors.surfaceRaised, opacity: pressed ? 0.6 : 1 },
                      ]}
                    >
                      <Feather name="list" size={12} color={colors.textSecondary} />
                      <NText variant="micro" color="secondary" numberOfLines={1} style={styles.playlistChipText}>
                        {pl.name}
                      </NText>
                    </Pressable>
                  ))}
                </View>
                <SectionHeader title="All Tracks" style={styles.sectionHeader} />
              </View>
            ) : (
              <SectionHeader title="All Tracks" style={styles.sectionHeader} />
            )
          }
          renderItem={({ item }) => (
            <TrackRow
              title={item.title}
              artist={item.artist}
              duration={formatDuration(item.duration)}
              trackNumber={item.trackNumber ?? undefined}
              isPlaying={currentTrack?.id === item.id}
              onPress={() => handleTrackPress(item)}
              onLongPress={() => handleAddToPlaylist(item.id)}
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
      );
    }

    if (activeTab === 'albums') {
      return (
        <FlatList
          key="albums"
          data={albums}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={
            playlists.length > 0 ? (
              <View>
                <SectionHeader title="Playlists" style={styles.sectionHeader} />
                <FlatList
                  data={playlists}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.playlistsList}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handlePlaylistPress(item.id)}
                      style={({ pressed }) => [
                        styles.playlistCard,
                        { backgroundColor: colors.surfaceRaised, opacity: pressed ? 0.6 : 1 },
                      ]}
                    >
                      <Feather name="list" size={20} color={colors.textSecondary} />
                      <NText variant="caption" numberOfLines={2} style={styles.playlistCardName}>
                        {item.name}
                      </NText>
                      <NText variant="micro" color="secondary">
                        {item.trackIds.length} tracks
                      </NText>
                    </Pressable>
                  )}
                />
                <SectionHeader title="Albums" style={styles.sectionHeader} />
              </View>
            ) : (
              <SectionHeader title="Albums" style={styles.sectionHeader} />
            )
          }
          renderItem={({ item }) => (
            <AlbumCard album={item} onPress={() => handleAlbumPress(item.id)} />
          )}
          columnWrapperStyle={styles.albumRow}
          contentContainerStyle={styles.albumListContent}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    // artists
    return (
      <FlatList
        key="artists"
        data={artists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArtistCard artist={item} onPress={() => handleArtistPress(item.id)} />}
        ItemSeparatorComponent={() => (
          <View style={styles.separator}>
            <NDivider />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <NText variant="caption" color="secondary" uppercase>
          Library
        </NText>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setShowCreateModal(true)}
            disabled={isEmpty}
            style={({ pressed }) => ({
              opacity: pressed || isEmpty ? 0.4 : 1,
              marginRight: Spacing.s3,
            })}
          >
            <Feather name="plus" size={16} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={scanLibrary}
            disabled={isScanning}
            style={({ pressed }) => ({ opacity: pressed || isScanning ? 0.4 : 1 })}
          >
            <Feather name="refresh-cw" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Tab chips */}
      <View style={styles.chips}>
        {TABS.map((tab) => (
          <NChip
            key={tab.key}
            label={tab.label}
            selected={activeTab === tab.key}
            onPress={() => setActiveTab(tab.key)}
          />
        ))}
      </View>

      <NDivider />

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Create Playlist Modal */}
      <Modal transparent visible={showCreateModal} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setShowCreateModal(false);
            setNewPlaylistName('');
          }}
        >
          <View
            style={[styles.modalBox, { backgroundColor: colors.surfaceRaised }]}
            onStartShouldSetResponder={() => true}
          >
            <NText variant="h3" style={styles.modalTitle}>
              New Playlist
            </NText>
            <TextInput
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              placeholder="Playlist name"
              placeholderTextColor={colors.textDisabled}
              style={[
                styles.modalInput,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreatePlaylist}
            />
            <View style={styles.modalActions}>
              <NButton
                label="Cancel"
                variant="ghost"
                size="sm"
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                }}
              />
              <NButton
                label="Create"
                variant="primary"
                size="sm"
                onPress={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
              />
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Add to Playlist Modal */}
      <Modal transparent visible={showAddToPlaylist} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setShowAddToPlaylist(false);
            setSelectedTrackId(null);
          }}
        >
          <View
            style={[styles.modalBox, { backgroundColor: colors.surfaceRaised }]}
            onStartShouldSetResponder={() => true}
          >
            <NText variant="h3" style={styles.modalTitle}>
              Add to Playlist
            </NText>
            {playlists.length === 0 ? (
              <NText variant="body" color="secondary">
                No playlists yet
              </NText>
            ) : (
              <View style={styles.playlistPickerList}>
                {playlists.map((pl) => (
                  <Pressable
                    key={pl.id}
                    onPress={() => handleConfirmAddToPlaylist(pl.id)}
                    style={({ pressed }) => [
                      styles.playlistPickerRow,
                      { opacity: pressed ? 0.6 : 1 },
                    ]}
                  >
                    <Feather name="list" size={16} color={colors.textSecondary} />
                    <NText variant="body" style={styles.playlistPickerName}>
                      {pl.name}
                    </NText>
                    <NText variant="caption" color="secondary">
                      {pl.trackIds.length} tracks
                    </NText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenH,
    paddingTop: Spacing.s4,
    paddingBottom: Spacing.s3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.s2,
    paddingHorizontal: Spacing.screenH,
    paddingBottom: Spacing.s3,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s3,
  },
  scanningLabel: {
    marginTop: Spacing.s2,
  },
  separator: {
    paddingHorizontal: Spacing.screenH,
  },
  listContent: {
    paddingVertical: Spacing.s2,
  },
  albumRow: {
    gap: Spacing.s3,
    paddingHorizontal: Spacing.screenH,
  },
  albumListContent: {
    paddingVertical: Spacing.s3,
    gap: Spacing.s4,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.screenH,
    paddingTop: Spacing.s3,
    paddingBottom: Spacing.s1,
  },
  playlistsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s2,
    paddingHorizontal: Spacing.screenH,
    paddingBottom: Spacing.s2,
  },
  playlistChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s1,
    paddingVertical: Spacing.s1,
    paddingHorizontal: Spacing.s3,
    borderRadius: 4,
    maxWidth: 120,
  },
  playlistChipText: {
    flex: 1,
  },
  playlistsList: {
    paddingHorizontal: Spacing.screenH,
    paddingBottom: Spacing.s3,
    gap: Spacing.s3,
  },
  playlistCard: {
    width: 100,
    padding: Spacing.s3,
    borderRadius: 8,
    gap: Spacing.s2,
    marginRight: Spacing.s3,
  },
  playlistCardName: {
    letterSpacing: -0.2,
  },
  recentlyList: {
    paddingHorizontal: Spacing.screenH,
    paddingBottom: Spacing.s2,
  },
  recentlyCard: {
    width: 90,
    padding: Spacing.s2,
    borderRadius: 6,
    gap: Spacing.s1,
    marginRight: Spacing.s3,
  },
  recentlyArt: {
    width: 74,
    height: 74,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentlyTitle: {
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: 300,
    borderRadius: 8,
    padding: Spacing.s5,
    gap: Spacing.s4,
  },
  modalTitle: {
    letterSpacing: -0.3,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s2,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.s2,
  },
  playlistPickerList: {
    gap: Spacing.s2,
  },
  playlistPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
    paddingVertical: Spacing.s2,
  },
  playlistPickerName: {
    flex: 1,
    letterSpacing: -0.2,
  },
});
