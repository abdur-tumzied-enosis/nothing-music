import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';
import { NChip } from '@/components/ui/NChip';
import { NDivider } from '@/components/ui/NDivider';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingDots } from '@/components/common/LoadingDots';
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
  const [activeTab, setActiveTab] = useState<Tab>('tracks');

  const tracks = useLibraryStore((s) => s.tracks);
  const albums = useLibraryStore((s) => s.albums);
  const artists = useLibraryStore((s) => s.artists);
  const isScanning = useLibraryStore((s) => s.isScanning);
  const permissionDenied = useLibraryStore((s) => s.permissionDenied);
  const scanLibrary = useLibraryStore((s) => s.scanLibrary);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const play = usePlayerStore((s) => s.play);

  const handleTrackPress = useCallback(
    (track: Track) => {
      play(track, tracks);
    },
    [play, tracks]
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
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TrackRow
              title={item.title}
              artist={item.artist}
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (activeTab === 'albums') {
      return (
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <AlbumCard album={item} />
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
        data={artists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArtistCard artist={item} />}
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
        <Pressable
          onPress={scanLibrary}
          disabled={isScanning}
          style={({ pressed }) => ({ opacity: pressed || isScanning ? 0.4 : 1 })}
        >
          <Feather name="refresh-cw" size={16} color={colors.textSecondary} />
        </Pressable>
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
});
