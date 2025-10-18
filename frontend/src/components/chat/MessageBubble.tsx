import { type ReactNode, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { BotIcon, ClipboardIcon, CogIcon, UserIcon } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  message: ChatMessage;
}

const roleStyles: Record<ChatMessage["role"], string> = {
  system:
    "border-amber-200/70 bg-amber-50/95 text-amber-900 shadow-[0_18px_36px_-20px_rgba(217,119,6,0.55)] supports-[backdrop-filter]:backdrop-blur dark:border-amber-500/30 dark:bg-amber-900/40 dark:text-amber-100",
  user:
    "border-slate-200/80 bg-white/95 text-slate-900 shadow-[0_20px_48px_-28px_rgba(15,23,42,0.65)] supports-[backdrop-filter]:backdrop-blur dark:border-slate-100/10 dark:bg-slate-100/5 dark:text-slate-50",
  assistant:
    "border-slate-800/70 bg-slate-950/85 text-slate-100 shadow-[0_26px_64px_-30px_rgba(2,6,23,0.95)] supports-[backdrop-filter]:backdrop-blur-sm dark:border-slate-800/60",
};

const roleIcons: Record<ChatMessage["role"], ReactNode> = {
  system: <CogIcon className="h-3.5 w-3.5" />,
  user: <UserIcon className="h-3.5 w-3.5" />,
  assistant: <BotIcon className="h-3.5 w-3.5" />,
};

const roleHeaderStyles: Record<ChatMessage["role"], string> = {
  system: "text-amber-900/80 dark:text-amber-100/85",
  user: "text-slate-600 dark:text-slate-200/90",
  assistant: "text-slate-200/90",
};

const roleMetaStyles: Record<ChatMessage["role"], string> = {
  system: "text-amber-900/70 dark:text-amber-100/70",
  user: "text-slate-500 dark:text-slate-300/80",
  assistant: "text-slate-400/90",
};

const roleIconStyles: Record<ChatMessage["role"], string> = {
  system: "border-amber-200/70 bg-amber-500/20 text-amber-900 dark:border-amber-400/40 dark:bg-amber-200/20 dark:text-amber-100",
  user: "border-slate-200/70 bg-slate-900/5 text-slate-700 dark:border-slate-100/20 dark:bg-slate-100/10 dark:text-slate-100",
  assistant: "border-white/15 bg-slate-900 text-slate-100 ring-1 ring-white/10",
};

const roleWordBadgeStyles: Record<ChatMessage["role"], string> = {
  system: "border-amber-200/70 bg-amber-100/30 text-amber-900/80 dark:border-amber-300/50 dark:bg-amber-100/10 dark:text-amber-100/90",
  user: "border-slate-300/70 bg-white/70 text-slate-600 dark:border-slate-100/20 dark:bg-slate-100/10 dark:text-slate-200",
  assistant: "border-white/15 bg-white/5 text-slate-200",
};

const roleCopyButtonStyles: Record<ChatMessage["role"], string> = {
  system: "border-amber-200/60 text-amber-900/80 hover:bg-amber-100/40 dark:border-amber-500/40 dark:text-amber-100 hover:dark:bg-amber-100/10",
  user: "border-slate-300/60 text-slate-500 hover:bg-slate-100/60 dark:border-slate-100/20 dark:text-slate-200 hover:dark:bg-slate-100/10",
  assistant: "border-white/10 text-slate-200 hover:bg-white/10",
};

const roleContentStyles: Record<ChatMessage["role"], string> = {
  system:
    "text-amber-900/90 dark:text-amber-100/90 prose-headings:text-amber-900 prose-strong:text-amber-900 prose-a:text-amber-800 hover:prose-a:text-amber-900 dark:prose-headings:text-amber-100 dark:prose-strong:text-amber-100 dark:prose-a:text-amber-200",
  user:
    "text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-a:text-slate-800 hover:prose-a:text-slate-900 dark:text-slate-100 dark:prose-headings:text-slate-100 dark:prose-strong:text-slate-100 dark:prose-a:text-slate-200",
  assistant:
    "prose-invert text-slate-100 prose-headings:text-white/90 prose-strong:text-white prose-a:text-white/90 hover:prose-a:text-white",
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const wordCount = useMemo(() => {
    const tokens = message.content.trim().split(/\s+/).filter(Boolean);
    return tokens.length;
  }, [message.content]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).catch(() => {
      /* swallow */
    });
  }, [message.content]);

  return (
    <article
      className={cn(
        "group relative isolate w-full max-w-3xl rounded-3xl border px-6 py-5 text-sm transition duration-200",
        roleStyles[message.role],
      )}
    >
      <header className="flex items-start gap-4">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm",
            roleIconStyles[message.role],
          )}
        >
          {roleIcons[message.role]}
        </span>

        <div className="flex flex-1 flex-col gap-1">
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium",
              roleHeaderStyles[message.role],
            )}
          >
            <span className="capitalize tracking-wide">{message.role}</span>
            <span className={cn("hidden text-xs sm:inline-block", roleMetaStyles[message.role])} aria-hidden>
              •
            </span>
            <time
              className={cn(
                "text-xs font-normal tabular-nums",
                roleMetaStyles[message.role],
              )}
              dateTime={new Date(message.createdAt).toISOString()}
            >
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className={cn(
              "h-8 w-8 rounded-full border bg-transparent opacity-0 backdrop-blur transition group-hover:opacity-100",
              roleCopyButtonStyles[message.role],
            )}
            title="Copy message"
            aria-label="Copy message"
          >
            <ClipboardIcon className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <ReactMarkdown
        className={cn(
          "prose prose-sm mt-4 max-w-none leading-relaxed prose-pre:rounded-2xl prose-pre:p-0",
          roleContentStyles[message.role],
        )}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? "");
            if (inline) {
              return (
                <code
                  className={cn(
                    "rounded px-1 py-0.5 text-[0.85em]",
                    message.role === "assistant"
                      ? "bg-white/10 text-white"
                      : "bg-slate-900/5 text-slate-800 dark:bg-slate-100/10 dark:text-slate-100",
                    className,
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <SyntaxHighlighter
                {...props}
                style={oneDark}
                language={match?.[1] ?? "plaintext"}
                PreTag="div"
                className={cn(
                  "mt-4 overflow-hidden rounded-2xl border",
                  message.role === "assistant"
                    ? "border-white/10 bg-slate-950/60"
                    : "border-slate-200/70 bg-slate-900/10 dark:border-slate-700/60 dark:bg-slate-900/60",
                )}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {message.content}
      </ReactMarkdown>
    </article>
  );
}
