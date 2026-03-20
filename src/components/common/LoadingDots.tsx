import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const DOT_SIZE = 6;
const STAGGER = 120;

function Dot({ delay, color }: { delay: number; color: string }) {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0.2, { duration: 200 }),
          withTiming(0.2, { duration: STAGGER * 2 }) // wait before next cycle
        ),
        -1,
        false
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, { backgroundColor: color }, animStyle]} />;
}

export function LoadingDots() {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Dot delay={0} color={colors.textSecondary} />
      <Dot delay={STAGGER} color={colors.textSecondary} />
      <Dot delay={STAGGER * 2} color={colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DOT_SIZE,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: 2,
  },
});
