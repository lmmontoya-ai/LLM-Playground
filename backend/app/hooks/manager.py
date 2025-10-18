from __future__ import annotations

import asyncio
from typing import Dict, Iterable, List

from ..models.schemas import (
    ChatCompletionRequest,
    HookInfo,
    HookRegistrationRequest,
    HookType,
)
from .base import BaseHook, HookContext, TokenEvent


class HookManager:
    """Runtime registry and dispatcher for interpretability hooks."""

    def __init__(self) -> None:
        self._hooks: Dict[str, BaseHook] = {}
        self._builtin: Dict[str, BaseHook] = {}

    def register(self, hook: BaseHook, *, is_builtin: bool = False) -> None:
        registry = self._builtin if is_builtin else self._hooks
        registry[hook.id] = hook

    def register_from_request(self, payload: HookRegistrationRequest) -> BaseHook:
        raise NotImplementedError(
            "Dynamic hook registration is disabled. Define hooks statically on the server."
        )

    def unregister(self, hook_id: str) -> None:
        self._hooks.pop(hook_id, None)

    def list_hooks(self) -> List[HookInfo]:
        merged = {**self._builtin, **self._hooks}
        return [
            hook.to_info(hook.id in self._builtin)
            for hook in sorted(merged.values(), key=lambda h: h.name.lower())
        ]

    async def dispatch_pre(
        self, request: ChatCompletionRequest, provider_id: str, model_id: str
    ) -> HookContext:
        context = HookContext(
            request=request, provider_id=provider_id, model_id=model_id
        )
        await self._run_hooks(HookType.PRE, context)
        return context

    async def dispatch_post(
        self,
        context: HookContext,
        response: Dict[str, object],
    ) -> None:
        await self._run_hooks(HookType.POST, context, response=response)

    async def emit_token(self, context: HookContext, event: TokenEvent) -> None:
        await self._run_hooks(HookType.TOKEN, context, event=event)

    async def _run_hooks(
        self,
        hook_type: HookType,
        context: HookContext,
        **kwargs: object,
    ) -> None:
        tasks = []
        for hook in self._iter_hooks_for_type(hook_type):
            coro = self._call_hook(hook, hook_type, context, **kwargs)
            tasks.append(coro)
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    def _iter_hooks_for_type(self, hook_type: HookType) -> Iterable[BaseHook]:
        for hook in {**self._builtin, **self._hooks}.values():
            if hook_type in hook.types:
                yield hook

    async def _call_hook(
        self,
        hook: BaseHook,
        hook_type: HookType,
        context: HookContext,
        **kwargs: object,
    ) -> None:
        try:
            if hook_type is HookType.PRE:
                await hook.before_generation(context)
            elif hook_type is HookType.POST:
                await hook.after_generation(context, kwargs.get("response", {}))
            elif hook_type is HookType.TOKEN:
                await hook.on_token(context, kwargs.get("event"))
        except Exception:
            # Hooks must not break the request pipeline; swallow errors.
            pass


class DynamicHook(BaseHook):
    """Hook created dynamically at runtime via the registration API."""

    async def before_generation(self, context: HookContext) -> None:
        pass

    async def after_generation(
        self, context: HookContext, response: Dict[str, object]
    ) -> None:
        pass

    async def on_token(self, context: HookContext, event: TokenEvent) -> None:
        pass
