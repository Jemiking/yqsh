import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Button, WeekIndicator } from '../components';
import { calculatePregnancyProgress, isValidDueDate } from '../lib/pregnancy';
import { saveProfile } from '../services/db/queries';
import { usePregnancyStore } from '../state';
import type { RootStackScreenProps } from '../navigation/types';

type Step = 'welcome' | 'dueDate' | 'complete';

export function OnboardingScreen({ navigation }: RootStackScreenProps<'Onboarding'>) {
  const [step, setStep] = useState<Step>('welcome');
  const [dueDate, setDueDate] = useState<Date>(dayjs().add(180, 'day').toDate());
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [saving, setSaving] = useState(false);
  const setProfile = usePregnancyStore((s) => s.setProfile);
  const calculateCurrentWeek = usePregnancyStore((s) => s.calculateCurrentWeek);

  const dueDateString = dayjs(dueDate).format('YYYY-MM-DD');
  const isValid = isValidDueDate(dueDateString);
  const progress = isValid ? calculatePregnancyProgress(dueDateString) : null;

  const handleDateChange = useCallback((_: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  }, []);

  const handleComplete = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await saveProfile(dueDateString);
      const profile = {
        id: 1,
        dueDate: dueDateString,
        locale: 'zh-CN',
        createdAt: dayjs().toISOString(),
        updatedAt: dayjs().toISOString(),
      };
      setProfile(profile);
      calculateCurrentWeek();
      navigation.replace('Main', { screen: 'Home' });
    } catch (e) {
      console.error('Failed to save profile:', e);
    } finally {
      setSaving(false);
    }
  };

  if (step === 'welcome') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.logo}>伴生</Text>
          <Text style={styles.tagline}>准爸爸的孕期伴侣</Text>
          <Text style={styles.description}>
            恭喜你，准爸爸。{'\n'}
            接下来的日子，我陪你一起走。
          </Text>
        </View>
        <View style={styles.footer}>
          <Button title="开始" onPress={() => setStep('dueDate')} />
        </View>
      </View>
    );
  }

  if (step === 'dueDate') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>宝宝预计什么时候到来？</Text>
            <Text style={styles.stepSubtitle}>
              输入预产期，我来帮你计算当前孕周
            </Text>
          </View>

          <View style={styles.dateSection}>
            {Platform.OS === 'android' && !showDatePicker && (
              <Button
                title={dayjs(dueDate).format('YYYY年M月D日')}
                variant="outline"
                onPress={() => setShowDatePicker(true)}
              />
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

          {progress && (
            <View style={styles.previewCard}>
              <WeekIndicator progress={progress} showDetails={true} />
            </View>
          )}

          {!isValid && (
            <Text style={styles.errorText}>
              预产期需要在合理范围内
            </Text>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="完成设置"
            onPress={handleComplete}
            disabled={!isValid}
            loading={saving}
          />
          <Button
            title="返回"
            variant="ghost"
            onPress={() => setStep('welcome')}
            style={styles.backButton}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  logo: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  tagline: {
    ...typography.h2,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  stepHeader: {
    marginBottom: spacing.xl,
  },
  stepTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  dateSection: {
    marginBottom: spacing.xl,
  },
  previewCard: {
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.avoid,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    marginTop: spacing.sm,
  },
});
