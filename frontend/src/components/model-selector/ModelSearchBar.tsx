/**
 * ModelSearchBar component
 * Provides search input for filtering models
 *
 * Redesigned for modern simplicity:
 * - Minimal borders
 * - Cleaner focus states
 * - Subtle icon styling
 */

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ModelSearchBarProps } from "./types";

export function ModelSearchBar({
  query,
  onQueryChange,
  placeholder,
  autoFocus = false,
  inputRef,
}: ModelSearchBarProps) {
  return (
    <div className="relative flex-1">
      <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="h-8 w-full rounded-md border-0 bg-muted/30 pl-8 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
        aria-label="Search models"
      />
    </div>
  );
}
