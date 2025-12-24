import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import {
  startKickSession,
  incrementKickCount,
  endKickSession,
  addXPEvent,
  getDadGrowth,
} from '../services/db/queries';
import { useDadStore } from '../state';
import type { RootStackScreenProps } from '../navigation/types';

const TARGET_KICKS = 10;
const CIRCLE_SIZE = 200;
const STROKE_WIDTH = 12;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}分${s.toString().padStart(2, '0')}秒`;
}

export function KickCounterScreen({ navigation }: RootStackScreenProps<'KickCounter'>) {
  const insets = useSafeAreaInsets();
  const { addXP, setGrowth } = useDadStore();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const countRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const handleStart = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const id = await startKickSession();
    if (id === -1) return;
    setSessionId(id);
    setCount(0);
    countRef.current = 0;
    setElapsed(0);
    setCompleted(false);
    intervalRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
  }, []);

  const handleKick = useCallback(async () => {
    if (!sessionId) return;
    const newCount = countRef.current + 1;
    setCount(newCount);
    await incrementKickCount(sessionId);
    if (newCount >= TARGET_KICKS) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      await endKickSession(sessionId);
      setCompleted(true);

      // Award XP for completing kick session
      const xpAmount = 30;
      await addXPEvent('tool_use', xpAmount, sessionId, 'kick_session_complete');
      addXP(xpAmount);
      const growth = await getDadGrowth();
      if (growth) {
        setGrowth(growth);
      }
    }
  }, [sessionId, addXP, setGrowth]);

  const handleReset = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sessionId) {
      await endKickSession(sessionId);
    }
    setSessionId(null);
    setCount(0);
    countRef.current = 0;
    setElapsed(0);
    setCompleted(false);
  }, [sessionId]);

  const progress = Math.min(count / TARGET_KICKS, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

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
        <Text style={styles.title}>胎动计数</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
            <Circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              stroke={colors.border}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <Circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              stroke={completed ? colors.safe : colors.secondary}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
            />
          </Svg>
          <View style={styles.countOverlay}>
            <Text style={styles.countText}>{count}</Text>
            <Text style={styles.targetText}>/ {TARGET_KICKS} 次</Text>
          </View>
        </View>

        {sessionId && (
          <Text style={styles.elapsedText}>已计时：{formatElapsed(elapsed)}</Text>
        )}

        {completed ? (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={48} color={colors.safe} />
            <Text style={styles.successText}>已达标！宝宝很活跃</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>重新开始</Text>
            </TouchableOpacity>
          </View>
        ) : sessionId ? (
          <TouchableOpacity
            style={styles.kickBtn}
            onPress={handleKick}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="记录胎动"
          >
            <Ionicons name="footsteps" size={32} color={colors.white} />
            <Text style={styles.kickBtnText}>感觉到胎动</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStart}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="开始计数"
          >
            <Text style={styles.startBtnText}>开始计数</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.hintText}>
          建议在饭后1小时内计数，目标10次胎动
        </Text>
      </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  progressContainer: {
    position: 'relative',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  countText: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  targetText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  elapsedText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  kickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
    marginTop: spacing.xl,
    ...shadows.md,
  },
  kickBtnText: {
    ...typography.h3,
    color: colors.white,
  },
  startBtn: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
    marginTop: spacing.xl,
    ...shadows.md,
  },
  startBtnText: {
    ...typography.h3,
    color: colors.white,
  },
  successContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  successText: {
    ...typography.h3,
    color: colors.safe,
    marginTop: spacing.md,
  },
  resetBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resetBtnText: {
    ...typography.button,
    color: colors.primary,
  },
  hintText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
});
