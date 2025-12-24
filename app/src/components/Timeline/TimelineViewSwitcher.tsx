import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useTimelineStore, type TimelineViewMode } from '../../state';

interface ViewOption {
  mode: TimelineViewMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const VIEW_OPTIONS: ViewOption[] = [
  { mode: 'focus', label: '本周', icon: 'albums-outline' },
  { mode: 'journey', label: '旅程', icon: 'list-outline' },
  { mode: 'grid', label: '全览', icon: 'grid-outline' },
];

const BUTTON_WIDTH = 72;

export function TimelineViewSwitcher() {
  const { viewMode, setViewMode } = useTimelineStore();
  const slideAnim = useRef(new Animated.Value(0)).current;

  const activeIndex = VIEW_OPTIONS.findIndex((o) => o.mode === viewMode);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * BUTTON_WIDTH,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  }, [activeIndex, slideAnim]);

  const handlePress = (mode: TimelineViewMode) => {
    if (mode !== viewMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setViewMode(mode);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.track} accessibilityRole="tablist">
        <Animated.View
          style={[
            styles.activeIndicator,
            { transform: [{ translateX: slideAnim }] },
          ]}
        />
        {VIEW_OPTIONS.map((option) => {
          const isActive = viewMode === option.mode;
          return (
            <TouchableOpacity
              key={option.mode}
              style={styles.button}
              onPress={() => handlePress(option.mode)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={option.label}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={isActive ? colors.primary : colors.textMuted}
                style={styles.icon}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.full,
    padding: 3,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: BUTTON_WIDTH,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  button: {
    width: BUTTON_WIDTH,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.primary,
  },
});
