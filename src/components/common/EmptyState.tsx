import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme/spacing';
import { NText } from '@/components/ui/NText';
import { NButton } from '@/components/ui/NButton';

const GRID_COLS = 9;
const GRID_ROWS = 5;
const DOT = 3;
const DOT_GAP = 8;

interface EmptyStateProps {
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ message, ctaLabel, onCta }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Dot grid illustration */}
      <View style={styles.grid}>
        {Array.from({ length: GRID_ROWS }).map((_, row) => (
          <View key={row} style={styles.gridRow}>
            {Array.from({ length: GRID_COLS }).map((_, col) => {
              // Vary opacity to suggest a "missing" pattern
              const center =
                Math.abs(col - Math.floor(GRID_COLS / 2)) +
                Math.abs(row - Math.floor(GRID_ROWS / 2));
              const opacity = center === 0 ? 0 : center < 3 ? 0.12 : 0.25;
              return (
                <View
                  key={col}
                  style={[
                    styles.dot,
                    { backgroundColor: colors.textDisabled, opacity },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      <NText variant="caption" color="secondary" uppercase style={styles.message}>
        {message}
      </NText>

      {ctaLabel && onCta && (
        <NButton
          label={ctaLabel}
          onPress={onCta}
          variant="ghost"
          size="sm"
          style={styles.cta}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.s8,
    gap: Spacing.s4,
  },
  grid: {
    gap: DOT_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    gap: DOT_GAP,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: 1,
  },
  message: {
    textAlign: 'center',
  },
  cta: {
    alignSelf: 'center',
  },
});
