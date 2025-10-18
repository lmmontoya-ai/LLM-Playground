from functools import lru_cache
from typing import Literal, Optional

from pydantic import Field

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:  # pragma: no cover - fallback for Pydantic v1 installations
    from pydantic import BaseSettings  # type: ignore

    SettingsConfigDict = None  # type: ignore
    _MODEL_CONFIG = None
else:
    _MODEL_CONFIG = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    backend_host: str = Field(default="0.0.0.0")
    backend_port: int = Field(default=8000)
    frontend_url: str = Field(default="http://localhost:5173")

    openrouter_api_key: Optional[str] = Field(default=None)
    default_provider: Literal["openrouter", "huggingface"] = Field(default="openrouter")
    local_models_path: str = Field(default="./models")
    huggingface_download_path: str = Field(default="./models")
    huggingface_token: Optional[str] = Field(default=None)
    huggingface_max_parallel_downloads: int = Field(default=1, ge=1, le=4)
    device: Literal["cpu", "cuda", "mps"] = Field(default="cpu")

    enable_interpretability: bool = Field(default=True)

    if _MODEL_CONFIG is not None:
        model_config = _MODEL_CONFIG
    else:  # pragma: no cover - legacy Pydantic v1 configuration path

        class Config:
            env_file = ".env"
            env_file_encoding = "utf-8"
            case_sensitive = False


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings instance."""

    return Settings()  # type: ignore[arg-type]
