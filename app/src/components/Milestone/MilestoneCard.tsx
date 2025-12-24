import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { isHighlightTemplate } from '../../knowledge/milestoneTemplates';
import type { Milestone } from '../../types';

interface MilestoneCardProps {
  milestone: Milestone;
  weekStr: string;
  dateStr: string;
  isLast?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function MilestoneCard({
  milestone,
  weekStr,
  dateStr,
  isLast = false,
  onPress,
  onLongPress,
}: MilestoneCardProps) {
  const isHighlight = isHighlightTemplate(milestone.templateId);

  return (
    <View style={styles.container}>
      {/* Timeline Line & Dot */}
      <View style={styles.timelineContainer}>
        <View style={[styles.line, isLast && styles.lineHidden]} />
        <View style={[styles.dot, isHighlight ? styles.dotHighlight : styles.dotNormal]}>
          {isHighlight && <View style={styles.dotInner} />}
        </View>
      </View>

      {/* Card Content */}
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`${milestone.title}，${weekStr}，${dateStr}`}
      >
        <View style={styles.header}>
          <View style={styles.weekBadge}>
            <Text style={styles.weekText}>{weekStr}</Text>
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>

        {milestone.photoUri && (
          <Image source={{ uri: milestone.photoUri }} style={styles.photo} />
        )}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{milestone.title}</Text>
            {isHighlight && (
              <Ionicons name="star" size={16} color={colors.accent} style={styles.icon} />
            )}
          </View>

          {milestone.description && (
            <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
              {milestone.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  timelineContainer: {
    width: 40,
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    top: 0,
    bottom: -spacing.sm,
    width: 2,
    backgroundColor: colors.secondaryLight + '40',
    zIndex: -1,
  },
  lineHidden: {
    bottom: '50%',
  },
  dot: {
    marginTop: 24,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background,
    zIndex: 1,
  },
  dotNormal: {
    backgroundColor: colors.secondary,
  },
  dotHighlight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    marginTop: 22,
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    position: 'absolute',
    top: 3,
    left: 3,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    marginRight: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weekBadge: {
    backgroundColor: colors.secondaryLight + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  weekText: {
    ...typography.caption,
    color: colors.secondaryDark,
    fontWeight: '700',
  },
  dateText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  photo: {
    width: '100%',
    height: 160,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceVariant,
  },
  content: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  icon: {
    marginTop: 2,
  },
});
