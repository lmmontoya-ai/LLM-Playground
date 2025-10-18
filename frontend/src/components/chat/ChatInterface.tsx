import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { ChatHeader } from "./ChatHeader";
import { useChatInterface } from "./hooks";
import type { ChatInterfaceProps } from "./types";

export function ChatInterface({
  messages,
  isStreaming,
  onSend,
  onStop,
  models,
  selectedModel,
  onModelChange,
  provider,
  providerLabel,
  onDownloadModel,
}: ChatInterfaceProps) {
  const { connectionStatus, copied, handleExport, handleReset, showLoadedToggle, hasMessages } = useChatInterface({
    messages,
    isStreaming,
    onStop,
    provider,
    providerLabel,
    selectedModel,
  });

  return (
    <div className="flex h-full flex-col">
      <ChatHeader
        models={models}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        provider={provider}
        connectionStatus={connectionStatus}
        isStreaming={isStreaming}
        onDownloadModel={onDownloadModel}
        copied={copied}
        onExport={handleExport}
        onReset={handleReset}
        showLoadedToggle={showLoadedToggle}
        hasMessages={hasMessages}
      />
      <div className="flex flex-1 flex-col px-4">
        <MessageList messages={messages} isStreaming={isStreaming} />
      </div>

      <div className="px-6 pb-10 pt-4">
        <MessageInput
          disabled={false}
          isStreaming={isStreaming}
          onSend={onSend}
          onStop={onStop}
        />
      </div>
    </div>
  );
}
