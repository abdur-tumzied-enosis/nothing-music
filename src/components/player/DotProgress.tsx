import { View, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

const DOT_COUNT = 40;
const DOT_SIZE = 4;

interface DotProgressProps {
  position: number;  // ms
  duration: number;  // ms
  onSeek?: (ms: number) => void;
}

export function DotProgress({ position, duration, onSeek }: DotProgressProps) {
  const { colors } = useTheme();
  const [barWidth, setBarWidth] = useState(0);

  const progress = duration > 0 ? position / duration : 0;
  const filledCount = Math.round(progress * DOT_COUNT);

  const handlePress = (e: { nativeEvent: { locationX: number } }) => {
    if (!onSeek || barWidth === 0 || duration === 0) return;
    const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
    onSeek(Math.floor(ratio * duration));
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  };

  return (
    <Pressable
      onPress={handlePress}
      onLayout={handleLayout}
      style={styles.container}
    >
      {Array.from({ length: DOT_COUNT }, (_, i) => {
        const filled = i < filledCount;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: filled ? colors.textPrimary : 'transparent',
                borderColor: filled ? colors.textPrimary : colors.border,
              },
            ]}
          />
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: 2,
    borderWidth: 1,
  },
});
