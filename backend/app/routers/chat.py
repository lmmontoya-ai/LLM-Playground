from __future__ import annotations

import json
from typing import AsyncIterator

from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse

from ..core.dependencies import get_chat_service
from ..models.schemas import ChatCompletionRequest, ChatCompletionResponse
from ..services.chat import ChatService

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post(
    "/completions",
    response_model=ChatCompletionResponse,
)
async def create_completion(
    payload: ChatCompletionRequest,
    service: ChatService = Depends(get_chat_service),
):
    result = await service.complete(payload)
    if isinstance(result, ChatCompletionResponse):
        return result

    stream = result
    response_holder: dict[str, StreamingResponse | None] = {"response": None}

    async def event_source(iterator: AsyncIterator):
        try:
            async for chunk in iterator:
                yield f"data: {chunk.json()}\n\n"
        except Exception as exc:  # pragma: no cover - defensive error surfacing
            streaming_response = response_holder["response"]
            if streaming_response is not None:
                streaming_response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            error_payload = json.dumps({"detail": str(exc)})
            yield f"event: error\ndata: {error_payload}\n\n"
            return
        yield "data: [DONE]\n\n"

    streaming_response = StreamingResponse(
        event_source(stream),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"},
    )
    response_holder["response"] = streaming_response
    return streaming_response
