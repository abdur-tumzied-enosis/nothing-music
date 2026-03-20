export const Typography = {
  fonts: {
    ndot:       'NDot57',            // dot-matrix display — requires assets/fonts/NDot57.ttf
    body:       'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
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
    tight:  -0.5,  // headlines
    normal:  0,
    wide:    0.8,  // chips, labels (ALL CAPS)
  },
  lineHeight: {
    tight:  1.2,
    normal: 1.6,
  },
} as const;
