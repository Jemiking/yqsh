import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import type { PregnancyProgress } from '../lib/pregnancy';
import { getTrimesterName, getBabySizeComparison } from '../lib/pregnancy';

interface WeekIndicatorProps {
  progress: PregnancyProgress;
  showDetails?: boolean;
}

export function WeekIndicator({ progress, showDetails = true }: WeekIndicatorProps) {
  const babySize = getBabySizeComparison(progress.currentWeek);
  const trimesterName = getTrimesterName(progress.trimester);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.weekText}>
          第{progress.currentWeek}周第{progress.currentDay}天
        </Text>
        <Text style={styles.trimesterText}>{trimesterName}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress.progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress.progressPercent}%</Text>
      </View>

      {showDetails && (
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>宝宝大小</Text>
            <Text style={styles.detailValue}>{babySize.comparison}</Text>
            <Text style={styles.detailSubtext}>{babySize.size} / {babySize.weight}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>距离预产期</Text>
            <Text style={styles.detailValue}>{progress.daysUntilDue}天</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weekText: {
    ...typography.h2,
    color: colors.primary,
  },
  trimesterText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
  details: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.h3,
    color: colors.text,
  },
  detailSubtext: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
