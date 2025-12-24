import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDadStore } from '../state';
import { getAchievements } from '../services/db/queries';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import type { RootStackScreenProps } from '../navigation/types';
import type { AchievementCategory, Achievement } from '../types';

const CATEGORY_CONFIG: Record<AchievementCategory, { title: string; color: string; icon: string }> = {
  connection: { title: '情感连接', color: '#E07A5F', icon: 'heart' },
  care: { title: '日常关怀', color: '#84A98C', icon: 'shield-checkmark' },
  preparedness: { title: '待产准备', color: '#475569', icon: 'briefcase' },
  consistency: { title: '坚持不懈', color: '#F59E0B', icon: 'calendar' },
  learning: { title: '学习成长', color: '#64748B', icon: 'book' },
};

export function AchievementsScreen({ navigation }: RootStackScreenProps<'Achievements'>) {
  const insets = useSafeAreaInsets();
  const { achievements, setAchievements } = useDadStore();

  useEffect(() => {
    const loadAchievements = async () => {
      const data = await getAchievements();
      setAchievements(data);
    };
    loadAchievements();
  }, [setAchievements]);

  const { totalPoints, completedCount, groupedAchievements } = useMemo(() => {
    const totalPoints = achievements.reduce((sum, a) => sum + (a.completed ? a.points : 0), 0);
    const completedCount = achievements.filter((a) => a.completed).length;

    const grouped: Record<string, Achievement[]> = {};
    achievements.forEach((a) => {
      if (!grouped[a.category]) grouped[a.category] = [];
      grouped[a.category].push(a);
    });

    const orderedCategories: AchievementCategory[] = [
      'connection',
      'care',
      'preparedness',
      'consistency',
      'learning',
    ];

    const sortedGrouped = orderedCategories
      .filter((cat) => grouped[cat]?.length > 0)
      .map((cat) => ({
        id: cat,
        ...CATEGORY_CONFIG[cat],
        items: grouped[cat],
      }));

    return { totalPoints, completedCount, groupedAchievements: sortedGrouped };
  }, [achievements]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="返回"
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>成就墙</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>总成就点</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {completedCount}
              <Text style={styles.statTotal}> / {achievements.length}</Text>
            </Text>
            <Text style={styles.statLabel}>已解锁</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {groupedAchievements.map((group) => (
          <View key={group.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={group.icon as any} size={20} color={group.color} />
              <Text style={[styles.sectionTitle, { color: group.color }]}>{group.title}</Text>
            </View>

            <View style={styles.grid}>
              {group.items.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} color={group.color} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function AchievementCard({ achievement, color }: { achievement: Achievement; color: string }) {
  const isUnlocked = achievement.completed;
  const progress = isUnlocked
    ? 100
    : Math.min(((achievement.progress || 0) / achievement.target) * 100, 100);

  return (
    <View style={[styles.card, isUnlocked && { borderColor: color + '80', borderWidth: 2 }]}>
      <View style={[styles.badge, isUnlocked ? { backgroundColor: color + '20' } : styles.badgeLocked]}>
        <Ionicons
          name={(achievement.icon as any) || 'trophy'}
          size={24}
          color={isUnlocked ? color : colors.textMuted}
        />
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, !isUnlocked && styles.textLocked]} numberOfLines={1}>
          {achievement.title}
        </Text>
        <Text style={[styles.cardDesc, !isUnlocked && styles.textLocked]} numberOfLines={2}>
          {achievement.description}
        </Text>
      </View>

      {isUnlocked ? (
        <View style={[styles.pointsBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.pointsText, { color }]}>+{achievement.points}</Text>
        </View>
      ) : (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.progressText}>
            {achievement.progress}/{achievement.target}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 100,
  },
  statValue: {
    ...typography.h1,
    color: colors.white,
    fontSize: 28,
  },
  statTotal: {
    fontSize: 16,
    color: colors.primaryLight,
  },
  statLabel: {
    ...typography.caption,
    color: colors.primaryLight,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.primaryLight + '50',
    marginHorizontal: spacing.lg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    alignItems: 'center',
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeLocked: {
    backgroundColor: colors.background,
  },
  cardContent: {
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  cardTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 14,
  },
  textLocked: {
    color: colors.textMuted,
  },
  pointsBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  pointsText: {
    ...typography.caption,
    fontWeight: '700',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    fontSize: 10,
    color: colors.textMuted,
  },
});
