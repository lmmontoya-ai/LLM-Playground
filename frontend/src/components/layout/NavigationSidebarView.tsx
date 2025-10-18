import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KeyIcon, SettingsIcon, SunIcon, MoonIcon } from "lucide-react";
import type { NavigationSidebarViewProps } from "./types";

export function NavigationSidebarView({
  navItems,
  active,
  onSelect,
  theme,
  onThemeToggle,
  onOpenSettings,
  statusLabel,
  statusColor,
}: NavigationSidebarViewProps) {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-border/70 bg-background/85 backdrop-blur">
      <div className="flex items-center justify-between px-5 py-5">
        <div>
          <h1 className="text-lg font-semibold">LLM Playground</h1>
          <p className="text-xs text-muted-foreground">Experiment with hosted and local models.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onThemeToggle} title="Toggle theme">
          {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-2 px-3 pb-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "w-full rounded-xl border border-transparent bg-transparent px-4 py-3 text-left transition",
                isActive ? "border-primary/40 bg-primary/10 text-primary" : "hover:border-border hover:bg-muted/60",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border",
                    isActive ? "border-primary/40 bg-primary/10" : "border-border bg-background",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
      <div className="border-t border-border/60 px-5 py-5">
        <button
          type="button"
          onClick={onOpenSettings}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border border-border/70 bg-background px-4 py-3 text-left text-sm font-medium transition",
            "hover:border-primary/40 hover:text-primary",
          )}
        >
          <span className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" /> Settings
          </span>
          <KeyIcon className="h-4 w-4 text-muted-foreground" />
        </button>
        <p className="mt-2 text-xs text-muted-foreground">Manage API keys and workspace preferences.</p>
        <p className={cn("mt-1 text-[11px] uppercase tracking-wide", statusColor)}>OpenRouter key: {statusLabel}</p>
      </div>
    </aside>
  );
}
