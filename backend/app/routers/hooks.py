from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from ..core.dependencies import get_hook_manager
from ..hooks.manager import HookManager
from ..models.schemas import HookInfo, HookRegistrationRequest

router = APIRouter(prefix="/api/hooks", tags=["hooks"])


@router.get("", response_model=List[HookInfo])
async def list_hooks(manager: HookManager = Depends(get_hook_manager)):
    return manager.list_hooks()


@router.post("/register", response_model=HookInfo, status_code=status.HTTP_201_CREATED)
async def register_hook(
    payload: HookRegistrationRequest,
    manager: HookManager = Depends(get_hook_manager),
):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Dynamic hook registration is disabled. Define hooks in the backend instead.",
    )
