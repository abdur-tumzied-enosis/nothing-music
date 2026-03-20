import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { NText } from '@/components/ui/NText';

export default function SearchScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <NText variant="caption" color="secondary" uppercase>Search</NText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
