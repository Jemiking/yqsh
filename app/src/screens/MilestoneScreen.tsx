import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';

import { colors, spacing, typography, shadows, borderRadius } from '../constants/theme';
import { MilestoneCard } from '../components/Milestone';
import { getMilestones, deleteMilestone } from '../services/db/queries';
import type { Milestone } from '../types';
import type { RootStackScreenProps } from '../navigation/types';

export function MilestoneScreen({ navigation }: RootStackScreenProps<'Milestone'>) {
  const insets = useSafeAreaInsets();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMilestones = useCallback(async () => {
    const data = await getMilestones();
    setMilestones(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMilestones();
    }, [loadMilestones])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMilestones();
    setRefreshing(false);
  }, [loadMilestones]);

  const handleAddPress = () => {
    navigation.navigate('AddMilestone', {});
  };

  const handleCardPress = (milestone: Milestone) => {
    navigation.navigate('AddMilestone', { id: milestone.id });
  };

  const handleCardLongPress = (milestone: Milestone) => {
    Alert.alert(
      milestone.title,
      '选择操作',
      [
        {
          text: '编辑',
          onPress: () => navigation.navigate('AddMilestone', { id: milestone.id }),
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => confirmDelete(milestone),
        },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  const confirmDelete = (milestone: Milestone) => {
    Alert.alert(
      '确认删除',
      `确定要删除「${milestone.title}」吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await deleteMilestone(milestone.id);
            loadMilestones();
          },
        },
      ]
    );
  };

  const formatWeekStr = (week?: number): string => {
    if (!week) return '';
    return `孕${week}周`;
  };

  const formatDateStr = (date: string): string => {
    return dayjs(date).format('YYYY.MM.DD');
  };

  const renderItem = ({ item, index }: { item: Milestone; index: number }) => (
    <MilestoneCard
      milestone={item}
      weekStr={formatWeekStr(item.week)}
      dateStr={formatDateStr(item.date)}
      isLast={index === milestones.length - 1}
      onPress={() => handleCardPress(item)}
      onLongPress={() => handleCardLongPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="flag-outline" size={48} color={colors.secondaryLight} />
      </View>
      <Text style={styles.emptyTitle}>开启记录之旅</Text>
      <Text style={styles.emptyText}>
        第一次心跳、第一次胎动、第一次为宝宝购物...{'\n'}
        这些瞬间都值得被珍藏。
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddPress}>
        <Text style={styles.emptyButtonText}>记录第一个里程碑</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="返回"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>里程碑</Text>
          <Text style={styles.headerSubtitle}>Captain's Log</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={milestones}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="添加里程碑"
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
  },
  emptyButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
