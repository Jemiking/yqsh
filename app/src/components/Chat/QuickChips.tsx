import React, { useEffect } from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity, PixelRatio, LayoutChangeEvent } from 'react-native';
import { spacing, typography, borderRadius } from '../../constants/theme';
import { chatColors, chatShadows } from './chatTheme';

const DEBUG_CHAT_UI = __DEV__ && process.env.EXPO_PUBLIC_DEBUG_CHAT_UI === '1';

interface QuickChipsProps {
  chips: string[];
  onSelect: (chip: string) => void;
}

export function QuickChips({ chips, onSelect }: QuickChipsProps) {
  if (chips.length === 0) return null;

  useEffect(() => {
    if (!DEBUG_CHAT_UI) return;
    console.log('[DEBUG QuickChips] styles:', {
      container: StyleSheet.flatten(styles.container),
      chip: StyleSheet.flatten(styles.chip),
      chipText: StyleSheet.flatten(styles.chipText),
      fontScale: PixelRatio.getFontScale(),
    });
  }, []);

  const handleLayout = (label: string) => (e: LayoutChangeEvent) => {
    if (!DEBUG_CHAT_UI) return;
    console.log(`[DEBUG QuickChips] ${label}:`, e.nativeEvent.layout);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, DEBUG_CHAT_UI && debugStyles.container]}
      style={[styles.scrollView, DEBUG_CHAT_UI && debugStyles.scrollView]}
      onLayout={handleLayout('ScrollView')}
      onContentSizeChange={(w, h) => {
        if (DEBUG_CHAT_UI) console.log('[DEBUG QuickChips] contentSize:', { w, h });
      }}
      accessibilityRole="list"
      accessibilityLabel="快捷问题建议"
    >
      {chips.map((chip, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.chip, DEBUG_CHAT_UI && debugStyles.chip]}
          onPress={() => onSelect(chip)}
          onLayout={handleLayout(`chip[${index}]`)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          accessibilityRole="button"
          accessibilityLabel={`发送问题：${chip}`}
        >
          <Text style={[styles.chipText, DEBUG_CHAT_UI && debugStyles.chipText]}>{chip}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    backgroundColor: chatColors.surface,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: chatColors.chipBorder,
    marginHorizontal: spacing.xs,
    ...chatShadows.sm,
  },
  chipText: {
    ...typography.bodySmall,
    color: chatColors.chipText,
    fontWeight: '500',
  },
});

const debugStyles = StyleSheet.create({
  scrollView: { borderWidth: 1, borderColor: 'red' },
  container: { backgroundColor: 'rgba(255,0,0,0.1)' },
  chip: { borderColor: 'blue', backgroundColor: 'rgba(0,255,0,0.2)' },
  chipText: { backgroundColor: 'rgba(255,255,0,0.3)' },
});
