from __future__ import annotations

from typing import Dict, List

from ..core.config import Settings
from ..models.schemas import ModelInfo, ProviderInfo
from .base import LLMProvider, ProviderError
from .huggingface import HuggingFaceProvider
from .openrouter import OpenRouterProvider


class ProviderRegistry:
    """Factory and registry for configured LLM providers."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._providers: Dict[str, LLMProvider] = {}
        self._bootstrap()

    def _bootstrap(self) -> None:
        self._providers[OpenRouterProvider.id] = OpenRouterProvider(self.settings)
        self._providers[HuggingFaceProvider.id] = HuggingFaceProvider(self.settings)

    def get(self, provider_id: str) -> LLMProvider:
        provider = self._providers.get(provider_id)
        if not provider:
            raise ProviderError(f"Provider '{provider_id}' is not registered.")
        return provider

    def list_providers(self) -> List[ProviderInfo]:
        return [provider.to_info() for provider in self._providers.values()]

    async def list_models(self) -> List[ModelInfo]:
        models: List[ModelInfo] = []
        for provider in self._providers.values():
            models.extend(await provider.get_models())
        return models

    async def load_model(
        self,
        provider_id: str,
        model_id: str,
        *,
        revision: str | None = None,
        quantization: str | None = None,
        **parameters: object,
    ) -> ModelInfo:
        provider = self.get(provider_id)
        return await provider.load_model(
            model_id,
            revision=revision,
            quantization=quantization,
            **parameters,
        )
