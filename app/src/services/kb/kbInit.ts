import {
  openKnowledgeDatabase,
  getKbVersion,
  setKbVersion,
  seedFoodData,
  seedSymptomData,
  seedEmotionalData,
  seedEmergencyData,
  getKbStats,
} from './knowledgeDb';

// Import JSON data with type assertion
import foodsDataRaw from '../../knowledge/foods.json';
import symptomsDataRaw from '../../knowledge/symptoms.json';
import emotionalDataRaw from '../../knowledge/emotional.json';
import emergenciesDataRaw from '../../knowledge/emergencies.json';

const foodsData = foodsDataRaw as Array<{
  name: string;
  name_en: string;
  category: string;
  safety_level: 'SAFE' | 'CAUTION' | 'AVOID';
  reason: string;
  dad_tip?: string;
  trimester_notes?: string;
}>;

const symptomsData = symptomsDataRaw as Array<{
  id: string;
  symptom_name: string;
  symptom_name_en: string;
  questions: string[];
  decision_paths: Array<{ condition: string; action: string; urgency: string }>;
  dad_actions?: string[];
}>;

const emotionalData = emotionalDataRaw as Array<{
  id: string;
  scenario_name: string;
  scenario_name_en: string;
  trigger: string;
  wife_feeling?: string;
  wrong_response?: string;
  right_response: string;
  follow_up_actions?: string;
}>;

const emergenciesData = emergenciesDataRaw as Array<{
  id: string;
  emergency_name: string;
  emergency_name_en: string;
  recognition_signs: string[];
  immediate_actions: string[];
  what_not_to_do?: string[];
  when_to_call_ambulance?: string[];
  hospital_bag_items?: string[];
  reassurance_script?: string;
}>;

const KB_VERSION = '1.1.0';

export async function initializeKnowledgeBase(): Promise<{
  success: boolean;
  stats: { foods: number; symptoms: number; emotional: number; emergencies: number };
  version: string;
}> {
  try {
    await openKnowledgeDatabase();

    const currentVersion = await getKbVersion();

    if (currentVersion !== KB_VERSION) {
      console.log(`[KB] Seeding knowledge base (version ${KB_VERSION})...`);

      const foodCount = await seedFoodData(foodsData);
      console.log(`[KB] Seeded ${foodCount} food items`);

      const symptomCount = await seedSymptomData(symptomsData);
      console.log(`[KB] Seeded ${symptomCount} symptom trees`);

      const emotionalCount = await seedEmotionalData(emotionalData);
      console.log(`[KB] Seeded ${emotionalCount} emotional scenarios`);

      const emergencyCount = await seedEmergencyData(emergenciesData);
      console.log(`[KB] Seeded ${emergencyCount} emergency procedures`);

      await setKbVersion(KB_VERSION);
      console.log(`[KB] Version set to ${KB_VERSION}`);
    } else {
      console.log(`[KB] Already at version ${KB_VERSION}, skipping seed`);
    }

    const stats = await getKbStats();
    return { success: true, stats, version: KB_VERSION };
  } catch (error) {
    console.error('[KB] Initialization failed:', error);
    return {
      success: false,
      stats: { foods: 0, symptoms: 0, emotional: 0, emergencies: 0 },
      version: '',
    };
  }
}
