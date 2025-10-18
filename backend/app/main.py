from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .core.dependencies import get_hook_manager, get_provider_registry
from .routers import chat, hooks, huggingface, models, providers

settings = get_settings()

app = FastAPI(
    title="LLM Playground API",
    version="0.1.0",
    description="Backend service for hybrid LLM experimentation.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost", "http://localhost:5173"],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(models.router)
app.include_router(providers.router)
app.include_router(hooks.router)
app.include_router(huggingface.router)


@app.get("/healthz")
async def healthcheck():
    """Simple health endpoint for readiness probes."""
    return {
        "status": "ok",
        "providers": [info.id for info in get_provider_registry().list_providers()],
        "hooks": [hook.id for hook in get_hook_manager().list_hooks()],
    }
