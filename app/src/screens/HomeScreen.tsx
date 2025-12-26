import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import { WeekIndicator, TaskCard, DadLevelCard } from '../components';
import { usePregnancyStore, useDadStore } from '../state';
import { calculatePregnancyProgress, getBabySizeComparison, getTrimesterName } from '../lib/pregnancy';
import { getDadGrowth, initDadGrowth, initAchievements } from '../services/db/queries';
import type { MainTabScreenProps } from '../navigation/types';

interface DailyTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const { profile, currentWeek, currentDay, trimester, daysUntilDue } = usePregnancyStore();
  const { setGrowth } = useDadStore();

  useEffect(() => {
    const initGrowth = async () => {
      await initDadGrowth();
      await initAchievements();
      const growth = await getDadGrowth();
      if (growth) {
        setGrowth(growth);
      }
    };
    initGrowth();
  }, []);

  const progress = useMemo(() => {
    if (!profile?.dueDate) return null;
    return calculatePregnancyProgress(profile.dueDate);
  }, [profile?.dueDate]);

  const babySize = getBabySizeComparison(currentWeek || 20);
  const trimesterName = getTrimesterName(trimester || 2);

  const dailyTasks: DailyTask[] = useMemo(() => {
    if (!currentWeek) return [];
    return [
      {
        id: '1',
        title: '关心她今天的状态',
        description: '问问她今天感觉怎么样，不用解决问题，只需倾听。',
        completed: false,
      },
      {
        id: '2',
        title: '准备一杯温水',
        description: `${trimesterName}需要充足的水分摄入。`,
        completed: false,
      },
      {
        id: '3',
        title: '帮她按摩放松',
        description: currentWeek > 20 ? '腰部可能会酸，轻轻按摩帮助她放松。' : '陪她散步或做轻柔运动。',
        completed: false,
      },
    ];
  }, [currentWeek, trimesterName]);

  const handleTaskToggle = (taskId: string) => {
    // TODO: Implement task toggle with database
    console.log('Toggle task:', taskId);
  };

  const goToAssistant = () => {
    navigation.navigate('Assistant');
  };

  if (!profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>请先完成引导设置</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>早上好，队长</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            accessibilityRole="button"
            accessibilityLabel="打开个人设置"
          >
            <Ionicons name="person-circle-outline" size={32} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {progress && (
          <View style={styles.statusCard}>
            <WeekIndicator progress={progress} showDetails={true} />
          </View>
        )}

        <DadLevelCard onPress={() => navigation.navigate('Achievements')} />

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>今日提示</Text>
          <Text style={styles.tipText}>
            {currentWeek && currentWeek <= 13
              ? '孕早期最重要的是保证充足休息和叶酸摄入。'
              : currentWeek && currentWeek <= 27
              ? '孕中期是比较舒适的时期，可以开始准备宝宝用品了。'
              : '孕晚期要密切关注胎动，随时准备好待产包。'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日任务</Text>
          {dailyTasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              description={task.description}
              completed={task.completed}
              onToggle={() => handleTaskToggle(task.id)}
            />
          ))}
        </View>

        <View style={styles.babyInfo}>
          <View style={styles.babyInfoIcon}>
            <Text style={styles.babyEmoji}>{babySize.emoji}</Text>
          </View>
          <View style={styles.babyInfoContent}>
            <Text style={styles.babyInfoTitle}>宝宝现在像</Text>
            <Text style={styles.babyInfoSize}>{babySize.comparison}</Text>
            <Text style={styles.babyInfoDetails}>
              {babySize.size} / {babySize.weight}
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={goToAssistant} activeOpacity={0.8}>
        <Ionicons name="chatbubble-ellipses" size={24} color={colors.white} />
        <Text style={styles.fabText}>问问大哥</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h1,
    color: colors.text,
  },
  profileButton: {
    padding: spacing.xs,
  },
  statusCard: {
    marginBottom: spacing.lg,
  },
  tipCard: {
    backgroundColor: colors.secondaryLight + '30',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  tipTitle: {
    ...typography.bodySmall,
    color: colors.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  babyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  babyInfoIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  babyEmoji: {
    fontSize: 28,
  },
  babyInfoContent: {
    flex: 1,
  },
  babyInfoTitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  babyInfoSize: {
    ...typography.h2,
    color: colors.primary,
    marginVertical: spacing.xs,
  },
  babyInfoDetails: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  fabText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
