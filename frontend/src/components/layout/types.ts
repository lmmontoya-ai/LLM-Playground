import type { RefObject, FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import type { ApiKeySource, ApiKeyStatus, ModelInfo, ProviderInfo } from "@/lib/types";

export type Section = "openrouter" | "huggingface";

export interface FeedbackState {
  type: "success" | "error";
  message: string;
}

export interface NavigationNavItem {
  id: Section;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface NavigationSidebarProps {
  active: Section;
  onSelect: (section: Section) => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  apiKey?: string;
  onApiKeyChange: (value: string) => void;
  apiKeySource: ApiKeySource;
  onApiKeyPersist: (value: string) => Promise<ApiKeyStatus>;
  onApiKeyClear: () => Promise<ApiKeyStatus>;
}

export interface NavigationSidebarViewProps {
  navItems: NavigationNavItem[];
  active: Section;
  onSelect: (section: Section) => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  onOpenSettings: () => void;
  statusLabel: string;
  statusColor: string;
}

export interface NavigationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey?: string;
  onApiKeyChange: (value: string) => void;
  feedback: FeedbackState | null;
  statusLabel: string;
  statusColor: string;
  isRuntimeKey: boolean;
  isSavingKey: boolean;
  isClearingKey: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRemoveKey: () => void;
}

export interface UseNavigationSidebarParams extends NavigationSidebarProps {}

export interface UseNavigationSidebarReturn {
  navItems: NavigationNavItem[];
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  feedback: FeedbackState | null;
  statusLabel: string;
  statusColor: string;
  isRuntimeKey: boolean;
  isSavingKey: boolean;
  isClearingKey: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  handleSaveApiKey: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleClearStoredApiKey: () => Promise<void>;
}

export interface DeveloperPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  section: Section;
  providers: ProviderInfo[];
  models: ModelInfo[];
  activeProvider?: string;
  selectedModel?: string;
  align?: "left" | "right";
}

export interface DeveloperPanelViewProps {
  isOpen: boolean;
  onToggle: () => void;
  isRightAligned: boolean;
  openIcon: LucideIcon;
  closeIcon: LucideIcon;
  title: string;
  subtitle: string;
  providerMeta: ProviderInfo | null;
  selectedModelMeta: ModelInfo | null;
  models: ModelInfo[];
  section: Section;
}

export interface UseDeveloperPanelReturn {
  isRightAligned: boolean;
  openIcon: LucideIcon;
  closeIcon: LucideIcon;
  title: string;
  subtitle: string;
  providerMeta: ProviderInfo | null;
  selectedModelMeta: ModelInfo | null;
}
