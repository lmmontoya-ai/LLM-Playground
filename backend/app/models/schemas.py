from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Any, Dict, Iterable, List, Literal, Optional

from pydantic import BaseModel, Field, root_validator, validator


class Role(str, enum.Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(BaseModel):
    role: Role
    content: str


class UsageStats(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class ChatCompletionChoice(BaseModel):
    index: int
    message: ChatMessage
    finish_reason: Optional[str] = None


class ChatCompletionResponse(BaseModel):
    id: str = Field(default_factory=lambda: f"chatcmpl-{uuid.uuid4().hex}")
    model: str
    provider: str
    choices: List[ChatCompletionChoice]
    usage: UsageStats = Field(default_factory=UsageStats)
    meta: Dict[str, Any] = Field(default_factory=dict)


class StreamDelta(BaseModel):
    content: Optional[str] = None
    role: Optional[Role] = None
    finish_reason: Optional[str] = None


class ChatCompletionChunk(BaseModel):
    id: str
    model: str
    index: int
    delta: StreamDelta
    provider: str
    meta: Dict[str, Any] = Field(default_factory=dict)


class ChatCompletionRequest(BaseModel):
    messages: List[ChatMessage]
    provider: Optional[str] = None
    model: Optional[str] = None
    stream: bool = False
    api_key: Optional[str] = None

    temperature: float = 0.7
    max_tokens: Optional[int] = None
    top_p: float = 1.0
    presence_penalty: float = 0.0
    frequency_penalty: float = 0.0
    stop: Optional[List[str]] = None

    hook_ids: Optional[List[str]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @validator("messages")
    def ensure_messages(cls, value: Iterable[ChatMessage]) -> List[ChatMessage]:
        messages = list(value)
        if not messages:
            raise ValueError("At least one message is required for completion request.")
        return messages


class ProviderInfo(BaseModel):
    id: str
    name: str
    supports_streaming: bool = True
    models: List[str] = Field(default_factory=list)
    meta: Dict[str, Any] = Field(default_factory=dict)


class ModelInfo(BaseModel):
    id: str
    provider: str
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    loaded: bool = False
    meta: Dict[str, Any] = Field(default_factory=dict)


class DownloadStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ModelDownloadRequest(BaseModel):
    model_id: str
    revision: Optional[str] = None
    task: Optional[str] = None
    quantization: Optional[str] = None
    token: Optional[str] = None
    auto_load: bool = True


class ModelDownloadJob(BaseModel):
    id: str
    model_id: str
    revision: Optional[str] = None
    task: Optional[str] = None
    quantization: Optional[str] = None
    status: DownloadStatus
    progress: float = Field(default=0.0, ge=0.0, le=1.0)
    downloaded_bytes: int = 0
    total_bytes: Optional[int] = None
    message: Optional[str] = None
    auto_load: bool = True
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class LoadModelRequest(BaseModel):
    provider: str
    model_id: str
    revision: Optional[str] = None
    quantization: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)


class HookType(str, enum.Enum):
    PRE = "pre"
    POST = "post"
    TOKEN = "token"


class HookRegistrationRequest(BaseModel):
    id: str
    name: str
    types: List[HookType]
    description: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict)

    @root_validator(pre=True)
    def ensure_types(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        if not values.get("types"):
            raise ValueError("At least one hook type is required.")
        return values


class HookInfo(BaseModel):
    id: str
    name: str
    types: List[HookType]
    description: Optional[str] = None
    is_builtin: bool = False
    config: Dict[str, Any] = Field(default_factory=dict)


class ApiKeyRequest(BaseModel):
    api_key: str


class ApiKeyStatus(BaseModel):
    configured: bool
    source: Literal["env", "runtime", "none"]
