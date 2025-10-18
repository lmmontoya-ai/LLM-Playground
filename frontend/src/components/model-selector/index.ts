/**
 * Model Selector Module
 * Exports all components, hooks, types, and utilities
 */

// Main components
export { ModelSelector } from "./ModelSelector";
export { ModelDetailsCard } from "./ModelDetailsCard";

// Sub-components (for advanced usage)
export { ModelSelectorTrigger } from "./ModelSelectorTrigger";
export { ModelDropdown } from "./ModelDropdown";
export { ModelListItem } from "./ModelListItem";
export { ModelSearchBar } from "./ModelSearchBar";
export { ModelFilterToggle } from "./ModelFilterToggle";

// Hooks
export { useModelSelector, useModelSearch } from "./hooks";

// Utilities
export * from "./utils";

// Types
export type {
  ModelSelectorProps,
  ModelSelectorVariant,
  ModelSelectorAlign,
  ModelDetailsCardProps,
  ModelSelectorTriggerProps,
  ModelDropdownProps,
  ModelListItemProps,
  ModelSearchBarProps,
  ModelFilterToggleProps,
  UseModelSelectorReturn,
  SearchMatch,
  ConnectionStatus,
} from "./types";
