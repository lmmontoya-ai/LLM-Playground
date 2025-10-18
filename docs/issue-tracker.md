# Issue Tracker

Structured log of open findings, current status, and the implementation approach to resolve them. Update the status column as fixes land.

## Active Findings

| Status | Severity | Scope | Summary | Details | Implementation Plan |
| --- | --- | --- | --- | --- | --- |
| Resolved | High | `frontend/src/store/chat-store.ts:43` | API keys persisted in `localStorage` | The Zustand `persist` middleware stores the OpenRouter API key in `localStorage`, leaving it exposed to any script with browser access. | Implemented: bumped the persisted store version, stripped `apiKey` from the persisted slice, added a migration to scrub leaked values, and introduced backend endpoints that hold the OpenRouter key server-side with UI flows to save/clear it (`frontend/src/store/chat-store.ts`, `frontend/src/App.tsx`, `frontend/src/components/layout/NavigationSidebar.tsx`, `frontend/src/lib/api.ts`, `frontend/src/lib/types.ts`, `backend/app/providers/openrouter.py`, `backend/app/routers/providers.py`, `backend/app/models/schemas.py`). |
| Resolved | High | `backend/app/hooks/manager.py:21` | Dynamic hooks are no-ops | Hooks registered via `/api/hooks/register` were silently ignored because the dynamic hook implementation never executed. | Implemented: disabled the registration endpoint with an explicit 501 response and made the manager raise if called so hooks must be defined server-side (`backend/app/routers/hooks.py`, `backend/app/hooks/manager.py`). |
| Resolved | High | `backend/app/core/config.py:4` | Pydantic 2.x compatibility regression | The old fallback replaced `BaseSettings` with `BaseModel`, so env vars were skipped under Pydantic 2.x. | Implemented: prefer `pydantic-settings` when available, provide a legacy fallback for Pydantic 1.x, and remove the `BaseModel` shim so configuration loads correctly across versions (`backend/app/core/config.py`). |
| Resolved | Medium | `backend/app/providers/openrouter.py:195` | Shared HTTP client never closed | `_ensure_client` used to cache a long-lived `httpx.AsyncClient`, risking leaked connections. | Implemented: replaced the shared client with a per-request context manager that spins up and disposes clients for each call (`backend/app/providers/openrouter.py`). |
| Resolved | Medium | `backend/app/providers/huggingface.py:62` | Streaming flag misrepresents behaviour | `supports_streaming` advertises streaming support, but the implementation synchronously generates the full completion and then yields tokens by splitting a string, offering no latency benefit. | Implemented: disabled streaming for the local HuggingFace provider so the API accurately reports capabilities and raises `StreamingNotSupportedError` (`backend/app/providers/huggingface.py`). |
| Resolved | Medium | `backend/app/services/chat.py:48` | Streaming buffering defeats hooks | `_stream_with_hooks` buffers every token in `collected` before invoking post hooks, increasing memory usage and delaying hook processing for long completions. | Implemented: replaced the token list with an incremental `StringIO`, emit token/post hook events per chunk, and send a final assembled payload without retaining duplicate buffers (`backend/app/services/chat.py`). |
| Resolved | Medium | `backend/app/routers/chat.py:29` | SSE hides provider errors | The SSE wrapper always yields `data: [DONE]` in the `finally` block, so clients cannot distinguish between success and failure. | Implemented: surface provider failures via `event: error`, drop the `[DONE]` marker on exceptions, and set the streaming response status to 500 to reflect the failure (`backend/app/routers/chat.py`). |

## Usage Guidelines

- Mark the **Status** column as `In Progress` or `Resolved` as work progresses.
- Add links to pull requests or commits in the summary row when issues are resolved.
- Append new findings beneath the existing list to maintain a chronological record.
