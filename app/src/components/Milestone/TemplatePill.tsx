import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface TemplatePillProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}

export function TemplatePill({ label, icon, selected, onPress }: TemplatePillProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected ? styles.selectedContainer : styles.unselectedContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon}
        size={16}
        color={selected ? colors.white : colors.textSecondary}
        style={styles.icon}
      />
      <Text style={[styles.text, selected ? styles.selectedText : styles.unselectedText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
  },
  selectedContainer: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unselectedContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  selectedText: {
    color: colors.white,
  },
  unselectedText: {
    color: colors.textSecondary,
  },
});
