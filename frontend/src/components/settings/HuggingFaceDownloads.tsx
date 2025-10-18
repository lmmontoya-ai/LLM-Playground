import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useModelManagerStore } from "@/store/model-store";
import type { ModelDownloadJob } from "@/lib/types";
import {
  DownloadCloudIcon,
  Loader2Icon,
  RefreshCwIcon,
  XCircleIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
} from "lucide-react";

function formatBytes(value: number | undefined | null): string {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let current = value;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  return `${current.toFixed(current >= 10 ? 0 : 1)} ${units[index]}`;
}

function statusBadge(job: ModelDownloadJob) {
  switch (job.status) {
    case "queued":
      return { label: "Queued", className: "bg-muted text-muted-foreground" };
    case "running":
      return { label: "Downloading", className: "bg-blue-500/15 text-blue-400" };
    case "completed":
      return { label: "Ready", className: "bg-emerald-500/15 text-emerald-400" };
    case "failed":
      return { label: "Failed", className: "bg-red-500/15 text-red-400" };
    case "cancelled":
      return { label: "Cancelled", className: "bg-muted text-muted-foreground" };
    default:
      return { label: job.status, className: "bg-muted text-muted-foreground" };
  }
}

export function HuggingFaceDownloadsPanel() {
  const downloads = useModelManagerStore((state) => state.downloads);
  const isFetching = useModelManagerStore((state) => state.isFetching);
  const fetchDownloads = useModelManagerStore((state) => state.fetchDownloads);
  const cancelDownload = useModelManagerStore((state) => state.cancelDownload);

  useEffect(() => {
    void fetchDownloads();
    const interval = window.setInterval(() => {
      void fetchDownloads();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [fetchDownloads]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <DownloadCloudIcon className="h-4 w-4" /> Downloads
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => void fetchDownloads()}
          title="Refresh downloads"
        >
          {isFetching ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <RefreshCwIcon className="h-4 w-4" />}
        </Button>
      </div>

      {downloads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          Start a HuggingFace download to populate this list. Models load automatically once finished.
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((job) => {
            const badge = statusBadge(job);
            const progressPercentage = Math.round(job.progress * 100);
            const showCancel = job.status === "running" || job.status === "queued";
            return (
              <div key={job.id} className="rounded-lg border border-border/60 bg-background/80 p-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-foreground">{job.model_id}</p>
                    {job.revision ? (
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Revision · {job.revision}</p>
                    ) : null}
                  </div>
                  <Badge className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase", badge.className)}>
                    {badge.label}
                  </Badge>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        job.status === "completed"
                          ? "bg-emerald-500"
                          : job.status === "failed"
                            ? "bg-red-500"
                            : "bg-primary",
                      )}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span>{progressPercentage}%</span>
                    <span>
                      {formatBytes(job.downloaded_bytes)}
                      {job.total_bytes ? ` / ${formatBytes(job.total_bytes)}` : ""}
                    </span>
                    <span>{job.auto_load ? "Auto-load enabled" : "Manual load"}</span>
                  </div>
                  {job.message ? (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      {job.status === "failed" ? (
                        <AlertTriangleIcon className="h-3.5 w-3.5 text-red-400" />
                      ) : job.status === "completed" ? (
                        <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-400" />
                      ) : null}
                      <span className="line-clamp-2">{job.message}</span>
                    </div>
                  ) : null}
                </div>

                {showCancel ? (
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => void cancelDownload(job.id)}
                    >
                      <XCircleIcon className="mr-2 h-3.5 w-3.5" /> Cancel
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
