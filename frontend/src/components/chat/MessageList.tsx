import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220,
    overscan: 8,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  useEffect(() => {
    if (messages.length === 0) return;
    const lastIndex = messages.length - 1;
    rowVirtualizer.scrollToIndex(lastIndex, { align: "end", smooth: true });
  }, [messages, isStreaming, rowVirtualizer]);

  if (messages.length === 0) {
    return (
      <div className="relative flex flex-1 items-center justify-center px-6 py-10">
        <div className="text-center text-sm text-muted-foreground">
          <p className="text-base font-medium text-foreground/80">Start a new conversation</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask a question, paste context, or describe a task and we&rsquo;ll respond in real time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background via-background/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background via-background/10 to-transparent" />
      <div ref={parentRef} className="flex-1 overflow-y-auto px-3 py-6 sm:px-6">
        <div style={{ height: totalHeight, position: "relative" }}>
          {virtualItems.map((virtualRow) => {
            const message = messages[virtualRow.index];
            if (!message) return null;
            return (
              <div
                key={message.id}
                data-index={virtualRow.index}
                ref={(node) => {
                  if (node) {
                    rowVirtualizer.measureElement(node);
                  }
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  paddingBottom: "1.25rem",
                }}
                className="flex w-full"
              >
                <div
                  className={cn(
                    "flex w-full",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <MessageBubble message={message} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
