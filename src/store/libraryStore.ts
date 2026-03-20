import { create } from 'zustand';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Album, Artist, Playlist } from './types';

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

    set({ isScanning: true, permissionDenied: false });

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
      const tracks: Track[] = allAssets.map((asset) => {
        const albumName = asset.albumId
          ? (albumTitleMap[asset.albumId] ?? 'Unknown Album')
          : 'Unknown Album';
        const albumId = asset.albumId ?? `album_${slugify(albumName)}`;
        const artist = 'Unknown Artist';
        const artistId = `artist_${slugify(artist)}`;

        return {
          id: asset.id,
          uri: asset.uri,
          title: parseTitle(asset.filename),
          artist,
          album: albumName,
          albumId,
          artistId,
          duration: Math.round(asset.duration * 1000),
          trackNumber: null,
          artworkUri: null,
          dateAdded: asset.creationTime,
        };
      });

      // #13 — Derive albums from tracks
      const albumMap: Record<string, Album> = {};
      for (const track of tracks) {
        if (!albumMap[track.albumId]) {
          albumMap[track.albumId] = {
            id: track.albumId,
            title: track.album,
            artist: track.artist,
            artworkUri: null,
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

      // #16 — Persist to AsyncStorage
      const toStore: PersistedLibrary = { tracks, albums, artists, playlists, lastScanned };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      set({ isScanning: false });
    }
  },

  addPlaylist: (name) =>
    set((s) => ({
      playlists: [
        ...s.playlists,
        { id: `pl_${Date.now()}`, name, trackIds: [], createdAt: Date.now() },
      ],
    })),

  addToPlaylist: (playlistId, trackId) =>
    set((s) => ({
      playlists: s.playlists.map((pl) =>
        pl.id === playlistId && !pl.trackIds.includes(trackId)
          ? { ...pl, trackIds: [...pl.trackIds, trackId] }
          : pl
      ),
    })),

  removeFromPlaylist: (playlistId, trackId) =>
    set((s) => ({
      playlists: s.playlists.map((pl) =>
        pl.id === playlistId
          ? { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId) }
          : pl
      ),
    })),

  deletePlaylist: (playlistId) =>
    set((s) => ({
      playlists: s.playlists.filter((pl) => pl.id !== playlistId),
    })),
}));
