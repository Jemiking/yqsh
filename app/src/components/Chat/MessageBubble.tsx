import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { chatColors, chatBorderRadius, chatShadows } from './chatTheme';

interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp?: string;
}

export function MessageBubble({ content, role, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={14} color={chatColors.surface} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
          {content}
        </Text>
        {timestamp && (
          <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampAssistant]}>
            {formatTime(timestamp)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  containerUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    alignSelf: 'flex-end',
    marginBottom: spacing.xs,
    ...chatShadows.sm,
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: chatBorderRadius.lg,
    ...chatShadows.sm,
  },
  bubbleUser: {
    backgroundColor: chatColors.userBubble,
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  bubbleAssistant: {
    backgroundColor: chatColors.assistantBubble,
    borderTopLeftRadius: 4,
  },
  text: {
    ...typography.body,
    lineHeight: 22,
  },
  textAssistant: {
    color: chatColors.assistantBubbleText,
  },
  textUser: {
    color: chatColors.userBubbleText,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  timestampAssistant: {
    color: chatColors.textMuted,
  },
  timestampUser: {
    color: chatColors.userBubbleText,
    opacity: 0.7,
  },
});
