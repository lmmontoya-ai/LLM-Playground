import type {
  ChatCompletionChunk,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ApiKeyStatus,
  ModelInfo,
  ModelDownloadJob,
  ModelDownloadRequestPayload,
  ProviderInfo,
} from "@/lib/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

const jsonHeaders = {
  "Content-Type": "application/json",
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.detail ?? response.statusText);
  }

  return (await response.json()) as T;
}

export async function fetchProviders(): Promise<ProviderInfo[]> {
  return request<ProviderInfo[]>("/providers");
}

export async function fetchModels(): Promise<ModelInfo[]> {
  return request<ModelInfo[]>("/models");
}

export async function listModelDownloads(): Promise<ModelDownloadJob[]> {
  return request<ModelDownloadJob[]>("/huggingface/downloads");
}

export async function startModelDownload(
  payload: ModelDownloadRequestPayload,
): Promise<ModelDownloadJob> {
  return request<ModelDownloadJob>("/huggingface/downloads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelModelDownload(jobId: string): Promise<ModelDownloadJob> {
  return request<ModelDownloadJob>(`/huggingface/downloads/${jobId}`, {
    method: "DELETE",
  });
}

export async function fetchOpenRouterApiKeyStatus(): Promise<ApiKeyStatus> {
  return request<ApiKeyStatus>("/providers/openrouter/key");
}

export async function setOpenRouterApiKey(apiKey: string): Promise<ApiKeyStatus> {
  return request<ApiKeyStatus>("/providers/openrouter/key", {
    method: "POST",
    body: JSON.stringify({ api_key: apiKey }),
  });
}

export async function clearOpenRouterApiKey(): Promise<ApiKeyStatus> {
  return request<ApiKeyStatus>("/providers/openrouter/key", {
    method: "DELETE",
  });
}

export async function createChatCompletion(
  payload: ChatCompletionRequest,
): Promise<ChatCompletionResponse> {
  return request<ChatCompletionResponse>("/chat/completions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface StreamingHandlers<TChunk> {
  onChunk: (chunk: TChunk) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export function streamChatCompletion<TChunk = ChatCompletionChunk>(
  payload: ChatCompletionRequest,
  handlers: StreamingHandlers<TChunk>,
) {
  const controller = new AbortController();

  const run = async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/completions`, {
        method: "POST",
        body: JSON.stringify({ ...(payload as Record<string, unknown>), stream: true }),
        headers: jsonHeaders,
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming request failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode(new Uint8Array(), { stream: false });
          break;
        }
        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const frame = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf("\n\n");

          if (!frame.startsWith("data:")) continue;
          const payload = frame.replace(/^data:/, "").trim();
          if (payload === "[DONE]") {
            handlers.onDone?.();
            controller.abort();
            return;
          }
          try {
            const parsed = JSON.parse(payload) as TChunk;
            handlers.onChunk(parsed);
          } catch (error) {
            console.error("Failed to parse SSE frame", error);
          }
        }
      }
      if (buffer.trim()) {
        const frame = buffer.trim();
        if (frame.startsWith("data:")) {
          const payload = frame.replace(/^data:/, "").trim();
          if (payload !== "[DONE]") {
            try {
              const parsed = JSON.parse(payload) as TChunk;
              handlers.onChunk(parsed);
            } catch (error) {
              console.error("Failed to parse trailing SSE frame", error);
            }
          }
        }
      }
      handlers.onDone?.();
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      handlers.onError?.(error as Error);
    }
  };

  run();

  return () => controller.abort();
}
