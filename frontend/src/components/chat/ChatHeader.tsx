import { DownloadIcon, HardDriveDownloadIcon, RefreshCcwIcon } from "lucide-react";
import { ModelSelector } from "@/components/model-selector";
import { StreamingIndicator } from "@/components/ui/streaming-indicator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatHeaderProps } from "./types";

export function ChatHeader({
  models,
  selectedModel,
  onModelChange,
  provider,
  connectionStatus,
  isStreaming,
  onDownloadModel,
  copied,
  onExport,
  onReset,
  showLoadedToggle,
  hasMessages,
}: ChatHeaderProps) {
  return (
    <div className="px-6 pb-4 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ModelSelector
            models={models}
            selectedModel={selectedModel ?? undefined}
            onModelChange={onModelChange}
            provider={provider ?? null}
            totalModels={models.length}
            showLoadedToggle={showLoadedToggle}
            align="start"
            variant="inline"
            connectionStatus={connectionStatus}
          />
          {onDownloadModel ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDownloadModel}
              className="h-9 w-9 rounded-full border border-border/60 bg-background/70 text-muted-foreground hover:text-foreground"
              title="Download model"
            >
              <HardDriveDownloadIcon className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isStreaming ? <StreamingIndicator /> : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void onExport();
            }}
            className={cn(
              "gap-2 rounded-full border-border/70 bg-background/70 px-4 text-xs font-medium shadow-sm hover:bg-background",
              copied ? "text-primary" : "",
            )}
            disabled={!hasMessages}
          >
            <DownloadIcon className="h-4 w-4" />
            {copied ? "Copied!" : "Export"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-2 rounded-full px-4 text-xs font-medium text-muted-foreground hover:text-destructive"
            disabled={!hasMessages}
          >
            <RefreshCcwIcon className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
