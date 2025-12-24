import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import { Button } from '../components';
import { getProfile, saveProfile } from '../services/db/queries';
import type { MainTabScreenProps } from '../navigation/types';
import type { MeasurementUnit, UserPreferences } from '../types';

type ReminderFrequency = 'daily' | 'weekly' | 'important_only';

const MEASUREMENT_OPTIONS: { id: MeasurementUnit; label: string }[] = [
  { id: 'metric', label: '公制 (kg/cm)' },
  { id: 'imperial', label: '英制 (lb/in)' },
];

const REMINDER_OPTIONS: { id: ReminderFrequency; label: string }[] = [
  { id: 'daily', label: '每日' },
  { id: 'weekly', label: '每周' },
  { id: 'important_only', label: '仅重要' },
];

export function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [dueDate, setDueDate] = useState<Date>(dayjs().add(180, 'day').toDate());
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('metric');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>('daily');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getProfile();
      if (profile) {
        setPartnerName(profile.partnerName || '');
        if (profile.dueDate) {
          const parsed = dayjs(profile.dueDate);
          if (parsed.isValid()) {
            setDueDate(parsed.toDate());
          }
        }
        setMeasurementUnit(profile.preferences.measurementUnit);
        setNotificationsEnabled(profile.preferences.notificationsEnabled);
        setReminderFrequency(profile.preferences.reminderFrequency);
      }
    } catch {
      Alert.alert('加载失败', '无法读取配置，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDateChange = useCallback((_: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  }, []);

  const handleSave = async () => {
    const dueDateString = dayjs(dueDate).format('YYYY-MM-DD');

    setSaving(true);
    try {
      const preferences: Partial<UserPreferences> = {
        measurementUnit,
        notificationsEnabled,
        reminderFrequency,
      };
      await saveProfile(dueDateString, partnerName || undefined, preferences);
      Alert.alert('成功', '设置已保存');
    } catch {
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headerTitle}>设置</Text>
        <Text style={styles.headerSubtitle}>个人信息与应用偏好</Text>

        {/* Section: 个人信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>个人信息</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>伴侣昵称（选填）</Text>
              <TextInput
                style={styles.input}
                value={partnerName}
                onChangeText={setPartnerName}
                placeholder="给她起个爱称"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>预产期</Text>
              {Platform.OS === 'android' && !showDatePicker && (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {dayjs(dueDate).format('YYYY年M月D日')}
                  </Text>
                </TouchableOpacity>
              )}
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={dayjs().subtract(2, 'week').toDate()}
                  maximumDate={dayjs().add(280, 'day').toDate()}
                  locale="zh-CN"
                />
              )}
            </View>
          </View>
        </View>

      {/* Section: 应用偏好 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>应用偏好</Text>
        <View style={styles.card}>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>计量单位</Text>
            <View style={styles.optionChips}>
              {MEASUREMENT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.chip, measurementUnit === opt.id && styles.chipActive]}
                  onPress={() => setMeasurementUnit(opt.id)}
                >
                  <Text style={[styles.chipText, measurementUnit === opt.id && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Section: 通知设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知设置</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.preferenceLabel}>启用通知</Text>
              <Text style={styles.preferenceDesc}>接收提醒和重要通知</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
            />
          </View>
          {notificationsEnabled && (
            <View style={styles.frequencySection}>
              <Text style={styles.preferenceLabel}>提醒频率</Text>
              <View style={styles.optionChips}>
                {REMINDER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.chip, reminderFrequency === opt.id && styles.chipActive]}
                    onPress={() => setReminderFrequency(opt.id)}
                  >
                    <Text style={[styles.chipText, reminderFrequency === opt.id && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Section: 应用设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>应用设置</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.getParent()?.navigate('Settings')}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.navLabel}>AI 助手配置</Text>
              <Text style={styles.navDesc}>设置模型、API Key 和服务商</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section: 关于 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>当前版本</Text>
            <Text style={styles.infoValue}>v0.1.0</Text>
          </View>
        </View>
      </View>

      {/* 保存按钮 */}
        <View style={styles.footer}>
          <Button title="保存设置" onPress={handleSave} loading={saving} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    minHeight: 50,
    ...typography.input,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: 'center',
  },
  dateButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  dateButtonText: {
    ...typography.body,
    color: colors.text,
  },
  preferenceRow: {
    marginBottom: spacing.sm,
  },
  preferenceLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  preferenceDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  optionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frequencySection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  navLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  navDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: colors.textMuted,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.body,
    color: colors.text,
  },
  infoValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.lg,
  },
});
