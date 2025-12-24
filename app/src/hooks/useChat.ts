import { useState, useCallback, useEffect } from 'react';
import { usePregnancyStore } from '../state';
import { useChatStore } from '../state';
import {
  createAiProvider,
  buildKbAugmentedPrompt,
  buildContextSummary,
  type ChatMessage as AiChatMessage,
  type PregnancyContext,
  type KbPayload,
} from '../services/ai';
import { getAIConfig, addChatMessage, getChatHistory } from '../services/db/queries';
import { getBabySizeComparison } from '../lib/pregnancy';
import type { AIConfig, ChatMessage } from '../types';
import {
  detectKbIntent,
  searchFood,
  searchSymptom,
  searchEmotional,
  searchEmergency,
  type KbIntentType,
} from '../services/kb';

export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [detectedIntent, setDetectedIntent] = useState<KbIntentType | null>(null);

  const { currentWeek, currentDay, trimester, daysUntilDue } = usePregnancyStore();
  const { messages, addMessage, setMessages, clearMessages } = useChatStore();

  const context: PregnancyContext = {
    currentWeek,
    currentDay,
    trimester,
    daysUntilDue,
    ...getBabySizeComparison(currentWeek),
  };

  const contextSummary = buildContextSummary(context);

  useEffect(() => {
    loadConfig();
    loadHistory();
  }, []);

  const loadConfig = async () => {
    const config = await getAIConfig();
    setAiConfig(config);
  };

  const loadHistory = async () => {
    const history = await getChatHistory(50);
    setMessages(history);
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !aiConfig) {
        setError(aiConfig ? '消息不能为空' : '请先配置 AI 服务');
        return;
      }

      setIsLoading(true);
      setError(null);

      const userMessage: ChatMessage = {
        id: Date.now(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };
      addMessage(userMessage);

      try {
        await addChatMessage('user', content.trim());

        // Intent detection and KB search
        const intentResult = detectKbIntent(content);
        setDetectedIntent(intentResult.intent);

        const kbPayload: KbPayload = {};

        try {
          if (intentResult.intent === 'emergency') {
            const emergency = await searchEmergency(content);
            if (emergency) kbPayload.emergency = emergency;
          } else if (intentResult.intent === 'food') {
            const result = await searchFood(content, 5);
            if (result.items.length) kbPayload.foods = result.items;
          } else if (intentResult.intent === 'symptom') {
            const result = await searchSymptom(content, 3);
            if (result.items.length) kbPayload.symptoms = result.items;
          } else if (intentResult.intent === 'emotional') {
            const result = await searchEmotional(content, 3);
            if (result.items.length) kbPayload.emotional = result.items;
          }
        } catch (kbError) {
          console.warn('KB search failed:', kbError);
        }

        const provider = createAiProvider(aiConfig);
        const systemPrompt = buildKbAugmentedPrompt(context, kbPayload);

        const aiMessages: AiChatMessage[] = [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10).map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user', content: content.trim() },
        ];

        const response = await provider.chat(aiMessages);

        const assistantMessage: ChatMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
        };
        addMessage(assistantMessage);
        await addChatMessage('assistant', response);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : '发送失败，请重试';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [aiConfig, messages, context, addMessage]
  );

  const clearChat = useCallback(async () => {
    try {
      const { clearChatHistory } = await import('../services/db/queries');
      await clearChatHistory();
    } catch (e) {
      console.warn('Failed to clear chat history from DB:', e);
    }
    clearMessages();
  }, [clearMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    contextSummary,
    hasAiConfig: !!aiConfig,
    reloadConfig: loadConfig,
    detectedIntent,
  };
}
