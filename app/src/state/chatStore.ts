import { create } from 'zustand';
import type { AIConfig, ChatMessage } from '../types';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  aiConfig: AIConfig | null;
  error: string | null;

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setAIConfig: (config: AIConfig) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

let messageId = 0;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  aiConfig: null,
  error: null,

  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: ++messageId,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  setMessages: (messages) => set({ messages }),

  setLoading: (isLoading) => set({ isLoading }),

  setAIConfig: (aiConfig) => set({ aiConfig }),

  setError: (error) => set({ error }),

  clearMessages: () => set({ messages: [] }),
}));
