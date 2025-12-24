import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import type { MainTabScreenProps } from '../navigation/types';

interface ToolCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

function ToolCard({ icon, title, subtitle, color, onPress }: ToolCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

export function ToolsScreen({ navigation }: MainTabScreenProps<'Tools'>) {
  const insets = useSafeAreaInsets();

  const tools = [
    {
      icon: 'timer-outline' as const,
      title: '宫缩计时',
      subtitle: '记录宫缩间隔',
      color: colors.accent,
      route: 'ContractionTimer' as const,
    },
    {
      icon: 'footsteps-outline' as const,
      title: '胎动计数',
      subtitle: '记录胎动次数',
      color: colors.secondary,
      route: 'KickCounter' as const,
    },
    {
      icon: 'bag-outline' as const,
      title: '待产包',
      subtitle: '准备清单',
      color: colors.primary,
      route: 'HospitalBag' as const,
    },
    {
      icon: 'call-outline' as const,
      title: '紧急联系',
      subtitle: '一键拨打',
      color: colors.emergency,
      route: 'EmergencyContacts' as const,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
    >
      <Text style={styles.header}>实用工具</Text>
      <View style={styles.grid}>
        {tools.map((tool) => (
          <ToolCard
            key={tool.route}
            icon={tool.icon}
            title={tool.title}
            subtitle={tool.subtitle}
            color={tool.color}
            onPress={() => navigation.navigate(tool.route)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  card: {
    width: '48%',
    aspectRatio: 1.1,
    margin: '1%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.sm,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
