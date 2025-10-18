/**
 * ModelListItem component
 * Individual model item in the dropdown list
 *
 * Redesigned for modern simplicity:
 * - Minimal badges and indicators
 * - Cleaner typography
 * - Subtle hover states
 * - Reduced visual clutter
 */

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelListItemProps } from "./types";
import { getModelDisplayLabel, highlightMatches } from "./utils";

export function ModelListItem({ model, isSelected, searchQuery, onClick }: ModelListItemProps) {
  const displayName = getModelDisplayLabel(model);
  const modelName = (model as typeof model & { name?: string }).name;
  const hasName = Boolean(modelName);

  return (
    <button
      type="button"
      onClick={() => onClick(model.id)}
      className={cn(
        "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
        "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary/30",
        isSelected && "bg-muted/30",
      )}
      aria-selected={isSelected}
      role="option"
    >
      <div className="flex-1 space-y-1">
        {/* Model name or ID */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-sm font-medium",
              isSelected ? "text-foreground" : "text-foreground/90",
            )}
          >
            {highlightMatches(displayName, searchQuery)}
          </span>
          {model.loaded && (
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" aria-label="Loaded" />
          )}
        </div>

        {/* Model ID (if name exists and is different) */}
        {hasName && modelName !== model.id && (
          <p className="truncate text-xs text-muted-foreground/60 font-mono">
            {highlightMatches(model.id, searchQuery)}
          </p>
        )}

        {/* Description */}
        {model.description && (
          <p className="line-clamp-1 text-xs text-muted-foreground/70">
            {highlightMatches(model.description, searchQuery)}
          </p>
        )}

        {/* Tags - minimal */}
        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {model.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60 bg-muted/40"
              >
                {tag}
              </span>
            ))}
            {model.tags.length > 3 && (
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/50">
                +{model.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Selection indicator - minimal */}
      {isSelected && (
        <CheckIcon
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
