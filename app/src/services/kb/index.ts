export {
  openKnowledgeDatabase,
  closeKnowledgeDatabase,
  getKnowledgeDb,
  getKbVersion,
  setKbVersion,
  seedFoodData,
  seedSymptomData,
  seedEmotionalData,
  seedEmergencyData,
  getKbStats,
} from './knowledgeDb';
export {
  searchFood,
  getFoodByName,
  getFoodsByCategory,
  searchSymptom,
  getSymptomById,
  evaluateSymptomPath,
  searchEmotional,
  getEmotionalById,
  searchEmergency,
  getAllEmergencies,
  type KbSearchResult,
  type EmergencyProcedure,
} from './kbService';
export { detectKbIntent, type KbIntentType, type IntentResult } from './intentDetector';
export { initializeKnowledgeBase } from './kbInit';
