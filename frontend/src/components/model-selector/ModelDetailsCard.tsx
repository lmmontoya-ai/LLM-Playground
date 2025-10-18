/**
 * ModelDetailsCard Component
 * Displays detailed information about a model
 *
 * This is a redesigned version with:
 * - Cleaner layout
 * - Better information hierarchy
 * - Improved expandable content
 * - Standalone usability
 */

import { useState, useEffect } from "react";
import { ChevronDownIcon, LayersIcon, CheckCircle2Icon, CircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ModelDetailsCardProps } from "./types";
import { getProviderDisplayLabel } from "./utils";

/**
 * ModelDetailsCard
 *
 * Shows comprehensive details about a selected model including:
 * - Model identifier
 * - Provider information
 * - Load status
 * - Description (expandable for long text)
 * - Tags
 *
 * @example
 * ```tsx
 * <ModelDetailsCard
 *   model={selectedModel}
 *   provider={provider}
 *   totalModels={models.length}
 * />
 * ```
 */
export function ModelDetailsCard({
  model,
  provider,
  totalModels = 0,
  className,
}: ModelDetailsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const providerLabel = getProviderDisplayLabel(provider);

  // Reset expansion state when model changes
  useEffect(() => {
    setIsExpanded(false);
    setShowFullDescription(false);
  }, [model?.id]);

  const handleToggleExpansion = () => {
    setIsExpanded((prev) => {
      const nextState = !prev;
      if (!nextState) {
        // Collapse description too when collapsing card
        setShowFullDescription(false);
      }
      return nextState;
    });
  };

  const hasLongDescription = model?.description && model.description.length > 160;

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/70 bg-muted/30 p-4",
        "text-xs text-muted-foreground",
        className,
      )}
    >
      {/* Header - always visible */}
      <button
        type="button"
        onClick={handleToggleExpansion}
        className={cn(
          "flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-foreground transition",
          "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Collapse model details" : "Expand model details"}
      >
        <span className="flex items-center gap-2">
          <LayersIcon className="h-4 w-4" />
          Model details
        </span>
        <ChevronDownIcon
          className={cn("h-4 w-4 transition-transform", isExpanded ? "rotate-180" : "")}
          aria-hidden="true"
        />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-3 space-y-3">
          {model ? (
            <>
              {/* Model ID */}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Identifier
                </p>
                <p className="mt-1 font-mono text-sm text-foreground">{model.id}</p>
              </div>

              {/* Provider and Status in grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Provider
                  </p>
                  <p className="mt-1 font-medium text-foreground">{providerLabel}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-medium text-foreground">
                    {model.loaded ? (
                      <>
                        <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-500" />
                        Ready
                      </>
                    ) : (
                      <>
                        <CircleIcon className="h-3 w-3 text-muted-foreground" />
                        Available
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Description */}
              {model.description && (
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Description
                  </p>
                  <p
                    className={cn(
                      "text-sm leading-relaxed text-foreground transition-all",
                      showFullDescription ? "" : "line-clamp-3",
                    )}
                  >
                    {model.description}
                  </p>
                  {hasLongDescription && (
                    <button
                      type="button"
                      onClick={() => setShowFullDescription((prev) => !prev)}
                      className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {showFullDescription ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              )}

              {/* Tags */}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Tags</p>
                {model.tags && model.tags.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {model.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={cn(
                          "rounded-md border-border/60 bg-background px-2 py-0.5",
                          "text-[11px] font-normal uppercase tracking-wide text-muted-foreground",
                        )}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">No tags provided.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Select a model above to inspect provider information, tags, and readiness state.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
