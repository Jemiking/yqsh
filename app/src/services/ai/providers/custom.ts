import type { IAiProvider, ChatMessage, ChatOptions, AiProviderConfig } from '../types';

export class CustomProvider implements IAiProvider {
  id = 'custom';
  name = 'Custom';
  private config: AiProviderConfig;

  constructor(config: AiProviderConfig) {
    this.config = config;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    if (!this.config.baseUrl) {
      throw new Error('Custom provider requires a base URL');
    }

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        model: this.config.model || 'default',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Custom API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || data.content?.[0]?.text || '';
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.chat([{ role: 'user', content: 'Hello' }], { maxTokens: 10 });
      return result.length > 0;
    } catch {
      return false;
    }
  }
}
