// 伴生 APP 主题配置

export const colors = {
  // 主色调 - 岩蓝（可靠、沉稳、适合爸爸）
  primary: '#475569',
  primaryLight: '#64748b',
  primaryDark: '#334155',

  // 辅助色 - 灰绿（成长、和谐）
  secondary: '#84A98C',
  secondaryLight: '#A7C4BC',
  secondaryDark: '#52796F',

  // 强调色 - 赤陶（紧急/爱心动作）
  accent: '#E07A5F',
  accentLight: '#F2A391',
  accentDark: '#C9604A',

  // 背景色
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',

  // 文字色
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  // 状态色
  safe: '#22C55E',
  safeBackground: '#DCFCE7',
  caution: '#F59E0B',
  cautionBackground: '#FEF3C7',
  avoid: '#EF4444',
  avoidBackground: '#FEE2E2',
  emergency: '#DC2626',
  warning: '#F59E0B',

  // 边框和分隔线
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // 其他
  overlay: 'rgba(0, 0, 0, 0.5)',
  disabled: '#CBD5E1',

  // 别名
  text: '#1E293B',
  white: '#FFFFFF',
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  input: {
    fontSize: 16,
    fontWeight: '400' as const,
    includeFontPadding: false,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
  typography,
};
