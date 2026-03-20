# NMusic — Task List

> Track implementation progress phase by phase.
> Status: `[ ]` pending · `[x]` done · `[-]` in progress
> implementation plan:  `docs\nmusic-implementation-plan.md`

---

## Phase 1 — Foundation

- [x] #1 Install all dependencies ; and clean/remove existing default template from expo
- [x] #2 Set up expo-router tab + stack layout
- [x] #3 Build design token files (colors, typography, spacing)
- [x] #4 Load NDot font via expo-font
- [x] #5 Build base UI components (NText, NCard, NButton, NChip, NDivider)
- [x] #6 Build LoadingDots and EmptyState components
- [x] #7 Set up Zustand stores (empty shells)
- [x] #8 Set up useTheme hook with light / dark / extra-dark switching
- [x] #9 Build SectionHeader and TrackRow shell

---

## Phase 2 — Library

- [x] #10 Request expo-media-library permissions
- [x] #11 Scan device for audio files
- [x] #12 Parse track metadata (title, artist, album, duration)
- [x] #13 Populate libraryStore (tracks, albums, artists)
- [x] #14 Build Library screen with Tracks / Albums / Artists tabs
- [x] #15 Build TrackRow (wired), AlbumCard, ArtistCard components
- [x] #16 EmptyState for empty library + persist library to AsyncStorage

---

## Phase 3 — Playback

- [ ] #17 Set up expo-av audio session (background mode)
- [ ] #18 Build audioService (load, play/pause, seek, skip)
- [ ] #19 Wire playerStore to audioService
- [ ] #20 Build MiniPlayer persistent bar
- [ ] #21 Build full-screen Player screen
- [ ] #22 Build DotProgress seek bar component
- [ ] #23 Lock screen / notification controls

---

## Phase 4 — Playlists & Search

- [ ] #24 Build Search screen with real-time filter
- [ ] #25 Build Playlist creation flow and detail screen
- [ ] #26 Build Album detail screen
- [ ] #27 Build Artist detail screen
- [ ] #28 Recently played section on Home

---

## Phase 5 — Polish & Settings

- [ ] #29 Build Settings screen
- [ ] #30 Implement haptic feedback on player controls
- [ ] #31 Implement sleep timer
- [ ] #32 Animated transitions (MiniPlayer slide-up, screen entries)
- [ ] #33 Error states and performance audit
- [ ] #34 App icon and splash screen (Nothing OS styled)
