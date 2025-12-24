import { getKnowledgeDb } from './knowledgeDb';
import type { FoodItem, SymptomDecisionTree, EmotionalScenario, DecisionPath, Urgency } from '../../types';

function escapeFtsQuery(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return '';
  const escaped = trimmed.replace(/["\-*()^~:]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!escaped) return '';
  return `"${escaped}"`;
}

export interface KbSearchResult<T> {
  items: T[];
  query: string;
  totalMatches: number;
}

export interface KbFoodRow {
  id: string;
  name: string;
  name_en: string | null;
  category: string;
  safety_level: 'SAFE' | 'CAUTION' | 'AVOID';
  reason: string;
  dad_tip: string | null;
  trimester_notes: string | null;
}

export interface KbSymptomRow {
  id: string;
  symptom_name: string;
  symptom_name_en: string | null;
  questions: string;
  decision_paths: string;
  dad_actions: string | null;
}

export interface KbEmotionalRow {
  id: string;
  scenario_name: string;
  scenario_name_en: string | null;
  trigger: string;
  wife_feeling: string | null;
  wrong_response: string | null;
  right_response: string;
  follow_up_actions: string | null;
}

export interface KbEmergencyRow {
  id: string;
  emergency_name: string;
  emergency_name_en: string | null;
  recognition_signs: string;
  immediate_actions: string;
  what_not_to_do: string | null;
  when_to_call_ambulance: string | null;
  hospital_bag_items: string | null;
  reassurance_script: string | null;
}

function rowToFoodItem(row: KbFoodRow): FoodItem {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en ?? '',
    category: row.category,
    safetyLevel: row.safety_level,
    reason: row.reason,
    dadTip: row.dad_tip ?? '',
    trimesterNotes: row.trimester_notes ?? undefined,
  };
}

function rowToSymptomTree(row: KbSymptomRow): SymptomDecisionTree {
  return {
    id: row.id,
    symptomName: row.symptom_name,
    symptomNameEn: row.symptom_name_en ?? '',
    questions: JSON.parse(row.questions) as string[],
    decisionPaths: JSON.parse(row.decision_paths) as DecisionPath[],
    dadActions: row.dad_actions ? JSON.parse(row.dad_actions) as string[] : [],
  };
}

function rowToEmotionalScenario(row: KbEmotionalRow): EmotionalScenario {
  return {
    id: row.id,
    scenarioName: row.scenario_name,
    scenarioNameEn: row.scenario_name_en ?? '',
    trigger: row.trigger,
    wifeFeeling: row.wife_feeling ?? '',
    wrongResponse: row.wrong_response ?? '',
    rightResponse: row.right_response,
    followUpActions: row.follow_up_actions ?? '',
  };
}

export async function searchFood(query: string, limit = 5): Promise<KbSearchResult<FoodItem>> {
  const db = getKnowledgeDb();
  if (!db) return { items: [], query, totalMatches: 0 };

  const normalizedQuery = query.toLowerCase().trim();
  const ftsQuery = escapeFtsQuery(normalizedQuery);

  if (ftsQuery) {
    try {
      const rows = await db.getAllAsync<KbFoodRow>(
        `SELECT f.* FROM kb_food f
         JOIN kb_food_fts fts ON f.rowid = fts.rowid
         WHERE kb_food_fts MATCH ?
         ORDER BY bm25(kb_food_fts)
         LIMIT ?`,
        [ftsQuery, limit]
      );
      if (rows.length > 0) {
        return {
          items: rows.map(rowToFoodItem),
          query: normalizedQuery,
          totalMatches: rows.length,
        };
      }
    } catch {
      // FTS query failed, fall through to LIKE
    }
  }

  const likeRows = await db.getAllAsync<KbFoodRow>(
    `SELECT * FROM kb_food
     WHERE name LIKE ? OR name_en LIKE ? OR category LIKE ?
     LIMIT ?`,
    [`%${normalizedQuery}%`, `%${normalizedQuery}%`, `%${normalizedQuery}%`, limit]
  );
  return {
    items: likeRows.map(rowToFoodItem),
    query: normalizedQuery,
    totalMatches: likeRows.length,
  };
}

export async function getFoodByName(name: string): Promise<FoodItem | null> {
  const db = getKnowledgeDb();
  if (!db) return null;

  const row = await db.getFirstAsync<KbFoodRow>(
    `SELECT * FROM kb_food WHERE name = ? OR name_en = ?`,
    [name, name]
  );

  return row ? rowToFoodItem(row) : null;
}

export async function getFoodsByCategory(category: string): Promise<FoodItem[]> {
  const db = getKnowledgeDb();
  if (!db) return [];

  const rows = await db.getAllAsync<KbFoodRow>(
    `SELECT * FROM kb_food WHERE category = ? ORDER BY safety_level, name`,
    [category]
  );

  return rows.map(rowToFoodItem);
}

export async function searchSymptom(query: string, limit = 3): Promise<KbSearchResult<SymptomDecisionTree>> {
  const db = getKnowledgeDb();
  if (!db) return { items: [], query, totalMatches: 0 };

  const normalizedQuery = query.toLowerCase().trim();
  const ftsQuery = escapeFtsQuery(normalizedQuery);

  if (ftsQuery) {
    try {
      const rows = await db.getAllAsync<KbSymptomRow>(
        `SELECT s.* FROM kb_symptom s
         JOIN kb_symptom_fts fts ON s.rowid = fts.rowid
         WHERE kb_symptom_fts MATCH ?
         ORDER BY bm25(kb_symptom_fts)
         LIMIT ?`,
        [ftsQuery, limit]
      );
      if (rows.length > 0) {
        return {
          items: rows.map(rowToSymptomTree),
          query: normalizedQuery,
          totalMatches: rows.length,
        };
      }
    } catch {
      // FTS query failed, fall through to LIKE
    }
  }

  const likeRows = await db.getAllAsync<KbSymptomRow>(
    `SELECT * FROM kb_symptom
     WHERE symptom_name LIKE ? OR symptom_name_en LIKE ? OR search_text LIKE ?
     LIMIT ?`,
    [`%${normalizedQuery}%`, `%${normalizedQuery}%`, `%${normalizedQuery}%`, limit]
  );
  return {
    items: likeRows.map(rowToSymptomTree),
    query: normalizedQuery,
    totalMatches: likeRows.length,
  };
}

export async function getSymptomById(id: string): Promise<SymptomDecisionTree | null> {
  const db = getKnowledgeDb();
  if (!db) return null;

  const row = await db.getFirstAsync<KbSymptomRow>(
    `SELECT * FROM kb_symptom WHERE id = ?`,
    [id]
  );

  return row ? rowToSymptomTree(row) : null;
}

export function evaluateSymptomPath(
  tree: SymptomDecisionTree,
  answers: boolean[]
): { path: DecisionPath | null; urgency: Urgency; suggestion: string } {
  const paths = tree.decisionPaths;
  if (!paths.length) {
    return { path: null, urgency: 'NORMAL', suggestion: '观察情况' };
  }

  const hasAnyYes = answers.some((a) => a === true);
  const allNo = answers.length > 0 && answers.every((a) => a === false);
  const yesCount = answers.filter((a) => a === true).length;

  for (const path of paths) {
    const cond = path.condition.toLowerCase();
    if (path.urgency === 'EMERGENCY') {
      if (cond.includes('任一为是') && hasAnyYes) {
        return { path, urgency: 'EMERGENCY', suggestion: path.action };
      }
      if (cond.includes('看到') || cond.includes('脐带')) {
        if (answers[1] === true) {
          return { path, urgency: 'EMERGENCY', suggestion: path.action };
        }
      }
      if ((cond.includes('绿色') || cond.includes('棕色') || cond.includes('不足37周')) && (answers[0] === true || answers[2] === true)) {
        return { path, urgency: 'EMERGENCY', suggestion: path.action };
      }
      if (hasAnyYes && yesCount >= 2) {
        return { path, urgency: 'EMERGENCY', suggestion: path.action };
      }
    }
  }

  for (const path of paths) {
    const cond = path.condition.toLowerCase();
    if (path.urgency === 'CALL_DOCTOR') {
      if (cond.includes('不足37周') && answers.length > 2 && answers[answers.length > 3 ? 3 : 2] === true) {
        return { path, urgency: 'CALL_DOCTOR', suggestion: path.action };
      }
      if (hasAnyYes) {
        return { path, urgency: 'CALL_DOCTOR', suggestion: path.action };
      }
    }
  }

  if (allNo) {
    const monitorPath = paths.find((p) => p.urgency === 'MONITOR');
    if (monitorPath) {
      return { path: monitorPath, urgency: 'MONITOR', suggestion: monitorPath.action };
    }
    const normalPath = paths.find((p) => p.urgency === 'NORMAL');
    if (normalPath) {
      return { path: normalPath, urgency: 'NORMAL', suggestion: normalPath.action };
    }
  }

  const fallback = paths[paths.length - 1];
  return {
    path: fallback,
    urgency: fallback.urgency,
    suggestion: fallback.action,
  };
}

export async function searchEmotional(query: string, limit = 3): Promise<KbSearchResult<EmotionalScenario>> {
  const db = getKnowledgeDb();
  if (!db) return { items: [], query, totalMatches: 0 };

  const normalizedQuery = query.toLowerCase().trim();
  const ftsQuery = escapeFtsQuery(normalizedQuery);

  if (ftsQuery) {
    try {
      const rows = await db.getAllAsync<KbEmotionalRow>(
        `SELECT e.* FROM kb_emotional e
         JOIN kb_emotional_fts fts ON e.rowid = fts.rowid
         WHERE kb_emotional_fts MATCH ?
         ORDER BY bm25(kb_emotional_fts)
         LIMIT ?`,
        [ftsQuery, limit]
      );
      if (rows.length > 0) {
        return {
          items: rows.map(rowToEmotionalScenario),
          query: normalizedQuery,
          totalMatches: rows.length,
        };
      }
    } catch {
      // FTS query failed, fall through to LIKE
    }
  }

  const likeRows = await db.getAllAsync<KbEmotionalRow>(
    `SELECT * FROM kb_emotional
     WHERE scenario_name LIKE ? OR trigger LIKE ? OR wife_feeling LIKE ?
     LIMIT ?`,
    [`%${normalizedQuery}%`, `%${normalizedQuery}%`, `%${normalizedQuery}%`, limit]
  );
  return {
    items: likeRows.map(rowToEmotionalScenario),
    query: normalizedQuery,
    totalMatches: likeRows.length,
  };
}

export async function getEmotionalById(id: string): Promise<EmotionalScenario | null> {
  const db = getKnowledgeDb();
  if (!db) return null;

  const row = await db.getFirstAsync<KbEmotionalRow>(
    `SELECT * FROM kb_emotional WHERE id = ?`,
    [id]
  );

  return row ? rowToEmotionalScenario(row) : null;
}

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

function rowToEmergency(row: KbEmergencyRow): EmergencyProcedure {
  return {
    id: row.id,
    emergencyName: row.emergency_name,
    emergencyNameEn: row.emergency_name_en ?? '',
    recognitionSigns: row.recognition_signs ? JSON.parse(row.recognition_signs) : [],
    immediateActions: row.immediate_actions ? JSON.parse(row.immediate_actions) : [],
    whatNotToDo: row.what_not_to_do ? JSON.parse(row.what_not_to_do) : [],
    whenToCallAmbulance: row.when_to_call_ambulance ? JSON.parse(row.when_to_call_ambulance) : [],
    hospitalBagItems: row.hospital_bag_items ? JSON.parse(row.hospital_bag_items) : [],
    reassuranceScript: row.reassurance_script ?? '',
  };
}

export async function searchEmergency(query: string): Promise<EmergencyProcedure | null> {
  const db = getKnowledgeDb();
  if (!db) return null;

  const normalizedQuery = query.toLowerCase().trim();
  const ftsQuery = escapeFtsQuery(normalizedQuery);

  if (ftsQuery) {
    try {
      const row = await db.getFirstAsync<KbEmergencyRow>(
        `SELECT e.* FROM kb_emergency e
         JOIN kb_emergency_fts fts ON e.rowid = fts.rowid
         WHERE kb_emergency_fts MATCH ?
         ORDER BY bm25(kb_emergency_fts)
         LIMIT 1`,
        [ftsQuery]
      );
      if (row) {
        return rowToEmergency(row);
      }
    } catch {
      // FTS query failed, fall through to LIKE
    }
  }

  const likeRow = await db.getFirstAsync<KbEmergencyRow>(
    `SELECT * FROM kb_emergency
     WHERE emergency_name LIKE ? OR search_text LIKE ?
     LIMIT 1`,
    [`%${normalizedQuery}%`, `%${normalizedQuery}%`]
  );
  return likeRow ? rowToEmergency(likeRow) : null;
}

export async function getAllEmergencies(): Promise<EmergencyProcedure[]> {
  const db = getKnowledgeDb();
  if (!db) return [];

  const rows = await db.getAllAsync<KbEmergencyRow>(
    `SELECT * FROM kb_emergency ORDER BY emergency_name`
  );

  return rows.map(rowToEmergency);
}
