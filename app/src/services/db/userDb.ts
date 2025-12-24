import * as SQLite from 'expo-sqlite';

let userDb: SQLite.SQLiteDatabase | null = null;

export async function openUserDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (userDb) return userDb;
  userDb = await SQLite.openDatabaseAsync('user.db');
  await initUserSchema(userDb);
  return userDb;
}

async function initUserSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      due_date TEXT NOT NULL,
      partner_name TEXT,
      locale TEXT DEFAULT 'zh-CN',
      measurement_unit TEXT DEFAULT 'metric',
      notifications_enabled INTEGER DEFAULT 1,
      reminder_frequency TEXT DEFAULT 'daily',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migration: add new columns if they don't exist (for existing databases)
  const columns = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(profile)"
  );
  const columnNames = columns.map((c) => c.name);
  if (!columnNames.includes('measurement_unit')) {
    await db.execAsync("ALTER TABLE profile ADD COLUMN measurement_unit TEXT DEFAULT 'metric'");
  }
  if (!columnNames.includes('notifications_enabled')) {
    await db.execAsync("ALTER TABLE profile ADD COLUMN notifications_enabled INTEGER DEFAULT 1");
  }
  if (!columnNames.includes('reminder_frequency')) {
    await db.execAsync("ALTER TABLE profile ADD COLUMN reminder_frequency TEXT DEFAULT 'daily'");
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ai_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT DEFAULT 'Default Config',
      provider TEXT DEFAULT 'custom',
      base_url TEXT,
      api_key TEXT,
      model TEXT,
      is_active INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      context TEXT
    );

    CREATE TABLE IF NOT EXISTS symptom_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      symptom_type TEXT NOT NULL,
      severity INTEGER CHECK(severity BETWEEN 1 AND 5),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS weight_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      weight REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT,
      reminder_minutes INTEGER DEFAULT 60,
      notes TEXT,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS kicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_start TEXT NOT NULL,
      session_end TEXT,
      count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration_seconds INTEGER,
      intensity INTEGER CHECK(intensity BETWEEN 1 AND 5),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      item_name TEXT NOT NULL,
      checked INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT NOT NULL,
      week INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      week INTEGER,
      photo_uri TEXT,
      template_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      relation TEXT NOT NULL,
      phone TEXT NOT NULL,
      priority INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      note TEXT,
      photo_uri TEXT,
      type TEXT DEFAULT 'general',
      week INTEGER,
      day INTEGER,
      shared INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS dad_growth (
      id INTEGER PRIMARY KEY DEFAULT 1,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      last_calculated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS xp_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      ref_id INTEGER,
      delta INTEGER NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      icon TEXT,
      points INTEGER DEFAULT 0,
      target INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      achievement_id TEXT NOT NULL UNIQUE,
      unlocked_at TEXT DEFAULT (datetime('now')),
      progress INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_history(timestamp);
    CREATE INDEX IF NOT EXISTS idx_symptom_date ON symptom_logs(date);
    CREATE INDEX IF NOT EXISTS idx_weight_date ON weight_records(date);
    CREATE INDEX IF NOT EXISTS idx_appointment_date ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_contacts_priority ON emergency_contacts(priority DESC);
    CREATE INDEX IF NOT EXISTS idx_memories_week ON memories(week);
    CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_xp_events_created ON xp_events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(completed, unlocked_at DESC);
  `);

  // Migration: ai_config 表新增 name 和 is_active 列（兼容旧版本）
  const aiConfigCols = await db.getAllAsync<{ name: string }>("PRAGMA table_info(ai_config)");
  const aiConfigColNames = aiConfigCols.map((c) => c.name);
  if (!aiConfigColNames.includes('name')) {
    await db.execAsync("ALTER TABLE ai_config ADD COLUMN name TEXT DEFAULT 'Default Config'");
  }
  if (!aiConfigColNames.includes('is_active')) {
    await db.execAsync("ALTER TABLE ai_config ADD COLUMN is_active INTEGER DEFAULT 0");
    // 将旧的单条配置设为激活状态
    await db.execAsync("UPDATE ai_config SET is_active = 1, name = '默认配置' WHERE id = (SELECT MIN(id) FROM ai_config)");
  }
}

export async function closeUserDatabase(): Promise<void> {
  if (userDb) {
    await userDb.closeAsync();
    userDb = null;
  }
}

export function getUserDb(): SQLite.SQLiteDatabase | null {
  return userDb;
}
