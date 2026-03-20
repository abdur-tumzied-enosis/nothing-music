import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme/spacing';
import { NText } from './NText';

interface NChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function NChip({ label, active = false, onPress, style }: NChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? colors.surfaceRaised : 'transparent',
          borderColor: active ? colors.surfaceRaised : colors.border,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <NText
        variant="micro"
        color={active ? 'primary' : 'secondary'}
        uppercase
      >
        {label}
      </NText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: Spacing.s1,
    paddingHorizontal: Spacing.s3,
    alignSelf: 'flex-start',
  },
});
