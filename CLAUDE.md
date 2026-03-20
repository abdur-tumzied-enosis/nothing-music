# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (choose platform interactively)
npx expo start

# Platform-specific
npx expo start --android
npx expo start --ios
npx expo start --web

# Lint
npx expo lint

# Reset to clean Expo template (destructive)
npm run reset-project
```

Use `npx expo install <package>` (not `npm install`) for any React Native / Expo packages to ensure compatible versions are resolved automatically.

## Architecture

**Framework:** Expo SDK 55, React 19, React Native 0.83, TypeScript (strict), file-based routing via `expo-router`.

**Source layout:**
- `src/app/` — expo-router screens (file-based routes). `_layout.tsx` is the root layout.
- `src/components/` — UI components. `ui/` holds the base design system; `player/`, `library/`, `common/` hold domain components.
- `src/constants/theme.ts` — current color/spacing/font tokens (light/dark only; `extraDark` not yet implemented).
- `src/hooks/` — `use-theme.ts` returns typed colors for current scheme; `use-color-scheme.ts` has a `.web.ts` platform override.
- `src/store/` — Zustand stores (planned: `playerStore`, `libraryStore`, `settingsStore`).
- `src/services/` — Audio engine and metadata parsing (planned).

**Path alias:** `@/*` → `src/*`, `@/assets/*` → `assets/*`.

**Platform-specific files:** Use `.web.tsx` / `.web.ts` suffixes for web overrides (e.g., `app-tabs.web.tsx`, `animated-icon.web.tsx`).

## Planned stack (not yet installed)

Per `docs/nmusic-implementation-plan.md`, these are planned but not yet added:
- `expo-av` — audio playback with background mode
- `expo-media-library` — device music scanning
- `zustand` — global state (player, library, settings)
- `@react-native-async-storage/async-storage` — persistence
- `expo-haptics` — tactile feedback
- `@expo-google-fonts/inter` — Inter font family

## Nothing OS Design Rules

The app strictly follows the Nothing OS design language. Every component must pass this checklist before being considered done:

- **One red accent (`#FF2400`) per screen maximum** — used only on the primary interactive element (e.g., play button). Never decorative.
- **Zero gradients, zero glass/blur effects** — flat, opaque surfaces only.
- **`borderRadius` ≤ 8px** — no pill/rounded shapes.
- **All icons outlined (Feather set), 1.5px stroke** — no filled icons except the active play button state.
- **NDot font for all numeric display** — timestamps, track numbers, counters.
- **Section headers** in Inter Medium, ALL CAPS, `letterSpacing: 0.8`.
- **All animations ≤ 300ms**, easing `cubic-bezier(0.2, 0, 0, 1)` — no spring/bounce.
- **All colors from theme tokens** — zero hardcoded hex values in components; use `useTheme()`.
- **`FlatList` for all lists** — never `ScrollView` + `.map()`.
- **Three theme modes:** `light` (#FFFFFF bg), `dark` (#111111 bg), `extraDark` (#000000 bg, OLED).

Full design token definitions and the per-screen review checklist are in `docs/nmusic-implementation-plan.md`. The design reference is in `docs/design-guide/nothing-os-design-guide.md`.

## Navigation structure (target)

```
Root _layout.tsx
└── Tab Navigator (Home/Library, Search, Settings)
    └── Stack (overlays tabs)
        ├── /player          — full-screen, slides up
        ├── /album/[id]      — push
        ├── /artist/[id]     — push
        ├── /playlist/[id]   — push
        └── /queue           — modal sheet
```

Tab bar: icons only (no labels by default), no blur/glass, 1px top border, active state = small red dot indicator.
