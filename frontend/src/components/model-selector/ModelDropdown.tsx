/**
 * ModelDropdown component
 * Dropdown content for model selector with search and filtering
 *
 * Redesigned for modern simplicity:
 * - Minimal borders and dividers
 * - Cleaner spacing and white space
 * - Subtle shadows for depth
 * - Reduced visual weight
 */

import { cn } from "@/lib/utils";
import type { ModelDropdownProps } from "./types";
import { ModelSearchBar } from "./ModelSearchBar";
import { ModelFilterToggle } from "./ModelFilterToggle";
import { ModelListItem } from "./ModelListItem";
import { getProviderDisplayLabel, formatModelCount } from "./utils";

export function ModelDropdown({
  isOpen,
  models,
  selectedModelId,
  searchQuery,
  onSearchChange,
  provider,
  totalModels,
  loadedCount,
  showLoadedToggle,
  loadedFilterActive,
  onLoadedFilterToggle,
  onModelSelect,
  align,
  searchInputRef,
}: ModelDropdownProps) {
  if (!isOpen) return null;

  const providerLabel = getProviderDisplayLabel(provider);
  const alignmentClass = align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";

  const matchCount = formatModelCount(models.length, "match", "matches");
  const totalCount = loadedFilterActive
    ? `${loadedCount} loaded`
    : formatModelCount(totalModels, "model");

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 w-[min(100vw-2rem,480px)] overflow-hidden rounded-lg",
        "border border-border/40 bg-background shadow-lg",
        alignmentClass,
      )}
      role="listbox"
      aria-label="Model selector"
    >
      {/* Header with search and filter */}
      <div className="border-b border-border/30 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <ModelSearchBar
            query={searchQuery}
            onQueryChange={onSearchChange}
            placeholder={`Search models...`}
            inputRef={searchInputRef}
          />
          <ModelFilterToggle
            active={loadedFilterActive}
            onToggle={onLoadedFilterToggle}
            visible={showLoadedToggle && loadedCount > 0}
          />
        </div>

        {/* Results summary - minimal */}
        <p className="mt-2 text-[11px] text-muted-foreground/60">
          {matchCount} · {totalCount}
        </p>
      </div>

      {/* Model list */}
      <div className="max-h-80 overflow-y-auto">
        {models.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-muted-foreground/70">No models match your search</p>
            <p className="mt-1 text-xs text-muted-foreground/50">Try a different keyword</p>
          </div>
        ) : (
          <div className="py-1">
            {models.map((model) => (
              <ModelListItem
                key={model.id}
                model={model}
                isSelected={model.id === selectedModelId}
                searchQuery={searchQuery}
                onClick={onModelSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
