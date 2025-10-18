from __future__ import annotations

import abc
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List, Optional

from ..models.schemas import ChatCompletionRequest, HookInfo, HookType


@dataclass
class TokenEvent:
    token: str
    probability: Optional[float] = None
    index: Optional[int] = None
    meta: Dict[str, Any] = field(default_factory=dict)


@dataclass
class HookContext:
    request: ChatCompletionRequest
    provider_id: str
    model_id: str
    extra: Dict[str, Any] = field(default_factory=dict)


class BaseHook(abc.ABC):
    """Base class for interpretability hooks."""

    id: str
    name: str
    types: List[HookType]
    description: Optional[str]

    def __init__(
        self,
        hook_id: str,
        name: str,
        types: Iterable[HookType],
        description: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.id = hook_id
        self.name = name
        self.types = list(types)
        self.description = description
        self.config = config or {}

    async def before_generation(self, context: HookContext) -> None:
        """Called before a provider generates output."""

    async def after_generation(
        self, context: HookContext, response: Dict[str, Any]
    ) -> None:
        """Called after a provider completes generation."""

    async def on_token(self, context: HookContext, event: TokenEvent) -> None:
        """Called for each generated token."""

    def to_info(self, is_builtin: bool = False) -> HookInfo:
        return HookInfo(
            id=self.id,
            name=self.name,
            types=self.types,
            description=self.description,
            is_builtin=is_builtin,
            config=self.config,
        )
