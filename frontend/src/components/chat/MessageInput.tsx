import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { PaperclipIcon, SendHorizonalIcon, SquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  disabled?: boolean;
  isStreaming?: boolean;
  onSend: (value: string) => Promise<void> | void;
  onStop?: () => void;
}

export function MessageInput({ disabled, isStreaming, onSend, onStop }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        const isInputTarget =
          target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
        if (isInputTarget) return;
        event.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "0px";
    const next = Math.min(Math.max(Math.floor(element.scrollHeight / 24), 1), 6);
    element.style.height = `${element.scrollHeight}px`;
    setRows(next);
  }, [value]);

  const estimatedTokens = useMemo(() => {
    if (!value.trim()) return 0;
    const words = value.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(Math.round(words * 1.3), words);
  }, [value]);

  const handleSubmit = useCallback(async () => {
    const composerDisabled = disabled ?? false;
    const streaming = isStreaming ?? false;
    if (!value.trim() || composerDisabled || streaming) return;
    await onSend(value.trim());
    setValue("");
  }, [disabled, isStreaming, onSend, value]);
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <form
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void handleSubmit();
      }}
      className={cn(
        "relative rounded-3xl border border-border/40 bg-background/90 px-4 py-4 shadow-2xl backdrop-blur",
        "supports-[backdrop-filter]:bg-background/70",
      )}
    >
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-1 h-10 w-10 text-muted-foreground hover:text-foreground"
          title="Attach (coming soon)"
        >
          <PaperclipIcon className="h-5 w-5" />
        </Button>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          disabled={disabled}
          placeholder="Type a prompt, describe a task, or paste context…"
          className="max-h-[220px] flex-1 resize-none border-0 bg-transparent px-0 text-base leading-relaxed focus-visible:ring-0"
          rows={rows}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2 py-0.5">
            Shift + Enter for newline
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2 py-0.5">
            {estimatedTokens} est. tokens
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && onStop ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onStop}
              className="gap-2 text-destructive"
            >
              <SquareIcon className="h-4 w-4" />
              Stop
            </Button>
          ) : null}
          <Button
            type="submit"
            disabled={(disabled ?? false) || (isStreaming ?? false) || !value.trim()}
            className="gap-2"
          >
            <SendHorizonalIcon className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
    </form>
  );
}
