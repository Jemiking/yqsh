// Web 平台 stub - SQLite 不支持 Web
import type { UserProfile, AIConfig } from '../../types';

export async function openUserDatabase(): Promise<void> {
  console.warn('[Web] SQLite not supported, using in-memory stub');
}

export async function closeUserDatabase(): Promise<void> {}

export function getUserDb(): null {
  return null;
}

export async function getProfile(): Promise<UserProfile | null> {
  return null;
}

export async function saveProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  console.warn('[Web] Cannot save profile - SQLite not supported');
}

export async function getAiConfig(): Promise<AIConfig | null> {
  const stored = localStorage.getItem('ai_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export async function saveAiConfig(config: Omit<AIConfig, 'id' | 'updatedAt'>): Promise<void> {
  localStorage.setItem('ai_config', JSON.stringify(config));
}
