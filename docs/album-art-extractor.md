# Album Art & Metadata Extraction

## Overview

The app extracts embedded ID3 metadata and album artwork directly from audio files on the device using Android's native `MediaMetadataRetriever` API. This runs as a **local native module** inside the app's Android package, bypassing the need for any third-party ID3 parsing library.

## Native Module: `AlbumArtExtractor`

**Location:** `android/app/src/main/java/com/tz01x/nmusic/AlbumArtExtractorModule.kt`

### Architecture

```
JavaScript (TypeScript)              Native Kotlin
─────────────────────────            ──────────────────────────────────────
getAllMetadata(uri) ───────► AlbumArtExtractorModule.getAllMetadata(uri)
                                       │
                                       ▼
                              MediaMetadataRetriever
                                       │
                              extractMetadata(KEY_XXX)
                              embeddedPicture
                                       │
                                       ▼
                              WritableNativeMap ──► Promise resolves
```

### What is extracted

| ID3 Tag | MediaMetadataRetriever Key | Field in `AudioMetadata` |
|---|---|---|
| `TITLE` | `METADATA_KEY_TITLE` | `title` |
| `ARTIST` | `METADATA_KEY_ARTIST` | `artist` |
| `ALBUM` | `METADATA_KEY_ALBUM` | `album` |
| `ALBUMARTIST` | `METADATA_KEY_ALBUMARTIST` | `albumArtist` |
| `GENRE` | `METADATA_KEY_GENRE` | `genre` |
| `YEAR` | `METADATA_KEY_YEAR` | `year` |
| `TRACK_NUMBER` | `METADATA_KEY_CD_TRACK_NUMBER` | `trackNumber` |
| `DURATION` | `METADATA_KEY_DURATION` | `duration` |
| Embedded picture | `embeddedPicture` property | `artworkUri` (base64 data URI) |

### `artworkUri` format

The embedded picture (usually JPEG) is converted to a base64 data URI:

```
data:image/jpeg;base64,<base64 string>
```

This is directly usable as an `Image` source in React Native / Expo Image with no download or file access required.

### Package registration

`AlbumArtExtractorPackage` is manually registered in `MainApplication.kt`:

```kotlin
PackageList(this).packages.apply {
    add(AlbumArtExtractorPackage())
}
```

This is necessary because the module is **not** auto-linked — it lives inside the app's own Android package (`com.tz01x.nmusic`), not as a separate npm package.

## TypeScript Service

**Location:** `src/services/albumArtExtractor.ts`

### API

```ts
// Extract embedded album art only — returns base64 data URI or null
getEmbeddedPicture(uri: string): Promise<string | null>

// Extract all ID3 metadata + embedded art in one call
getAllMetadata(uri: string): Promise<AudioMetadata | null>
```

### `AudioMetadata` interface

```ts
interface AudioMetadata {
  album?: string
  artist?: string
  title?: string
  albumArtist?: string
  genre?: string
  year?: string
  trackNumber?: string
  duration?: string
  artworkUri: string | null
}
```

### Platform safety

Both functions are **Android-only**. On other platforms (`ios`, `web`), they return `null` immediately:

```ts
if (Platform.OS !== 'android') return null
```

## Integration: Library Scanning

**Location:** `src/store/libraryStore.ts` — `scanLibrary()`

During `scanLibrary()`, each audio asset's URI is passed to `getAllMetadata()` in **batched concurrent requests** (8 at a time) to balance throughput against I/O overhead:

```ts
const CONCURRENCY = 8
for (let i = 0; i < allAssets.length; i += CONCURRENCY) {
    const batch = allAssets.slice(i, i + CONCURRENCY)
    const batchTracks = await Promise.all(
        batch.map(async (asset) => {
            const metadata = await getAllMetadata(asset.uri)
            return { /* map metadata to Track fields */ }
        })
    )
    tracks.push(...batchTracks)
}
```

Each track gets real values from ID3 tags. If `getAllMetadata` throws (e.g. a corrupted file), the scan falls back to the raw `MediaLibrary.Asset` data.

## Files

```
android/app/src/main/java/com/tz01x/nmusic/
├── AlbumArtExtractorModule.kt    # Native module (MediaMetadataRetriever)
└── AlbumArtExtractorPackage.kt   # ReactPackage wrapper

src/services/
└── albumArtExtractor.ts          # TypeScript wrapper + types
```

## Permissions

No new permissions required. Reading audio file metadata via `MediaMetadataRetriever` uses the same `content://` URI that `expo-media-library` already resolved — no `READ_EXTERNAL_STORAGE` needed beyond what the app already holds.
