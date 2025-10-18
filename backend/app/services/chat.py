from __future__ import annotations

from io import StringIO
from typing import AsyncIterator

from ..hooks.base import TokenEvent
from ..hooks.manager import HookManager
from ..models.schemas import (
    ChatCompletionChunk,
    ChatCompletionRequest,
    ChatCompletionResponse,
)
from ..providers.registry import ProviderRegistry


class ChatService:
    """Coordinates provider calls with interpretability hooks."""

    def __init__(self, registry: ProviderRegistry, hooks: HookManager) -> None:
        self.registry = registry
        self.hooks = hooks

    async def complete(
        self, request: ChatCompletionRequest
    ) -> ChatCompletionResponse | AsyncIterator[ChatCompletionChunk]:
        provider_id = request.provider or self.registry.settings.default_provider
        provider = self.registry.get(provider_id)
        model_id = request.model or "default"

        context = await self.hooks.dispatch_pre(request, provider_id, model_id)

        if request.stream:
            return self._stream_with_hooks(provider.stream(request), context)

        response = await provider.generate(request)
        await self.hooks.dispatch_post(context, response.dict())
        return response

    async def list_models(self):
        return await self.registry.list_models()

    async def load_model(self, **kwargs):
        return await self.registry.load_model(**kwargs)

    def _stream_with_hooks(
        self, stream: AsyncIterator[ChatCompletionChunk], context
    ) -> AsyncIterator[ChatCompletionChunk]:
        async def generator():
            assembled = StringIO()
            async for chunk in stream:
                token = chunk.delta.content if chunk.delta else None
                if token:
                    assembled.write(token)
                    await self.hooks.emit_token(
                        context, TokenEvent(token=token, index=chunk.index)
                    )
                await self.hooks.dispatch_post(
                    context,
                    {
                        "streaming": True,
                        "chunk": chunk.dict(),
                    },
                )
                yield chunk
            await self.hooks.dispatch_post(
                context,
                {
                    "streaming": False,
                    "meta": {"assembled_text": assembled.getvalue()},
                },
            )

        return generator()
