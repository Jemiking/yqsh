import type { IAiProvider, ChatMessage, ChatOptions, AiProviderConfig } from '../types';

export class OpenAIProvider implements IAiProvider {
  id = 'openai';
  name = 'OpenAI';
  private config: AiProviderConfig;

  constructor(config: AiProviderConfig) {
    this.config = config;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
    const model = this.config.model || 'gpt-4o-mini';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
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
