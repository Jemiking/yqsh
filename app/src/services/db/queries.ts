import { getUserDb } from './userDb';
import type {
  UserProfile,
  UserPreferences,
  MeasurementUnit,
  AIConfig,
  ChatMessage,
  Memory,
  MemoryType,
  Milestone,
  DadGrowth,
  XPEvent,
  XPEventType,
  Achievement,
  AchievementCategory,
} from '../../types';

export async function getProfile(): Promise<UserProfile | null> {
  const db = getUserDb();
  if (!db) return null;
  const result = await db.getFirstAsync<any>('SELECT * FROM profile WHERE id = 1');
  if (!result) return null;

  // Safe enum parsing with fallbacks
  const measurementUnit: MeasurementUnit =
    result.measurement_unit === 'imperial' ? 'imperial' : 'metric';
  const reminderFrequency: 'daily' | 'weekly' | 'important_only' =
    ['daily', 'weekly', 'important_only'].includes(result.reminder_frequency)
      ? result.reminder_frequency
      : 'daily';

  return {
    id: result.id,
    dueDate: result.due_date,
    partnerName: result.partner_name,
    locale: result.locale || 'zh-CN',
    preferences: {
      measurementUnit,
      notificationsEnabled: result.notifications_enabled === 1,
      reminderFrequency,
    },
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}

export async function saveProfile(
  dueDate: string,
  partnerName?: string,
  preferences?: Partial<UserPreferences>
): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  const existing = await db.getFirstAsync<any>('SELECT * FROM profile WHERE id = 1');
  if (existing) {
    await db.runAsync(
      `UPDATE profile SET
        due_date = ?,
        partner_name = ?,
        measurement_unit = COALESCE(?, measurement_unit),
        notifications_enabled = COALESCE(?, notifications_enabled),
        reminder_frequency = COALESCE(?, reminder_frequency),
        updated_at = datetime('now')
       WHERE id = 1`,
      [
        dueDate,
        partnerName ?? null,
        preferences?.measurementUnit ?? null,
        preferences?.notificationsEnabled !== undefined ? (preferences.notificationsEnabled ? 1 : 0) : null,
        preferences?.reminderFrequency ?? null,
      ]
    );
  } else {
    await db.runAsync(
      `INSERT INTO profile (id, due_date, partner_name, measurement_unit, notifications_enabled, reminder_frequency)
       VALUES (1, ?, ?, ?, ?, ?)`,
      [
        dueDate,
        partnerName ?? null,
        preferences?.measurementUnit ?? 'metric',
        preferences?.notificationsEnabled !== undefined ? (preferences.notificationsEnabled ? 1 : 0) : 1,
        preferences?.reminderFrequency ?? 'daily',
      ]
    );
  }
}

export async function getAIConfig(): Promise<AIConfig | null> {
  const db = getUserDb();
  if (!db) return null;
  const result = await db.getFirstAsync<any>('SELECT * FROM ai_config WHERE is_active = 1 LIMIT 1');
  if (!result) return null;
  return {
    id: result.id,
    name: result.name,
    provider: result.provider || 'custom',
    baseUrl: result.base_url,
    apiKey: result.api_key,
    model: result.model,
    isActive: result.is_active === 1,
  };
}

export async function getAllAIConfigs(): Promise<AIConfig[]> {
  const db = getUserDb();
  if (!db) return [];
  const results = await db.getAllAsync<any>('SELECT * FROM ai_config ORDER BY is_active DESC, id DESC');
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    provider: r.provider || 'custom',
    baseUrl: r.base_url,
    apiKey: r.api_key,
    model: r.model,
    isActive: r.is_active === 1,
  }));
}

export async function addAIConfig(config: AIConfig): Promise<number> {
  const db = getUserDb();
  if (!db) return -1;
  const count = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM ai_config');
  const isActive = (count?.c || 0) === 0 ? 1 : 0;
  const result = await db.runAsync(
    `INSERT INTO ai_config (name, provider, base_url, api_key, model, is_active, updated_at)
     VALUES (?, 'custom', ?, ?, ?, ?, datetime('now'))`,
    [config.name || '新配置', config.baseUrl ?? null, config.apiKey ?? null, config.model ?? null, isActive]
  );
  return result.lastInsertRowId;
}

export async function updateAIConfig(config: AIConfig): Promise<void> {
  const db = getUserDb();
  if (!db || !config.id) return;
  await db.runAsync(
    `UPDATE ai_config SET
       name = ?,
       base_url = ?,
       api_key = ?,
       model = ?,
       updated_at = datetime('now')
     WHERE id = ?`,
    [config.name || '未命名配置', config.baseUrl ?? null, config.apiKey ?? null, config.model ?? null, config.id]
  );
}

export async function setActiveAIConfig(id: number): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.execAsync('BEGIN TRANSACTION');
  try {
    await db.runAsync('UPDATE ai_config SET is_active = 0');
    const result = await db.runAsync(
      "UPDATE ai_config SET is_active = 1, updated_at = datetime('now') WHERE id = ?",
      [id]
    );
    if (result.changes === 0) {
      throw new Error('Config not found');
    }
    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
}

export async function deleteAIConfig(id: number): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.execAsync('BEGIN TRANSACTION');
  try {
    const config = await db.getFirstAsync<{ is_active: number }>('SELECT is_active FROM ai_config WHERE id = ?', [id]);
    await db.runAsync('DELETE FROM ai_config WHERE id = ?', [id]);
    if (config?.is_active === 1) {
      const next = await db.getFirstAsync<{ id: number }>('SELECT id FROM ai_config ORDER BY updated_at DESC, id DESC LIMIT 1');
      if (next) {
        await db.runAsync("UPDATE ai_config SET is_active = 1, updated_at = datetime('now') WHERE id = ?", [next.id]);
      }
    }
    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
}

export async function saveAIConfig(config: AIConfig): Promise<void> {
  if (config.id) {
    await updateAIConfig(config);
  } else {
    await addAIConfig(config);
  }
}

export async function getChatHistory(limit = 50): Promise<ChatMessage[]> {
  const db = getUserDb();
  if (!db) return [];
  const results = await db.getAllAsync<any>(
    'SELECT * FROM chat_history ORDER BY timestamp DESC LIMIT ?',
    [limit]
  );
  return results.reverse().map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    timestamp: row.timestamp,
  }));
}

export async function addChatMessage(
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<number> {
  const db = getUserDb();
  if (!db) return -1;
  const result = await db.runAsync(
    'INSERT INTO chat_history (role, content) VALUES (?, ?)',
    [role, content]
  );
  return result.lastInsertRowId;
}

export async function clearChatHistory(): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.runAsync('DELETE FROM chat_history');
}

export async function addWeightRecord(date: string, weight: number): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  if (weight <= 0 || weight > 300) return;
  await db.runAsync(
    `INSERT INTO weight_records (date, weight)
     VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET weight = excluded.weight`,
    [date, weight]
  );
}

export async function getWeightRecords(limit = 30): Promise<{ date: string; weight: number }[]> {
  const db = getUserDb();
  if (!db) return [];
  return await db.getAllAsync<{ date: string; weight: number }>(
    'SELECT date, weight FROM weight_records ORDER BY date DESC LIMIT ?',
    [limit]
  );
}

// ==================== Contractions ====================

export interface ContractionRecord {
  id: number;
  startTime: string;
  endTime: string | null;
  durationSeconds: number | null;
  intensity: number | null;
}

export async function addContraction(startTime: string): Promise<number> {
  const db = getUserDb();
  if (!db) return -1;
  const result = await db.runAsync(
    'INSERT INTO contractions (start_time) VALUES (?)',
    [startTime]
  );
  return result.lastInsertRowId;
}

export async function endContraction(
  id: number,
  endTime: string,
  durationSeconds: number,
  intensity?: number
): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.runAsync(
    'UPDATE contractions SET end_time = ?, duration_seconds = ?, intensity = ? WHERE id = ?',
    [endTime, durationSeconds, intensity ?? null, id]
  );
}

export async function getContractions(limit = 20): Promise<ContractionRecord[]> {
  const db = getUserDb();
  if (!db) return [];
  const results = await db.getAllAsync<any>(
    'SELECT * FROM contractions WHERE end_time IS NOT NULL ORDER BY start_time DESC LIMIT ?',
    [limit]
  );
  return results.map((r) => ({
    id: r.id,
    startTime: r.start_time,
    endTime: r.end_time,
    durationSeconds: r.duration_seconds,
    intensity: r.intensity,
  }));
}

export async function clearContractions(): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.runAsync('DELETE FROM contractions');
}

// ==================== Kicks ====================

export interface KickSession {
  id: number;
  sessionStart: string;
  sessionEnd: string | null;
  count: number;
}

export async function startKickSession(): Promise<number> {
  const db = getUserDb();
  if (!db) return -1;
  const result = await db.runAsync(
    'INSERT INTO kicks (session_start, count) VALUES (datetime("now"), 0)'
  );
  return result.lastInsertRowId;
}

export async function incrementKickCount(id: number): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.runAsync('UPDATE kicks SET count = count + 1 WHERE id = ?', [id]);
}

export async function endKickSession(id: number): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.runAsync(
    'UPDATE kicks SET session_end = datetime("now") WHERE id = ?',
    [id]
  );
}

export async function getKickSessions(limit = 10): Promise<KickSession[]> {
  const db = getUserDb();
  if (!db) return [];
  const results = await db.getAllAsync<any>(
    'SELECT * FROM kicks ORDER BY session_start DESC LIMIT ?',
    [limit]
  );
  return results.map((r) => ({
    id: r.id,
    sessionStart: r.session_start,
    sessionEnd: r.session_end,
    count: r.count,
  }));
}

// ==================== Checklist ====================

export interface ChecklistItem {
  id: number;
  category: string;
  itemName: string;
  checked: boolean;
}

export async function getChecklistItems(): Promise<ChecklistItem[]> {
  const db = getUserDb();
  if (!db) return [];
  const results = await db.getAllAsync<any>(
    'SELECT * FROM checklist_items ORDER BY category, id'
  );
  return results.map((r) => ({
    id: r.id,
    category: r.category,
    itemName: r.item_name,
    checked: r.checked === 1,
  }));
}

export async function toggleChecklistItem(id: number, checked: boolean): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.runAsync(
    'UPDATE checklist_items SET checked = ?, updated_at = datetime("now") WHERE id = ?',
    [checked ? 1 : 0, id]
  );
}

export async function initDefaultChecklist(): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  const existing = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM checklist_items'
  );
  if (existing && existing.cnt > 0) return;

  const defaults: { category: string; items: string[] }[] = [
    { category: '妈妈用品', items: ['睡衣', '拖鞋', '洗漱用品', '产褥垫', '哺乳内衣', '出院衣物'] },
    { category: '宝宝用品', items: ['纸尿裤', '婴儿衣服', '包被', '湿巾', '奶瓶'] },
    { category: '证件资料', items: ['身份证', '医保卡', '产检手册', '准生证'] },
    { category: '爸爸用品', items: ['换洗衣物', '充电器', '零食', '现金'] },
  ];

  for (const cat of defaults) {
    for (const item of cat.items) {
      await db.runAsync(
        'INSERT INTO checklist_items (category, item_name, checked) VALUES (?, ?, 0)',
        [cat.category, item]
      );
    }
  }
}

export async function resetChecklist(): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.runAsync('UPDATE checklist_items SET checked = 0');
}

// ==================== Emergency Contacts ====================

export interface EmergencyContact {
  id: number;
  name: string;
  relation: string;
  phone: string;
  priority: number;
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const db = getUserDb();
  if (!db) return [];
  return await db.getAllAsync<EmergencyContact>(
    'SELECT id, name, relation, phone, priority FROM emergency_contacts ORDER BY priority DESC, id'
  );
}

export async function addEmergencyContact(
  name: string,
  relation: string,
  phone: string,
  priority = 0
): Promise<number> {
  const db = getUserDb();
  if (!db) return -1;
  const result = await db.runAsync(
    'INSERT INTO emergency_contacts (name, relation, phone, priority) VALUES (?, ?, ?, ?)',
    [name, relation, phone, priority]
  );
  return result.lastInsertRowId;
}

export async function updateEmergencyContact(
  id: number,
  name: string,
  relation: string,
  phone: string,
  priority = 0
): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.runAsync(
    'UPDATE emergency_contacts SET name = ?, relation = ?, phone = ?, priority = ? WHERE id = ?',
    [name, relation, phone, priority, id]
  );
}

export async function deleteEmergencyContact(id: number): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.runAsync('DELETE FROM emergency_contacts WHERE id = ?', [id]);
}

// ==================== Memories ====================

export async function getMemories(limit = 50): Promise<Memory[]> {
  const db = getUserDb();
  if (!db) return [];
  const results = await db.getAllAsync<any>(
    'SELECT * FROM memories ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  return results.map((r) => ({
    id: r.id,
    title: r.title,
    note: r.note,
    photoUri: r.photo_uri,
    type: r.type as MemoryType,
    week: r.week,
    day: r.day,
    shared: r.shared === 1,
    createdAt: r.created_at,
  }));
}

export async function getRecentMemory(): Promise<Memory | null> {
  const db = getUserDb();
  if (!db) return null;
  const result = await db.getFirstAsync<any>(
    'SELECT * FROM memories ORDER BY created_at DESC LIMIT 1'
  );
  if (!result) return null;
  return {
    id: result.id,
    title: result.title,
    note: result.note,
    photoUri: result.photo_uri,
    type: result.type as MemoryType,
    week: result.week,
    day: result.day,
    shared: result.shared === 1,
    createdAt: result.created_at,
  };
}

export async function getMemoryCount(): Promise<number> {
  const db = getUserDb();
  if (!db) return 0;
  const result = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM memories'
  );
  return result?.cnt ?? 0;
}

export async function addMemory(
  title: string,
  type: MemoryType,
  options?: {
    note?: string;
    photoUri?: string;
    week?: number;
    day?: number;
    shared?: boolean;
  }
): Promise<number> {
  const db = getUserDb();
  if (!db) return -1;
  const result = await db.runAsync(
    `INSERT INTO memories (title, note, photo_uri, type, week, day, shared)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      options?.note ?? null,
      options?.photoUri ?? null,
      type,
      options?.week ?? null,
      options?.day ?? null,
      options?.shared ? 1 : 0,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateMemory(
  id: number,
  changes: Partial<Omit<Memory, 'id' | 'createdAt'>>
): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  const updates: string[] = [];
  const values: any[] = [];
  if (changes.title !== undefined) {
    updates.push('title = ?');
    values.push(changes.title);
  }
  if (changes.note !== undefined) {
    updates.push('note = ?');
    values.push(changes.note);
  }
  if (changes.photoUri !== undefined) {
    updates.push('photo_uri = ?');
    values.push(changes.photoUri);
  }
  if (changes.type !== undefined) {
    updates.push('type = ?');
    values.push(changes.type);
  }
  if (changes.week !== undefined) {
    updates.push('week = ?');
    values.push(changes.week);
  }
  if (changes.day !== undefined) {
    updates.push('day = ?');
    values.push(changes.day);
  }
  if (changes.shared !== undefined) {
    updates.push('shared = ?');
    values.push(changes.shared ? 1 : 0);
  }
  if (updates.length === 0) return;
  values.push(id);
  await db.runAsync(
    `UPDATE memories SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteMemory(id: number): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.runAsync('DELETE FROM memories WHERE id = ?', [id]);
}

// ==================== Milestones ====================

export async function getMilestones(): Promise<Milestone[]> {
  const db = getUserDb();
  if (!db) return [];
  const results = await db.getAllAsync<any>(
    'SELECT * FROM milestones ORDER BY date DESC, created_at DESC'
  );
  return results.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    date: r.date,
    week: r.week,
    photoUri: r.photo_uri,
    templateId: r.template_id,
    createdAt: r.created_at,
  }));
}

export async function getMilestoneById(id: number): Promise<Milestone | null> {
  const db = getUserDb();
  if (!db) return null;
  const r = await db.getFirstAsync<any>(
    'SELECT * FROM milestones WHERE id = ?',
    [id]
  );
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    date: r.date,
    week: r.week,
    photoUri: r.photo_uri,
    templateId: r.template_id,
    createdAt: r.created_at,
  };
}

export async function addMilestone(
  data: Omit<Milestone, 'id' | 'createdAt'>
): Promise<number> {
  const db = getUserDb();
  if (!db) return -1;
  const result = await db.runAsync(
    `INSERT INTO milestones (title, description, date, week, photo_uri, template_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.description ?? null,
      data.date,
      data.week ?? null,
      data.photoUri ?? null,
      data.templateId ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateMilestone(
  id: number,
  changes: Partial<Omit<Milestone, 'id' | 'createdAt'>>
): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  const updates: string[] = [];
  const values: any[] = [];
  if (changes.title !== undefined) {
    updates.push('title = ?');
    values.push(changes.title);
  }
  if (changes.description !== undefined) {
    updates.push('description = ?');
    values.push(changes.description);
  }
  if (changes.date !== undefined) {
    updates.push('date = ?');
    values.push(changes.date);
  }
  if (changes.week !== undefined) {
    updates.push('week = ?');
    values.push(changes.week);
  }
  if (changes.photoUri !== undefined) {
    updates.push('photo_uri = ?');
    values.push(changes.photoUri);
  }
  if (changes.templateId !== undefined) {
    updates.push('template_id = ?');
    values.push(changes.templateId);
  }
  if (updates.length === 0) return;
  values.push(id);
  await db.runAsync(
    `UPDATE milestones SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteMilestone(id: number): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  await db.runAsync('DELETE FROM milestones WHERE id = ?', [id]);
}

// ==================== Dad Growth ====================

export async function getDadGrowth(): Promise<DadGrowth | null> {
  const db = getUserDb();
  if (!db) return null;
  const result = await db.getFirstAsync<any>(
    'SELECT xp, level FROM dad_growth WHERE id = 1'
  );
  if (!result) return null;

  const LEVELS = [
    { level: 1, title: '预备队员', xp: 0 },
    { level: 2, title: '后勤保障', xp: 100 },
    { level: 3, title: '护航专员', xp: 300 },
    { level: 4, title: '核心指挥', xp: 600 },
    { level: 5, title: '超级奶爸', xp: 1000 },
  ];

  let title = '预备队员';
  let nextLevelXp = 100;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (result.xp >= LEVELS[i].xp) {
      title = LEVELS[i].title;
      nextLevelXp = LEVELS[i + 1]?.xp ?? 99999;
      break;
    }
  }

  return {
    xp: result.xp,
    level: result.level,
    title,
    nextLevelXp,
  };
}

export async function initDadGrowth(): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM dad_growth WHERE id = 1'
  );
  if (!existing) {
    await db.runAsync(
      'INSERT INTO dad_growth (id, xp, level) VALUES (1, 0, 1)'
    );
  }
}

export async function addXPEvent(
  type: XPEventType,
  delta: number,
  refId?: number,
  note?: string
): Promise<number> {
  const db = getUserDb();
  if (!db) return -1;

  // Ensure dad_growth row exists
  await db.runAsync(
    'INSERT OR IGNORE INTO dad_growth (id, xp, level) VALUES (1, 0, 1)'
  );

  const result = await db.runAsync(
    'INSERT INTO xp_events (type, ref_id, delta, note) VALUES (?, ?, ?, ?)',
    [type, refId ?? null, delta, note ?? null]
  );

  await db.runAsync(
    'UPDATE dad_growth SET xp = xp + ?, last_calculated_at = datetime("now") WHERE id = 1',
    [delta]
  );

  const growth = await db.getFirstAsync<{ xp: number }>(
    'SELECT xp FROM dad_growth WHERE id = 1'
  );
  if (growth) {
    let newLevel = 1;
    const LEVELS = [0, 100, 300, 600, 1000];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (growth.xp >= LEVELS[i]) {
        newLevel = i + 1;
        break;
      }
    }
    await db.runAsync('UPDATE dad_growth SET level = ? WHERE id = 1', [newLevel]);
  }

  return result.lastInsertRowId;
}

export async function getRecentXPEvents(limit = 10): Promise<XPEvent[]> {
  const db = getUserDb();
  if (!db) return [];
  const results = await db.getAllAsync<any>(
    'SELECT * FROM xp_events ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  return results.map((r) => ({
    id: r.id,
    type: r.type as XPEventType,
    refId: r.ref_id,
    delta: r.delta,
    note: r.note,
    createdAt: r.created_at,
  }));
}

// ==================== Achievements ====================

const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'progress' | 'unlockedAt' | 'completed'>[] = [
  { id: 'first_milestone', title: '初次记录', description: '记录第一个里程碑', category: 'connection', icon: 'flag', points: 50, target: 1 },
  { id: 'milestone_3', title: '船长日志', description: '记录3个里程碑', category: 'connection', icon: 'journal', points: 100, target: 3 },
  { id: 'first_letter', title: '致未来', description: '写第一封信给宝宝', category: 'connection', icon: 'mail', points: 50, target: 1 },
  { id: 'memory_keeper', title: '记忆守护者', description: '添加10条回忆', category: 'connection', icon: 'images', points: 150, target: 10 },
  { id: 'guardian', title: '守护者', description: '添加3个紧急联系人', category: 'care', icon: 'shield', points: 80, target: 3 },
  { id: 'calm_pressure', title: '临危不乱', description: '完成5次宫缩记录', category: 'care', icon: 'pulse', points: 100, target: 5 },
  { id: 'ready_bag', title: '整装待发', description: '待产包100%完成', category: 'preparedness', icon: 'briefcase', points: 120, target: 1 },
  { id: 'steady_helm', title: '坚定舵手', description: '连续7天使用APP', category: 'consistency', icon: 'calendar', points: 150, target: 7 },
];

export async function initAchievements(): Promise<void> {
  const db = getUserDb();
  if (!db) return;
  for (const ach of DEFAULT_ACHIEVEMENTS) {
    await db.runAsync(
      `INSERT OR IGNORE INTO achievements (id, title, description, category, icon, points, target)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ach.id, ach.title, ach.description ?? null, ach.category, ach.icon ?? null, ach.points, ach.target]
    );
  }
}

export async function getAchievements(): Promise<Achievement[]> {
  const db = getUserDb();
  if (!db) return [];
  const results = await db.getAllAsync<any>(`
    SELECT a.*, ua.progress, ua.completed, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
    ORDER BY a.points DESC
  `);
  return results.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category as AchievementCategory,
    icon: r.icon,
    points: r.points,
    target: r.target,
    progress: r.progress ?? 0,
    unlockedAt: r.unlocked_at,
    completed: r.completed === 1,
  }));
}

export async function updateAchievementProgress(
  achievementId: string,
  progress: number
): Promise<boolean> {
  const db = getUserDb();
  if (!db) return false;

  const ach = await db.getFirstAsync<{ target: number }>(
    'SELECT target FROM achievements WHERE id = ?',
    [achievementId]
  );
  if (!ach) return false;

  const completed = progress >= ach.target ? 1 : 0;

  await db.runAsync(
    `INSERT INTO user_achievements (achievement_id, progress, completed)
     VALUES (?, ?, ?)
     ON CONFLICT(achievement_id) DO UPDATE SET
       progress = excluded.progress,
       completed = excluded.completed,
       unlocked_at = CASE WHEN excluded.completed = 1 AND user_achievements.completed = 0 THEN datetime('now') ELSE user_achievements.unlocked_at END`,
    [achievementId, progress, completed]
  );

  return completed === 1;
}
