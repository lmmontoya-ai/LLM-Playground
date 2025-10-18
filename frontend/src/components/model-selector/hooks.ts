/**
 * Custom hooks for model selector business logic
 * Separates state management and filtering logic from UI components
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ModelInfo } from "@/lib/types";
import type { UseModelSelectorReturn } from "./types";
import {
  countLoadedModels,
  ensureSelectedModelPresent,
  filterModelsByLoadedState,
  searchModels,
} from "./utils";

/**
 * Main hook for managing model selector state
 * Handles dropdown visibility, search, filtering, model selection, and keyboard navigation
 */
export function useModelSelector(
  models: ModelInfo[],
  selectedModelId: string | undefined,
  onModelChange: (modelId: string) => void,
): UseModelSelectorReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoadedOnly, setShowLoadedOnly] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute derived values
  const loadedCount = useMemo(() => countLoadedModels(models), [models]);
  const hasLoadedModels = loadedCount > 0;

  const selectedModelMeta = useMemo(() => {
    if (!selectedModelId) return null;
    return models.find((model) => model.id === selectedModelId) ?? null;
  }, [models, selectedModelId]);

  // Filter and search models
  const filteredModels = useMemo(() => {
    // First filter by loaded state if needed
    let result = filterModelsByLoadedState(models, showLoadedOnly);

    // Then apply search
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery) {
      result = searchModels(result, normalizedQuery);
    }

    // Ensure selected model is always visible
    result = ensureSelectedModelPresent(result, selectedModelId, models);

    return result;
  }, [models, searchQuery, showLoadedOnly, selectedModelId]);

  // Reset focused index when filtered models change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredModels]);

  // Handle model selection
  const handleModelSelect = useCallback(
    (modelId: string) => {
      onModelChange(modelId);
      setIsOpen(false);
      setSearchQuery("");
      setFocusedIndex(-1);
    },
    [onModelChange],
  );

  // Dropdown controls
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
    setFocusedIndex(-1);
  }, []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Toggle loaded filter
  const toggleLoadedFilter = useCallback(() => {
    setShowLoadedOnly((prev) => !prev);
  }, []);

  // Handle keyboard navigation in dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape to close
      if (event.key === "Escape") {
        close();
        return;
      }

      // Don't handle other keys if search input is focused
      if (document.activeElement === searchInputRef.current) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          // Start keyboard navigation from search
          if (filteredModels.length > 0) {
            setFocusedIndex(0);
          }
        }
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredModels.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          if (focusedIndex === 0) {
            // Return focus to search
            searchInputRef.current?.focus();
          }
          break;
        case "Enter":
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredModels.length) {
            handleModelSelect(filteredModels[focusedIndex].id);
          }
          break;
        case "Home":
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          event.preventDefault();
          setFocusedIndex(filteredModels.length - 1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, filteredModels, focusedIndex, handleModelSelect, close]);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, close]);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      // Use setTimeout to ensure focus happens after render
      const timeout = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
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
  };
}

/**
 * Hook for managing search input with debouncing (if needed in future)
 * Currently passes through immediately, but provides extensibility
 */
export function useModelSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    setQuery: handleQueryChange,
    clearQuery,
  };
}
