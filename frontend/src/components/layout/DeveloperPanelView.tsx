import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModelDetailsCard } from "@/components/model-selector";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { HuggingFaceDownloadsPanel } from "@/components/settings/HuggingFaceDownloads";
import { Separator } from "@/components/ui/separator";
import type { DeveloperPanelViewProps } from "./types";

export function DeveloperPanelView({
  isOpen,
  onToggle,
  isRightAligned,
  openIcon: OpenIcon,
  closeIcon: CloseIcon,
  title,
  subtitle,
  providerMeta,
  selectedModelMeta,
  models,
  section,
}: DeveloperPanelViewProps) {
  return (
    <aside
      className={cn(
        "relative flex h-full flex-col bg-background/75 backdrop-blur transition-all duration-300",
        isRightAligned ? "border-l border-border/70" : "border-r border-border/70",
        isOpen ? "w-80" : "w-14",
      )}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div
          className={cn("space-y-1 overflow-hidden transition-all", isOpen ? "w-full opacity-100" : "w-0 opacity-0")}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Developer options</p>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="shrink-0"
          title={isOpen ? "Collapse developer panel" : "Expand developer panel"}
        >
          {isOpen ? <CloseIcon className="h-5 w-5" /> : <OpenIcon className="h-5 w-5" />}
        </Button>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto px-4 pb-8 transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {section === "openrouter" ? (
          <div className="space-y-6">
            <ModelDetailsCard model={selectedModelMeta} provider={providerMeta} totalModels={models.length} />
            <div>
              <h3 className="text-sm font-semibold">Generation Settings</h3>
              <p className="text-xs text-muted-foreground">Fine-tune sampling for OpenRouter runs.</p>
              <div className="mt-4">
                <SettingsPanel />
              </div>
            </div>
          </div>
        ) : null}

        {section === "huggingface" ? (
          <div className="space-y-6">
            <ModelDetailsCard model={selectedModelMeta} provider={providerMeta} totalModels={models.length} />
            <HuggingFaceDownloadsPanel />
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
              Loaded models are cached on disk. Use the API or CLI to add new weights under
              <span className="ml-1 font-mono text-foreground">./models</span> and load them via the backend endpoint.
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold">Generation Settings</h3>
              <p className="text-xs text-muted-foreground">Applied to local HuggingFace generations.</p>
              <div className="mt-4">
                <SettingsPanel />
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 space-y-2 text-xs text-muted-foreground">
          <p>Hotkeys</p>
          <ul className="space-y-1">
            <li>
              <span className="font-semibold">Enter</span> · Send message
            </li>
            <li>
              <span className="font-semibold">Shift + Enter</span> · New line
            </li>
            <li>
              <span className="font-semibold">/</span> · Focus input
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
