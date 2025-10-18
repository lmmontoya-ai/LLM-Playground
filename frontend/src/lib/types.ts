export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

export interface ChatCompletionRequest {
  provider?: string;
  model?: string;
  messages: Array<{ role: ChatRole; content: string }>;
  stream?: boolean;
  api_key?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  stop?: string[];
  metadata?: Record<string, unknown>;
}

export interface ChatCompletionChunk {
  id: string;
  model: string;
  index: number;
  delta: {
    content?: string;
    role?: ChatRole;
    finish_reason?: string | null;
  };
  provider: string;
  meta?: Record<string, unknown>;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  provider: string;
  choices: Array<{
    index: number;
    finish_reason: string | null;
    message: {
      role: ChatRole;
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  meta?: Record<string, unknown>;
}

export interface ProviderInfo {
  id: string;
  name: string;
  supports_streaming: boolean;
  models: string[];
  meta?: Record<string, unknown>;
}

export interface ModelInfo {
  id: string;
  provider: string;
  description?: string | null;
  tags?: string[];
  loaded?: boolean;
  meta?: Record<string, unknown>;
}

export type DownloadStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface ModelDownloadJob {
  id: string;
  model_id: string;
  revision?: string | null;
  task?: string | null;
  quantization?: string | null;
  status: DownloadStatus;
  progress: number;
  downloaded_bytes: number;
  total_bytes?: number | null;
  message?: string | null;
  auto_load: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface ModelDownloadRequestPayload {
  model_id: string;
  revision?: string;
  task?: string;
  quantization?: string;
  token?: string;
  auto_load?: boolean;
}

export type ApiKeySource = "env" | "runtime" | "none";

export interface ApiKeyStatus {
  configured: boolean;
  source: ApiKeySource;
}
