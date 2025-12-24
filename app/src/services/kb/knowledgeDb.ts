import * as SQLite from 'expo-sqlite';

let knowledgeDb: SQLite.SQLiteDatabase | null = null;

export async function openKnowledgeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (knowledgeDb) return knowledgeDb;
  knowledgeDb = await SQLite.openDatabaseAsync('knowledge.db');
  await initKnowledgeSchema(knowledgeDb);
  return knowledgeDb;
}

async function initKnowledgeSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    -- 版本管理表
    CREATE TABLE IF NOT EXISTS kb_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 食物安全库
    CREATE TABLE IF NOT EXISTS kb_food (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT,
      category TEXT NOT NULL,
      safety_level TEXT NOT NULL CHECK(safety_level IN ('SAFE', 'CAUTION', 'AVOID')),
      reason TEXT NOT NULL,
      dad_tip TEXT,
      trimester_notes TEXT,
      search_text TEXT NOT NULL
    );

    -- 症状决策树
    CREATE TABLE IF NOT EXISTS kb_symptom (
      id TEXT PRIMARY KEY,
      symptom_name TEXT NOT NULL,
      symptom_name_en TEXT,
      questions TEXT NOT NULL,
      decision_paths TEXT NOT NULL,
      dad_actions TEXT,
      search_text TEXT NOT NULL
    );

    -- 情绪场景剧本
    CREATE TABLE IF NOT EXISTS kb_emotional (
      id TEXT PRIMARY KEY,
      scenario_name TEXT NOT NULL,
      scenario_name_en TEXT,
      trigger TEXT NOT NULL,
      wife_feeling TEXT,
      wrong_response TEXT,
      right_response TEXT NOT NULL,
      follow_up_actions TEXT,
      search_text TEXT NOT NULL
    );

    -- 应急流程
    CREATE TABLE IF NOT EXISTS kb_emergency (
      id TEXT PRIMARY KEY,
      emergency_name TEXT NOT NULL,
      emergency_name_en TEXT,
      recognition_signs TEXT NOT NULL,
      immediate_actions TEXT NOT NULL,
      what_not_to_do TEXT,
      when_to_call_ambulance TEXT,
      hospital_bag_items TEXT,
      reassurance_script TEXT,
      search_text TEXT NOT NULL
    );

    -- 周任务库
    CREATE TABLE IF NOT EXISTS kb_weekly_task (
      id TEXT PRIMARY KEY,
      week INTEGER NOT NULL,
      task TEXT NOT NULL,
      task_en TEXT,
      description TEXT,
      priority TEXT CHECK(priority IN ('HIGH', 'MEDIUM', 'LOW')),
      category TEXT CHECK(category IN ('MEDICAL', 'PREPARATION', 'EMOTIONAL', 'NUTRITION', 'PHYSICAL')),
      deadline TEXT
    );

    -- FTS5 全文搜索虚拟表
    CREATE VIRTUAL TABLE IF NOT EXISTS kb_food_fts USING fts5(
      name, name_en, category, reason, dad_tip,
      content='kb_food',
      content_rowid='rowid'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS kb_symptom_fts USING fts5(
      symptom_name, symptom_name_en,
      content='kb_symptom',
      content_rowid='rowid'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS kb_emotional_fts USING fts5(
      scenario_name, scenario_name_en, trigger, wife_feeling,
      content='kb_emotional',
      content_rowid='rowid'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS kb_emergency_fts USING fts5(
      emergency_name, emergency_name_en, recognition_signs,
      content='kb_emergency',
      content_rowid='rowid'
    );

    -- 索引
    CREATE INDEX IF NOT EXISTS idx_food_safety ON kb_food(safety_level);
    CREATE INDEX IF NOT EXISTS idx_food_category ON kb_food(category);
    CREATE INDEX IF NOT EXISTS idx_task_week ON kb_weekly_task(week);
    CREATE INDEX IF NOT EXISTS idx_task_priority ON kb_weekly_task(priority);
  `);
}

export async function closeKnowledgeDatabase(): Promise<void> {
  if (knowledgeDb) {
    await knowledgeDb.closeAsync();
    knowledgeDb = null;
  }
}

export function getKnowledgeDb(): SQLite.SQLiteDatabase | null {
  return knowledgeDb;
}

export async function getKbVersion(): Promise<string | null> {
  const db = getKnowledgeDb();
  if (!db) return null;
  const result = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM kb_meta WHERE key = 'version'"
  );
  return result?.value ?? null;
}

export async function setKbVersion(version: string): Promise<void> {
  const db = getKnowledgeDb();
  if (!db) return;
  await db.runAsync(
    `INSERT INTO kb_meta (key, value, updated_at) VALUES ('version', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    [version]
  );
}

// Data seeding functions
interface FoodData {
  name: string;
  name_en: string;
  category: string;
  safety_level: 'SAFE' | 'CAUTION' | 'AVOID';
  reason: string;
  dad_tip?: string;
  trimester_notes?: string;
}

interface SymptomData {
  id: string;
  symptom_name: string;
  symptom_name_en: string;
  questions: string[];
  decision_paths: Array<{ condition: string; action: string; urgency: string }>;
  dad_actions?: string[];
}

interface EmotionalData {
  id: string;
  scenario_name: string;
  scenario_name_en: string;
  trigger: string;
  wife_feeling?: string;
  wrong_response?: string;
  right_response: string;
  follow_up_actions?: string;
}

interface EmergencyData {
  id: string;
  emergency_name: string;
  emergency_name_en: string;
  recognition_signs: string[];
  immediate_actions: string[];
  what_not_to_do?: string[];
  when_to_call_ambulance?: string[];
  hospital_bag_items?: string[];
  reassurance_script?: string;
}

export async function seedFoodData(foods: FoodData[]): Promise<number> {
  const db = getKnowledgeDb();
  if (!db) return 0;

  let count = 0;
  await db.execAsync('BEGIN TRANSACTION');
  try {
    await db.execAsync('DELETE FROM kb_food');
    for (const food of foods) {
      const id = `food_${food.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}`;
      const searchText = `${food.name} ${food.name_en} ${food.category} ${food.reason}`;
      await db.runAsync(
        `INSERT OR REPLACE INTO kb_food (id, name, name_en, category, safety_level, reason, dad_tip, trimester_notes, search_text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, food.name, food.name_en, food.category, food.safety_level, food.reason, food.dad_tip ?? null, food.trimester_notes ?? null, searchText]
      );
      count++;
    }
    await db.execAsync("INSERT INTO kb_food_fts(kb_food_fts) VALUES('rebuild')");
    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
  return count;
}

export async function seedSymptomData(symptoms: SymptomData[]): Promise<number> {
  const db = getKnowledgeDb();
  if (!db) return 0;

  let count = 0;
  await db.execAsync('BEGIN TRANSACTION');
  try {
    await db.execAsync('DELETE FROM kb_symptom');
    for (const symptom of symptoms) {
      const searchText = `${symptom.symptom_name} ${symptom.symptom_name_en}`;
      await db.runAsync(
        `INSERT OR REPLACE INTO kb_symptom (id, symptom_name, symptom_name_en, questions, decision_paths, dad_actions, search_text)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          symptom.id,
          symptom.symptom_name,
          symptom.symptom_name_en,
          JSON.stringify(symptom.questions),
          JSON.stringify(symptom.decision_paths),
          symptom.dad_actions ? JSON.stringify(symptom.dad_actions) : null,
          searchText,
        ]
      );
      count++;
    }
    await db.execAsync("INSERT INTO kb_symptom_fts(kb_symptom_fts) VALUES('rebuild')");
    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
  return count;
}

export async function seedEmotionalData(scenarios: EmotionalData[]): Promise<number> {
  const db = getKnowledgeDb();
  if (!db) return 0;

  let count = 0;
  await db.execAsync('BEGIN TRANSACTION');
  try {
    await db.execAsync('DELETE FROM kb_emotional');
    for (const scenario of scenarios) {
      const searchText = `${scenario.scenario_name} ${scenario.scenario_name_en} ${scenario.trigger} ${scenario.wife_feeling ?? ''}`;
      await db.runAsync(
        `INSERT OR REPLACE INTO kb_emotional (id, scenario_name, scenario_name_en, trigger, wife_feeling, wrong_response, right_response, follow_up_actions, search_text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          scenario.id,
          scenario.scenario_name,
          scenario.scenario_name_en,
          scenario.trigger,
          scenario.wife_feeling ?? null,
          scenario.wrong_response ?? null,
          scenario.right_response,
          scenario.follow_up_actions ?? null,
          searchText,
        ]
      );
      count++;
    }
    await db.execAsync("INSERT INTO kb_emotional_fts(kb_emotional_fts) VALUES('rebuild')");
    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
  return count;
}

export async function seedEmergencyData(emergencies: EmergencyData[]): Promise<number> {
  const db = getKnowledgeDb();
  if (!db) return 0;

  let count = 0;
  await db.execAsync('BEGIN TRANSACTION');
  try {
    await db.execAsync('DELETE FROM kb_emergency');
    for (const emergency of emergencies) {
      const searchText = `${emergency.emergency_name} ${emergency.emergency_name_en} ${(emergency.recognition_signs ?? []).join(' ')}`;
      await db.runAsync(
        `INSERT OR REPLACE INTO kb_emergency (id, emergency_name, emergency_name_en, recognition_signs, immediate_actions, what_not_to_do, when_to_call_ambulance, hospital_bag_items, reassurance_script, search_text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          emergency.id,
          emergency.emergency_name,
          emergency.emergency_name_en,
          JSON.stringify(emergency.recognition_signs ?? []),
          JSON.stringify(emergency.immediate_actions ?? []),
          emergency.what_not_to_do ? JSON.stringify(emergency.what_not_to_do) : null,
          emergency.when_to_call_ambulance ? JSON.stringify(emergency.when_to_call_ambulance) : null,
          emergency.hospital_bag_items ? JSON.stringify(emergency.hospital_bag_items) : null,
          emergency.reassurance_script ?? null,
          searchText,
        ]
      );
      count++;
    }
    await db.execAsync("INSERT INTO kb_emergency_fts(kb_emergency_fts) VALUES('rebuild')");
    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
  return count;
}

export async function getKbStats(): Promise<{ foods: number; symptoms: number; emotional: number; emergencies: number }> {
  const db = getKnowledgeDb();
  if (!db) return { foods: 0, symptoms: 0, emotional: 0, emergencies: 0 };

  const [foods, symptoms, emotional, emergencies] = await Promise.all([
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM kb_food'),
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM kb_symptom'),
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM kb_emotional'),
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM kb_emergency'),
  ]);

  return {
    foods: foods?.count ?? 0,
    symptoms: symptoms?.count ?? 0,
    emotional: emotional?.count ?? 0,
    emergencies: emergencies?.count ?? 0,
  };
}
