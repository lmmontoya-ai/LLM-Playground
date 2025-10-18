from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from ..core.dependencies import get_provider_registry
from ..models.schemas import ApiKeyRequest, ApiKeyStatus, ProviderInfo
from ..providers.openrouter import OpenRouterProvider
from ..providers.registry import ProviderRegistry

router = APIRouter(prefix="/api/providers", tags=["providers"])


@router.get("", response_model=List[ProviderInfo])
async def list_providers(registry: ProviderRegistry = Depends(get_provider_registry)):
    return registry.list_providers()


@router.get("/openrouter/key", response_model=ApiKeyStatus)
async def get_openrouter_api_key_status(
    registry: ProviderRegistry = Depends(get_provider_registry),
) -> ApiKeyStatus:
    provider = _require_openrouter_provider(registry)
    return _api_key_status(provider)


@router.post(
    "/openrouter/key",
    response_model=ApiKeyStatus,
    status_code=status.HTTP_200_OK,
)
async def set_openrouter_api_key(
    payload: ApiKeyRequest,
    registry: ProviderRegistry = Depends(get_provider_registry),
) -> ApiKeyStatus:
    api_key = payload.api_key.strip()
    if not api_key:
        raise HTTPException(status_code=400, detail="API key must not be empty.")
    provider = _require_openrouter_provider(registry)
    provider.set_api_key(api_key)
    return _api_key_status(provider)


@router.delete("/openrouter/key", response_model=ApiKeyStatus)
async def clear_openrouter_api_key(
    registry: ProviderRegistry = Depends(get_provider_registry),
) -> ApiKeyStatus:
    provider = _require_openrouter_provider(registry)
    provider.set_api_key(None)
    return _api_key_status(provider)


def _require_openrouter_provider(registry: ProviderRegistry) -> OpenRouterProvider:
    provider = registry.get(OpenRouterProvider.id)
    if not isinstance(provider, OpenRouterProvider):  # pragma: no cover - defensive
        raise HTTPException(
            status_code=404,
            detail="OpenRouter provider is not configured.",
        )
    return provider


def _api_key_status(provider: OpenRouterProvider) -> ApiKeyStatus:
    return ApiKeyStatus(
        configured=provider.api_key_configured,
        source=provider.api_key_source,
    )
