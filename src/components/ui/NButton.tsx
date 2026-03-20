import { Pressable, View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme/spacing';
import { NText } from './NText';

type ButtonVariant = 'primary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';
type FeatherName = React.ComponentProps<typeof Feather>['name'];

interface NButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: FeatherName;
  style?: StyleProp<ViewStyle>;
}

export function NButton({
  label,
  onPress,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  icon,
  style,
}: NButtonProps) {
  const { colors } = useTheme();

  const bgColor = {
    primary: disabled ? colors.textDisabled : colors.accent,
    ghost:   'transparent',
    danger:  'transparent',
  }[variant];

  const borderColor = {
    primary: 'transparent',
    ghost:   disabled ? colors.textDisabled : colors.border,
    danger:  disabled ? colors.textDisabled : colors.accent,
  }[variant];

  const textColor: 'primary' | 'secondary' | 'disabled' | 'accent' = disabled
    ? 'disabled'
    : variant === 'primary'
    ? 'primary'
    : variant === 'danger'
    ? 'accent'
    : 'primary';

  const iconColor = disabled
    ? colors.textDisabled
    : variant === 'primary'
    ? colors.textPrimary
    : variant === 'danger'
    ? colors.accent
    : colors.textPrimary;

  const paddingV = size === 'sm' ? Spacing.s2 : Spacing.s3;
  const paddingH = size === 'sm' ? Spacing.s3 : Spacing.s4;
  const iconSize = size === 'sm' ? 14 : 16;
  const textVariant = size === 'sm' ? 'micro' : 'caption';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {icon && (
        <View style={styles.iconWrap}>
          <Feather name={icon} size={iconSize} color={iconColor} />
        </View>
      )}
      <NText variant={textVariant} color={textColor} uppercase style={styles.label}>
        {label}
      </NText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconWrap: {
    marginRight: Spacing.s2,
  },
  label: {
    includeFontPadding: false,
  },
});
