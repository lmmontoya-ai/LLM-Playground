/**
 * ModelFilterToggle component
 * Toggle button for filtering loaded models only
 *
 * Redesigned for modern simplicity:
 * - Minimal styling
 * - Subtle backgrounds
 * - Cleaner iconography
 */

import { CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ModelFilterToggleProps } from "./types";

export function ModelFilterToggle({ active, onToggle, visible }: ModelFilterToggleProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30",
        active
          ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15"
          : "bg-muted/30 text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground/80",
      )}
      aria-pressed={active}
      aria-label={active ? "Show all models" : "Show only loaded models"}
    >
      <CheckCircle2Icon className="h-3.5 w-3.5" />
      <span>Loaded</span>
    </button>
  );
}
