import { create } from 'zustand';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Album, Artist, Playlist } from './types';
import { getAllMetadata } from '../services/albumArtExtractor';

const STORAGE_KEY = 'nmusic_library';

interface PersistedLibrary {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  lastScanned: number;
}

interface LibraryStore {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  isScanning: boolean;
  lastScanned: number;
  permissionDenied: boolean;
  scanError: boolean;

  loadPersistedLibrary: () => Promise<void>;
  scanLibrary: () => Promise<void>;
  addPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
}

function parseTitle(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

/**
 * Persist the library to AsyncStorage, stripping artworkUri (base64 data URIs)
 * from tracks and albums before serialisation.
 *
 * artworkUri strings can be several hundred KB each. With a large library they
 * push the payload into the tens of megabytes and cause an OOM in AsyncStorage's
 * background thread. Artwork is re-extracted from disk on each scan, so it is
 * safe to omit it from the persistent cache.
 */
async function persistLibrary(
  tracks: Track[],
  albums: Album[],
  artists: Artist[],
  playlists: Playlist[],
  lastScanned: number,
) {
  const lightTracks = tracks.map((t) => ({ ...t, artworkUri: null }));
  const lightAlbums = albums.map((a) => ({ ...a, artworkUri: null }));
  const payload: PersistedLibrary = { tracks: lightTracks, albums: lightAlbums, artists, playlists, lastScanned };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  tracks: [],
  albums: [],
  artists: [],
  playlists: [],
  isScanning: false,
  lastScanned: 0,
  permissionDenied: false,
  scanError: false,

  // #16 — Load persisted library from AsyncStorage on startup
  loadPersistedLibrary: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (!json) return;
      const data: PersistedLibrary = JSON.parse(json);
      set({
        tracks: data.tracks ?? [],
        albums: data.albums ?? [],
        artists: data.artists ?? [],
        playlists: data.playlists ?? [],
        lastScanned: data.lastScanned ?? 0,
      });
    } catch {
      // Ignore parse errors — stale cache is non-fatal
    }
  },

  // #10 Permissions + #11 Scan + #12 Parse + #13 Populate
  scanLibrary: async () => {
    // #10 — Request permission
    let status: string;
    try {
      ({ status } = await MediaLibrary.requestPermissionsAsync());
    } catch {
      // Expo Go doesn't have audio permission in its manifest — requires a dev build
      set({ permissionDenied: true });
      return;
    }
    if (status !== 'granted') {
      set({ permissionDenied: true });
      return;
    }

    set({ isScanning: true, permissionDenied: false, scanError: false });

    try {
      // Build albumId → title map from media library albums
      const mlAlbums = await MediaLibrary.getAlbumsAsync();
      const albumTitleMap: Record<string, string> = {};
      for (const a of mlAlbums) {
        albumTitleMap[a.id] = a.title;
      }

      // #11 — Paginated scan for all audio assets
      const allAssets: MediaLibrary.Asset[] = [];
      let page = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 500,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      allAssets.push(...page.assets);
      while (page.hasNextPage) {
        page = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: 500,
          after: page.endCursor,
          sortBy: [MediaLibrary.SortBy.creationTime],
        });
        allAssets.push(...page.assets);
      }

      // #12 — Parse metadata from each asset
      const CONCURRENCY = 8;
      const tracks: Track[] = [];

      for (let i = 0; i < allAssets.length; i += CONCURRENCY) {
        const batch = allAssets.slice(i, i + CONCURRENCY);
        const batchTracks = await Promise.all(
          batch.map(async (asset) => {
            let metadata: import('../services/albumArtExtractor').AudioMetadata | null = null;
            try {
              metadata = await getAllMetadata(asset.uri);
              if (metadata?.artworkUri) {
                console.log('[LibraryStore] Successfully extracted artwork for:', asset.filename);
              } else {
                console.warn('[LibraryStore] No artwork found in metadata for:', asset.filename, metadata);
              }
            } catch (error) {
              console.warn('[LibraryStore] Metadata extraction failed for:', asset.filename, asset.uri, error);
              // getAllMetadata fails on some files — fall back to basic data
            }

            const albumName =
              metadata?.album ??
              (asset.albumId
                ? (albumTitleMap[asset.albumId] ?? 'Unknown Album')
                : 'Unknown Album');
            const artist = metadata?.artist ?? 'Unknown Artist';
            const artistId = `artist_${slugify(artist)}`;
            const albumId = asset.albumId ?? `album_${slugify(albumName)}`;


            return {
              id: asset.id,
              uri: asset.uri,
              title: metadata?.title ?? parseTitle(asset.filename),
              artist,
              album: albumName,
              albumId,
              artistId,
              duration: Math.round(asset.duration * 1000),
              trackNumber: metadata?.trackNumber ? parseInt(metadata.trackNumber, 10) || null : null,
              artworkUri: metadata?.artworkUri ?? null,
              dateAdded: asset.creationTime,
            };
          })
        );
        tracks.push(...batchTracks);
      }

      // #13 — Derive albums from tracks
      const albumMap: Record<string, Album> = {};
      for (const track of tracks) {
        if (!albumMap[track.albumId]) {
          albumMap[track.albumId] = {
            id: track.albumId,
            title: track.album,
            artist: track.artist,
            artworkUri: track.artworkUri,
            trackCount: 0,
            year: null,
          };
        }
        albumMap[track.albumId].trackCount++;
      }
      const albums = Object.values(albumMap).sort((a, b) =>
        a.title.localeCompare(b.title)
      );

      // #13 — Derive artists from tracks
      const artistMap: Record<string, { albumIds: Set<string>; trackCount: number; name: string }> = {};
      for (const track of tracks) {
        if (!artistMap[track.artistId]) {
          artistMap[track.artistId] = { albumIds: new Set(), trackCount: 0, name: track.artist };
        }
        artistMap[track.artistId].albumIds.add(track.albumId);
        artistMap[track.artistId].trackCount++;
      }
      const artists: Artist[] = Object.entries(artistMap).map(([id, data]) => ({
        id,
        name: data.name,
        albumCount: data.albumIds.size,
        trackCount: data.trackCount,
      }));

      const lastScanned = Date.now();
      const { playlists } = get();

      set({ tracks, albums, artists, isScanning: false, lastScanned });

      // #16 — Persist to AsyncStorage (artwork stripped to avoid OOM)
      await persistLibrary(tracks, albums, artists, playlists, lastScanned);
    } catch {
      set({ isScanning: false, scanError: true });
    }
  },

  addPlaylist: (name) => {
    set((s) => ({
      playlists: [
        ...s.playlists,
        { id: `pl_${Date.now()}`, name, trackIds: [], createdAt: Date.now() },
      ],
    }));
    const { playlists, tracks, albums, artists, lastScanned } = get();
    persistLibrary(tracks, albums, artists, playlists, lastScanned);
  },

  addToPlaylist: (playlistId, trackId) => {
    set((s) => ({
      playlists: s.playlists.map((pl) =>
        pl.id === playlistId && !pl.trackIds.includes(trackId)
          ? { ...pl, trackIds: [...pl.trackIds, trackId] }
          : pl
      ),
    }));
    const { playlists, tracks, albums, artists, lastScanned } = get();
    persistLibrary(tracks, albums, artists, playlists, lastScanned);
  },

  removeFromPlaylist: (playlistId, trackId) => {
    set((s) => ({
      playlists: s.playlists.map((pl) =>
        pl.id === playlistId
          ? { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId) }
          : pl
      ),
    }));
    const { playlists, tracks, albums, artists, lastScanned } = get();
    persistLibrary(tracks, albums, artists, playlists, lastScanned);
  },

  deletePlaylist: (playlistId) => {
    set((s) => ({
      playlists: s.playlists.filter((pl) => pl.id !== playlistId),
    }));
    const { playlists, tracks, albums, artists, lastScanned } = get();
    persistLibrary(tracks, albums, artists, playlists, lastScanned);
  },
}));
