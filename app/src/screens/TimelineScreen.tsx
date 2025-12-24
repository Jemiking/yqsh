import React, { useEffect } from 'react';
import { View, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import { usePregnancyStore, useTimelineStore } from '../state';
import { TimelineViewSwitcher } from '../components/Timeline';
import { FocusView, JourneyView, GridView } from '../components/Timeline/views';
import type { MainTabScreenProps } from '../navigation/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function TimelineScreen({ navigation }: MainTabScreenProps<'Timeline'>) {
  const insets = useSafeAreaInsets();
  const { currentWeek } = usePregnancyStore();
  const { viewMode, setFocusedWeek } = useTimelineStore();

  useEffect(() => {
    if (currentWeek && currentWeek > 0) {
      setFocusedWeek(currentWeek);
    }
  }, [currentWeek, setFocusedWeek]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [viewMode]);

  const renderView = () => {
    switch (viewMode) {
      case 'focus':
        return <FocusView />;
      case 'grid':
        return <GridView />;
      case 'journey':
      default:
        return <JourneyView />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TimelineViewSwitcher />
      </View>
      <View style={styles.content}>{renderView()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
});
