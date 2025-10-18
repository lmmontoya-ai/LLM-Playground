# LLM Playground

Full-stack platform for rapid experimentation with hosted and local large language models (LLMs), featuring a responsive, research-friendly UI. Interpretability tooling is temporarily disabled while the feature set is reworked.

## Project structure

```
.
├── backend/            # FastAPI application (uv-based)
├── frontend/           # React + Vite + Tailwind client
├── .env.example        # Shared environment configuration template
├── pnpm-workspace.yaml # Frontend workspace definition
└── README.md
```

## Prerequisites

- Python 3.10+
- [uv](https://github.com/astral-sh/uv) for backend dependency management
- Node.js 18+ and [pnpm](https://pnpm.io/) 8+ for the frontend

## Backend

```bash
cd backend
uv sync             # install dependencies
source .venv/bin/activate
uv run uvicorn app.main:app --reload
# stop the dev server from another terminal
pkill -f "uvicorn app.main:app"
```

The API listens on `http://localhost:8000` and exposes OpenAI-compatible chat endpoints plus provider/model management routes. Configure environment variables by copying `.env.example` to `.env` and setting `OPENROUTER_API_KEY` (and other options as needed).

## Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

The Vite dev server runs at `http://localhost:5173` and proxies `/api` requests to the backend. Update `VITE_BACKEND_URL` in your environment if the backend is hosted elsewhere.

Use the right-hand navigation sidebar to switch between Online (OpenRouter) and Local (HuggingFace) workspaces. Each workspace surfaces the relevant controls in the collapsible developer panel on the left. Store your OpenRouter API key there (kept in browser storage); requests surface a toast reminder if the key is required but missing.

## Key features

- **Provider abstraction** for OpenRouter-hosted models and local HuggingFace pipelines, including optional streaming support.
- **Research-grade UI** featuring provider/model selectors, token streaming indicator, virtualised message list, markdown rendering, copy-to-clipboard, and persisted conversations.
- **Configuration controls** for sampling parameters (temperature, top-p, penalties) accessible from the sidebar.
