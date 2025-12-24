import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius, shadows } from '../../../constants/theme';
import { useTimelineStore, usePregnancyStore } from '../../../state';
import { WEEKLY_DATA, WeekData } from '../../../data/weeklyData';

const CARD_MARGIN = spacing.md;

function getCardWidth() {
  const { width } = Dimensions.get('window');
  return width - CARD_MARGIN * 2;
}

const TRIMESTER_COLORS: Record<1 | 2 | 3, string> = {
  1: colors.secondary,
  2: colors.primary,
  3: colors.accent,
};

const TRIMESTER_NAMES: Record<1 | 2 | 3, string> = {
  1: '孕早期',
  2: '孕中期',
  3: '孕晚期',
};

export function FocusView() {
  const { focusedWeek, setFocusedWeek } = useTimelineStore();
  const { currentWeek } = usePregnancyStore();
  const flatListRef = useRef<FlatList<WeekData>>(null);
  const lastReportedWeek = useRef(focusedWeek);
  const [cardWidth, setCardWidth] = useState(getCardWidth());

  const clampedCurrentWeek = Math.max(1, Math.min(40, currentWeek || 1));

  useEffect(() => {
    if (focusedWeek !== lastReportedWeek.current) {
      lastReportedWeek.current = focusedWeek;
      flatListRef.current?.scrollToIndex({
        index: focusedWeek - 1,
        animated: true,
      });
    }
  }, [focusedWeek]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: cardWidth + CARD_MARGIN,
      offset: (cardWidth + CARD_MARGIN) * index,
      index,
    }),
    [cardWidth]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: WeekData }> }) => {
      if (viewableItems.length > 0) {
        const week = viewableItems[0].item.week;
        if (week !== lastReportedWeek.current) {
          lastReportedWeek.current = week;
          Haptics.selectionAsync();
          setFocusedWeek(week);
        }
      }
    },
    [setFocusedWeek]
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const renderItem = useCallback(
    ({ item }: { item: WeekData }) => {
      const isCurrent = item.week === clampedCurrentWeek;
      const isPast = item.week < clampedCurrentWeek;
      const trimesterColor = TRIMESTER_COLORS[item.trimester];

      return (
        <View style={[styles.cardContainer, { width: cardWidth }]}>
          <View style={[styles.trimesterHeader, { backgroundColor: trimesterColor }]}>
            <Text style={styles.trimesterText}>{TRIMESTER_NAMES[item.trimester]}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.weekHeader}>
              <Text style={[styles.weekNumber, { color: trimesterColor }]}>
                第 {item.week} 周
              </Text>
              {isCurrent && (
                <View style={[styles.currentBadge, { backgroundColor: trimesterColor }]}>
                  <Text style={styles.currentBadgeText}>本周</Text>
                </View>
              )}
              {isPast && <Text style={styles.pastLabel}>已过</Text>}
            </View>

            <View style={styles.babySection}>
              <Text style={styles.comparison}>{item.baby.comparison}</Text>
              <View style={styles.sizeRow}>
                <Text style={styles.sizeText}>{item.baby.sizeCm}cm · {item.baby.weightG}g</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.developmentSection}>
              <Text style={styles.sectionTitle}>关键发育</Text>
              <Text style={styles.developmentText}>{item.baby.keyDevelopment}</Text>
            </View>

            {item.weekTasks.length > 0 && (
              <View style={styles.tasksSection}>
                <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
                  🎯 爸爸任务
                </Text>
                {item.weekTasks.map((task, i) => (
                  <View key={i} style={styles.taskRow}>
                    <Text style={styles.taskBullet}>□</Text>
                    <Text style={styles.taskText}>{task}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.tipContainer}>
              <Text style={styles.tipText}>💡 {item.tip}</Text>
            </View>
          </View>
        </View>
      );
    },
    [clampedCurrentWeek]
  );

  const keyExtractor = useCallback((item: WeekData) => item.week.toString(), []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={WEEKLY_DATA}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={Math.max(0, focusedWeek - 1)}
        snapToInterval={cardWidth + CARD_MARGIN}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onLayout={() => setCardWidth(getCardWidth())}
        accessibilityHint="左右滑动切换周数"
      />
      <View style={styles.indicator}>
        <Text style={styles.indicatorText}>
          {focusedWeek} / 40
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN / 2,
  },
  cardContainer: {
    marginHorizontal: CARD_MARGIN / 2,
    flex: 1,
  },
  trimesterHeader: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  trimesterText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weekNumber: {
    ...typography.h1,
    fontWeight: '700',
  },
  currentBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  currentBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  pastLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  babySection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  comparison: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  sizeRow: {
    marginTop: spacing.xs,
  },
  sizeText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  developmentSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  developmentText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  tasksSection: {
    marginBottom: spacing.md,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  taskBullet: {
    ...typography.body,
    color: colors.secondary,
    marginRight: spacing.xs,
  },
  taskText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  tipContainer: {
    backgroundColor: colors.primaryLight + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: 'auto',
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontStyle: 'italic',
  },
  indicator: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  indicatorText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
});
