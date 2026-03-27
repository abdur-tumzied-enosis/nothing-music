import { NativeModules, Platform } from 'react-native';

const { AlbumArtExtractor } = NativeModules;

export interface AudioMetadata {
  album?: string;
  artist?: string;
  title?: string;
  albumArtist?: string;
  genre?: string;
  year?: string;
  trackNumber?: string;
  duration?: string;
  artworkUri: string | null;
}

/**
 * Extracts embedded album art (JPEG) from an audio file URI using
 * Android's MediaMetadataRetriever.getEmbeddedPicture().
 *
 * Works only on Android. Returns a base64 data URI on success, null if no
 * embedded picture exists, or throws on error.
 */
export async function getEmbeddedPicture(uri: string): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  return AlbumArtExtractor.getEmbeddedPicture(uri);
}

/**
 * Extracts all ID3 metadata and embedded album art from an audio file URI.
 *
 * On Android uses MediaMetadataRetriever; on other platforms returns null.
 *
 * @returns An object with all available metadata fields plus artworkUri.
 */
export async function getAllMetadata(uri: string): Promise<AudioMetadata | null> {
  if (Platform.OS !== 'android') return null;
  return AlbumArtExtractor.getAllMetadata(uri);
}
