import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { getTrimesterName } from '../../lib/pregnancy';

interface TrimesterHeaderProps {
  trimester: 1 | 2 | 3;
}

const TRIMESTER_COLORS: Record<1 | 2 | 3, string> = {
  1: colors.secondary,
  2: colors.primary,
  3: colors.accent,
};

export function TrimesterHeader({ trimester }: TrimesterHeaderProps) {
  const color = TRIMESTER_COLORS[trimester];

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.text}>{getTrimesterName(trimester)}</Text>
      </View>
      <View style={[styles.line, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  text: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  line: {
    flex: 1,
    height: 1,
    opacity: 0.4,
  },
});
