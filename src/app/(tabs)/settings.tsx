import { NDivider } from '@/components/ui/NDivider';
import { NText } from '@/components/ui/NText';
import { useSleepTimer } from '@/hooks/useSleepTimer';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';
import { SortOrder, ThemeMode } from '@/store/types';
import { Spacing } from '@/theme/spacing';
import { formatTime } from '@/utils/formatTime';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';


const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'LIGHT', value: 'light' },
  { label: 'DARK', value: 'dark' },
  { label: 'EXTRA DARK', value: 'extraDark' },
];

const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: 'A–Z', value: 'az' },
  { label: 'DATE ADDED', value: 'dateAdded' },
  { label: 'ARTIST', value: 'artist' },
];

const SLEEP_OPTIONS = [15, 30, 45, 60] as const;

export default function SettingsScreen() {
  const { colors } = useTheme();
  const {
    themeMode,
    sortOrder,
    hapticFeedback,
    sleepTimerMinutes,
    sleepTimerEndTime,
    setThemeMode,
    setSortOrder,
    setHapticFeedback,
    startSleepTimer,
    cancelSleepTimer,
  } = useSettingsStore();

  const { remaining } = useSleepTimer();
  const timerActive = sleepTimerEndTime !== null;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <NText variant="h2">Settings</NText>
      </View>

      {/* ── Appearance ── */}
      <SectionHeader label="Appearance" />

      <SettingLabel label="Theme" />
      <View style={styles.chipRow}>
        {THEME_OPTIONS.map(({ label, value }) => (
          <OptionChip
            key={value}
            label={label}
            active={themeMode === value}
            onPress={() => setThemeMode(value)}
            colors={colors}
          />
        ))}
      </View>

      <NDivider style={styles.divider} />

      {/* ── Library ── */}
      <SectionHeader label="Library" />

      <SettingLabel label="Sort tracks by" />
      <View style={styles.chipRow}>
        {SORT_OPTIONS.map(({ label, value }) => (
          <OptionChip
            key={value}
            label={label}
            active={sortOrder === value}
            onPress={() => setSortOrder(value)}
            colors={colors}
          />
        ))}
      </View>

      <NDivider style={styles.divider} />

      {/* ── Playback ── */}
      <SectionHeader label="Playback" />

      <View style={styles.toggleRow}>
        <NText variant="body">Haptic Feedback</NText>
        <Switch
          value={hapticFeedback}
          onValueChange={setHapticFeedback}
          trackColor={{ false: colors.border, true: colors.accent + '40' }}
          thumbColor={hapticFeedback ? colors.accent : colors.textSecondary}
        />
      </View>

      <NDivider style={styles.divider} />

      {/* ── Sleep Timer ── */}
      <SectionHeader label="Sleep Timer" />

      <View style={styles.chipRow}>
        <OptionChip
          label="OFF"
          active={!timerActive && sleepTimerMinutes === null}
          onPress={cancelSleepTimer}
          colors={colors}
        />
        {SLEEP_OPTIONS.map((min) => (
          <OptionChip
            key={min}
            label={`${min} MIN`}
            active={timerActive && sleepTimerMinutes === min}
            onPress={() => startSleepTimer(min)}
            colors={colors}
          />
        ))}
      </View>

      {timerActive && remaining !== null && (
        <View style={styles.countdownRow}>
          <NText variant="caption" color="secondary" uppercase>
            Pauses in{' '}
          </NText>
          <NText variant="caption" ndot>
            {formatTime(remaining)}
          </NText>
        </View>
      )}

      <NDivider style={styles.divider} />

      {/* ── About ── */}
      <SectionHeader label="About" />
      <View style={styles.aboutRow}>
        <NText variant="body" color="textSecondary">
          App Version
        </NText>
        <NText variant="body" color="textPrimary">
          1.0.0
        </NText>
      </View>
      <View style={styles.aboutRow}>
        <NText variant="body" color="textSecondary">
          Developed by
        </NText>
        <NText variant="body" color="textPrimary">
          Tumzied
        </NText>
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <NText
      variant="caption"
      color="secondary"
      uppercase
      style={styles.sectionHeader}
    >
      {label}
    </NText>
  );
}

function SettingLabel({ label }: { label: string }) {
  return (
    <NText variant="caption" color="secondary" style={styles.settingLabel}>
      {label}
    </NText>
  );
}

interface OptionChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}

function OptionChip({ label, active, onPress, colors }: OptionChipProps) {
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

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screenH,
    paddingTop: Spacing.s8,
  },
  header: {
    marginBottom: Spacing.s6,
  },
  sectionHeader: {
    marginBottom: Spacing.s3,
  },
  settingLabel: {
    marginBottom: Spacing.s2,
    marginTop: Spacing.s1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s2,
    marginBottom: Spacing.s4,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: Spacing.s1,
    paddingHorizontal: Spacing.s3,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.s3,
    marginBottom: Spacing.s4,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -Spacing.s2,
    marginBottom: Spacing.s4,
  },
  divider: {
    marginBottom: Spacing.s5,
  },
  bottomPad: {
    height: Spacing.s8,
  },
});
