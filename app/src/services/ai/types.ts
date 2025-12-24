import type { AIConfig } from '../../types';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface IAiProvider {
  id: string;
  name: string;
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  testConnection(): Promise<boolean>;
}

export interface PregnancyContext {
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  daysUntilDue: number;
  babySize?: string;
  babySizeComparison?: string;
  warningSignsThisWeek?: string[];
}

export type AiProviderType = 'custom' | string;

export interface AiProviderConfig extends AIConfig {
  systemPrompt?: string;
}
