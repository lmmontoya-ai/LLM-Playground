import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useModelManagerStore } from "@/store/model-store";
import type { ModelDownloadJob } from "@/lib/types";
import { DownloadCloudIcon, XIcon } from "lucide-react";

interface ModelDownloadModalProps {
  open: boolean;
  onClose: () => void;
  defaultToken?: string;
  onSubmitted?: (job: ModelDownloadJob) => void;
}

export function ModelDownloadModal({ open, onClose, defaultToken, onSubmitted }: ModelDownloadModalProps) {
  const startDownload = useModelManagerStore((state) => state.startDownload);
  const fetchDownloads = useModelManagerStore((state) => state.fetchDownloads);
  const modelRef = useRef<HTMLInputElement | null>(null);

  const [modelId, setModelId] = useState("");
  const [revision, setRevision] = useState("");
  const [token, setToken] = useState(defaultToken ?? "");
  const [autoLoad, setAutoLoad] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setModelId("");
    setRevision("");
    setToken(defaultToken ?? "");
    setAutoLoad(true);
    setError(null);
    setIsSubmitting(false);
  }, [open, defaultToken]);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => modelRef.current?.focus(), 50);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modelId.trim()) {
      setError("Enter a model identifier, e.g. meta-llama/Llama-3-8b-Instruct.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const job = await startDownload({
        model_id: modelId.trim(),
        revision: revision.trim() || undefined,
        token: token.trim() ? token.trim() : undefined,
        auto_load: autoLoad,
      });
      onSubmitted?.(job);
      await fetchDownloads();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="presentation">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-xl rounded-3xl border border-border/70 bg-background/95 p-8 shadow-2xl backdrop-blur"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <DownloadCloudIcon className="h-4 w-4" /> Download HuggingFace model
              </div>
              <p className="text-xs text-muted-foreground">
                Fetch weights directly into your local cache. Downloads auto-load by default.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Model identifier
              </label>
              <Input
                ref={modelRef}
                placeholder="meta-llama/Llama-3-8b-Instruct"
                value={modelId}
                onChange={(event) => setModelId(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Revision (optional)
                </label>
                <Input
                  placeholder="main"
                  value={revision}
                  onChange={(event) => setRevision(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Auto load after download</span>
                  <Switch checked={autoLoad} onCheckedChange={setAutoLoad} />
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, the model loads into memory once files finish downloading.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                HuggingFace token (optional)
              </label>
              <Input
                type="password"
                placeholder="hf_xxx"
                value={token}
                onChange={(event) => setToken(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Required for gated models. Leave blank to use the server&rsquo;s configured token.
              </p>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-400/50 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Starting…" : "Start download"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body,
  );
}
