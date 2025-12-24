import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import dayjs from 'dayjs';

import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import { milestoneTemplates } from '../knowledge/milestoneTemplates';
import { usePregnancyStore, useDadStore } from '../state';
import {
  addMilestone,
  updateMilestone,
  getMilestoneById,
  addXPEvent,
  getDadGrowth,
  updateAchievementProgress,
  getMilestones,
} from '../services/db/queries';
import type { RootStackScreenProps } from '../navigation/types';

export function AddMilestoneScreen({ navigation, route }: RootStackScreenProps<'AddMilestone'>) {
  const insets = useSafeAreaInsets();
  const { currentWeek } = usePregnancyStore();
  const { addXP, setGrowth } = useDadStore();

  const editId = route.params?.id;
  const isEditing = !!editId;

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [week, setWeek] = useState<number | undefined>(currentWeek ?? undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing && editId) {
      loadMilestone(editId);
    }
  }, [editId]);

  const loadMilestone = async (id: number) => {
    const milestone = await getMilestoneById(id);
    if (milestone) {
      setTitle(milestone.title);
      setDate(milestone.date);
      setNote(milestone.description ?? '');
      setImageUri(milestone.photoUri ?? null);
      setWeek(milestone.week ?? undefined);
      setSelectedTemplateId(milestone.templateId ?? null);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = milestoneTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setTitle(template.titleZh);
      if (!note) {
        setNote(template.defaultDescription);
      }
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('权限不足', '需要访问相册权限来添加照片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入标题');
      return;
    }

    setLoading(true);
    try {
      const milestoneData = {
        title: title.trim(),
        description: note.trim() || undefined,
        date,
        week,
        photoUri: imageUri ?? undefined,
        templateId: selectedTemplateId ?? undefined,
      };

      let savedId: number;
      if (isEditing && editId) {
        await updateMilestone(editId, milestoneData);
        savedId = editId;
      } else {
        savedId = await addMilestone(milestoneData);

        // Award XP for new milestone
        const xpAmount = 50;
        await addXPEvent('milestone', xpAmount, savedId, title);
        addXP(xpAmount);

        // Refresh growth from DB
        const growth = await getDadGrowth();
        if (growth) {
          setGrowth(growth);
        }

        // Update achievement progress
        const allMilestones = await getMilestones();
        await updateAchievementProgress('first_milestone', Math.min(allMilestones.length, 1));
        await updateAchievementProgress('milestone_3', allMilestones.length);
      }

      Alert.alert(
        isEditing ? '已更新' : '记录成功',
        isEditing ? '里程碑已更新' : '获得 50 点经验值！',
        [{ text: '好的', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="取消"
        >
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? '编辑里程碑' : '记录里程碑'}</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="保存"
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveText}>保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快速选择</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateList}
          >
            {milestoneTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.id;
              return (
                <TouchableOpacity
                  key={template.id}
                  style={[styles.templateChip, isSelected && styles.templateChipSelected]}
                  onPress={() => handleTemplateSelect(template.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Ionicons
                    name={template.icon as any}
                    size={16}
                    color={isSelected ? colors.white : colors.textSecondary}
                  />
                  <Text style={[styles.templateText, isSelected && styles.templateTextSelected]}>
                    {template.titleZh}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Photo */}
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={pickImage}
          accessibilityRole="button"
          accessibilityLabel="添加照片"
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={48} color={colors.secondaryLight} />
              <Text style={styles.photoPlaceholderText}>添加照片</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>标题</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="例如：第一次听到心跳"
              placeholderTextColor={colors.textMuted}
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>日期</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                keyboardType={Platform.OS === 'ios' ? 'default' : 'default'}
              />
              <TouchableOpacity
                style={styles.todayButton}
                onPress={() => setDate(dayjs().format('YYYY-MM-DD'))}
              >
                <Text style={styles.todayButtonText}>今天</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>孕周（可选）</Text>
            <TextInput
              style={styles.input}
              value={week?.toString() ?? ''}
              onChangeText={(text) => {
                const parsed = parseInt(text, 10);
                setWeek(text && !Number.isNaN(parsed) ? parsed : undefined);
              }}
              placeholder={currentWeek ? `当前第 ${currentWeek} 周` : '输入孕周数'}
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>心得 / 备注</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={note}
              onChangeText={setNote}
              placeholder="记录下这一刻的感受..."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: spacing.sm,
    minWidth: 60,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  saveText: {
    ...typography.button,
    color: colors.primary,
    textAlign: 'right',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  templateList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  templateChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  templateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  templateTextSelected: {
    color: colors.white,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  photoPlaceholderText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  photo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    minHeight: 50,
    ...typography.input,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: 'center',
  },
  textArea: {
    minHeight: 120,
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateInput: {
    flex: 1,
  },
  todayButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  todayButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
