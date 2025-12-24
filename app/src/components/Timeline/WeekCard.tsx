import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import type { WeekData } from '../../data/weeklyData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface WeekCardProps {
  data: WeekData;
  isCurrent: boolean;
  isPast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const TRIMESTER_COLORS: Record<1 | 2 | 3, string> = {
  1: colors.secondary,
  2: colors.primary,
  3: colors.accent,
};

export function WeekCard({ data, isCurrent, isPast, isExpanded, onToggle }: WeekCardProps) {
  const trimesterColor = TRIMESTER_COLORS[data.trimester];
  const nodeColor = isCurrent ? trimesterColor : isPast ? colors.disabled : colors.primaryLight;

  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    onToggle();
  };

  return (
    <View style={styles.container}>
      <View style={styles.timelineColumn}>
        <View style={styles.timelineLine} />
        <View
          style={[
            styles.timelineNode,
            {
              borderColor: nodeColor,
              backgroundColor: isCurrent ? nodeColor : colors.surface,
              borderWidth: isCurrent ? 0 : 2,
            },
          ]}
        >
          {isCurrent && <View style={styles.currentIndicator} />}
          {isPast && <Ionicons name="checkmark" size={10} color={colors.textMuted} />}
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel={`孕周${data.week}，${data.baby.comparison}`}
        accessibilityState={{ expanded: isExpanded, selected: isCurrent }}
        style={[
          styles.card,
          isCurrent && { borderColor: trimesterColor, borderWidth: 2, ...shadows.md },
          isPast && { opacity: 0.75 },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.weekBadge}>
            <Text style={[styles.weekText, isCurrent && { color: trimesterColor, fontWeight: 'bold' }]}>
              {data.week}周
            </Text>
          </View>
          <Text style={styles.comparisonText} numberOfLines={1}>
            {data.baby.comparison}
          </Text>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.developmentText} numberOfLines={isExpanded ? undefined : 1}>
            {data.baby.keyDevelopment}
          </Text>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="resize-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>长度: {data.baby.sizeCm}cm</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="scale-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>重量: {data.baby.weightG}g</Text>
            </View>

            {data.momSymptoms.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>妈妈可能症状</Text>
                {data.momSymptoms.map((s, i) => (
                  <View key={i} style={styles.symptomItem}>
                    <Text style={styles.symptomText}>{s.symptom}</Text>
                    <Text style={styles.actionText}>{s.dadAction}</Text>
                  </View>
                ))}
              </View>
            )}

            {data.warningSigns.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.accent }]}>危险信号</Text>
                {data.warningSigns.map((w, i) => (
                  <View key={i} style={styles.warningItem}>
                    <View style={styles.warningHeader}>
                      <Ionicons name="warning" size={14} color={w.urgency === 'EMERGENCY' ? colors.accent : colors.warning} />
                      <Text style={styles.warningText}>{w.symptom}</Text>
                    </View>
                    <Text style={styles.warningAction}>{w.action}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>爸爸行动</Text>
              <View style={styles.dadActionRow}>
                <Ionicons name="sunny-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.dadActionText}>早: {data.dadDaily.morning}</Text>
              </View>
              <View style={styles.dadActionRow}>
                <Ionicons name="moon-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.dadActionText}>晚: {data.dadDaily.evening}</Text>
              </View>
            </View>

            {data.weekTasks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>本周任务</Text>
                {data.weekTasks.map((task, i) => (
                  <View key={i} style={styles.taskRow}>
                    <Ionicons name="checkbox-outline" size={14} color={colors.secondary} />
                    <Text style={styles.taskText}>{task}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.tipContainer}>
              <Ionicons name="bulb-outline" size={16} color={colors.primary} />
              <Text style={styles.tipText}>{data.tip}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    minHeight: 80,
  },
  timelineColumn: {
    width: 36,
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  timelineLine: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  timelineNode: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    marginTop: 14,
  },
  currentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekText: {
    ...typography.h3,
    color: colors.text,
  },
  comparisonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  cardBody: {
    marginTop: spacing.xs,
  },
  developmentText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
  },
  expandedContent: {
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  symptomItem: {
    marginBottom: spacing.xs,
  },
  symptomText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  actionText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  warningItem: {
    marginBottom: spacing.sm,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  warningAction: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginLeft: spacing.lg,
  },
  dadActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dadActionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  taskText: {
    ...typography.bodySmall,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.primaryLight + '15',
    borderRadius: borderRadius.md,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: spacing.sm,
    flex: 1,
    fontStyle: 'italic',
  },
});
