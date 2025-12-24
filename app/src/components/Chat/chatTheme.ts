/**
 * AI 助手聊天界面专用暖色主题
 * 仅在 Chat 相关组件中使用，不影响全局主题
 */

export const chatColors = {
  // 暖色背景
  background: '#FDFBF7',
  surface: '#FFFFFF',
  surfaceVariant: '#FFF8F5',

  // 暖色文字
  textPrimary: '#2D3339',
  textSecondary: '#5D656E',
  textMuted: '#8E969F',

  // 用户消息气泡 - 加深主色确保对比度 ≥ 4.5:1
  userBubble: '#334155',
  userBubbleText: '#FDFBF7',

  // AI 消息气泡
  assistantBubble: '#FFFFFF',
  assistantBubbleText: '#2D3339',

  // 暖色边框
  border: '#E8E6E1',
  divider: '#F0EFE9',

  // 快捷建议
  chipBorder: 'rgba(100, 116, 139, 0.25)',
  chipText: '#475569',

  // Context Bar
  contextBorder: 'rgba(167, 196, 188, 0.5)',
  contextText: '#52796F',
};

export const chatBorderRadius = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const chatShadows = {
  sm: {
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
};
