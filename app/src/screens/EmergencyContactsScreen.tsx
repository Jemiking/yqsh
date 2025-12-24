import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  addXPEvent,
  updateAchievementProgress,
  getDadGrowth,
  type EmergencyContact,
} from '../services/db/queries';
import { useDadStore } from '../state';
import type { RootStackScreenProps } from '../navigation/types';

export function EmergencyContactsScreen({ navigation }: RootStackScreenProps<'EmergencyContacts'>) {
  const insets = useSafeAreaInsets();
  const { addXP, setGrowth } = useDadStore();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [priority, setPriority] = useState(0);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = useCallback(async () => {
    const data = await getEmergencyContacts();
    setContacts(data);
    return data;
  }, []);

  const handleCall = useCallback((phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingContact(null);
    setName('');
    setRelation('');
    setPhone('');
    setPriority(0);
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback((contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelation(contact.relation);
    setPhone(contact.phone);
    setPriority(contact.priority);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('提示', '请填写姓名和电话');
      return;
    }
    if (editingContact) {
      await updateEmergencyContact(
        editingContact.id,
        name.trim(),
        relation.trim() || '其他',
        phone.trim(),
        priority
      );
    } else {
      const newId = await addEmergencyContact(
        name.trim(),
        relation.trim() || '其他',
        phone.trim(),
        priority
      );

      // Award XP for adding contact
      const xpAmount = 15;
      await addXPEvent('support_action', xpAmount, newId, name.trim());
      addXP(xpAmount);
      const growth = await getDadGrowth();
      if (growth) {
        setGrowth(growth);
      }
    }
    setModalVisible(false);
    const updated = await loadContacts();
    if (updated && !editingContact) {
      const unlocked = await updateAchievementProgress('guardian', updated.length);
      if (unlocked) {
        Alert.alert('🎉 成就解锁', '守护者 - 添加3个紧急联系人！');
      }
    }
  }, [editingContact, name, relation, phone, priority, loadContacts, addXP, setGrowth]);

  const handleDelete = useCallback((contact: EmergencyContact) => {
    Alert.alert('删除联系人', `确定要删除 ${contact.name} 吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteEmergencyContact(contact.id);
          await loadContacts();
        },
      },
    ]);
  }, [loadContacts]);

  const renderItem = useCallback(
    ({ item }: { item: EmergencyContact }) => {
      const isEmergency = item.priority >= 10;
      return (
        <View style={[styles.contactCard, isEmergency && styles.contactCardEmergency]}>
          <TouchableOpacity
            style={styles.contactInfo}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, isEmergency && styles.avatarEmergency]}>
              <Ionicons
                name={isEmergency ? 'medical' : 'person'}
                size={24}
                color={isEmergency ? colors.emergency : colors.primary}
              />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactRelation}>{item.relation}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleCall(item.phone)}
              accessibilityRole="button"
              accessibilityLabel={`拨打 ${item.name}`}
            >
              <Ionicons name="call" size={22} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item)}
              accessibilityRole="button"
              accessibilityLabel={`删除 ${item.name}`}
            >
              <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [handleCall, handleDelete, openEditModal]
  );

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
        <Text style={styles.title}>紧急联系人</Text>
        <TouchableOpacity
          onPress={openAddModal}
          style={styles.addBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="添加联系人"
        >
          <Ionicons name="add" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="call-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>暂无联系人</Text>
            <Text style={styles.emptyHint}>点击右上角添加紧急联系人</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingContact ? '编辑联系人' : '添加联系人'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>姓名</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="输入姓名"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>关系</Text>
              <TextInput
                style={styles.input}
                value={relation}
                onChangeText={setRelation}
                placeholder="如：医院、家人、朋友"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>电话</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="输入电话号码"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>优先级</Text>
              <View style={styles.priorityRow}>
                {[
                  { value: 10, label: '紧急' },
                  { value: 5, label: '重要' },
                  { value: 0, label: '普通' },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.priorityBtn,
                      priority === opt.value && styles.priorityBtnActive,
                    ]}
                    onPress={() => setPriority(opt.value)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        priority === opt.value && styles.priorityTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    padding: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.sm,
  },
  contactCardEmergency: {
    borderLeftColor: colors.emergency,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarEmergency: {
    backgroundColor: colors.avoidBackground,
  },
  contactText: {
    flex: 1,
  },
  contactName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  contactRelation: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.safe,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  emptyHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    minHeight: 48,
    ...typography.input,
    color: colors.text,
    textAlignVertical: 'center',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  priorityBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  priorityText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  priorityTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: {
    ...typography.button,
    color: colors.white,
  },
});
