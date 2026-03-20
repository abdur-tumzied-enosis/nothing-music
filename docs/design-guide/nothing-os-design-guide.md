# Nothing OS — UI Design Guide

> A comprehensive design reference for building apps that feel native to the Nothing OS aesthetic. Inspired by Nothing Technology Limited's design language across Nothing OS 1.x through 4.0.

---

## 1. Design Philosophy

Nothing OS is built on a single idea: **remove everything that doesn't need to be there.**

| Principle | What it means in practice |
|---|---|
| **Intentional minimalism** | Every element must earn its place. If it doesn't serve the user, remove it. |
| **Mindful technology** | Design to reduce distraction, not increase engagement for its own sake. |
| **Honest materials** | Transparent, raw, dot-matrix aesthetics — no skeuomorphism, no false depth. |
| **Function first** | Aesthetics follow function. Beautiful because it works, not the other way around. |
| **Monochrome clarity** | Black, white, and grey do the heavy lifting. Colour is used sparingly and purposefully. |

---

## 2. Colour Palette

Nothing OS uses a near-total monochrome system with a single accent colour for emphasis.

### Core Palette

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-background` | `#FFFFFF` | `#000000` | Page / screen background |
| `--color-surface` | `#F5F5F5` | `#111111` | Cards, sheets, panels |
| `--color-surface-raised` | `#EBEBEB` | `#1A1A1A` | Elevated cards, modals |
| `--color-border` | `#E0E0E0` | `#2A2A2A` | Dividers, outlines |
| `--color-text-primary` | `#0A0A0A` | `#F0F0F0` | Headlines, body |
| `--color-text-secondary` | `#6B6B6B` | `#8A8A8A` | Subtext, captions, hints |
| `--color-text-disabled` | `#BABABA` | `#404040` | Disabled states |

### Accent Colour

Nothing uses **red** as its singular accent — used only to highlight the most important interactive element on a screen at any one time.

| Token | Value | Usage |
|---|---|---|
| `--color-accent` | `#FF2400` | CTAs, active states, highlights |
| `--color-accent-muted` | `#FF240020` | Accent backgrounds, tags |

> ⚠️ **Rule:** Never use the accent colour decoratively. One accent element per view maximum.

### Extra Dark Mode

Nothing OS 4.0 introduced "Extra Dark" mode — all dark surfaces are pushed to true `#000000`, creating maximum contrast with no grey midtones. When building for OLED screens, support this mode.

---

## 3. Typography

Nothing's typeface system was created in collaboration with **Colophon Foundry**, drawing from IBM's 1980s mainframe era — raw, digital, and brutally functional.

### Type Family

| Typeface | Use case |
|---|---|
| **NDot** (dot-matrix) | Iconic display text, widget numerals, section headers, lock screen |
| **NType 82** | Brand headings, large UI labels |
| **NType 82 Mono** | Data values, timestamps, code-adjacent content |
| **Inter / Roboto** | Body text, settings copy, long-form content (system fallback) |

> NDot is Nothing's most iconic element — the dot-matrix letterforms that made the OS recognisable. Use it for numbers, large headlines, and UI moments that need character.

### Type Scale

| Level | Size | Weight | Typeface | Usage |
|---|---|---|---|---|
| Display | 48–64px | Regular | NDot / NType 82 | Widget numbers, hero stats |
| H1 | 32px | Medium | NType 82 / Inter | Screen titles |
| H2 | 24px | Medium | Inter | Section headers |
| H3 | 18px | Medium | Inter | Card titles, list group headers |
| Body | 16px | Regular | Inter | Default content text |
| Caption | 13px | Regular | Inter | Secondary labels, metadata |
| Micro | 11px | Regular | Inter | Badges, timestamps |

### Typography Rules

- **Tight letter-spacing** on headlines: `letter-spacing: -0.02em`
- **Generous line-height** on body: `line-height: 1.6`
- Avoid italic styles — Nothing OS uses weight and size for emphasis, not slant
- ALL CAPS is used sparingly, only for section labels or status chips

---

## 4. Iconography

### The Dot Language

Nothing's icon system is built from **dot-matrix grids**. Icons are outlines, not filled, and use the same dot construction as the NDot typeface.

| Property | Value |
|---|---|
| Grid | 24×24px base (48×48px @2x) |
| Stroke weight | 1.5px |
| Style | Outlined, geometric |
| Corner radius | Minimal — sharp geometry preferred |
| Fill | None (outline only) |
| Dot accents | Applied to key icons for brand flair |

### Icon Rules

- Use a **monochromatic icon pack** — no multi-colour icons unless showing app logos
- Icons must be legible at 20px
- Prefer geometric simplicity over illustrative detail
- Avoid gradients and shadows on icons entirely

---

## 5. Spacing & Layout

Nothing OS uses a strict **8px base grid**. All spacing values are multiples of 8 (or 4 for micro adjustments).

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro gaps, inline padding |
| `space-2` | 8px | Tight component padding |
| `space-3` | 12px | Default inner padding |
| `space-4` | 16px | Standard padding, list items |
| `space-5` | 24px | Section spacing, card padding |
| `space-6` | 32px | Large section gaps |
| `space-8` | 48px | Screen-level breathing room |

### Layout Principles

- **Content-first layouts** — let content define the structure, not rigid templates
- **Generous whitespace** — empty space is not wasted space; it creates focus
- **Left-aligned text** throughout (avoid centred body text)
- Avoid deep nesting of cards within cards — maximum 2 levels of surface elevation

### Screen Margins

| Breakpoint | Horizontal Margin |
|---|---|
| Mobile | 16px |
| Tablet | 24px |
| Responsive cap | Max content width: 640px |

---

## 6. Components

### Buttons

Nothing buttons are understated. The default action uses a ghost (outline) treatment; only the primary CTA gets the filled style.

```
Primary Button
─────────────────────────────
Background: #0A0A0A (light) / #F0F0F0 (dark)
Text: #FFFFFF (light) / #000000 (dark)
Border radius: 4px  ← sharp, not pill
Padding: 12px 24px
Font: Inter Medium, 15px

Ghost Button
─────────────────────────────
Background: transparent
Border: 1.5px solid --color-border
Text: --color-text-primary
Border radius: 4px

Accent Button (use sparingly)
─────────────────────────────
Background: #FF2400
Text: #FFFFFF
Border radius: 4px
```

> **Rule:** Rounded pill buttons (`border-radius: 999px`) conflict with Nothing's sharp geometry. Keep corners tight — 4–8px maximum.

### Cards & Surfaces

```
Default Card
─────────────────────────────
Background: --color-surface
Border: 1px solid --color-border
Border radius: 12px
Padding: 16–24px
Shadow: none (flat design)

Elevated Card
─────────────────────────────
Background: --color-surface-raised
Border: none
Border radius: 12px
Box shadow: 0 2px 12px rgba(0,0,0,0.08)
```

No gradients. No glass morphism. Flat, solid surfaces only.

### Widgets (Dot Style)

Nothing's home screen widgets are a signature element. When building widget-like UI components:

- Use NDot/NType 82 Mono for all numeric values
- Build from dot-grid construction where possible
- Keep widget content to one primary data point + minimal supporting text
- Use dotted outlines or progress arcs, not solid fills

### Inputs & Forms

```
Text Input
─────────────────────────────
Border: 1.5px solid --color-border
Border (focused): 1.5px solid --color-text-primary
Background: transparent
Border radius: 6px
Padding: 12px 16px
Label: above the field, Caption size, uppercase
```

- No floating labels — Nothing uses above-field labels
- Avoid box shadows on inputs
- Error state uses `--color-accent` red underline only

### Toggle / Switch

Nothing's toggles are monochrome by default — grey when off, black/white when on. The accent red is only used if the toggle controls a critical or warning-level setting.

### Chips & Tags

```
Chip
─────────────────────────────
Background: --color-surface
Border: 1px solid --color-border
Border radius: 4px  ← not pill
Padding: 4px 10px
Font: Caption, uppercase, letter-spacing: 0.06em
```

---

## 7. Dot-Matrix Design Language

The dot motif is Nothing's most distinctive visual signature. Apply it thoughtfully:

### Where to use dots

| Context | Application |
|---|---|
| Display numerals | Use NDot font for large numbers (timers, stats, counters) |
| Progress indicators | Dot-based progress arcs or stepped dot trails |
| Decorative dividers | Dotted lines instead of solid lines |
| Loading states | Animated dot sequences instead of spinners |
| Illustrations | Simple dot-grid icons for empty states |
| Animations | Ripple dot patterns (e.g., fingerprint unlock effect) |

### Where NOT to use dots

- Body text — readability drops significantly below 18px with NDot
- Data tables or dense information layouts
- Inline within long-form copy

---

## 8. Motion & Animation

Nothing OS uses **minimal, purposeful animation**. No decorative or gratuitous transitions.

| Property | Value |
|---|---|
| Duration (micro) | 100–150ms |
| Duration (standard) | 200–250ms |
| Duration (screen) | 300–350ms |
| Easing | `cubic-bezier(0.2, 0, 0, 1)` — fast out, slow ease |
| Default transition | Fade + subtle vertical translate (8px) |

### Animation Rules

- Avoid bounce or spring physics — keep it linear and confident
- No looping animations unless showing an active/live state
- Prefer opacity transitions over scale transforms for content
- Unlock / fingerprint animations can use rippling dot motifs (signature Nothing moment)

---

## 9. Dark Mode & Extra Dark Mode

Nothing OS has three display modes:

| Mode | Description | Background |
|---|---|---|
| Light | Default white UI | `#FFFFFF` |
| Dark | Standard dark UI (grey surfaces) | `#111111` |
| Extra Dark | True black, OLED-optimised | `#000000` |

### Design for all three

- Never hardcode colours — always reference semantic tokens
- Test all screens in Extra Dark mode — no surface should look "muddy"
- In Extra Dark, borders may need to be slightly brighter (`#333333`) to remain visible

---

## 10. Glyph Interface Principles

The Glyph Interface (LED strips on the phone back) informs how Nothing thinks about ambient information delivery. Translate this philosophy to your app UI:

- Surface the **most important status** in the most visible place
- Use progressive disclosure — don't show everything at once
- Prefer **silent, ambient updates** over intrusive alerts
- Status indicators should be glanceable in under 1 second

In practice this means: favour status dots, subtle badge counts, and persistent-but-quiet status indicators over banners and modal alerts.

---

## 11. Quick Reference Checklist

Use this when reviewing any screen you design:

- [ ] Is the background strictly white, black, or a grey in the defined palette?
- [ ] Is there at most **one red accent** element on this screen?
- [ ] Are all buttons using sharp corners (≤8px radius)?
- [ ] Is NDot or NType 82 used for any display/hero numerals?
- [ ] Are icons outlined, not filled?
- [ ] Is whitespace generous — does every element have room to breathe?
- [ ] Are there zero gradients or glass effects?
- [ ] Does this screen work in Extra Dark mode?
- [ ] Is animation under 300ms with a fast-out easing?
- [ ] Can the key information on this screen be understood in under 2 seconds?

---

## 12. What to Avoid

| ❌ Avoid | ✅ Instead |
|---|---|
| Gradients | Flat solid fills |
| Glass morphism / frosted effects | Opaque surfaces with clear borders |
| Pill-shaped buttons (999px radius) | Sharp corners, 4–8px radius |
| Multi-colour icons | Monochrome outlined icons |
| Bright, saturated colours beyond red | Monochrome + single red accent |
| Heavy drop shadows | Borders and surface contrast |
| Playful, rounded typefaces | NType 82, NDot, Inter |
| Feature-dense screens | One primary action per screen |
| Auto-playing animations | User-triggered or state-driven motion only |

---

*Guide compiled from Nothing OS 1.0 through 4.0 design language, Nothing Technology Limited. This is an independent reference guide for developers and designers.*
