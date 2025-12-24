// 核心类型定义

export type SafetyLevel = 'SAFE' | 'CAUTION' | 'AVOID';
export type Urgency = 'NORMAL' | 'MONITOR' | 'CALL_DOCTOR' | 'EMERGENCY';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskCategory = 'MEDICAL' | 'PREPARATION' | 'EMOTIONAL' | 'NUTRITION' | 'PHYSICAL';
export type Trimester = 1 | 2 | 3;

// 用户配置
export type MeasurementUnit = 'metric' | 'imperial';

export interface UserPreferences {
  measurementUnit: MeasurementUnit;
  notificationsEnabled: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'important_only';
}

export interface UserProfile {
  id: number;
  dueDate: string;
  startDate?: string;
  partnerName?: string;
  locale: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

// 孕周数据
export interface WeekData {
  week: number;
  trimester: Trimester;
  gestationalDays: string;
  baby: BabyInfo;
  mother: MotherInfo;
  dadActions: DadActions;
  nutrition: NutritionInfo;
  medical: MedicalInfo;
  dadTipOfWeek: string;
}

export interface BabyInfo {
  size: {
    lengthCm: number;
    weightG: number;
    comparison: string;
  };
  developments: string[];
  whatDadCanDo: string[];
}

export interface MotherInfo {
  physicalSymptoms: PhysicalSymptom[];
  emotionalState: EmotionalState[];
  warningSigns: WarningSign[];
}

export interface PhysicalSymptom {
  symptom: string;
  probability: number;
  cause: string;
  when: string;
  dadAction: string;
}

export interface EmotionalState {
  state: string;
  cause: string;
  dadShould: string;
  dadShouldNot: string;
}

export interface WarningSign {
  symptom: string;
  possibleCondition: string;
  urgency: Urgency;
  action: string;
}

export interface DadActions {
  dailyMorning: ActionItem[];
  dailyEvening: ActionItem[];
  thisWeekTasks: TaskItem[];
  whatToPrepare: PrepareItem[];
}

export interface ActionItem {
  action: string;
  why: string;
}

export interface TaskItem {
  task: string;
  deadline: string;
  why: string;
}

export interface PrepareItem {
  item: string;
  why: string;
}

export interface NutritionInfo {
  focusNutrients: string[];
  recommendedFoods: string[];
  avoidFoods: string[];
  mealSuggestion: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export interface MedicalInfo {
  scheduledCheckups: Checkup[];
}

export interface Checkup {
  name: string;
  purpose: string;
  whatToExpect: string;
  dadRole: string;
}

// 食物安全
export interface FoodItem {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  safetyLevel: SafetyLevel;
  reason: string;
  dadTip: string;
  trimesterNotes?: string;
}

// 症状决策树
export interface SymptomDecisionTree {
  id: string;
  symptomName: string;
  symptomNameEn: string;
  questions: string[];
  decisionPaths: DecisionPath[];
  dadActions: string[];
}

export interface DecisionPath {
  condition: string;
  action: string;
  urgency: Urgency;
}

// 情绪场景
export interface EmotionalScenario {
  id: string;
  scenarioName: string;
  scenarioNameEn: string;
  trigger: string;
  wifeFeeling: string;
  wrongResponse: string;
  rightResponse: string;
  followUpActions: string;
}

// 应急流程
export interface EmergencyProcedure {
  id: string;
  emergencyName: string;
  emergencyNameEn: string;
  recognitionSigns: string[];
  immediateActions: string[];
  whatNotToDo: string[];
  whenToCallAmbulance: string[];
  hospitalBagItems: string[];
  reassuranceScript: string;
}

// 周任务
export interface WeeklyTask {
  id: string;
  week: number;
  task: string;
  taskEn: string;
  description: string;
  priority: Priority;
  category: TaskCategory;
  deadline: string;
  completed?: boolean;
}

// AI 配置
export interface AIConfig {
  id?: number;
  name?: string;
  provider?: 'custom' | string;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  isActive?: boolean;
}

// 聊天消息
export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

// 孕期记录
export type MemoryType = 'general' | 'ultrasound' | 'shopping' | 'milestone' | 'funny';

export interface Memory {
  id: number;
  title: string;
  note?: string;
  photoUri?: string;
  type: MemoryType;
  week?: number;
  day?: number;
  shared: boolean;
  createdAt: string;
}

// 里程碑
export interface Milestone {
  id: number;
  title: string;
  description?: string;
  date: string;
  week?: number;
  photoUri?: string;
  templateId?: string;
  createdAt: string;
}

export interface MilestoneTemplate {
  id: string;
  title: string;
  titleZh: string;
  defaultDescription: string;
  icon: string;
  suggestedWeek: number;
}

// 爸爸成长体系
export type XPEventType =
  | 'milestone'
  | 'memory'
  | 'letter'
  | 'daily_checkin'
  | 'tool_use'
  | 'support_action'
  | 'custom';

export interface XPEvent {
  id: number;
  type: XPEventType;
  refId?: number;
  delta: number;
  note?: string;
  createdAt: string;
}

export interface DadGrowth {
  xp: number;
  level: number;
  title: string;
  nextLevelXp: number;
}

export type AchievementCategory =
  | 'connection'
  | 'care'
  | 'preparedness'
  | 'consistency'
  | 'learning';

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  category: AchievementCategory;
  icon?: string;
  points: number;
  target: number;
  progress?: number;
  unlockedAt?: string;
  completed: boolean;
}
