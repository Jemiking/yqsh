import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius, shadows } from '../../../constants/theme';
import { useTimelineStore, usePregnancyStore } from '../../../state';
import { WEEKLY_DATA, getWeeksByTrimester } from '../../../data/weeklyData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = SCREEN_WIDTH < 380 ? 4 : 5;
const CELL_MARGIN = spacing.xs;
const CELL_SIZE = (SCREEN_WIDTH - spacing.md * 2 - CELL_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const TRIMESTER_COLORS: Record<1 | 2 | 3, string> = {
  1: colors.secondary,
  2: colors.primary,
  3: colors.accent,
};

const TRIMESTER_NAMES: Record<1 | 2 | 3, string> = {
  1: '孕早期 (1-12周)',
  2: '孕中期 (13-27周)',
  3: '孕晚期 (28-40周)',
};

export function GridView() {
  const { setViewMode } = useTimelineStore();
  const { currentWeek } = usePregnancyStore();

  const clampedCurrentWeek = Math.max(1, Math.min(40, currentWeek || 1));

  const handleCellPress = useCallback(
    (week: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setViewMode('focus', week);
    },
    [setViewMode]
  );

  const renderTrimester = (trimester: 1 | 2 | 3) => {
    const weeks = getWeeksByTrimester(trimester);
    const trimesterColor = TRIMESTER_COLORS[trimester];

    return (
      <View key={trimester} style={styles.trimesterSection}>
        <View style={[styles.trimesterHeader, { backgroundColor: trimesterColor + '20' }]}>
          <Text style={[styles.trimesterTitle, { color: trimesterColor }]}>
            {TRIMESTER_NAMES[trimester]}
          </Text>
        </View>
        <View style={styles.grid}>
          {weeks.map((weekData) => {
            const isCurrent = weekData.week === clampedCurrentWeek;
            const isPast = weekData.week < clampedCurrentWeek;

            return (
              <TouchableOpacity
                key={weekData.week}
                style={[
                  styles.cell,
                  isPast && { backgroundColor: trimesterColor },
                  isCurrent && [styles.currentCell, { borderColor: trimesterColor }],
                  !isPast && !isCurrent && styles.futureCell,
                ]}
                onPress={() => handleCellPress(weekData.week)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`第${weekData.week}周，${weekData.baby.comparison}${isCurrent ? '，当前周' : ''}`}
              >
                <Text
                  style={[
                    styles.cellWeek,
                    isPast && styles.cellWeekPast,
                    isCurrent && { color: trimesterColor, fontWeight: '700' },
                    !isPast && !isCurrent && styles.cellWeekFuture,
                  ]}
                >
                  {weekData.week}
                </Text>
                {isPast && (
                  <Ionicons name="checkmark" size={12} color={colors.white} />
                )}
                {isCurrent && (
                  <View style={[styles.currentDot, { backgroundColor: trimesterColor }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {([1, 2, 3] as const).map(renderTrimester)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  trimesterSection: {
    marginBottom: spacing.lg,
  },
  trimesterHeader: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  trimesterTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -CELL_MARGIN / 2,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: CELL_MARGIN / 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  currentCell: {
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  futureCell: {
    backgroundColor: colors.surfaceVariant,
  },
  cellWeek: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  cellWeekPast: {
    color: colors.white,
  },
  cellWeekFuture: {
    color: colors.textMuted,
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
});
