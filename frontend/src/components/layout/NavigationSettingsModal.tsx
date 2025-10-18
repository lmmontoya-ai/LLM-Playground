import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { KeyIcon, SettingsIcon, XIcon } from "lucide-react";
import type { NavigationSettingsModalProps } from "./types";

export function NavigationSettingsModal({
  isOpen,
  onClose,
  apiKey,
  onApiKeyChange,
  feedback,
  statusLabel,
  statusColor,
  isRuntimeKey,
  isSavingKey,
  isClearingKey,
  inputRef,
  onSubmit,
  onRemoveKey,
}: NavigationSettingsModalProps) {
  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="presentation">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md transform rounded-3xl border border-border/70 bg-background/95 p-8 shadow-2xl backdrop-blur"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <SettingsIcon className="h-4 w-4" /> Workspace settings
              </div>
              <p className="text-xs text-muted-foreground">Securely manage access tokens and global preferences.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          <form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <KeyIcon className="h-3.5 w-3.5" /> OpenRouter API Key
              </label>
              <Input
                ref={inputRef}
                type="password"
                value={apiKey ?? ""}
                placeholder="sk-..."
                autoComplete="off"
                onChange={(event) => onApiKeyChange(event.target.value)}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Stored securely on the backend; the UI forgets after reload.</span>
                <span className={cn("font-semibold uppercase tracking-wide", statusColor)}>{statusLabel}</span>
              </div>
            </div>
            {feedback ? (
              <div
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs",
                  feedback.type === "success"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                    : "border-destructive/40 bg-destructive/10 text-destructive",
                )}
              >
                {feedback.message}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Provide a new key to replace the stored credential.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!isRuntimeKey || isClearingKey}
                onClick={onRemoveKey}
                title={isRuntimeKey ? "Remove the runtime key" : "No runtime key is stored"}
              >
                {isClearingKey ? "Removing..." : "Remove stored key"}
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" disabled={isSavingKey}>
                {isSavingKey ? "Saving..." : "Save API key"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body,
  );
}
