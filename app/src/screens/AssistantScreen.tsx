import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Keyboard,
  useWindowDimensions,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { ContextBar, QuickChips, ChatInput, MessageBubble, Button, TypingIndicator } from '../components';
import { chatColors, chatBorderRadius, chatShadows } from '../components/Chat/chatTheme';
import { useChat } from '../hooks';
import type { MainTabScreenProps } from '../navigation/types';
import type { ChatMessage } from '../types';

const DEBUG_CHAT_UI = __DEV__ && process.env.EXPO_PUBLIC_DEBUG_CHAT_UI === '1';

const QUICK_SUGGESTIONS = [
  '她今天可能有什么症状？',
  '本周需要准备什么？',
  '螃蟹能吃吗？',
  '她说头疼怎么办？',
];

export function AssistantScreen({ navigation }: MainTabScreenProps<'Assistant'>) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const window = useWindowDimensions();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const isNearBottomRef = useRef(true);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    contextSummary,
    hasAiConfig,
  } = useChat();

  // Debug: Log layout info
  useEffect(() => {
    if (!DEBUG_CHAT_UI) return;
    console.log('[DEBUG AssistantScreen] layout info:', {
      windowHeight: window.height,
      insetsBottom: insets.bottom,
      tabBarHeight,
      keyboardVerticalOffset: insets.bottom + 60,
      kavBehavior: Platform.OS === 'ios' ? 'padding' : 'height',
    });
  }, [window.height, insets.bottom, tabBarHeight]);

  // Debug: Keyboard events
  useEffect(() => {
    if (!DEBUG_CHAT_UI) return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) =>
      console.log('[DEBUG AssistantScreen] keyboardDidShow:', e.endCoordinates)
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      console.log('[DEBUG AssistantScreen] keyboardDidHide')
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 80;
    const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    if (nearBottom !== isNearBottomRef.current) {
      isNearBottomRef.current = nearBottom;
      setIsNearBottom(nearBottom);
    }
  }, []);

  const scrollToBottom = useCallback((animated = true) => {
    flatListRef.current?.scrollToEnd({ animated });
  }, []);

  useEffect(() => {
    if (messages.length > 0 && isNearBottomRef.current) {
      const timeoutId = setTimeout(() => {
        scrollToBottom(true);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, scrollToBottom]);

  const handleQuickSelect = useCallback((chip: string) => {
    sendMessage(chip);
  }, [sendMessage]);

  const goToSettings = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
    <MessageBubble content={item.content} role={item.role} timestamp={item.timestamp} />
  ), []);

  const renderEmptyState = useMemo(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="heart-circle" size={72} color={colors.accentLight} />
        </View>
        <Text style={styles.emptyTitle}>准爸爸，你好！</Text>
        <Text style={styles.emptySubtitle}>
          {hasAiConfig
            ? '我可以帮你解答孕期饮食、症状、情绪支持与紧急信号。\n从下方快捷问题开始，或直接输入你的困惑。'
            : '请先配置 AI 服务，开启你的孕期陪伴对话。'}
        </Text>
        {!hasAiConfig && (
          <Button
            title="配置 AI 服务"
            variant="outline"
            onPress={goToSettings}
            style={styles.configButton}
          />
        )}
      </View>
    ),
    [hasAiConfig, goToSettings]
  );

  const handleScrollToBottom = useCallback(() => {
    isNearBottomRef.current = true;
    setIsNearBottom(true);
    scrollToBottom(true);
  }, [scrollToBottom]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.bottom + 60}
      onLayout={(e: LayoutChangeEvent) => {
        if (DEBUG_CHAT_UI) console.log('[DEBUG AssistantScreen] KAV.onLayout:', e.nativeEvent.layout);
      }}
    >
      {DEBUG_CHAT_UI && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: tabBarHeight,
            backgroundColor: 'rgba(255,0,0,0.08)',
            borderTopWidth: 2,
            borderTopColor: 'rgba(255,0,0,0.6)',
            zIndex: 9999,
          }}
        />
      )}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <View style={styles.onlineDot} />
          <Text style={styles.headerTitle}>AI 助手</Text>
        </View>
        <TouchableOpacity
          onPress={goToSettings}
          style={styles.headerButton}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="设置"
        >
          <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ContextBar summary={contextSummary} />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        style={styles.messageListContainer}
        contentContainerStyle={[
          styles.messageList,
          messages.length === 0 && styles.messageListEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        onContentSizeChange={() => {
          if (messages.length > 0 && isNearBottomRef.current) {
            scrollToBottom(false);
          }
        }}
      />

      {messages.length > 0 && !isNearBottom && (
        <TouchableOpacity
          style={[styles.scrollToBottomButton, { bottom: insets.bottom + 140 }]}
          onPress={handleScrollToBottom}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="滚动到底部"
        >
          <Ionicons name="chevron-down" size={20} color={chatColors.textSecondary} />
        </TouchableOpacity>
      )}

      {hasAiConfig && (
        <QuickChips chips={QUICK_SUGGESTIONS} onSelect={handleQuickSelect} />
      )}

      {error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ChatInput
        onSend={sendMessage}
        disabled={!hasAiConfig}
        loading={isLoading}
        placeholder={hasAiConfig ? '输入消息...' : '请先配置 AI 服务'}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: chatColors.background,
  },
  messageListContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: chatColors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.safe,
  },
  headerTitle: {
    ...typography.h3,
    color: chatColors.textPrimary,
    fontWeight: '700',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: chatColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...chatShadows.sm,
  },
  messageList: {
    paddingVertical: spacing.md,
  },
  messageListEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accentLight + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: chatColors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: chatColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  configButton: {
    marginTop: spacing.lg,
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: chatColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: chatColors.border,
    zIndex: 10,
    ...chatShadows.md,
  },
  errorBar: {
    backgroundColor: colors.avoidBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.avoid,
    textAlign: 'center',
  },
});
