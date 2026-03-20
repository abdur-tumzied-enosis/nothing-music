import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { NText } from '@/components/ui/NText';
import { Spacing } from '@/theme/spacing';

interface SectionHeaderProps {
  title: string;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({ title, style }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <NText variant="caption" color="secondary" uppercase>
        {title}
      </NText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.s2,
  },
});
