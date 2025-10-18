/**
 * Utility functions for model selector
 * Pure functions for filtering, searching, and text manipulation
 */

import { createElement, Fragment, type ReactNode } from "react";
import type { ModelInfo } from "@/lib/types";
import type { SearchMatch } from "./types";

/**
 * Filters models based on loaded state
 */
export function filterModelsByLoadedState(
  models: ModelInfo[],
  showLoadedOnly: boolean,
): ModelInfo[] {
  if (!showLoadedOnly) return models;
  return models.filter((model) => Boolean(model.loaded));
}

/**
 * Computes a search match score for a model against search tokens
 * Lower score = better match. Infinity = no match.
 *
 * Scoring priority:
 * 1. Direct substring match in concatenated text (lowest score)
 * 2. Sanitized match (alphanumeric only)
 * 3. Fragment match (word boundary match)
 */
export function computeModelMatchScore(model: ModelInfo, tokens: string[]): number {
  if (!tokens.length) return 0;

  // Note: model may have a 'name' property not in the type definition
  const modelName = (model as ModelInfo & { name?: string }).name ?? "";
  const haystack = `${model.id} ${modelName} ${model.description ?? ""}`.toLowerCase();
  const sanitizedHaystack = sanitizeText(haystack);
  let totalScore = 0;

  for (const rawToken of tokens) {
    const token = rawToken.toLowerCase();
    const sanitizedToken = sanitizeText(token);
    let tokenScore = Infinity;

    // Check for direct substring match
    const directIndex = haystack.indexOf(token);
    if (directIndex !== -1) {
      tokenScore = Math.min(tokenScore, directIndex);
    }

    // Check for sanitized match
    const sanitizedIndex = sanitizedHaystack.indexOf(sanitizedToken);
    if (sanitizedIndex !== -1) {
      tokenScore = Math.min(tokenScore, sanitizedIndex + 25);
    }

    // Check for fragment match (word boundary)
    if (token.length >= 2) {
      const fragments = haystack.split(/[^a-z0-9]+/);
      for (const fragment of fragments) {
        if (!fragment) continue;
        const fragmentIndex = fragment.indexOf(token);
        if (fragmentIndex !== -1) {
          tokenScore = Math.min(tokenScore, fragmentIndex + 50);
          break;
        }
      }
    }

    // If no match found for this token, the entire model doesn't match
    if (tokenScore === Infinity) {
      return Infinity;
    }

    totalScore += tokenScore;
  }

  return totalScore;
}

/**
 * Filters and sorts models based on search query
 */
export function searchModels(models: ModelInfo[], query: string): ModelInfo[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return models;
  }

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  const scored: SearchMatch[] = models
    .map((model) => ({
      model,
      score: computeModelMatchScore(model, tokens),
    }))
    .filter((entry) => entry.score !== Infinity)
    .sort((a, b) => a.score - b.score);

  return scored.map((entry) => entry.model);
}

/**
 * Removes non-alphanumeric characters from text
 */
export function sanitizeText(text: string): string {
  return text.replace(/[^a-z0-9]/gi, "");
}

/**
 * Escapes special regex characters in a string
 */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Highlights matching text fragments in a string
 * Returns React nodes with <mark> elements for matches
 */
export function highlightMatches(text: string, searchQuery: string): ReactNode {
  if (!searchQuery) return text;

  const tokens = searchQuery.split(/\s+/).filter(Boolean);
  if (!tokens.length) return text;

  const escapedTokens = tokens.map(escapeRegExp);
  const regex = new RegExp(`(${escapedTokens.join("|")})`, "gi");
  const parts = text.split(regex);

  return createElement(
    Fragment,
    null,
    parts.map((part, index) =>
      index % 2 === 1
        ? createElement(
            "mark",
            {
              key: `${part}-${index}`,
              className: "rounded-sm bg-primary/20 px-0.5 text-primary",
            },
            part,
          )
        : createElement("span", { key: `${part}-${index}` }, part),
    ),
  );
}

/**
 * Ensures the selected model is present in the filtered list
 * If not found, prepends it to the list
 */
export function ensureSelectedModelPresent(
  filteredModels: ModelInfo[],
  selectedModelId: string | undefined,
  allModels: ModelInfo[],
): ModelInfo[] {
  if (!selectedModelId) {
    return deduplicateModels(filteredModels);
  }

  const hasSelected = filteredModels.some((model) => model.id === selectedModelId);
  if (hasSelected) {
    return deduplicateModels(filteredModels);
  }

  const selectedModel = allModels.find((model) => model.id === selectedModelId);
  if (!selectedModel) {
    return deduplicateModels(filteredModels);
  }

  return deduplicateModels([selectedModel, ...filteredModels]);
}

/**
 * Removes duplicate models by ID
 */
export function deduplicateModels(models: ModelInfo[]): ModelInfo[] {
  const seen = new Set<string>();
  const unique: ModelInfo[] = [];

  for (const model of models) {
    if (seen.has(model.id)) continue;
    seen.add(model.id);
    unique.push(model);
  }

  return unique;
}

/**
 * Counts models that are loaded
 */
export function countLoadedModels(models: ModelInfo[]): number {
  return models.filter((model) => model.loaded).length;
}

/**
 * Gets display label for a model (name or id)
 */
export function getModelDisplayLabel(model: ModelInfo | null | undefined): string {
  if (!model) return "";
  // Note: model may have a 'name' property not in the type definition
  const modelName = (model as ModelInfo & { name?: string }).name;
  return modelName ?? model.id;
}

/**
 * Gets display label for a provider
 */
export function getProviderDisplayLabel(
  provider: { name?: string; id: string } | null | undefined,
): string {
  if (!provider) return "Provider";
  return provider.name ?? provider.id;
}

/**
 * Formats model count text
 */
export function formatModelCount(count: number, singular: string = "model", plural?: string): string {
  const pluralForm = plural ?? `${singular}s`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
