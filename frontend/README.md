# Frontend (React + Vite)

React 18 + TypeScript SPA that provides a rich chat interface, streaming visualisation, and interpretability controls for the LLM Playground.

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) 8+

## Quick start

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:5173` and proxies API requests to `http://localhost:8000` by default. Configure the target by creating a `.env` file with `VITE_BACKEND_URL=<url>`.

## Scripts

- `pnpm dev` – start the development server with HMR
- `pnpm build` – type-check and build a production bundle
- `pnpm preview` – preview the production build
- `pnpm lint` – run ESLint with the project config
- `pnpm format` – format the workspace with Prettier

## Architecture

- `src/App.tsx` – top-level layout containing the chat and interpretability tabs
- `src/store/chat-store.ts` – Zustand-powered global state with localStorage persistence
- `src/lib/api.ts` – typed API client with SSE handling for streaming responses
- `src/components/chat/*` – chat interface primitives (message list, input, streaming indicator)
- `src/components/settings/*` – provider/model selection and generation parameter controls
- `src/components/interpretability/*` – interpretability hook management UI

TailwindCSS powers styling, with shadcn-inspired primitives under `src/components/ui`. Virtualised rendering for long conversations is handled via `@tanstack/react-virtual`.
