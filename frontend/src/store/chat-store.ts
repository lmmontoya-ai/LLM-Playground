import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiKeySource, ChatMessage } from "@/lib/types";

interface ChatSettings {
  temperature: number;
  maxTokens?: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  activeProvider?: string;
  selectedModel?: string;
  apiKey?: string;
  apiKeyConfigured: boolean;
  apiKeySource: ApiKeySource;
  settings: ChatSettings;
  addMessage: (message: Omit<ChatMessage, "id" | "createdAt"> & { id?: string }) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (value: boolean) => void;
  setProvider: (providerId: string) => void;
  setModel: (modelId?: string) => void;
  setApiKey: (key?: string) => void;
  setApiKeyConfigured: (value: boolean) => void;
  setApiKeySource: (source: ApiKeySource) => void;
  setSettings: (settings: Partial<ChatSettings>) => void;
  reset: () => void;
}

const defaultSettings: ChatSettings = {
  temperature: 0.7,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  maxTokens: undefined,
};

type PersistedChatState = Pick<
  ChatState,
  "messages" | "activeProvider" | "selectedModel" | "settings"
>;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      apiKey: undefined,
      apiKeyConfigured: false,
      apiKeySource: "none",
      settings: defaultSettings,
      addMessage: ({ id, role, content }) => {
        const message: ChatMessage = {
          id: id ?? nanoid(),
          role,
          content,
          createdAt: Date.now(),
        };
        set((state) => ({ messages: [...state.messages, message] }));
      },
      updateLastMessage: (content) => {
        set((state) => {
          const next = [...state.messages];
          const last = next[next.length - 1];
          if (!last) return { messages: next };
          next[next.length - 1] = { ...last, content };
          return { messages: next };
        });
      },
      setStreaming: (value) => set({ isStreaming: value }),
      setProvider: (providerId) => set({ activeProvider: providerId }),
      setModel: (modelId) => set({ selectedModel: modelId }),
      setApiKey: (key) => set({ apiKey: key }),
      setApiKeyConfigured: (value) => set({ apiKeyConfigured: value }),
      setApiKeySource: (source) => set({ apiKeySource: source }),
      setSettings: (settings) => {
        set((state) => ({ settings: { ...state.settings, ...settings } }));
      },
      reset: () => set({
        messages: [],
        isStreaming: false,
      }),
    }),
    {
      name: "llm-playground-chat",
      version: 1,
      migrate: (persistedState, _version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState as PersistedChatState;
        }
        const { apiKey: _legacyApiKey, ...rest } = persistedState as Record<string, unknown>;
        return rest as PersistedChatState;
      },
      partialize: (state): PersistedChatState => ({
        messages: state.messages,
        activeProvider: state.activeProvider,
        selectedModel: state.selectedModel,
        settings: state.settings,
      }),
    },
  ),
);

export const useChatSettings = () => useChatStore((state) => state.settings);
