from __future__ import annotations

import abc
from typing import AsyncIterator, Iterable, List

from ..core.config import Settings
from ..models.schemas import (
    ChatCompletionChunk,
    ChatCompletionRequest,
    ChatCompletionResponse,
    ModelInfo,
    ProviderInfo,
)


class ProviderError(Exception):
    """Base exception for provider failures."""


class StreamingNotSupportedError(ProviderError):
    """Raised if streaming is requested from a provider without support."""


class LLMProvider(abc.ABC):
    """Abstract base provider with shared interface."""

    id: str
    name: str
    supports_streaming: bool = False

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @abc.abstractmethod
    async def generate(self, payload: ChatCompletionRequest) -> ChatCompletionResponse:
        """Return a full completion response."""

    async def stream(
        self, payload: ChatCompletionRequest
    ) -> AsyncIterator[ChatCompletionChunk]:
        """Yield streaming chunks; override when supported."""
        raise StreamingNotSupportedError(
            f"Provider {self.id} does not support streaming responses."
        )

    @abc.abstractmethod
    async def get_models(self) -> List[ModelInfo]:
        """Return metadata about models available for this provider."""

    async def load_model(
        self,
        model_id: str,
        *,
        revision: str | None = None,
        quantization: str | None = None,
        **parameters: object,
    ) -> ModelInfo:
        """Load a local model into memory if applicable."""
        raise ProviderError(
            f"Provider {self.id} does not support manual model loading."
        )

    def to_info(self, *, models: Iterable[str] | None = None) -> ProviderInfo:
        return ProviderInfo(
            id=self.id,
            name=self.name,
            supports_streaming=self.supports_streaming,
            models=list(models or []),
        )
