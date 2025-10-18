/**
 * ModelSelectorTrigger component
 * Button that opens the model selector dropdown
 * Supports two variants: default and inline
 *
 * Redesigned for modern simplicity:
 * - Minimal borders and backgrounds
 * - Subtle hover states
 * - Clean typography hierarchy
 * - Reduced visual noise
 * - Dynamic connection status indicator with tooltip
 */

import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelSelectorTriggerProps } from "./types";
import { getModelDisplayLabel } from "./utils";
import { Tooltip } from "@/components/ui/tooltip";

export function ModelSelectorTrigger({
  isOpen,
  selectedModel,
  provider,
  totalModels,
  loadedCount,
  showingLoadedOnly,
  hasModels,
  variant,
  align,
  onClick,
  disabled = false,
  connectionStatus = "disconnected",
}: ModelSelectorTriggerProps) {
  const displayLabel = getModelDisplayLabel(selectedModel);
  const fallbackLabel = hasModels ? displayLabel : "No models available";

  // Subtitle text
  const subtitle = hasModels
    ? showingLoadedOnly
      ? `${loadedCount}/${totalModels} loaded`
      : `${totalModels} ${totalModels === 1 ? "model" : "models"}`
    : "No models available yet";

  // Connection status styling and tooltip
  const statusConfig = {
    connected: {
      color: "bg-emerald-500",
      tooltip: "Connected with API key",
    },
    "api-key-missing": {
      color: "bg-amber-500",
      tooltip: "Connected but API key missing",
    },
    disconnected: {
      color: "bg-red-500/60",
      tooltip: "Not connected",
    },
  };

  const { color, tooltip } = statusConfig[connectionStatus];

  if (variant === "inline") {
    return (
      <Tooltip content={tooltip} side="top">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled || !hasModels}
          className={cn(
            "group relative flex min-w-[200px] items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all",
            "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30",
            disabled && "cursor-not-allowed opacity-50",
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {/* Status indicator */}
          <span
            className="flex items-center justify-center rounded-full border border-white/10 bg-foreground/5 p-1.5"
            aria-hidden="true"
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full transition-colors", color)}
            />
          </span>

          <span className="sr-only">{tooltip}</span>

          {/* Content */}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">{fallbackLabel}</span>
          </span>

          {/* Chevron */}
          <ChevronDownIcon
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </Tooltip>
    );
  }

  // Default variant - ultra minimal
  const alignmentClass = align === "center" ? "items-center" : "items-start";

  return (
    <div className={cn("flex flex-col gap-2", alignmentClass)}>
      <Tooltip content={tooltip} side="top" className="w-full">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled || !hasModels}
          className={cn(
            "group inline-flex items-center gap-2 rounded-md px-2 py-1 text-left transition-all",
            "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30",
            disabled && "cursor-not-allowed opacity-50",
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {/* Status indicator */}
          <span
            className="flex items-center justify-center rounded-full border border-white/10 bg-foreground/5 p-1.5"
            aria-hidden="true"
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full transition-colors", color)}
            />
          </span>

          <span className="sr-only">{tooltip}</span>

          {/* Label */}
          <span className="truncate text-sm font-medium text-foreground">{fallbackLabel}</span>

          {/* Chevron */}
          <ChevronDownIcon
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground/50 transition-transform",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </Tooltip>

      {/* Subtitle - minimal */}
      <p className="text-xs text-muted-foreground/70">{subtitle}</p>
    </div>
  );
}
