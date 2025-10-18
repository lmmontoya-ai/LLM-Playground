import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type DeveloperPanelProps,
  type FeedbackState,
  type UseDeveloperPanelReturn,
  type UseNavigationSidebarParams,
  type UseNavigationSidebarReturn,
} from "./types";
import { NAV_ITEMS, SECTION_TITLES, getApiKeyStatusMeta } from "./utils";
import {
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
} from "lucide-react";

export function useNavigationSidebar({
  apiKey,
  apiKeySource,
  onApiKeyPersist,
  onApiKeyClear,
}: UseNavigationSidebarParams): UseNavigationSidebarReturn {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isClearingKey, setIsClearingKey] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const statusMeta = useMemo(() => getApiKeyStatusMeta(apiKeySource), [apiKeySource]);
  const { label: statusLabel, color: statusColor, isRuntimeKey } = statusMeta;

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [isSettingsOpen]);

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [isSettingsOpen]);

  useEffect(() => {
    if (!isSettingsOpen) {
      setFeedback(null);
      setIsSavingKey(false);
      setIsClearingKey(false);
      return;
    }
    setFeedback((current) => {
      if (current) {
        return current;
      }
      if (apiKeySource === "runtime") {
        return { type: "success", message: "A runtime OpenRouter API key is stored on the backend." };
      }
      if (apiKeySource === "env") {
        return { type: "success", message: "Using an OpenRouter API key from environment variables." };
      }
      return null;
    });
  }, [apiKeySource, isSettingsOpen]);

  const handleSaveApiKey = useCallback<UseNavigationSidebarReturn["handleSaveApiKey"]>(
    async (event) => {
      event.preventDefault();
      setFeedback(null);
      const trimmed = apiKey?.trim() ?? "";
      if (!trimmed) {
        setFeedback({ type: "error", message: "Enter an OpenRouter API key before saving." });
        return;
      }
      setIsSavingKey(true);
      try {
        const status = await onApiKeyPersist(trimmed);
        setFeedback({
          type: "success",
          message:
            status.source === "runtime"
              ? "API key saved to the backend securely."
              : "Using environment-provided OpenRouter API key.",
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save API key.";
        setFeedback({ type: "error", message });
      } finally {
        setIsSavingKey(false);
      }
    },
    [apiKey, onApiKeyPersist],
  );

  const handleClearStoredApiKey = useCallback(async () => {
    setFeedback(null);
    setIsClearingKey(true);
    try {
      const status = await onApiKeyClear();
      setFeedback({
        type: "success",
        message:
          status.source === "env"
            ? "Runtime key removed. Environment variables still provide an OpenRouter key."
            : "Stored API key removed from the backend.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove API key.";
      setFeedback({ type: "error", message });
    } finally {
      setIsClearingKey(false);
    }
  }, [onApiKeyClear]);

  return {
    navItems: NAV_ITEMS,
    isSettingsOpen,
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
    feedback,
    statusLabel,
    statusColor,
    isRuntimeKey,
    isSavingKey,
    isClearingKey,
    inputRef,
    handleSaveApiKey,
    handleClearStoredApiKey,
  };
}

export function useDeveloperPanel({
  section,
  providers,
  models,
  activeProvider,
  selectedModel,
  align = "left",
}: DeveloperPanelProps): UseDeveloperPanelReturn {
  const isRightAligned = align === "right";
  const { title, subtitle } = SECTION_TITLES[section];
  const openIcon = isRightAligned ? PanelRightOpenIcon : PanelLeftOpenIcon;
  const closeIcon = isRightAligned ? PanelRightCloseIcon : PanelLeftCloseIcon;

  const providerMeta = useMemo(
    () => providers.find((item) => item.id === activeProvider) ?? null,
    [providers, activeProvider],
  );
  const selectedModelMeta = useMemo(
    () => models.find((item) => item.id === selectedModel) ?? null,
    [models, selectedModel],
  );

  return {
    isRightAligned,
    openIcon,
    closeIcon,
    title,
    subtitle,
    providerMeta,
    selectedModelMeta,
  };
}
