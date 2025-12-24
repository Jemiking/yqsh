import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDadStore, LEVELS } from '../../state';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

interface DadLevelCardProps {
  onPress?: () => void;
}

export function DadLevelCard({ onPress }: DadLevelCardProps) {
  const { growth, recentXpGain } = useDadStore();

  const prevLevelXp = LEVELS.find((l) => l.level === growth.level)?.xp ?? 0;
  const levelRange = growth.nextLevelXp - prevLevelXp;
  const currentProgress = growth.xp - prevLevelXp;
  const progressPercent = Math.min(Math.max(currentProgress / levelRange, 0), 1) * 100;

  const xpAnimValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (recentXpGain) {
      xpAnimValue.setValue(1);
      Animated.timing(xpAnimValue, {
        toValue: 0,
        duration: 2500,
        useNativeDriver: true,
      }).start();
    }
  }, [recentXpGain]);

  const xpGainOpacity = xpAnimValue.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 1, 1],
  });

  const xpGainTranslate = xpAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`当前等级 ${growth.title}，经验值 ${growth.xp}`}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>当前等级</Text>
          <View style={styles.rankRow}>
            <Text style={styles.rankTitle}>{growth.title}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{growth.level}</Text>
            </View>
          </View>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="medal" size={32} color={colors.accent} />
          {recentXpGain && (
            <Animated.View
              style={[
                styles.xpGainBadge,
                {
                  opacity: xpGainOpacity,
                  transform: [{ translateY: xpGainTranslate }],
                },
              ]}
            >
              <Text style={styles.xpGainText}>+{recentXpGain}</Text>
            </Animated.View>
          )}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.xpRow}>
          <Text style={styles.xpText}>{growth.xp} XP</Text>
          <Text style={styles.xpTextTarget}> / {growth.nextLevelXp} XP</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rankTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  levelBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  levelText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  iconContainer: {
    position: 'relative',
  },
  xpGainBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  xpGainText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  progressContainer: {
    marginBottom: spacing.xs,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 3,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  xpText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  xpTextTarget: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
