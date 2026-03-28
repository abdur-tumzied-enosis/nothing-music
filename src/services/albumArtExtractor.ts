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
  if (Platform.OS !== 'android') {
    console.log('[AlbumArtExtractor] getEmbeddedPicture: Not Android platform:', Platform.OS);
    return null;
  }
  console.log('[AlbumArtExtractor] Attempting to get embedded picture for:', uri);
  try {
    const result = await AlbumArtExtractor.getEmbeddedPicture(uri);
    console.log('[AlbumArtExtractor] getEmbeddedPicture result:', result);
    return result;
  } catch (error) {
    console.warn('[AlbumArtExtractor] getEmbeddedPicture failed:', error);
    throw error;
  }
}

/**
 * Extracts all ID3 metadata and embedded album art from an audio file URI.
 *
 * On Android uses MediaMetadataRetriever; on other platforms returns null.
 *
 * @returns An object with all available metadata fields plus artworkUri.
 */
export async function getAllMetadata(uri: string): Promise<AudioMetadata | null> {
  if (Platform.OS !== 'android') {
    console.log('[AlbumArtExtractor] getAllMetadata: Not Android platform:', Platform.OS);
    return null;
  }
  console.log('[AlbumArtExtractor] Attempting to get all metadata for:', uri);
  try {
    const result = await AlbumArtExtractor.getAllMetadata(uri);
    console.log('[AlbumArtExtractor] getAllMetadata result:', result);
    return result;
  } catch (error) {
    console.warn('[AlbumArtExtractor] getAllMetadata failed:', error);
    throw error;
  }
}
