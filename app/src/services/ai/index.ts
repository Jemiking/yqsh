import type { AIConfig } from '../../types';
import type { IAiProvider, AiProviderConfig } from './types';
import { CustomProvider } from './providers';

export function createAiProvider(config: AIConfig): IAiProvider {
  if (!config.baseUrl) {
    throw new Error('Base URL is required');
  }

  const providerConfig: AiProviderConfig = {
    provider: 'custom',
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    model: config.model,
  };

  return new CustomProvider(providerConfig);
}

export async function testAiConnection(config: AIConfig): Promise<boolean> {
  try {
    const provider = createAiProvider(config);
    return await provider.testConnection();
  } catch {
    return false;
  }
}

export * from './types';
export * from './providers';
export * from './context';
