import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircleIcon } from "lucide-react";
import { DeveloperPanel } from "@/components/layout/DeveloperPanel";
import { NavigationSidebar, type Section } from "@/components/layout/NavigationSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Toast } from "@/components/ui/toast";
import { useChatStore } from "@/store/chat-store";
import { ModelDownloadModal } from "@/components/settings/ModelDownloadModal";
import { useTheme } from "@/hooks/useTheme";
import {
  createChatCompletion,
  fetchModels,
  fetchProviders,
  streamChatCompletion,
  setOpenRouterApiKey as persistOpenRouterApiKey,
  clearOpenRouterApiKey as deleteOpenRouterApiKey,
} from "@/lib/api";
import type { ApiKeySource, ChatMessage, ChatCompletionChunk, ProviderInfo, ModelInfo } from "@/lib/types";

const DEFAULT_SYSTEM_PROMPT =
  "You are an AI assistant designed for interpretability research. Provide clear, well-structured answers.";

const SECTION_META: Record<Section, {
  providerId: string;
  heading: string;
  description: string;
}> = {
  openrouter: {
    providerId: "openrouter",
    heading: "OpenRouter workspace",
    description: "Interact with hosted models over the OpenRouter API.",
  },
  huggingface: {
    providerId: "huggingface",
    heading: "Local inference workspace",
    description: "Work with cached HuggingFace pipelines on this machine.",
  },
};

export default function App() {
  const messages = useChatStore((state) => state.messages);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateLastMessage = useChatStore((state) => state.updateLastMessage);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const setProvider = useChatStore((state) => state.setProvider);
  const activeProvider = useChatStore((state) => state.activeProvider);
  const setModel = useChatStore((state) => state.setModel);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const settings = useChatStore((state) => state.settings);
  const apiKey = useChatStore((state) => state.apiKey);
  const setApiKey = useChatStore((state) => state.setApiKey);
  const apiKeyConfigured = useChatStore((state) => state.apiKeyConfigured);
  const setApiKeyConfigured = useChatStore((state) => state.setApiKeyConfigured);
  const apiKeySource = useChatStore((state) => state.apiKeySource);
  const setApiKeySource = useChatStore((state) => state.setApiKeySource);

  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("openrouter");
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(true);
  const cancelRef = useRef<(() => void) | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [theme, , toggleTheme] = useTheme();
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);

  const sectionConfig = useMemo(() => SECTION_META[activeSection], [activeSection]);
  const activeProviderId = sectionConfig.providerId;
  const scopedModels = useMemo(
    () => (activeProviderId ? models.filter((model) => model.provider === activeProviderId) : []),
    [models, activeProviderId],
  );
  const activeProviderMeta = useMemo(
    () => (activeProviderId ? providers.find((provider) => provider.id === activeProviderId) : undefined),
    [providers, activeProviderId],
  );

  useEffect(() => {
    void (async () => {
      try {
        const [providerData, modelData] = await Promise.all([
          fetchProviders(),
          fetchModels(),
        ]);
        setProviders(providerData);
        setModels(modelData);
        const openRouterProvider = providerData.find((provider) => provider.id === "openrouter");
        const rawSource = (openRouterProvider?.meta?.api_key_source ?? null) as unknown;
        const normalizedSource: ApiKeySource = rawSource === "runtime" || rawSource === "env" || rawSource === "none"
          ? rawSource
          : (openRouterProvider?.meta?.api_key_configured ? "env" : "none");
        setApiKeySource(normalizedSource);
        setApiKeyConfigured(normalizedSource !== "none");
        if (!activeProvider && providerData.length > 0) {
          setProvider(providerData[0].id);
        }
        if (!selectedModel && modelData.length > 0) {
          setModel(modelData[0].id);
        }
      } catch (err) {
        setError((err as Error).message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeProviderId) return;
    if (activeProvider !== activeProviderId) {
      setProvider(activeProviderId);
    }
  }, [activeProviderId, activeProvider, setProvider]);

  useEffect(() => {
    if (!activeProviderId) return;
    const scopedModels = models.filter((model) => model.provider === activeProviderId);
    if (!scopedModels.length) {
      if (selectedModel) {
        setModel(undefined);
      }
      return;
    }
    if (!selectedModel || !scopedModels.some((model) => model.id === selectedModel)) {
      setModel(scopedModels[0].id);
    }
  }, [activeProviderId, models, selectedModel, setModel]);

  useEffect(() => {
    setError(null);
    setToastMessage(null);
  }, [activeSection]);

  useEffect(() => {
    return () => {
      cancelRef.current?.();
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 4000);
  }, []);

  const handlePersistApiKey = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        throw new Error("Enter a valid OpenRouter API key before saving.");
      }
      const status = await persistOpenRouterApiKey(trimmed);
      setApiKeyConfigured(status.configured);
      setApiKeySource(status.source);
      setApiKey(undefined);
      showToast(
        status.source === "runtime"
          ? "OpenRouter API key saved to the backend."
          : "Using OpenRouter API key provided via environment variables.",
      );
      return status;
    },
    [setApiKey, setApiKeyConfigured, setApiKeySource, showToast],
  );

  const handleClearApiKey = useCallback(async () => {
    const status = await deleteOpenRouterApiKey();
    setApiKeyConfigured(status.configured);
    setApiKeySource(status.source);
    setApiKey(undefined);
    showToast(
      status.source === "none"
        ? "OpenRouter API key removed from the backend."
        : "Using OpenRouter API key provided via environment variables.",
    );
    return status;
  }, [setApiKey, setApiKeyConfigured, setApiKeySource, showToast]);

  const buildPayloadMessages = (nextMessages: ChatMessage[]) => {
    const hasSystem = nextMessages.some((message) => message.role === "system");
    const baseSystemMessage: ChatMessage = {
      id: "system",
      role: "system",
      content: DEFAULT_SYSTEM_PROMPT,
      createdAt: Date.now(),
    };
    const base: ChatMessage[] = hasSystem ? nextMessages : [baseSystemMessage, ...nextMessages];

    return base.map((message) => ({
      role: message.role,
      content: message.content,
    }));
  };

  const handleSend = async (content: string) => {
    cancelRef.current?.();
    setError(null);
    setToastMessage(null);
    const providerId = activeProviderId;
    if (!providerId) {
      showToast("Select a chat workspace before sending a message.");
      return;
    }

    if (providerId === "openrouter" && !apiKeyConfigured && !apiKey) {
      showToast("Provide your OpenRouter API key in workspace settings before sending a message.");
      return;
    }

    if (providerId === "huggingface" && scopedModels.length === 0) {
      showToast("Load a local model before starting a conversation.");
      return;
    }

    const modelId = selectedModel ?? scopedModels[0]?.id;
    if (!modelId) {
      showToast("Select a model to continue.");
      return;
    }

    const supportsStreaming = activeProviderMeta?.supports_streaming ?? true;

    addMessage({ role: "user", content });

    const nextMessages = [...useChatStore.getState().messages];
    const payloadMessages = buildPayloadMessages(nextMessages);

    addMessage({ role: "assistant", content: "" });
    setStreaming(true);

    const requestPayload = {
      provider: providerId,
      model: modelId,
      messages: payloadMessages,
      api_key: providerId === "openrouter" ? apiKey?.trim() : undefined,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
      top_p: settings.topP,
      presence_penalty: settings.presencePenalty,
      frequency_penalty: settings.frequencyPenalty,
      stream: supportsStreaming,
    };

    try {
      if (supportsStreaming) {
        cancelRef.current = streamChatCompletion<ChatCompletionChunk>(requestPayload, {
          onChunk: (chunk) => {
            const delta = chunk.delta?.content ?? "";
            if (delta) {
              const current = useChatStore.getState().messages;
              if (current[current.length - 1]?.role !== "assistant") return;
              updateLastMessage((current[current.length - 1]?.content ?? "") + delta);
            }
          },
          onDone: () => {
            setStreaming(false);
            cancelRef.current = null;
          },
          onError: (err) => {
            setError(err.message);
            setStreaming(false);
            cancelRef.current = null;
          },
        });
      } else {
        const response = await createChatCompletion(requestPayload);
        const assistantMessage = response.choices?.[0]?.message?.content ?? "";
        updateLastMessage(assistantMessage);
        setStreaming(false);
        cancelRef.current = null;
      }
    } catch (err) {
      setError((err as Error).message);
      setStreaming(false);
      cancelRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setStreaming(false);
  };

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <NavigationSidebar
          active={activeSection}
          onSelect={(section) => {
            setActiveSection(section);
          }}
          theme={theme}
          onThemeToggle={toggleTheme}
          apiKey={apiKey}
          onApiKeyChange={(value) => {
            setApiKey(value ? value.trim() : undefined);
          }}
          apiKeySource={apiKeySource}
          onApiKeyPersist={handlePersistApiKey}
          onApiKeyClear={handleClearApiKey}
        />

        <main className="flex flex-1 flex-col">
          <div className="flex-1 overflow-hidden">
            {error ? (
              <div className="mx-10 mt-6 flex items-center gap-3 rounded-lg border border-red-300 bg-red-100/40 p-4 text-sm text-red-800">
                <AlertCircleIcon className="h-4 w-4" />
                {error}
              </div>
            ) : null}
            <div className="flex h-full flex-col gap-6 px-6 py-6 md:px-10">
              <ChatInterface
                messages={messages}
                isStreaming={isStreaming}
                onSend={handleSend}
                onStop={handleStopStreaming}
                models={scopedModels}
                selectedModel={selectedModel}
                onModelChange={(modelId) => {
                  setModel(modelId);
                }}
                provider={activeProviderMeta ?? null}
                providerLabel={sectionConfig.heading}
                onDownloadModel={
                  activeSection === "huggingface"
                    ? () => {
                        setDownloadModalOpen(true);
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </main>

        <DeveloperPanel
          isOpen={isDeveloperOpen}
          onToggle={() => {
            setIsDeveloperOpen((open) => !open);
          }}
          section={activeSection}
          providers={providers}
          models={scopedModels}
          activeProvider={activeProvider}
          selectedModel={selectedModel}
          align="right"
        />
      </div>
      <ModelDownloadModal
        open={isDownloadModalOpen}
        onClose={() => {
          setDownloadModalOpen(false);
        }}
        onSubmitted={(job) => {
          showToast(`Download queued for ${job.model_id}.`);
        }}
      />
      {toastMessage ? <Toast message={toastMessage} /> : null}
    </>
  );
}
