import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import {
  getChecklistItems,
  toggleChecklistItem,
  initDefaultChecklist,
  resetChecklist,
  updateAchievementProgress,
  type ChecklistItem,
} from '../services/db/queries';
import type { RootStackScreenProps } from '../navigation/types';

interface Section {
  title: string;
  data: ChecklistItem[];
  checkedCount: number;
  totalCount: number;
}

export function HospitalBagScreen({ navigation }: RootStackScreenProps<'HospitalBag'>) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    init();
  }, []);

  const init = useCallback(async () => {
    await initDefaultChecklist();
    const data = await getChecklistItems();
    setItems(data);
  }, []);

  const handleToggle = useCallback(async (item: ChecklistItem) => {
    const newChecked = !item.checked;
    await toggleChecklistItem(item.id, newChecked);

    const nextItems = items.map((i) =>
      i.id === item.id ? { ...i, checked: newChecked } : i
    );
    setItems(nextItems);

    const totalChecked = nextItems.filter((i) => i.checked).length;
    if (nextItems.length > 0 && totalChecked === nextItems.length) {
      const unlocked = await updateAchievementProgress('ready_bag', 1);
      if (unlocked) {
        Alert.alert('🎉 成就解锁', '整装待发 - 待产包100%完成！');
      }
    }
  }, [items]);

  const handleReset = useCallback(() => {
    Alert.alert('重置清单', '确定要将所有物品标记为未准备吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await resetChecklist();
          setItems((prev) => prev.map((i) => ({ ...i, checked: false })));
        },
      },
    ]);
  }, []);

  const toggleSection = useCallback((category: string) => {
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const sections: Section[] = useMemo(() => {
    const categoryMap = new Map<string, ChecklistItem[]>();
    for (const item of items) {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      categoryMap.get(item.category)!.push(item);
    }
    const order = ['妈妈用品', '宝宝用品', '证件资料', '爸爸用品'];
    return order
      .filter((cat) => categoryMap.has(cat))
      .map((cat) => {
        const data = categoryMap.get(cat)!;
        return {
          title: cat,
          data: collapsed[cat] ? [] : data,
          checkedCount: data.filter((i) => i.checked).length,
          totalCount: data.length,
        };
      });
  }, [items, collapsed]);

  const totalChecked = items.filter((i) => i.checked).length;
  const totalItems = items.length;
  const progress = totalItems > 0 ? totalChecked / totalItems : 0;

  const renderItem = useCallback(
    ({ item }: { item: ChecklistItem }) => (
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() => handleToggle(item)}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.checked }}
      >
        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
          {item.checked && <Ionicons name="checkmark" size={16} color={colors.white} />}
        </View>
        <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
          {item.itemName}
        </Text>
      </TouchableOpacity>
    ),
    [handleToggle]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(section.title)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionLeft}>
          <Ionicons
            name={collapsed[section.title] ? 'chevron-forward' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        <Text style={styles.sectionCount}>
          {section.checkedCount}/{section.totalCount}
        </Text>
      </TouchableOpacity>
    ),
    [collapsed, toggleSection]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="返回"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>待产包</Text>
        <TouchableOpacity
          onPress={handleReset}
          style={styles.resetBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="重置清单"
        >
          <Ionicons name="refresh-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>准备进度</Text>
          <Text style={styles.progressValue}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  resetBtn: {
    padding: spacing.sm,
  },
  progressSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...typography.body,
    color: colors.text,
  },
  progressValue: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.sm,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  sectionCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingLeft: spacing.xxl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.secondary,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  itemText: {
    ...typography.body,
    color: colors.text,
  },
  itemTextChecked: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
