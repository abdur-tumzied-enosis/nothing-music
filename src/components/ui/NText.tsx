import { Text, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/theme/typography';

type TextVariant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'micro';
type TextColor = 'primary' | 'secondary' | 'disabled' | 'accent';

interface NTextProps {
  variant?: TextVariant;
  color?: TextColor;
  uppercase?: boolean;
  ndot?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  children: React.ReactNode;
}

const variantSize: Record<TextVariant, number> = {
  display: Typography.sizes.display,
  h1:      Typography.sizes.h1,
  h2:      Typography.sizes.h2,
  h3:      Typography.sizes.h3,
  body:    Typography.sizes.body,
  caption: Typography.sizes.caption,
  micro:   Typography.sizes.micro,
};

const variantFont: Record<TextVariant, string> = {
  display: Typography.fonts.bodyMedium,
  h1:      Typography.fonts.bodyMedium,
  h2:      Typography.fonts.bodyMedium,
  h3:      Typography.fonts.bodyMedium,
  body:    Typography.fonts.body,
  caption: Typography.fonts.body,
  micro:   Typography.fonts.body,
};

export function NText({
  variant = 'body',
  color = 'primary',
  uppercase = false,
  ndot = false,
  style,
  numberOfLines,
  children,
}: NTextProps) {
  const { colors } = useTheme();

  const textColor = {
    primary:   colors.textPrimary,
    secondary: colors.textSecondary,
    disabled:  colors.textDisabled,
    accent:    colors.accent,
  }[color];

  const fontSize = variantSize[variant];
  const fontFamily = ndot ? Typography.fonts.ndot : variantFont[variant];
  const letterSpacing =
    uppercase || variant === 'caption' || variant === 'micro'
      ? Typography.letterSpacing.wide
      : variant === 'display' || variant === 'h1'
      ? Typography.letterSpacing.tight
      : Typography.letterSpacing.normal;

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontFamily,
          fontSize,
          color: textColor,
          letterSpacing,
          textTransform: uppercase ? 'uppercase' : 'none',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
