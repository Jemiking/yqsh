export * from './theme';

// APP 信息
export const APP_NAME = '伴生';
export const APP_VERSION = '0.1.0';

// 存储键
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  AI_CONFIG: 'ai_config',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  THEME_MODE: 'theme_mode',
} as const;

// API 端点
export const API_ENDPOINTS = {
  OPENAI: 'https://api.openai.com/v1',
  CLAUDE: 'https://api.anthropic.com/v1',
} as const;

// 孕期常量
export const PREGNANCY = {
  TOTAL_WEEKS: 40,
  FIRST_TRIMESTER_END: 13,
  SECOND_TRIMESTER_END: 27,
  FULL_TERM_START: 37,
  DAYS_PER_WEEK: 7,
} as const;

// 紧急联系
export const EMERGENCY = {
  CHINA_120: '120',
  POISON_CONTROL: '120',
} as const;
