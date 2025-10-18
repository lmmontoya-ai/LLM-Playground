from functools import lru_cache

from ..hooks.examples import AttentionCaptureHook, TokenLogHook
from ..hooks.manager import HookManager
from ..providers.registry import ProviderRegistry
from ..services.chat import ChatService
from ..services.hf_downloads import HuggingFaceDownloadManager
from .config import get_settings


@lru_cache(maxsize=1)
def _hook_manager_factory() -> HookManager:
    manager = HookManager()
    manager.register(TokenLogHook(), is_builtin=True)
    manager.register(AttentionCaptureHook(), is_builtin=True)
    return manager


def get_hook_manager() -> HookManager:
    return _hook_manager_factory()


@lru_cache(maxsize=1)
def _provider_registry_factory() -> ProviderRegistry:
    return ProviderRegistry(get_settings())


def get_provider_registry() -> ProviderRegistry:
    return _provider_registry_factory()


@lru_cache(maxsize=1)
def _chat_service_factory() -> ChatService:
    return ChatService(get_provider_registry(), get_hook_manager())


def get_chat_service() -> ChatService:
    return _chat_service_factory()


@lru_cache(maxsize=1)
def _hf_download_manager_factory() -> HuggingFaceDownloadManager:
    return HuggingFaceDownloadManager(get_settings(), get_provider_registry())


def get_hf_download_manager() -> HuggingFaceDownloadManager:
    return _hf_download_manager_factory()
