import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface NDividerProps {
  style?: StyleProp<ViewStyle>;
}

export function NDivider({ style }: NDividerProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.divider,
        { borderBottomColor: colors.border },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
});
