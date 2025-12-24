import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Button } from '../components';
import { testAiConnection } from '../services/ai';
import {
  getAllAIConfigs,
  addAIConfig,
  updateAIConfig,
  setActiveAIConfig,
  deleteAIConfig,
} from '../services/db/queries';
import type { AIConfig } from '../types';
import type { RootStackScreenProps } from '../navigation/types';

export function AIConfigScreen({ navigation }: RootStackScreenProps<'Settings'>) {
  const insets = useSafeAreaInsets();
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);

  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    const loaded = await getAllAIConfigs();
    setConfigs(loaded);
  };

  const startEdit = (config?: AIConfig) => {
    if (config) {
      setEditingId(config.id);
      setName(config.name || '');
      setApiKey(config.apiKey || '');
      setBaseUrl(config.baseUrl || '');
      setModel(config.model || '');
    } else {
      setEditingId(undefined);
      setName('');
      setApiKey('');
      setBaseUrl('');
      setModel('');
    }
    setTestResult(null);
    setIsEditing(true);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const config: AIConfig = { provider: 'custom', apiKey, baseUrl, model };
    const success = await testAiConnection(config);
    setTestResult(success);
    setTesting(false);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedBaseUrl = baseUrl.trim();

    if (!trimmedName) {
      Alert.alert('错误', '请输入配置名称');
      return;
    }
    if (!trimmedBaseUrl) {
      Alert.alert('错误', '请输入 Base URL');
      return;
    }

    setSaving(true);
    try {
      const configData: AIConfig = {
        id: editingId,
        name: trimmedName,
        provider: 'custom',
        apiKey: apiKey.trim() || undefined,
        baseUrl: trimmedBaseUrl,
        model: model.trim() || undefined,
      };

      if (editingId !== undefined) {
        await updateAIConfig(configData);
      } else {
        await addAIConfig(configData);
      }

      await loadConfigs();
      setIsEditing(false);
    } catch (e) {
      Alert.alert('保存失败', '请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      await setActiveAIConfig(id);
      await loadConfigs();
    } catch (e) {
      Alert.alert('设置失败', '无法切换配置');
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('确认删除', '确定要删除此配置吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteAIConfig(id);
          await loadConfigs();
        },
      },
    ]);
  };

  const renderConfigItem = ({ item }: { item: AIConfig }) => (
    <View style={[styles.configCard, item.isActive && styles.configCardActive]}>
      <TouchableOpacity
        style={styles.configInfo}
        onPress={() => item.id && handleSetActive(item.id)}
      >
        <View style={styles.configHeader}>
          <Text style={styles.configName}>{item.name || '未命名配置'}</Text>
          {item.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>当前使用</Text>
            </View>
          )}
        </View>
        <Text style={styles.configUrl} numberOfLines={1}>
          {item.baseUrl}
        </Text>
        <Text style={styles.configModel}>{item.model || '默认模型'}</Text>
      </TouchableOpacity>

      <View style={styles.configActions}>
        <TouchableOpacity onPress={() => startEdit(item)} style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => item.id && handleDelete(item.id)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={20} color={colors.avoid} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => (isEditing ? setIsEditing(false) : navigation.goBack())}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? (editingId ? '编辑配置' : '新建配置') : 'AI 配置管理'}
        </Text>
        {!isEditing ? (
          <TouchableOpacity style={styles.headerRightButton} onPress={() => startEdit()}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {isEditing ? (
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.section}>
              <Text style={styles.label}>配置名称</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => { setName(text); setTestResult(null); }}
                placeholder="例如: 我的 DeepSeek"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Base URL</Text>
              <TextInput
                style={styles.input}
                value={baseUrl}
                onChangeText={(text) => { setBaseUrl(text); setTestResult(null); }}
                placeholder="https://api.example.com/v1"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>API Key</Text>
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={(text) => { setApiKey(text); setTestResult(null); }}
                placeholder="sk-..."
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>模型名称</Text>
              <TextInput
                style={styles.input}
                value={model}
                onChangeText={(text) => { setModel(text); setTestResult(null); }}
                placeholder="例如: gpt-3.5-turbo"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.testSection}>
              <Button
                title="测试连接"
                variant="outline"
                onPress={handleTestConnection}
                loading={testing}
                disabled={!baseUrl.trim()}
              />
              {testResult !== null && (
                <View style={[styles.testResult, testResult ? styles.testSuccess : styles.testFailed]}>
                  <Text
                    style={[styles.testResultText, testResult ? styles.testSuccessText : styles.testFailedText]}
                  >
                    {testResult ? '连接成功' : '连接失败'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <Button title="保存" onPress={handleSave} loading={saving} disabled={!name.trim() || !baseUrl.trim()} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <FlatList
          data={configs}
          renderItem={renderConfigItem}
          keyExtractor={(item, index) => item.id?.toString() ?? `temp-${index}`}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.lg }]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>暂无 AI 配置</Text>
              <Text style={styles.emptySubText}>点击右上角 + 添加自定义配置</Text>
            </View>
          }
        />
      )}
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
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  headerRightButton: {
    padding: spacing.sm,
    marginRight: -spacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
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
  testSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  testResult: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  testSuccess: {
    backgroundColor: colors.safeBackground,
  },
  testFailed: {
    backgroundColor: colors.avoidBackground,
  },
  testResultText: {
    ...typography.bodySmall,
  },
  testSuccessText: {
    color: colors.safe,
  },
  testFailedText: {
    color: colors.avoid,
  },
  footer: {
    marginTop: spacing.lg,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  configCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  configCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '15',
  },
  configInfo: {
    flex: 1,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  configName: {
    ...typography.h3,
    color: colors.text,
  },
  activeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  activeBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
  },
  configUrl: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  configModel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  configActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: spacing.md,
  },
  actionButton: {
    padding: spacing.xs,
  },
  emptyContainer: {
    padding: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
