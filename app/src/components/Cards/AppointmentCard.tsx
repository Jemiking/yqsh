import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

interface AppointmentCardProps {
  title: string;
  date: string;
  time?: string;
  location?: string;
  onPress?: () => void;
}

export function AppointmentCard({
  title,
  date,
  time,
  location,
  onPress,
}: AppointmentCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name="calendar" size={20} color={colors.accent} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>
          {date}
          {time && ` ${time}`}
        </Text>
        {location && <Text style={styles.location}>{location}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    ...shadows.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  date: {
    ...typography.bodySmall,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  location: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
