from __future__ import annotations

import asyncio
import logging
from typing import Any, AsyncIterator, Dict, List

from ..core.config import Settings
from ..models.schemas import (
    ChatCompletionChoice,
    ChatCompletionChunk,
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatMessage,
    ModelInfo,
    Role,
    UsageStats,
)
from .base import LLMProvider, ProviderError, StreamingNotSupportedError

logger = logging.getLogger(__name__)

try:
    from transformers import pipeline as hf_pipeline
except ImportError:  # pragma: no cover
    hf_pipeline = None


class HuggingFaceProvider(LLMProvider):
    id = "huggingface"
    name = "HuggingFace Local"
    supports_streaming = False

    def __init__(self, settings: Settings) -> None:
        super().__init__(settings)
        self._pipelines: Dict[str, Any] = {}
        self._lock = asyncio.Lock()

    async def generate(self, payload: ChatCompletionRequest) -> ChatCompletionResponse:
        model_id = self._ensure_model_id(payload)
        generator = await self._get_pipeline(model_id)
        prompt = self._build_prompt(payload.messages)

        generated = await asyncio.to_thread(
            generator,
            prompt,
            max_new_tokens=payload.max_tokens or 512,
            temperature=payload.temperature,
        )
        text = self._extract_text(generated)
        message = ChatMessage(role=Role.ASSISTANT, content=text)

        return ChatCompletionResponse(
            model=model_id,
            provider=self.id,
            choices=[
                ChatCompletionChoice(index=0, message=message, finish_reason="stop")
            ],
            usage=UsageStats(total_tokens=len(prompt.split()) + len(text.split())),
            meta={"prompt": prompt},
        )

    async def stream(
        self, payload: ChatCompletionRequest
    ) -> AsyncIterator[ChatCompletionChunk]:
        raise StreamingNotSupportedError("Streaming disabled for HuggingFace provider.")

    async def get_models(self) -> List[ModelInfo]:
        loaded = [
            ModelInfo(
                id=model_id,
                provider=self.id,
                loaded=True,
                description="Loaded locally",
            )
            for model_id in self._pipelines.keys()
        ]
        if not loaded:
            loaded.append(
                ModelInfo(
                    id="bert-base-uncased",
                    provider=self.id,
                    description="Example model; call POST /api/models/load to download.",
                    meta={"path": self.settings.local_models_path},
                )
            )
        return loaded

    async def load_model(
        self,
        model_id: str,
        *,
        revision: str | None = None,
        quantization: str | None = None,
        **parameters: object,
    ) -> ModelInfo:
        if hf_pipeline is None:
            raise ProviderError(
                "transformers is not installed. Install it to use local HuggingFace models."
            )
        async with self._lock:
            if model_id in self._pipelines:
                return ModelInfo(id=model_id, provider=self.id, loaded=True)
            logger.info("Loading HuggingFace model %s", model_id)
            generator = await asyncio.to_thread(
                hf_pipeline,
                "text-generation",
                model=model_id,
                revision=revision,
                model_kwargs={"torch_dtype": parameters.get("torch_dtype")},
                device=self._resolve_device(),
            )
            self._pipelines[model_id] = generator
        return ModelInfo(
            id=model_id,
            provider=self.id,
            loaded=True,
            meta={
                "quantization": quantization,
                "path": self.settings.local_models_path,
            },
        )

    async def _get_pipeline(self, model_id: str):
        if hf_pipeline is None:
            raise ProviderError(
                "transformers is not installed. Install it to use local HuggingFace models."
            )
        async with self._lock:
            pipeline = self._pipelines.get(model_id)
            if pipeline is not None:
                return pipeline
        info = await self.load_model(model_id)
        return self._pipelines[info.id]

    def _resolve_device(self) -> int:
        device = self.settings.device.lower()
        if device == "cuda":
            return 0
        return -1

    def _ensure_model_id(self, payload: ChatCompletionRequest) -> str:
        if payload.model:
            return payload.model
        loaded = list(self._pipelines.keys())
        if loaded:
            return loaded[0]
        raise ProviderError(
            "No local model loaded. Call POST /api/models/load before requesting completions."
        )

    def _build_prompt(self, messages: List[ChatMessage]) -> str:
        segments = []
        for message in messages:
            if message.role is Role.SYSTEM:
                segments.append(f"[System]\n{message.content.strip()}\n")
            elif message.role is Role.USER:
                segments.append(f"[User]\n{message.content.strip()}\n")
            else:
                segments.append(f"[Assistant]\n{message.content.strip()}\n")
        segments.append("[Assistant]\n")
        return "\n".join(segments)

    def _extract_text(self, generated: Any) -> str:
        if isinstance(generated, list) and generated:
            item = generated[0]
            if isinstance(item, dict):
                return item.get("generated_text", "")
        return str(generated)
