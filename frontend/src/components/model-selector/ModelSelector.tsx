/**
 * ModelSelector Component
 * Main component that composes trigger and dropdown for model selection
 *
 * This is a complete redesign of the original ModelSelector with:
 * - Separation of concerns (UI vs business logic)
 * - Modular component architecture
 * - Better accessibility
 * - Cleaner code organization
 */

import { cn } from "@/lib/utils";
import type { ModelSelectorProps } from "./types";
import { useModelSelector } from "./hooks";
import { ModelSelectorTrigger } from "./ModelSelectorTrigger";
import { ModelDropdown } from "./ModelDropdown";

/**
 * ModelSelector
 *
 * A dropdown component for selecting models with search and filter capabilities.
 *
 * Features:
 * - Search models by name, ID, or description
 * - Filter to show only loaded models
 * - Two visual variants: default and inline
 * - Fully accessible with keyboard navigation
 * - Responsive design
 *
 * @example
 * ```tsx
 * <ModelSelector
 *   models={models}
 *   selectedModel={selectedModelId}
 *   onModelChange={(id) => setSelectedModelId(id)}
 *   provider={provider}
 *   variant="inline"
 * />
 * ```
 */
export function ModelSelector({
  models,
  selectedModel,
  onModelChange,
  provider,
  totalModels,
  showLoadedToggle = true,
  align = "center",
  variant = "default",
  className,
  connectionStatus = "disconnected",
}: ModelSelectorProps) {
  const {
    isOpen,
    toggle,
    searchQuery,
    setSearchQuery,
    showLoadedOnly,
    toggleLoadedFilter,
    filteredModels,
    selectedModelMeta,
    loadedCount,
    hasLoadedModels,
    containerRef,
    searchInputRef,
    handleModelSelect,
  } = useModelSelector(models, selectedModel, onModelChange);

  const totalCount = totalModels ?? models.length;
  const hasModels = models.length > 0;

  const containerWidthClass =
    variant === "inline"
      ? "w-auto"
      : align === "center"
        ? "w-full mx-auto max-w-2xl"
        : "w-full sm:w-auto";

  return (
    <div ref={containerRef} className={cn("relative", containerWidthClass, className)}>
      <ModelSelectorTrigger
        isOpen={isOpen}
        selectedModel={selectedModelMeta}
        provider={provider}
        totalModels={totalCount}
        loadedCount={loadedCount}
        showingLoadedOnly={showLoadedOnly}
        hasModels={hasModels}
        variant={variant}
        align={align}
        onClick={toggle}
        disabled={!hasModels}
        connectionStatus={connectionStatus}
      />

      <ModelDropdown
        isOpen={isOpen}
        models={filteredModels}
        selectedModelId={selectedModel}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        provider={provider}
        totalModels={totalCount}
        loadedCount={loadedCount}
        showLoadedToggle={showLoadedToggle && hasLoadedModels}
        loadedFilterActive={showLoadedOnly}
        onLoadedFilterToggle={toggleLoadedFilter}
        onModelSelect={handleModelSelect}
        align={align}
        searchInputRef={searchInputRef}
      />
    </div>
  );
}

// Re-export types for convenience
export type { ModelSelectorProps, ModelSelectorVariant, ModelSelectorAlign } from "./types";
