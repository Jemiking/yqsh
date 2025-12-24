export type KbIntentType = 'food' | 'symptom' | 'emotional' | 'emergency';

export interface IntentResult {
  intent: KbIntentType | null;
  keywords: string[];
  confidence: 'high' | 'medium' | 'low';
}

const EMERGENCY_KEYWORDS = [
  '破水', '大出血', '昏倒', '昏迷', '120', '急救', '抽搐',
  '胎动消失', '剧烈腹痛', '晕厥', '失去意识', '高烧不退',
];

const SYMPTOM_KEYWORDS = [
  '疼', '痛', '出血', '发烧', '恶心', '呕吐', '宫缩',
  '胎动', '头晕', '水肿', '便秘', '腹泻', '失眠', '瘙痒',
];

const FOOD_KEYWORDS = ['能吃', '可以吃', '安全吗', '能喝', '孕妇吃', '孕妇能吃', '孕妇能喝'];

const FOOD_PATTERNS: Array<{ regex: RegExp; label: string }> = [
  { regex: /能吃.+吗/, label: '能吃X吗' },
  { regex: /可以吃.+吗/, label: '可以吃X吗' },
  { regex: /吃.+安全/, label: 'X安全' },
  { regex: /能喝.+吗/, label: '能喝X吗' },
  { regex: /孕妇.*吃/, label: '孕妇吃' },
  { regex: /孕妇.*喝/, label: '孕妇喝' },
];

const EMOTIONAL_KEYWORDS = [
  '烦躁', '哭', '心情', '情绪', '吵架', '焦虑', '抑郁',
  '害怕', '担心', '压力', '崩溃', '委屈', '生气', '发脾气',
];

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function matchKeywords(text: string, keywords: string[]): string[] {
  const matches: string[] = [];
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      matches.push(keyword);
    }
  }
  return matches;
}

function detectFoodPatterns(text: string): { keywords: string[]; confidence: 'high' | 'medium' } | null {
  const keywordMatches = matchKeywords(text, FOOD_KEYWORDS);
  const patternMatches = FOOD_PATTERNS.filter((p) => p.regex.test(text)).map((p) => p.label);
  const combined = Array.from(new Set([...keywordMatches, ...patternMatches]));

  if (combined.length === 0) return null;
  return { keywords: combined, confidence: combined.length > 1 ? 'high' : 'medium' };
}

export function detectKbIntent(text: string): IntentResult {
  const normalized = normalize(text);
  if (!normalized) {
    return { intent: null, keywords: [], confidence: 'low' };
  }

  // Priority 1: Emergency
  const emergencyMatches = matchKeywords(normalized, EMERGENCY_KEYWORDS);
  if (emergencyMatches.length > 0) {
    return { intent: 'emergency', keywords: emergencyMatches, confidence: 'high' };
  }

  // Priority 2: Symptom
  const symptomMatches = matchKeywords(normalized, SYMPTOM_KEYWORDS);
  if (symptomMatches.length > 0) {
    return {
      intent: 'symptom',
      keywords: symptomMatches,
      confidence: symptomMatches.length > 1 ? 'high' : 'medium',
    };
  }

  // Priority 3: Food
  const foodResult = detectFoodPatterns(normalized);
  if (foodResult) {
    return { intent: 'food', keywords: foodResult.keywords, confidence: foodResult.confidence };
  }

  // Priority 4: Emotional
  const emotionalMatches = matchKeywords(normalized, EMOTIONAL_KEYWORDS);
  if (emotionalMatches.length > 0) {
    return {
      intent: 'emotional',
      keywords: emotionalMatches,
      confidence: emotionalMatches.length > 1 ? 'high' : 'medium',
    };
  }

  return { intent: null, keywords: [], confidence: 'low' };
}
