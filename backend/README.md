# Backend (FastAPI)

FastAPI application that exposes a unified API for both OpenRouter-hosted models and local HuggingFace inference. The project is configured for use with [`uv`](https://github.com/astral-sh/uv) to manage dependencies.

## Getting started

```bash
# Install dependencies
uv sync

# Activate virtual environment
source .venv/bin/activate

# Run the API
uvicorn app.main:app --reload

# Stop the API (choose either)
pkill -f "uvicorn app.main:app"
# or kill by port if needed
kill "$(lsof -ti :8000)"
```

The service starts on `http://localhost:8000`. The interactive docs are available at `/docs`.

## Environment

Copy `.env.example` from the repository root and set the following at minimum:

```
OPENROUTER_API_KEY=your-token
FRONTEND_URL=http://localhost:5173
DEFAULT_PROVIDER=openrouter
```

## Testing

```bash
uv run pytest
```

## Project layout

```
backend/
├── app/
│   ├── core/          # Config & dependency helpers
│   ├── hooks/         # Interpretability hooks
│   ├── models/        # Pydantic schemas
│   ├── providers/     # Provider implementations
│   ├── routers/       # FastAPI routers
│   └── services/      # Business logic orchestration
└── tests/             # Unit tests
```
