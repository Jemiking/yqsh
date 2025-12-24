import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { chatColors, chatShadows } from './chatTheme';

interface ContextBarProps {
  summary: string;
}

export function ContextBar({ summary }: ContextBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="information-circle-outline" size={16} color={chatColors.contextText} />
      <Text style={styles.text}>{summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: chatColors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: chatColors.contextBorder,
    gap: spacing.sm,
    ...chatShadows.sm,
  },
  text: {
    ...typography.caption,
    color: chatColors.contextText,
    flex: 1,
  },
});
