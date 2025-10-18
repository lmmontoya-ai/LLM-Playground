from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from ..core.dependencies import get_provider_registry
from ..models.schemas import LoadModelRequest, ModelInfo
from ..providers.base import ProviderError
from ..providers.registry import ProviderRegistry

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("", response_model=List[ModelInfo])
async def list_models(registry: ProviderRegistry = Depends(get_provider_registry)):
    return await registry.list_models()


@router.post("/load", response_model=ModelInfo, status_code=status.HTTP_202_ACCEPTED)
async def load_model(
    payload: LoadModelRequest,
    registry: ProviderRegistry = Depends(get_provider_registry),
):
    try:
        return await registry.load_model(
            payload.provider,
            payload.model_id,
            revision=payload.revision,
            quantization=payload.quantization,
            **payload.parameters,
        )
    except ProviderError as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=400, detail=str(exc)) from exc
