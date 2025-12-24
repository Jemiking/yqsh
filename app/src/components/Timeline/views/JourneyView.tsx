import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { colors, spacing } from '../../../constants/theme';
import { useTimelineStore, usePregnancyStore } from '../../../state';
import { WEEKLY_DATA, WeekData } from '../../../data/weeklyData';
import { TrimesterHeader } from '../TrimesterHeader';
import { WeekCard } from '../WeekCard';

export function JourneyView() {
  const { focusedWeek, setFocusedWeek, expandedWeek, setExpandedWeek } = useTimelineStore();
  const { currentWeek } = usePregnancyStore();
  const flatListRef = useRef<FlatList<WeekData>>(null);
  const hasScrolledRef = useRef(false);
  const lastVisibleWeek = useRef<number | null>(focusedWeek ?? null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const clampedCurrentWeek =
    typeof currentWeek === 'number' && currentWeek > 0
      ? Math.min(40, Math.max(1, currentWeek))
      : null;

  useEffect(() => {
    if (clampedCurrentWeek && !expandedWeek) {
      setExpandedWeek(clampedCurrentWeek);
    }
  }, [clampedCurrentWeek, expandedWeek, setExpandedWeek]);

  useEffect(() => {
    const targetWeek = clampedCurrentWeek ?? focusedWeek;
    if (targetWeek && flatListRef.current && !hasScrolledRef.current) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: targetWeek - 1,
          animated: true,
          viewPosition: 0.3,
        });
        hasScrolledRef.current = true;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [focusedWeek, clampedCurrentWeek]);

  const toggleExpand = useCallback(
    (week: number) => {
      setExpandedWeek(expandedWeek === week ? null : week);
      setFocusedWeek(week);
    },
    [expandedWeek, setExpandedWeek, setFocusedWeek]
  );

  const onScrollToIndexFailed = useCallback(
    (info: { index: number }) => {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0.3,
        });
      }, 500);
    },
    []
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: WeekData }> }) => {
      if (!viewableItems.length) return;
      const week = viewableItems[0].item.week;
      if (week !== lastVisibleWeek.current) {
        lastVisibleWeek.current = week;
        setFocusedWeek(week);
      }
    },
    [setFocusedWeek]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: WeekData; index: number }) => {
      const isFirstOfTrimester =
        index === 0 || WEEKLY_DATA[index - 1].trimester !== item.trimester;
      const isPast = clampedCurrentWeek ? item.week < clampedCurrentWeek : false;
      const isCurrent = item.week === clampedCurrentWeek;
      const isExpanded = expandedWeek === item.week;

      return (
        <View>
          {isFirstOfTrimester && <TrimesterHeader trimester={item.trimester} />}
          <WeekCard
            data={item}
            isCurrent={isCurrent}
            isPast={isPast}
            isExpanded={isExpanded}
            onToggle={() => toggleExpand(item.week)}
          />
        </View>
      );
    },
    [clampedCurrentWeek, expandedWeek, toggleExpand]
  );

  const keyExtractor = useCallback((item: WeekData) => item.week.toString(), []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={WEEKLY_DATA}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={11}
        onScrollToIndexFailed={onScrollToIndexFailed}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS !== 'web'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
});
