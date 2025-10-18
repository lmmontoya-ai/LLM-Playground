import { useCallback, useMemo, useRef, useState } from "react";
import type { ConnectionStatus } from "@/components/model-selector/types";
import { useChatStore } from "@/store/chat-store";
import type { UseChatInterfaceParams, UseChatInterfaceReturn } from "./types";
import { buildTranscript, formatWorkspaceLabel } from "./utils";

export function useChatInterface({
  messages,
  isStreaming,
  onStop,
  provider,
  providerLabel,
  selectedModel,
}: UseChatInterfaceParams): UseChatInterfaceReturn {
  const resetConversation = useChatStore((state) => state.reset);
  const apiKeyConfigured = useChatStore((state) => state.apiKeyConfigured);
  const apiKeySource = useChatStore((state) => state.apiKeySource);

  const sessionCountRef = useRef(1);
  const [sessionName, setSessionName] = useState(() => `Session ${sessionCountRef.current}`);
  const [copied, setCopied] = useState(false);

  const hasMessages = messages.length > 0;
  const activeModelLabel = selectedModel ?? "No model selected";

  const workspaceLabel = useMemo(
    () => formatWorkspaceLabel(provider?.name, providerLabel),
    [provider?.name, providerLabel],
  );

  const connectionStatus = useMemo<ConnectionStatus>(() => {
    if (provider?.id === "openrouter") {
      if (apiKeyConfigured && apiKeySource !== "none") {
        return "connected";
      }
      if (provider && !apiKeyConfigured) {
        return "api-key-missing";
      }
    }
    if (provider?.id === "huggingface") {
      return "connected";
    }
    return "disconnected";
  }, [provider, apiKeyConfigured, apiKeySource]);

  const transcript = useMemo(
    () => buildTranscript(sessionName, activeModelLabel, workspaceLabel, messages),
    [sessionName, activeModelLabel, workspaceLabel, messages],
  );

  const showLoadedToggle = provider?.id === "huggingface";

  const handleReset = useCallback(() => {
    if (!hasMessages) {
      return;
    }

    if (typeof window !== "undefined") {
      const shouldReset = window.confirm("Reset conversation? This will clear the current thread.");
      if (!shouldReset) {
        return;
      }
    }

    if (isStreaming && onStop) {
      onStop();
    }

    resetConversation();
    sessionCountRef.current += 1;
    setSessionName(`Session ${sessionCountRef.current}`);
    setCopied(false);
  }, [hasMessages, isStreaming, onStop, resetConversation]);

  const handleExport = useCallback(async () => {
    if (!transcript) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      console.error("Clipboard API not available in this environment.");
      return;
    }

    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (error) {
      console.error("Failed to copy transcript", error);
    }
  }, [transcript]);

  return {
    connectionStatus,
    copied,
    handleExport,
    handleReset,
    showLoadedToggle,
    hasMessages,
  };
}
