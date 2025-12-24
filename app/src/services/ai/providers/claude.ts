import type { IAiProvider, ChatMessage, ChatOptions, AiProviderConfig } from '../types';

export class ClaudeProvider implements IAiProvider {
  id = 'claude';
  name = 'Claude';
  private config: AiProviderConfig;

  constructor(config: AiProviderConfig) {
    this.config = config;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const baseUrl = this.config.baseUrl || 'https://api.anthropic.com/v1';
    const model = this.config.model || 'claude-3-5-sonnet-20241022';

    const systemMessage = messages.find((m) => m.role === 'system');
    const chatMessages = messages.filter((m) => m.role !== 'system');

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: options?.maxTokens ?? 1024,
        system: systemMessage?.content,
        messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
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
