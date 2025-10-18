from __future__ import annotations

import json
import logging
from typing import Dict

from ..models.schemas import HookType
from .base import BaseHook, HookContext, TokenEvent

logger = logging.getLogger(__name__)


class TokenLogHook(BaseHook):
    """Example hook that logs each generated token and probability."""

    def __init__(self) -> None:
        super().__init__(
            hook_id="token-logger",
            name="Token Probability Logger",
            types=[HookType.TOKEN],
            description="Logs every generated token with its probability when available.",
        )

    async def on_token(self, context: HookContext, event: TokenEvent) -> None:
        logger.debug(
            "Token generated | provider=%s model=%s token=%s prob=%s",
            context.provider_id,
            context.model_id,
            event.token,
            event.probability,
        )


class AttentionCaptureHook(BaseHook):
    """Captures attention weights emitted by providers that support them."""

    def __init__(self) -> None:
        super().__init__(
            hook_id="attention-capture",
            name="Attention Weight Capture",
            types=[HookType.POST],
            description="Stores attention weights from generation metadata for downstream visualization.",
        )
        self.storage: Dict[str, Dict[str, object]] = {}

    async def after_generation(
        self, context: HookContext, response: Dict[str, object]
    ) -> None:
        metadata = response.get("meta", {})
        attention = metadata.get("attention") if isinstance(metadata, dict) else None
        if attention is None:
            return
        key = f"{context.provider_id}:{context.model_id}"
        self.storage[key] = {"attention": attention, "request": context.request.dict()}
        logger.debug(
            "Captured attention weights for provider=%s model=%s payload=%s",
            context.provider_id,
            context.model_id,
            json.dumps({"attention_keys": list(attention)})
            if isinstance(attention, dict)
            else "<raw>",
        )

    def get_attention(self, provider_id: str, model_id: str) -> Dict[str, object]:
        return self.storage.get(f"{provider_id}:{model_id}", {})
