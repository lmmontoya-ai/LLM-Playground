/**
 * Type definitions for the Model Selector system
 * Centralizes all interfaces for better type safety and maintainability
 */

import type { ModelInfo, ProviderInfo } from "@/lib/types";

/**
 * Display variant for the model selector
 * - default: Traditional dropdown with label
 * - inline: Compact horizontal layout with icon
 */
export type ModelSelectorVariant = "default" | "inline";

/**
 * Alignment options for the dropdown
 */
export type ModelSelectorAlign = "center" | "start";

/**
 * Connection status for the provider
 */
export type ConnectionStatus = "connected" | "api-key-missing" | "disconnected";

/**
 * Props for the main ModelSelector component
 */
export interface ModelSelectorProps {
  /** Available models to select from */
  models: ModelInfo[];
  /** Currently selected model ID */
  selectedModel?: string;
  /** Callback when model selection changes */
  onModelChange: (modelId: string) => void;
  /** Provider metadata for display */
  provider?: ProviderInfo | null;
  /** Total number of models available (may differ from models.length due to filtering) */
  totalModels?: number;
  /** Show toggle for filtering loaded models only */
  showLoadedToggle?: boolean;
  /** Dropdown alignment */
  align?: ModelSelectorAlign;
  /** Visual variant */
  variant?: ModelSelectorVariant;
  /** Custom class name */
  className?: string;
  /** Connection status for dynamic indicator */
  connectionStatus?: ConnectionStatus;
}

/**
 * Props for ModelSelectorTrigger (the button that opens dropdown)
 */
export interface ModelSelectorTriggerProps {
  /** Is dropdown open */
  isOpen: boolean;
  /** Currently selected model */
  selectedModel?: ModelInfo | null;
  /** Provider info */
  provider?: ProviderInfo | null;
  /** Total models count */
  totalModels: number;
  /** Loaded models count */
  loadedCount: number;
  /** Is showing only loaded models */
  showingLoadedOnly: boolean;
  /** Models available */
  hasModels: boolean;
  /** Visual variant */
  variant: ModelSelectorVariant;
  /** Alignment */
  align: ModelSelectorAlign;
  /** Click handler */
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Connection status for dynamic indicator */
  connectionStatus?: ConnectionStatus;
}

/**
 * Props for the ModelSearchBar component
 */
export interface ModelSearchBarProps {
  /** Current search query */
  query: string;
  /** Search query change handler */
  onQueryChange: (query: string) => void;
  /** Placeholder text */
  placeholder: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Input ref for external focus control */
  inputRef?: React.RefObject<HTMLInputElement>;
}

/**
 * Props for the ModelFilterToggle component
 */
export interface ModelFilterToggleProps {
  /** Is filter active (showing only loaded) */
  active: boolean;
  /** Toggle handler */
  onToggle: () => void;
  /** Should show toggle at all */
  visible: boolean;
}

/**
 * Props for individual ModelListItem
 */
export interface ModelListItemProps {
  /** Model data */
  model: ModelInfo;
  /** Is this model selected */
  isSelected: boolean;
  /** Search query for highlighting */
  searchQuery: string;
  /** Click handler */
  onClick: (modelId: string) => void;
}

/**
 * Props for ModelDropdown (the popup content)
 */
export interface ModelDropdownProps {
  /** Is dropdown visible */
  isOpen: boolean;
  /** Filtered models to display */
  models: ModelInfo[];
  /** Selected model ID */
  selectedModelId?: string;
  /** Search query */
  searchQuery: string;
  /** Search change handler */
  onSearchChange: (query: string) => void;
  /** Provider info */
  provider?: ProviderInfo | null;
  /** Total models count */
  totalModels: number;
  /** Loaded models count */
  loadedCount: number;
  /** Show loaded filter toggle */
  showLoadedToggle: boolean;
  /** Is loaded filter active */
  loadedFilterActive: boolean;
  /** Toggle loaded filter */
  onLoadedFilterToggle: () => void;
  /** Model selection handler */
  onModelSelect: (modelId: string) => void;
  /** Dropdown alignment */
  align: ModelSelectorAlign;
  /** Search input ref */
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

/**
 * Props for ModelDetailsCard component
 */
export interface ModelDetailsCardProps {
  /** Model to display details for */
  model?: ModelInfo | null;
  /** Provider metadata */
  provider?: ProviderInfo | null;
  /** Total models available */
  totalModels?: number;
  /** Custom class name */
  className?: string;
}

/**
 * Search match score result
 */
export interface SearchMatch {
  /** The model */
  model: ModelInfo;
  /** Match score (lower is better, Infinity = no match) */
  score: number;
}

/**
 * Hook return type for useModelSelector
 */
export interface UseModelSelectorReturn {
  /** Is dropdown open */
  isOpen: boolean;
  /** Open dropdown */
  open: () => void;
  /** Close dropdown */
  close: () => void;
  /** Toggle dropdown */
  toggle: () => void;
  /** Search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Show only loaded models */
  showLoadedOnly: boolean;
  /** Toggle loaded filter */
  toggleLoadedFilter: () => void;
  /** Filtered models based on search and filters */
  filteredModels: ModelInfo[];
  /** Selected model metadata */
  selectedModelMeta: ModelInfo | null;
  /** Loaded models count */
  loadedCount: number;
  /** Has any loaded models */
  hasLoadedModels: boolean;
  /** Container ref for click outside detection */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Search input ref */
  searchInputRef: React.RefObject<HTMLInputElement>;
  /** Handle model selection */
  handleModelSelect: (modelId: string) => void;
}
