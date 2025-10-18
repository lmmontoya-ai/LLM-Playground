import pytest
from app.core.config import Settings
from app.models.schemas import ChatCompletionRequest, ChatMessage, Role
from app.providers.base import ProviderError
from app.providers.huggingface import HuggingFaceProvider


@pytest.mark.asyncio
async def test_huggingface_requires_model():
    provider = HuggingFaceProvider(Settings())
    request = ChatCompletionRequest(
        messages=[ChatMessage(role=Role.USER, content="Hello!")],
    )
    with pytest.raises(ProviderError):
        await provider.generate(request)
