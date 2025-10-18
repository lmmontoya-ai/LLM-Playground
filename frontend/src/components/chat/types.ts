import type { ConnectionStatus } from "@/components/model-selector/types";
import type { ChatMessage, ModelInfo, ProviderInfo } from "@/lib/types";

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (value: string) => Promise<void>;
  onStop?: () => void;
  models: ModelInfo[];
  selectedModel?: string | null;
  onModelChange: (modelId: string) => void;
  provider?: ProviderInfo | null;
  providerLabel?: string;
  onDownloadModel?: () => void;
}

export interface ChatHeaderProps {
  models: ModelInfo[];
  selectedModel?: string | null;
  onModelChange: (modelId: string) => void;
  provider?: ProviderInfo | null;
  connectionStatus: ConnectionStatus;
  isStreaming: boolean;
  onDownloadModel?: () => void;
  copied: boolean;
  onExport: () => void | Promise<void>;
  onReset: () => void;
  showLoadedToggle: boolean;
  hasMessages: boolean;
}

export interface UseChatInterfaceParams {
  messages: ChatMessage[];
  isStreaming: boolean;
  onStop?: () => void;
  provider?: ProviderInfo | null;
  providerLabel?: string;
  selectedModel?: string | null;
}

export interface UseChatInterfaceReturn {
  connectionStatus: ConnectionStatus;
  copied: boolean;
  handleExport: () => Promise<void>;
  handleReset: () => void;
  showLoadedToggle: boolean;
  hasMessages: boolean;
}
