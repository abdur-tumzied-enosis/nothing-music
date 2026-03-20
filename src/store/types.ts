export interface Track {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string;
  albumId: string;
  artistId: string;
  duration: number; // ms
  trackNumber: number | null;
  artworkUri: string | null;
  dateAdded: number; // timestamp
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artworkUri: string | null;
  trackCount: number;
  year: number | null;
}

export interface Artist {
  id: string;
  name: string;
  albumCount: number;
  trackCount: number;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

export type ThemeMode = 'light' | 'dark' | 'extraDark';
export type SortOrder = 'az' | 'dateAdded' | 'artist';
export type RepeatMode = 'none' | 'one' | 'all';
