import type { ChatMessage } from "@/lib/types";

export function formatWorkspaceLabel(providerName?: string | null, providerLabel?: string): string {
  const source = providerName ?? providerLabel ?? "workspace";
  const normalized = source.replace(/[-_]/g, " ").trim();
  if (!normalized) {
    return "Workspace";
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function buildTranscript(
  sessionName: string,
  modelLabel: string,
  workspaceLabel: string,
  messages: ChatMessage[],
): string {
  if (messages.length === 0) {
    return "";
  }

  const header = `# ${sessionName}\n\nModel: ${modelLabel}\nProvider: ${workspaceLabel}\n`;

  const body = messages
    .map((message) => {
      const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `\n---\n**${message.role.toUpperCase()}** (${timestamp})\n\n${message.content}`;
    })
    .join("\n");

  return `${header}${body}`;
}
