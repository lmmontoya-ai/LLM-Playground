import { CloudIcon, CpuIcon } from "lucide-react";
import type { ApiKeySource } from "@/lib/types";
import type { NavigationNavItem, Section } from "./types";

export const NAV_ITEMS: NavigationNavItem[] = [
  {
    id: "openrouter",
    title: "Online",
    description: "OpenRouter API",
    icon: CloudIcon,
  },
  {
    id: "huggingface",
    title: "Local",
    description: "HuggingFace runtime",
    icon: CpuIcon,
  },
];

export const SECTION_TITLES: Record<Section, { title: string; subtitle: string }> = {
  openrouter: {
    title: "Online models",
    subtitle: "Configure OpenRouter access and sampling.",
  },
  huggingface: {
    title: "Local models",
    subtitle: "Manage cached HuggingFace pipelines.",
  },
};

export function getApiKeyStatusMeta(source: ApiKeySource): {
  label: string;
  color: string;
  isRuntimeKey: boolean;
} {
  switch (source) {
    case "runtime":
      return {
        label: "Runtime key",
        color: "text-emerald-500",
        isRuntimeKey: true,
      };
    case "env":
      return {
        label: "Environment key",
        color: "text-sky-500",
        isRuntimeKey: false,
      };
    default:
      return {
        label: "Not configured",
        color: "text-muted-foreground",
        isRuntimeKey: false,
      };
  }
}
