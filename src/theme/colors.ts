export const Colors = {
  light: {
    background:    '#FFFFFF',
    surface:       '#F5F5F5',
    surfaceRaised: '#EBEBEB',
    border:        '#E0E0E0',
    textPrimary:   '#0A0A0A',
    textSecondary: '#6B6B6B',
    textDisabled:  '#BABABA',
    accent:        '#FF2400',
    accentMuted:   '#FF240020',
  },
  dark: {
    background:    '#111111',
    surface:       '#111111',
    surfaceRaised: '#1A1A1A',
    border:        '#2A2A2A',
    textPrimary:   '#F0F0F0',
    textSecondary: '#8A8A8A',
    textDisabled:  '#404040',
    accent:        '#FF2400',
    accentMuted:   '#FF240020',
  },
  extraDark: {
    background:    '#000000',
    surface:       '#000000',
    surfaceRaised: '#0D0D0D',
    border:        '#333333',
    textPrimary:   '#F0F0F0',
    textSecondary: '#8A8A8A',
    textDisabled:  '#404040',
    accent:        '#FF2400',
    accentMuted:   '#FF240020',
  },
} as const;

export type ThemeMode = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ThemeMode];
