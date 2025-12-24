import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

interface TaskCardProps {
  title: string;
  description?: string;
  completed?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
}

export function TaskCard({
  title,
  description,
  completed = false,
  onPress,
  onToggle,
}: TaskCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, completed && styles.containerCompleted]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`任务：${title}${completed ? '，已完成' : ''}`}
    >
      <TouchableOpacity
        style={[styles.checkbox, completed && styles.checkboxCompleted]}
        onPress={onToggle}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={completed ? '标记为未完成' : '标记为已完成'}
      >
        {completed && <Ionicons name="checkmark" size={16} color={colors.white} />}
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.titleCompleted]}>{title}</Text>
        {description && (
          <Text style={[styles.description, completed && styles.descriptionCompleted]}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  containerCompleted: {
    backgroundColor: colors.surfaceVariant,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: colors.safe,
    borderColor: colors.safe,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  titleCompleted: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  descriptionCompleted: {
    color: colors.textMuted,
  },
});
