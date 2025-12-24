/**
 * Knowledge Base Import Script
 *
 * Parses YAML data from markdown files and imports into SQLite database.
 * Run: npx tsx scripts/import-kb.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

const DOC_DIR = path.resolve(__dirname, '../../doc/开发进度');
const DB_PATH = path.resolve(__dirname, '../knowledge.db');

interface FoodRaw {
  name: string;
  name_en: string;
  category: string;
  safety_level: 'SAFE' | 'CAUTION' | 'AVOID';
  reason: string;
  dad_tip?: string;
  trimester_notes?: string;
}

interface SymptomRaw {
  id: string;
  symptom_name: string;
  symptom_name_en: string;
  questions: string[];
  decision_paths: Array<{
    condition: string;
    action: string;
    urgency: string;
  }>;
  dad_actions?: string[];
}

interface EmotionalRaw {
  id: string;
  scenario_name: string;
  scenario_name_en: string;
  trigger: string;
  wife_feeling?: string;
  wrong_response?: string;
  right_response: string;
  follow_up_actions?: string;
}

interface EmergencyRaw {
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

function extractYamlBlocks(mdContent: string): string[] {
  const regex = /```yaml\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;
  while ((match = regex.exec(mdContent)) !== null) {
    // Fix common YAML issues: nested quotes
    let fixed = match[1];
    // Replace problematic nested quotes in values
    fixed = fixed.replace(/: "(.*?)"/gm, (m, p1) => {
      // Escape inner quotes and use single quotes for outer
      const escaped = p1.replace(/"/g, '\\"');
      return `: "${escaped}"`;
    });
    blocks.push(fixed);
  }
  return blocks;
}

function safeYamlParse(content: string): unknown {
  try {
    return yaml.parse(content);
  } catch (e) {
    // Try with more lenient options
    try {
      return yaml.parse(content, { strict: false });
    } catch {
      console.warn('YAML parse failed, trying line-by-line extraction...');
      return null;
    }
  }
}

function parseFood(yamlContent: string): FoodRaw[] {
  const parsed = safeYamlParse(yamlContent);
  if (!parsed) return [];
  const foods: FoodRaw[] = [];

  for (const key of Object.keys(parsed)) {
    const items = parsed[key];
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.name && item.safety_level) {
          foods.push({
            name: item.name,
            name_en: item.name_en || '',
            category: item.category || key,
            safety_level: item.safety_level,
            reason: item.reason || '',
            dad_tip: item.dad_tip,
            trimester_notes: item.trimester_notes,
          });
        }
      }
    }
  }
  return foods;
}

function parseSymptoms(yamlContent: string): SymptomRaw[] {
  const parsed = safeYamlParse(yamlContent) as Record<string, unknown> | null;
  if (!parsed) return [];
  const symptoms: SymptomRaw[] = [];

  const items = (parsed.symptom_decision_trees || parsed) as unknown[];
  if (Array.isArray(items)) {
    for (const item of items) {
      if (item.id && item.symptom_name) {
        symptoms.push({
          id: item.id,
          symptom_name: item.symptom_name,
          symptom_name_en: item.symptom_name_en || '',
          questions: item.questions || [],
          decision_paths: item.decision_paths || [],
          dad_actions: item.dad_actions,
        });
      }
    }
  }
  return symptoms;
}

function parseEmotional(yamlContent: string): EmotionalRaw[] {
  const parsed = safeYamlParse(yamlContent) as Record<string, unknown> | null;
  if (!parsed) return [];
  const scenarios: EmotionalRaw[] = [];

  const items = (parsed.emotional_scenarios || parsed) as unknown[];
  if (Array.isArray(items)) {
    for (const item of items) {
      if (item.id && item.scenario_name) {
        scenarios.push({
          id: item.id,
          scenario_name: item.scenario_name,
          scenario_name_en: item.scenario_name_en || '',
          trigger: item.trigger || '',
          wife_feeling: item.wife_feeling,
          wrong_response: item.wrong_response,
          right_response: item.right_response || '',
          follow_up_actions: item.follow_up_actions,
        });
      }
    }
  }
  return scenarios;
}

function parseEmergency(yamlContent: string): EmergencyRaw[] {
  const parsed = safeYamlParse(yamlContent) as Record<string, unknown> | null;
  if (!parsed) return [];
  const emergencies: EmergencyRaw[] = [];

  const items = (parsed.emergencies || parsed.emergency_procedures || parsed) as unknown[];
  if (Array.isArray(items)) {
    for (const item of items) {
      if (item.id && item.emergency_name) {
        emergencies.push({
          id: item.id,
          emergency_name: item.emergency_name,
          emergency_name_en: item.emergency_name_en || '',
          recognition_signs: item.recognition_signs || [],
          immediate_actions: item.immediate_actions || [],
          what_not_to_do: item.what_not_to_do,
          when_to_call_ambulance: item.when_to_call_ambulance,
          hospital_bag_items: item.hospital_bag_items,
          reassurance_script: item.reassurance_script,
        });
      }
    }
  }
  return emergencies;
}

async function main() {
  console.log('=== Knowledge Base Import Script ===\n');

  // Read markdown files
  const foodFile = path.join(DOC_DIR, '20251219-食物安全库.md');
  const symptomFile = path.join(DOC_DIR, '20251219-症状决策树.md');
  const emotionalFile = path.join(DOC_DIR, '20251219-情绪场景剧本.md');
  const emergencyFile = path.join(DOC_DIR, '20251219-应急流程.md');

  // Parse Food
  console.log('Parsing food safety data...');
  const foodContent = fs.readFileSync(foodFile, 'utf-8');
  const foodYamlBlocks = extractYamlBlocks(foodContent);
  const foods: FoodRaw[] = [];
  for (const block of foodYamlBlocks) {
    foods.push(...parseFood(block));
  }
  console.log(`  Found ${foods.length} food items`);

  // Parse Symptoms
  console.log('Parsing symptom decision trees...');
  const symptomContent = fs.readFileSync(symptomFile, 'utf-8');
  const symptomYamlBlocks = extractYamlBlocks(symptomContent);
  const symptoms: SymptomRaw[] = [];
  for (const block of symptomYamlBlocks) {
    symptoms.push(...parseSymptoms(block));
  }
  console.log(`  Found ${symptoms.length} symptom trees`);

  // Parse Emotional
  console.log('Parsing emotional scenarios...');
  const emotionalContent = fs.readFileSync(emotionalFile, 'utf-8');
  const emotionalYamlBlocks = extractYamlBlocks(emotionalContent);
  const emotionalScenarios: EmotionalRaw[] = [];
  for (const block of emotionalYamlBlocks) {
    emotionalScenarios.push(...parseEmotional(block));
  }
  console.log(`  Found ${emotionalScenarios.length} emotional scenarios`);

  // Parse Emergency
  console.log('Parsing emergency procedures...');
  const emergencyContent = fs.readFileSync(emergencyFile, 'utf-8');
  const emergencyYamlBlocks = extractYamlBlocks(emergencyContent);
  const emergencies: EmergencyRaw[] = [];
  for (const block of emergencyYamlBlocks) {
    emergencies.push(...parseEmergency(block));
  }
  console.log(`  Found ${emergencies.length} emergency procedures`);

  // Output JSON for app bundling
  const outputDir = path.resolve(__dirname, '../src/knowledge');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'foods.json'),
    JSON.stringify(foods, null, 2)
  );
  fs.writeFileSync(
    path.join(outputDir, 'symptoms.json'),
    JSON.stringify(symptoms, null, 2)
  );
  fs.writeFileSync(
    path.join(outputDir, 'emotional.json'),
    JSON.stringify(emotionalScenarios, null, 2)
  );
  fs.writeFileSync(
    path.join(outputDir, 'emergencies.json'),
    JSON.stringify(emergencies, null, 2)
  );

  console.log('\n=== Export Complete ===');
  console.log(`Output directory: ${outputDir}`);
  console.log('Files created:');
  console.log('  - foods.json');
  console.log('  - symptoms.json');
  console.log('  - emotional.json');
  console.log('  - emergencies.json');
  console.log('\nNext steps:');
  console.log('1. Review the JSON files for correctness');
  console.log('2. Use knowledgeDb.ts to import into SQLite at app init');
}

main().catch(console.error);
