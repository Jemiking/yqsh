import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PixelRatio,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { spacing, borderRadius, typography } from '../../constants/theme';
import { chatColors, chatShadows } from './chatTheme';

const DEBUG_CHAT_UI = __DEV__ && process.env.EXPO_PUBLIC_DEBUG_CHAT_UI === '1';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  loading = false,
  placeholder = '输入消息...',
}: ChatInputProps) {
  const [text, setText] = useState('');
  const containerRef = useRef<View>(null);
  const window = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();

  // Debug: Log styles and font info
  useEffect(() => {
    if (!DEBUG_CHAT_UI) return;
    console.log('[DEBUG ChatInput] typography.input:', typography.input);
    console.log('[DEBUG ChatInput] styles.input:', StyleSheet.flatten(styles.input));
    console.log('[DEBUG ChatInput] fontScale:', PixelRatio.getFontScale());
  }, []);

  // Debug: Measure gap to tab bar
  const logGap = useCallback(() => {
    if (!DEBUG_CHAT_UI || !containerRef.current) return;
    requestAnimationFrame(() => {
      containerRef.current?.measureInWindow((x, y, w, h) => {
        const chatInputBottom = y + h;
        const tabBarTop = window.height - tabBarHeight;
        console.log('[DEBUG ChatInput] measureInWindow:', {
          windowHeight: window.height,
          tabBarHeight,
          tabBarTop,
          chatInput: { x, y, w, h, bottom: chatInputBottom },
          gapToTabBarTop: tabBarTop - chatInputBottom,
        });
      });
    });
  }, [tabBarHeight, window.height]);

  const handleSend = () => {
    if (text.trim() && !disabled && !loading) {
      onSend(text.trim());
      setText('');
    }
  };

  const canSend = text.trim().length > 0 && !disabled && !loading;

  return (
    <View
      ref={containerRef}
      collapsable={false}
      style={[styles.container, DEBUG_CHAT_UI && debugStyles.container]}
      onLayout={() => logGap()}
    >
      <TextInput
        style={[styles.input, DEBUG_CHAT_UI && debugStyles.input]}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={chatColors.textMuted}
        multiline
        maxLength={2000}
        editable={!disabled}
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
        onLayout={(e) => {
          if (DEBUG_CHAT_UI) console.log('[DEBUG ChatInput] TextInput.onLayout:', e.nativeEvent.layout);
        }}
        onContentSizeChange={(e) => {
          if (DEBUG_CHAT_UI) console.log('[DEBUG ChatInput] TextInput.contentSize:', e.nativeEvent.contentSize);
        }}
        accessibilityLabel="输入消息"
        accessibilityHint="在此输入您想发送的消息"
      />
      <TouchableOpacity
        style={[styles.sendButton, (canSend || loading) && styles.sendButtonActive]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={loading ? '发送中' : '发送消息'}
        accessibilityState={{ disabled: !canSend }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={chatColors.surface} />
        ) : (
          <Ionicons
            name="arrow-up"
            size={22}
            color={canSend ? chatColors.surface : chatColors.textSecondary}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: chatColors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 4,
    fontSize: typography.input.fontSize,
    fontWeight: typography.input.fontWeight,
    includeFontPadding: false,
    color: chatColors.textPrimary,
    maxHeight: 120,
    minHeight: 50,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: chatColors.border,
    ...chatShadows.sm,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: chatColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...chatShadows.sm,
  },
  sendButtonActive: {
    backgroundColor: chatColors.userBubble,
    ...chatShadows.md,
  },
});

const debugStyles = StyleSheet.create({
  container: { borderWidth: 2, borderColor: 'lime' },
  input: { borderWidth: 1, borderColor: 'orange', backgroundColor: 'rgba(255,255,0,0.2)' },
});
