# Chat Module Architecture

## Component Hierarchy

```
ChatInterface (Composition root)
│
├── ChatHeader
│   ├── ModelSelector (inline variant)
│   ├── Download button (optional)
│   ├── StreamingIndicator
│   └── Session actions (Export, Reset)
│
├── MessageList (Virtualized scroller)
│   └── MessageBubble (markdown rendering)
│
└── MessageInput (Composer)
```

## Data Flow

```
Application Shell (messages, models, provider, actions)
            │ props
            ▼
    ┌─────────────────────┐
    │    ChatInterface    │
    │  - Layout + wiring  │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │  useChatInterface   │─────┐
    │  - Session state    │     │ derived props
    │  - Export/reset     │     │
    │  - Provider status  │     │
    └──────────┬──────────┘     │
               │                 │
     ┌─────────┼─────────┐       │
     ▼         ▼         ▼       │
ChatHeader  MessageList  MessageInput
```

## State Management

```
useChatInterface hook
│
├── Local State
│   ├── sessionName            (current transcript heading)
│   └── copied                 (export feedback state)
│
├── Refs
│   └── sessionCountRef        (incremental session numbering)
│
├── Derived State
│   ├── hasMessages            (messages.length > 0)
│   ├── connectionStatus       (provider health)
│   ├── workspaceLabel         (formatted provider label)
│   └── transcript             (markdown export payload)
│
└── Actions
    ├── handleExport()         (copy transcript to clipboard)
    ├── handleReset()          (confirm + reset conversation)
    └── showLoadedToggle       (huggingface-only switch enablement)
```

## Event Flow

### Reset Conversation

```
User clicks Reset
       │
       ▼
handleReset()
       │
       ├─► Confirm via window.confirm
       ├─► Stop streaming (if active)
       ├─► Reset zustand store state
       └─► Increment session counter + clear copied state
```

### Export Transcript

```
User clicks Export
       │
       ▼
handleExport()
       │
       ├─► Build transcript markdown
       ├─► navigator.clipboard.writeText()
       └─► Toggle copied feedback for 2.5s
```

### Message Composer

```
User types message
       │
       ▼
MessageInput manages textarea auto-sizing
       │
       ├─► Shift+Enter inserts newline
       └─► Enter submits via onSend
```

## Utility Functions Flow

```
Messages + metadata
       │
       ▼
formatWorkspaceLabel()     (normalise provider label)
       │
       ▼
buildTranscript()
       │
       ▼
Markdown string handed to clipboard API
```

## Type Safety

```
types.ts
 │
 ├─► ChatInterfaceProps        (composition API surface)
 ├─► ChatHeaderProps           (render-only props)
 └─► UseChatInterface*         (hook contracts)
```

## Module Dependencies

```
ChatInterface.tsx
 │
 ├─► hooks.ts                  (useChatInterface)
 ├─► ChatHeader.tsx
 ├─► MessageList.tsx
 └─► MessageInput.tsx

hooks.ts
 │
 └─► utils.ts                  (formatWorkspaceLabel, buildTranscript)

MessageList.tsx
 │
 └─► MessageBubble.tsx         (markdown rendering)
```

## Accessibility Notes

- ChatHeader buttons use semantic `<button>` elements with tooltips/titles.
- MessageInput focuses on `/` hotkey and exposes keyboard shortcuts inline.
- Virtualized MessageList preserves DOM order and uses gradients to hint scrollable areas.
- Clipboard/confirm interactions guard against missing browser APIs.

## Testing Strategy

- **Unit**: utils (`formatWorkspaceLabel`, `buildTranscript`) with edge cases.
- **Hook**: `useChatInterface` behaviours (connection status, export/reset logic) via render-hook tests.
- **Component**: ChatHeader interactions (export feedback, reset disablement) using @testing-library/react.
- **Integration**: ChatInterface flow covering header actions, message rendering, and composer submission.
