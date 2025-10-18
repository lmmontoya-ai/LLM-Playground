from __future__ import annotations

import json
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator, Dict, Iterable, List, Literal, Optional

import httpx

from ..core.config import Settings
from ..models.schemas import (
    ChatCompletionChoice,
    ChatCompletionChunk,
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatMessage,
    ModelInfo,
    ProviderInfo,
    Role,
    StreamDelta,
    UsageStats,
)
from .base import LLMProvider, ProviderError

OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"


class OpenRouterProvider(LLMProvider):
    id = "openrouter"
    name = "OpenRouter"
    supports_streaming = True

    def __init__(self, settings: Settings) -> None:
        super().__init__(settings)
        self._api_key: Optional[str] = None

    async def generate(self, payload: ChatCompletionRequest) -> ChatCompletionResponse:
        response = await self._post_chat(payload, stream=False)
        if not isinstance(response, dict):
            raise ProviderError("Unexpected response from OpenRouter API.")
        return self._parse_chat_completion(response)

    async def stream(
        self, payload: ChatCompletionRequest
    ) -> AsyncIterator[ChatCompletionChunk]:
        iterator = await self._post_chat(payload, stream=True)
        if iterator is None or not hasattr(iterator, "__aiter__"):
            raise ProviderError("Streaming response unavailable from OpenRouter.")
        async for chunk in iterator:
            yield chunk

    async def get_models(self) -> List[ModelInfo]:
        async with self._client_session() as client:
            resp = await client.get("/models")
            resp.raise_for_status()
            data = resp.json()
        models = []
        for item in data.get("data", []):
            models.append(
                ModelInfo(
                    id=item.get("id"),
                    provider=self.id,
                    description=item.get("description"),
                    tags=item.get("tags") or [],
                    meta={
                        "pricing": item.get("pricing"),
                        "context_length": item.get("context_length"),
                    },
                )
            )
        return models

    async def _post_chat(
        self,
        payload: ChatCompletionRequest,
        *,
        stream: bool,
    ) -> Dict[str, Any] | AsyncIterator[ChatCompletionChunk]:
        request_payload = self._build_request(payload, stream=stream)
        api_key = self._resolve_api_key(payload)
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self.settings.frontend_url,
            "X-Title": "LLM Playground",
        }
        if stream:
            return self._streaming_request(request_payload, headers)
        async with self._client_session() as client:
            resp = await client.post(
                "/chat/completions", json=request_payload, headers=headers
            )
            resp.raise_for_status()
            return resp.json()  # type: ignore[return-value]

    async def _streaming_request(
        self,
        payload: Dict[str, Any],
        headers: Dict[str, str],
    ) -> AsyncIterator[ChatCompletionChunk]:
        async with self._client_session() as client:
            async with client.stream(
                "POST",
                "/chat/completions",
                json=payload,
                headers={**headers, "Accept": "text/event-stream"},
                timeout=None,
            ) as response:
                async for line in response.aiter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    data = line.replace("data:", "", 1).strip()
                    if data == "[DONE]":
                        break
                    chunk = self._parse_stream_chunk(data)
                    if chunk:
                        yield chunk

    def _parse_chat_completion(self, data: Dict[str, Any]) -> ChatCompletionResponse:
        choices = []
        for idx, choice in enumerate(data.get("choices", [])):
            message = choice.get("message", {})
            choices.append(
                ChatCompletionChoice(
                    index=idx,
                    message=ChatMessage(
                        role=Role(message.get("role", Role.ASSISTANT.value)),
                        content=message.get("content", ""),
                    ),
                    finish_reason=choice.get("finish_reason"),
                )
            )

        usage = data.get("usage") or {}
        usage_stats = (
            UsageStats(
                prompt_tokens=usage.get("prompt_tokens", 0),
                completion_tokens=usage.get("completion_tokens", 0),
                total_tokens=usage.get("total_tokens", 0),
            )
            if isinstance(usage, dict)
            else UsageStats()
        )
        return ChatCompletionResponse(
            id=data.get("id", ""),
            model=data.get("model", payload_model(data)),
            provider=self.id,
            choices=choices,
            usage=usage_stats,
            meta=data.get("meta") or {},
        )

    def _parse_stream_chunk(self, data: str) -> Optional[ChatCompletionChunk]:
        try:
            payload = json.loads(data)
        except json.JSONDecodeError:
            return None
        choice = (payload.get("choices") or [{}])[0]
        delta = choice.get("delta", {})
        return ChatCompletionChunk(
            id=payload.get("id") or payload.get("id", "stream"),
            model=payload.get("model", "unknown"),
            index=choice.get("index", 0),
            delta=StreamDelta(
                content=delta.get("content"),
                role=Role(delta.get("role", Role.ASSISTANT.value))
                if delta.get("role")
                else None,
                finish_reason=choice.get("finish_reason"),
            ),
            provider=self.id,
            meta=payload.get("meta") or {},
        )

    def _build_request(
        self, payload: ChatCompletionRequest, *, stream: bool
    ) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "model": payload.model,
            "messages": [message.dict() for message in payload.messages],
            "stream": stream,
            "temperature": payload.temperature,
            "top_p": payload.top_p,
            "presence_penalty": payload.presence_penalty,
            "frequency_penalty": payload.frequency_penalty,
            "metadata": payload.metadata,
        }
        if payload.max_tokens is not None:
            data["max_tokens"] = payload.max_tokens
        if payload.stop:
            data["stop"] = payload.stop
        return data

    def _resolve_api_key(self, payload: ChatCompletionRequest) -> str:
        api_key = payload.api_key or self._api_key or self.settings.openrouter_api_key
        if api_key:
            return api_key
        raise ProviderError(
            "OpenRouter API key is required. Set OPENROUTER_API_KEY or provide api_key in the request."
        )

    @asynccontextmanager
    async def _client_session(self) -> AsyncIterator[httpx.AsyncClient]:
        async with httpx.AsyncClient(
            base_url=OPENROUTER_API_BASE,
            timeout=httpx.Timeout(30.0, connect=10.0),
        ) as client:
            yield client

    def set_api_key(self, api_key: Optional[str]) -> None:
        self._api_key = api_key.strip() if api_key else None

    @property
    def api_key_configured(self) -> bool:
        return self.api_key_source != "none"

    @property
    def api_key_source(self) -> Literal["env", "runtime", "none"]:
        if self._api_key:
            return "runtime"
        if self.settings.openrouter_api_key:
            return "env"
        return "none"

    def to_info(self, *, models: Iterable[str] | None = None) -> ProviderInfo:
        info = super().to_info(models=models)
        info.meta["api_key_configured"] = self.api_key_configured
        info.meta["api_key_source"] = self.api_key_source
        return info


def payload_model(data: Dict[str, Any]) -> str:
    model = data.get("model")
    if model:
        return model
    choices = data.get("choices") or []
    if choices:
        return choices[0].get("model", "unknown")
    return "unknown"
