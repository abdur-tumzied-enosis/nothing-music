import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme/spacing';

interface NCardProps {
  children: React.ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NCard({ children, padded = false, style }: NCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
  },
  padded: {
    padding: Spacing.s4,
  },
});
