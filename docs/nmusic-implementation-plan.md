# NMusic — Implementation Plan
### Expo + React Native · Nothing OS Design Language

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Design System Setup](#4-design-system-setup)
5. [Phase Roadmap](#5-phase-roadmap)
6. [Screen Inventory](#6-screen-inventory)
7. [Component Architecture](#7-component-architecture)
8. [Navigation Structure](#8-navigation-structure)
9. [Audio Engine Plan](#9-audio-engine-plan)
10. [State Management](#10-state-management)
11. [Nothing OS Design Decisions](#11-nothing-os-design-decisions)
12. [Implementation Checklist](#12-implementation-checklist)

---

## 1. Project Overview

**NMusic** is a local music player app built with Expo and React Native, designed to feel native to the Nothing OS aesthetic. The UI draws from the Nothing OS design language — monochrome surfaces, dot-matrix typography, sharp geometry, and confident minimalism.

**Core goals:**
- Read and play local music files from the device
- Beautiful, distraction-free listening experience
- Nothing OS–faithful design in every screen
- Smooth performance on Android (primary) and iOS

---

## 2. Tech Stack

| Category | Library | Reason |
|---|---|---|
| Framework | `expo` (SDK 51+) | Managed workflow, easy device API access |
| Navigation | `expo-router` (file-based) | Clean, scalable routing |
| Audio | `expo-av` or `expo-audio` | Local file playback, background audio |
| Media Library | `expo-media-library` | Scan device for music files |
| State | `zustand` | Lightweight global player state |
| Fonts | `expo-font` + `@expo-google-fonts/inter` | Inter as body font; NDot via custom font |
| Icons | `@expo/vector-icons` (Feather set) | Outlined, geometric — closest to Nothing icon style |
| Animations | `react-native-reanimated` v3 | Performant animations, gesture-driven |
| Gestures | `react-native-gesture-handler` | Swipe gestures on player, lists |
| Storage | `expo-secure-store` / `AsyncStorage` | Persist settings, playlists, queue |
| Image | `expo-image` | Efficient album art rendering |
| Haptics | `expo-haptics` | Subtle tactile feedback on controls |

### Install commands

```bash
# Core
npx expo install expo-av expo-media-library expo-font expo-image expo-haptics
npx expo install expo-router react-native-reanimated react-native-gesture-handler

# State & storage
npx expo install @react-native-async-storage/async-storage
npm install zustand

# Fonts
npx expo install @expo-google-fonts/inter
```

---

## 3. Folder Structure

```
nmusic/
├── app/                          # expo-router screens (file-based routes)
│   ├── (tabs)/
│   │   ├── index.tsx             # Home / Library
│   │   ├── search.tsx            # Search
│   │   └── settings.tsx          # Settings
│   ├── player/
│   │   └── [id].tsx              # Full-screen player
│   ├── playlist/
│   │   └── [id].tsx              # Playlist detail
│   ├── album/
│   │   └── [id].tsx              # Album detail
│   └── _layout.tsx               # Root layout
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base design system components
│   │   │   ├── NText.tsx         # Typography component
│   │   │   ├── NCard.tsx         # Surface/card component
│   │   │   ├── NButton.tsx       # Button variants
│   │   │   ├── NChip.tsx         # Chip/tag component
│   │   │   ├── NDivider.tsx      # Dotted divider
│   │   │   ├── NInput.tsx        # Text input
│   │   │   └── DotProgress.tsx   # Dot-matrix progress bar
│   │   ├── player/
│   │   │   ├── MiniPlayer.tsx    # Persistent bottom player bar
│   │   │   ├── PlayerControls.tsx
│   │   │   ├── SeekBar.tsx       # Dot-style seek bar
│   │   │   ├── AlbumArt.tsx
│   │   │   └── TrackMeta.tsx
│   │   ├── library/
│   │   │   ├── TrackRow.tsx      # Single track list item
│   │   │   ├── AlbumCard.tsx
│   │   │   ├── ArtistCard.tsx
│   │   │   └── PlaylistCard.tsx
│   │   └── common/
│   │       ├── EmptyState.tsx    # Dot-grid empty state illustration
│   │       ├── LoadingDots.tsx   # Dot animation loader
│   │       └── SectionHeader.tsx
│   │
│   ├── theme/                    # Nothing OS design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   ├── store/                    # Zustand stores
│   │   ├── playerStore.ts        # Playback state
│   │   ├── libraryStore.ts       # Music library data
│   │   └── settingsStore.ts      # App settings / theme mode
│   │
│   ├── hooks/
│   │   ├── useAudioPlayer.ts     # Audio playback logic
│   │   ├── useMediaLibrary.ts    # Scan & load music
│   │   ├── useTheme.ts           # Theme mode (light/dark/extra-dark)
│   │   └── useHaptics.ts
│   │
│   ├── services/
│   │   ├── audioService.ts       # Background audio, queue management
│   │   └── metadataService.ts    # Parse ID3 tags, album art
│   │
│   └── utils/
│       ├── formatTime.ts         # ms → mm:ss
│       ├── sortTracks.ts
│       └── groupByAlbum.ts
│
├── assets/
│   ├── fonts/
│   │   └── NDot57.ttf            # NDot font file
│   └── images/
│       └── placeholder-art.png   # Default album art (dot-grid style)
│
└── app.json
```

---

## 4. Design System Setup
Design guild also can be found `docs\design-guide\nothing-os-design-guide.md`
### 4.1 Color Tokens — `src/theme/colors.ts`

```typescript
export const Colors = {
  light: {
    background:     '#FFFFFF',
    surface:        '#F5F5F5',
    surfaceRaised:  '#EBEBEB',
    border:         '#E0E0E0',
    textPrimary:    '#0A0A0A',
    textSecondary:  '#6B6B6B',
    textDisabled:   '#BABABA',
    accent:         '#FF2400',
    accentMuted:    '#FF240020',
  },
  dark: {
    background:     '#111111',
    surface:        '#111111',
    surfaceRaised:  '#1A1A1A',
    border:         '#2A2A2A',
    textPrimary:    '#F0F0F0',
    textSecondary:  '#8A8A8A',
    textDisabled:   '#404040',
    accent:         '#FF2400',
    accentMuted:    '#FF240020',
  },
  extraDark: {
    background:     '#000000',
    surface:        '#000000',
    surfaceRaised:  '#0D0D0D',
    border:         '#333333',
    textPrimary:    '#F0F0F0',
    textSecondary:  '#8A8A8A',
    textDisabled:   '#404040',
    accent:         '#FF2400',
    accentMuted:    '#FF240020',
  },
} as const;
```

### 4.2 Typography Tokens — `src/theme/typography.ts`

```typescript
export const Typography = {
  fonts: {
    ndot:       'NDot57',       // dot-matrix display
    body:       'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    mono:       'Inter_400Regular', // fallback for NType82Mono
  },
  sizes: {
    display: 56,
    h1:      32,
    h2:      24,
    h3:      18,
    body:    16,
    caption: 13,
    micro:   11,
  },
  letterSpacing: {
    tight:   -0.5,  // headlines
    normal:  0,
    wide:    0.8,   // chips, labels (ALL CAPS)
  },
  lineHeight: {
    tight:  1.2,
    normal: 1.6,
  },
};
```

### 4.3 Spacing Tokens — `src/theme/spacing.ts`

```typescript
export const Spacing = {
  s1:  4,
  s2:  8,
  s3:  12,
  s4:  16,   // default screen margin
  s5:  24,
  s6:  32,
  s8:  48,
  screenH: 16,   // horizontal screen padding
  screenV: 24,   // vertical screen padding
};
```

### 4.4 `useTheme` Hook

```typescript
// src/hooks/useTheme.ts
import { useSettingsStore } from '../store/settingsStore';
import { Colors } from '../theme/colors';

export type ThemeMode = 'light' | 'dark' | 'extraDark';

export function useTheme() {
  const mode = useSettingsStore(s => s.themeMode); // 'light' | 'dark' | 'extraDark'
  const colors = Colors[mode];
  return { colors, mode };
}
```

---

## 5. Phase Roadmap

### Phase 1 — Foundation (Week 1–2)
> Set up the skeleton. No music yet — just structure and design system.

- [ ] Install all dependencies
- [ ] Set up `expo-router` tab + stack layout
- [ ] Build design token files (`colors`, `typography`, `spacing`)
- [ ] Load NDot font via `expo-font`
- [ ] Build base UI components: `NText`, `NCard`, `NButton`, `NChip`, `NDivider`
- [ ] Build `LoadingDots` and `EmptyState` components
- [ ] Set up Zustand stores (empty shells)
- [ ] Set up `useTheme` hook with light/dark/extra-dark switching
- [ ] Build `SectionHeader` and `TrackRow` shell

**Exit criteria:** App loads, tabs navigate, design tokens work, theme switches correctly.

---

### Phase 2 — Library (Week 2–3)
> Read device music and display it.

- [ ] Request `expo-media-library` permissions
- [ ] Scan device for audio files (`MediaLibrary.getAssetsAsync`)
- [ ] Parse basic metadata (title, artist, album, duration)
- [ ] Populate `libraryStore` with tracks, albums, artists
- [ ] Build Library screen with three tabs: Tracks / Albums / Artists
- [ ] Build `TrackRow` with track name, artist, duration
- [ ] Build `AlbumCard` grid view
- [ ] Build `ArtistCard` list view
- [ ] Empty state when no music found (dot-grid illustration)
- [ ] Persist library data to AsyncStorage

**Exit criteria:** App reads device music and renders it across all three library views.

---

### Phase 3 — Playback (Week 3–4)
> Make music play.

- [ ] Set up `expo-av` Audio session (background mode)
- [ ] Build `audioService` — load track, play/pause, seek, skip
- [ ] Wire `playerStore` to audio service
- [ ] Build `MiniPlayer` persistent bar above tab bar
- [ ] Build full-screen `Player` screen (`/player/[id]`)
- [ ] Build `SeekBar` with dot-style progress indicator
- [ ] Build `PlayerControls` (previous, play/pause, next, shuffle, repeat)
- [ ] Handle audio focus (interruptions — calls, other apps)
- [ ] Lock screen / notification controls via `expo-av`
- [ ] Queue management (next up, shuffle queue)

**Exit criteria:** Tap a track → plays → MiniPlayer appears → tap MiniPlayer → full player opens. Seek, skip, shuffle all work.

---

### Phase 4 — Playlists & Search (Week 4–5)
> Organisation and discovery.

- [ ] Build Search screen with real-time filter
- [ ] Search across tracks, albums, artists simultaneously
- [ ] Build Playlist creation flow (name input + track selector)
- [ ] Build Playlist detail screen
- [ ] Add/remove tracks from playlists
- [ ] Persist playlists to AsyncStorage
- [ ] Album detail screen (tracklist + album art header)
- [ ] Artist detail screen (albums + tracks)
- [ ] Recently played section on Home

**Exit criteria:** User can search, create playlists, and browse by album/artist.

---

### Phase 5 — Polish & Settings (Week 5–6)
> Finish the experience.

- [ ] Settings screen: theme mode selector (Light / Dark / Extra Dark)
- [ ] Settings: sort order for library (A–Z, by date added, by artist)
- [ ] Settings: equaliser toggle (if supported)
- [ ] Sleep timer feature
- [ ] Haptic feedback on player controls
- [ ] Animated transitions (screen entry, MiniPlayer slide-up)
- [ ] Loading state for large libraries (dot animation)
- [ ] Error states (permission denied, corrupt file)
- [ ] Performance audit — FlatList optimisation, memo, useCallback
- [ ] App icon + splash screen (Nothing OS–styled)

**Exit criteria:** App feels complete, polished, and passes the Nothing OS design checklist on every screen.

---

## 6. Screen Inventory

| Screen | Route | Primary purpose | Nothing design moment |
|---|---|---|---|
| **Home / Library** | `/(tabs)/` | Browse all music | Section headers in ALL CAPS · dotted dividers |
| **Search** | `/(tabs)/search` | Find tracks/albums/artists | Minimal input, instant results |
| **Settings** | `/(tabs)/settings` | Theme, sort, timer | Toggle rows, no decorative elements |
| **Album Detail** | `/album/[id]` | Tracklist for one album | Large album art · NDot track numbers |
| **Artist Detail** | `/artist/[id]` | Albums + tracks by artist | Clean list, left-aligned |
| **Playlist Detail** | `/playlist/[id]` | User playlist | Ghost button CTAs |
| **Full Player** | `/player` | Now playing | NDot timestamp · dot seek bar · accent play button |
| **Queue** | `/queue` | Up next list | Drag-to-reorder, monochrome |

---

## 7. Component Architecture

### MiniPlayer
Persistent above the tab bar. Slides up when a track starts. Contains:
- Album art thumbnail (40×40, border-radius 4px — sharp)
- Track title (Body, truncated)
- Artist name (Caption, secondary colour)
- Play/Pause button — **this is the one accent-red element on most screens**
- Progress bar — thin 1px line, no dot style (micro context)

### Full Player Screen
This is the hero screen. Nothing OS design shines here:
- Album art — full-width square, border-radius 8px, no shadow
- Track title — H1, Inter Medium, tight letter-spacing
- Artist name — Body, secondary colour
- Seek bar — dot-matrix style (series of dots, filled dots = played)
- Timestamps — NDot font, Caption size (this is the NDot showcase moment)
- Controls row — outlined icons, 24px, 1.5px stroke
- Play/pause — the ONE accent red element; large circle button or filled square

### DotProgress (Seek Bar)
The signature component. Renders as a row of small dots:
- Total dots calculated from track duration
- Filled dots (white/black) = elapsed
- Empty dots (border only) = remaining
- Draggable thumb is a slightly larger dot

### EmptyState
For empty library, empty search, empty playlist:
- Dot-grid illustration (custom SVG or canvas-drawn pattern)
- Short message in Caption size, ALL CAPS
- Optional ghost button CTA

---

## 8. Navigation Structure

```
Root Layout (_layout.tsx)
└── Tab Navigator
    ├── Home (Library)          ← index tab
    ├── Search                  ← search tab
    └── Settings                ← settings tab

Stack (overlays tabs)
    ├── /player                 ← full-screen, slides up from bottom
    ├── /album/[id]             ← standard push
    ├── /artist/[id]            ← standard push
    ├── /playlist/[id]          ← standard push
    └── /queue                  ← modal sheet from bottom
```

**Tab bar design (Nothing OS style):**
- No labels by default — icons only (can toggle in settings)
- Active icon: filled or `--color-accent` dot indicator below icon
- Background: `--color-background` (no blur, no glass)
- Border top: 1px `--color-border`

---

## 9. Audio Engine Plan

### Setup — Audio Session

```typescript
// src/services/audioService.ts
import { Audio } from 'expo-av';

await Audio.setAudioModeAsync({
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  interruptionModeIOS: InterruptionModeIOS.DuckOthers,
  interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
});
```

### Player State (Zustand)

```typescript
// src/store/playerStore.ts
interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  position: number;       // ms
  duration: number;       // ms
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';

  // Actions
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  seek: (ms: number) => void;
  skipNext: () => void;
  skipPrev: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}
```

### Queue Logic
- Shuffle generates a new randomised queue array, keeping current track at index 0
- Repeat `one` — on `onPlaybackStatusUpdate` end, seek to 0
- Repeat `all` — on end of queue, restart from index 0
- Skip prev — if position > 3s, seek to 0; else go to previous track

---

## 10. State Management

Three Zustand stores:

### `playerStore` — live playback state
Updated frequently (every seek tick). Lightweight. See Section 9.

### `libraryStore` — music catalogue
```typescript
interface LibraryStore {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  isScanning: boolean;
  lastScanned: number; // timestamp

  scanLibrary: () => Promise<void>;
  addPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
}
```

### `settingsStore` — preferences
```typescript
interface SettingsStore {
  themeMode: 'light' | 'dark' | 'extraDark';
  sortOrder: 'az' | 'dateAdded' | 'artist';
  showTabLabels: boolean;
  hapticFeedback: boolean;
  sleepTimerMinutes: number | null;

  setThemeMode: (mode: ThemeMode) => void;
  setSortOrder: (order: SortOrder) => void;
}
```

---

## 11. Nothing OS Design Decisions

Specific decisions made for NMusic to align with the design guide:

### Typography
- Track numbers and timestamps → **NDot font** (the dot-matrix moment)
- All section headers (`TRACKS`, `ALBUMS`, `RECENTLY PLAYED`) → Inter Medium, ALL CAPS, `letterSpacing: 0.8`
- Track titles → Inter Medium 16px, `letterSpacing: -0.3`
- Artist/album names → Inter Regular 13px, secondary colour

### Colour usage
- **Play button** = the one red accent per screen (`#FF2400`)
- All other controls = monochrome (white in dark mode, black in light mode)
- Active tab indicator = small red dot below icon (not a filled icon)
- Currently playing track row = white background tint in dark mode (`#1A1A1A`) — no red

### Iconography
- Use **Feather** icon set from `@expo/vector-icons` — closest to Nothing's outlined, geometric style
- Stroke width: 1.5 (matches Nothing spec exactly)
- No filled icons anywhere except the play button state

### Surfaces & Cards
- Track list → flat, no cards; separated by 1px `--color-border` dividers
- Album grid → cards with `borderRadius: 8`, `border: 1px`, no shadow
- Full Player → no card wrapping — art and controls float on raw background
- Bottom sheet (queue) → `surfaceRaised` background, top border only

### Seek Bar (Dot Design)
Replace the standard slider with a dot-matrix seek bar:
- 40 dots across the width
- Each dot: 4×4px, `borderRadius: 2` (slightly rounded square)
- Elapsed dots: `--color-text-primary` (white/black)
- Remaining dots: `--color-border` (barely visible)
- No thumb indicator — the boundary between filled/empty is the implicit position

### Animations
- MiniPlayer entrance: `translateY` from +60 → 0, 300ms, `cubic-bezier(0.2, 0, 0, 1)`
- Full player open: slide up as a stack screen, 300ms, same easing
- Track row press: `opacity` 1 → 0.6 on press-in, back to 1 on press-out (100ms each)
- No spring, no bounce

### Loading State
Replace spinners with `LoadingDots` — three dots animating opacity in sequence (100ms stagger).

---

## 12. Implementation Checklist

### Per-screen Nothing OS review (run before marking any screen "done")

- [ ] Background is strictly from the palette — no custom colours
- [ ] Maximum one red accent element visible at a time
- [ ] All buttons have `borderRadius` ≤ 8px
- [ ] NDot font is used for at least one numeric display (timestamps, track numbers)
- [ ] All icons are outlined (Feather), not filled
- [ ] Whitespace is generous — no cramped layouts
- [ ] Zero gradients, zero glass/blur effects
- [ ] Screen tested in Extra Dark mode (`#000000` background)
- [ ] All animations ≤ 300ms, no spring/bounce easing
- [ ] Key info is scannable in under 2 seconds

### Global app checklist

- [ ] `expo-font` loads NDot before first render (splash screen held until ready)
- [ ] All colours reference theme tokens — zero hardcoded hex values in components
- [ ] `useTheme()` used in every component that renders colour
- [ ] `react-native-reanimated` used for all animations (not `Animated` from RN core)
- [ ] `FlatList` used for all lists (never `ScrollView` + `.map()`)
- [ ] `keyExtractor` set on all `FlatList` instances
- [ ] Audio background mode enabled in `app.json`
- [ ] Android `MEDIA_LIBRARY` and `READ_MEDIA_AUDIO` permissions declared
- [ ] iOS `NSMicrophoneUsageDescription` and `NSAppleMusicUsageDescription` in Info.plist
- [ ] App tested on real device (not just simulator) for audio

---

## Appendix — `app.json` Audio Permissions

```json
{
  "expo": {
    "plugins": [
      [
        "expo-av",
        { "microphonePermission": false }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": false,
          "savePhotosPermission": false,
          "isAccessMediaLocationEnabled": true
        }
      ]
    ],
    "android": {
      "permissions": [
        "android.permission.READ_MEDIA_AUDIO",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"
      ]
    },
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    }
  }
}
```

---

*NMusic · Built with Expo · Designed for Nothing OS*
