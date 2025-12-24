import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import {
  addContraction,
  endContraction,
  getContractions,
  clearContractions,
  updateAchievementProgress,
  addXPEvent,
  getDadGrowth,
  type ContractionRecord,
} from '../services/db/queries';
import { useDadStore } from '../state';
import type { RootStackScreenProps } from '../navigation/types';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function check511Pattern(records: ContractionRecord[]): boolean {
  if (records.length < 12) return false;
  const recent = records.slice(0, 12);
  if (!recent.every((r) => (r.durationSeconds ?? 0) >= 60)) return false;
  const latestStart = new Date(recent[0].startTime).getTime();
  const earliestStart = new Date(recent[recent.length - 1].startTime).getTime();
  const spanMinutes = Math.abs((latestStart - earliestStart) / 1000 / 60);
  if (spanMinutes < 55) return false;
  for (let i = 0; i < recent.length - 1; i++) {
    const t1 = new Date(recent[i].startTime).getTime();
    const t2 = new Date(recent[i + 1].startTime).getTime();
    const intervalMinutes = Math.abs((t1 - t2) / 1000 / 60);
    if (intervalMinutes > 5) return false;
  }
  return true;
}

export function ContractionTimerScreen({ navigation }: RootStackScreenProps<'ContractionTimer'>) {
  const insets = useSafeAreaInsets();
  const { addXP, setGrowth } = useDadStore();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [records, setRecords] = useState<ContractionRecord[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const startTimeRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadRecords();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const loadRecords = useCallback(async () => {
    const data = await getContractions(20);
    setRecords(data);
    setShowAlert(check511Pattern(data));
  }, []);

  const handleToggle = useCallback(async () => {
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (currentId && startTimeRef.current) {
        await endContraction(currentId, new Date().toISOString(), elapsed);
        const updated = await getContractions(20);
        setRecords(updated);
        setShowAlert(check511Pattern(updated));

        // Award XP and update achievement
        const xpAmount = 20;
        await addXPEvent('tool_use', xpAmount, currentId, 'contraction_session');
        addXP(xpAmount);
        const growth = await getDadGrowth();
        if (growth) {
          setGrowth(growth);
        }

        const unlocked = await updateAchievementProgress('calm_pressure', updated.length);
        if (unlocked) {
          Alert.alert('🎉 成就解锁', '临危不乱 - 完成5次宫缩记录！');
        }
      }
      setIsRunning(false);
      setElapsed(0);
      setCurrentId(null);
      startTimeRef.current = null;
    } else {
      const now = new Date().toISOString();
      startTimeRef.current = now;
      const id = await addContraction(now);
      setCurrentId(id);
      setIsRunning(true);
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }
  }, [isRunning, currentId, elapsed, addXP, setGrowth, loadRecords]);

  const handleClear = useCallback(() => {
    Alert.alert('清除记录', '确定要清除所有宫缩记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await clearContractions();
          setRecords([]);
          setShowAlert(false);
        },
      },
    ]);
  }, []);

  const getInterval = (index: number): string => {
    if (index >= records.length - 1) return '--';
    const t1 = new Date(records[index].startTime).getTime();
    const t2 = new Date(records[index + 1].startTime).getTime();
    const mins = Math.round((t1 - t2) / 1000 / 60);
    return `${mins}分钟`;
  };

  const renderItem = useCallback(
    ({ item, index }: { item: ContractionRecord; index: number }) => (
      <View style={styles.recordRow}>
        <Text style={styles.recordTime}>{formatTime(item.startTime)}</Text>
        <Text style={styles.recordDuration}>
          {item.durationSeconds ? formatDuration(item.durationSeconds) : '--'}
        </Text>
        <Text style={styles.recordInterval}>{getInterval(index)}</Text>
      </View>
    ),
    [records]
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
        <Text style={styles.title}>宫缩计时</Text>
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="清除记录"
        >
          <Ionicons name="trash-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {showAlert && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={20} color={colors.white} />
          <Text style={styles.alertText}>5-1-1 规律！建议联系医院</Text>
        </View>
      )}

      <View style={styles.timerSection}>
        <Text style={styles.timerLabel}>{isRunning ? '宫缩中' : '准备计时'}</Text>
        <Text style={styles.timerDisplay}>{formatDuration(elapsed)}</Text>
        <TouchableOpacity
          style={[styles.actionBtn, isRunning && styles.actionBtnActive]}
          onPress={handleToggle}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isRunning ? '停止计时' : '开始计时'}
        >
          <Text style={styles.actionBtnText}>{isRunning ? '停止' : '开始'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>历史记录</Text>
        <View style={styles.recordHeader}>
          <Text style={styles.colHeader}>时间</Text>
          <Text style={styles.colHeader}>持续</Text>
          <Text style={styles.colHeader}>间隔</Text>
        </View>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>暂无记录</Text>
        }
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
  clearBtn: {
    padding: spacing.sm,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emergency,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  alertText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  timerSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  timerLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: colors.primary,
    marginBottom: spacing.xl,
  },
  actionBtn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  actionBtnActive: {
    backgroundColor: colors.accent,
  },
  actionBtnText: {
    ...typography.h1,
    color: colors.white,
  },
  historyHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  historyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  colHeader: {
    flex: 1,
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  recordRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  recordTime: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  recordDuration: {
    flex: 1,
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  recordInterval: {
    flex: 1,
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
