import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed top-6 right-6 z-50 min-w-[220px] rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-lg",
        "animate-in fade-in slide-in-from-top-2"
      )}
    >
      {message}
    </div>
  );
}
