from __future__ import annotations

import asyncio
import uuid
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Deque, Dict, List, Optional

from huggingface_hub import snapshot_download

from ..core.config import Settings
from ..models.schemas import DownloadStatus, ModelDownloadJob, ModelDownloadRequest
from ..providers.registry import ProviderRegistry


@dataclass
class _DownloadJobState:
    request: ModelDownloadRequest
    id: str = field(default_factory=lambda: f"hfjob-{uuid.uuid4().hex}")
    status: DownloadStatus = DownloadStatus.QUEUED
    progress: float = 0.0
    downloaded_bytes: int = 0
    total_bytes: Optional[int] = None
    message: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    task: Optional[asyncio.Task] = None

    def to_model(self) -> ModelDownloadJob:
        return ModelDownloadJob(
            id=self.id,
            model_id=self.request.model_id,
            revision=self.request.revision,
            task=self.request.task,
            quantization=self.request.quantization,
            status=self.status,
            progress=round(self.progress, 4),
            downloaded_bytes=self.downloaded_bytes,
            total_bytes=self.total_bytes,
            message=self.message,
            auto_load=self.request.auto_load,
            created_at=self.created_at,
            updated_at=self.updated_at,
            completed_at=self.completed_at,
        )

    def update_progress(self, downloaded: int, total: Optional[int]) -> None:
        self.downloaded_bytes = downloaded
        self.total_bytes = total
        if total and total > 0:
            self.progress = min(1.0, downloaded / total)
        else:
            self.progress = 0.0
        self.updated_at = datetime.utcnow()


class HuggingFaceDownloadManager:
    """Coordinates background downloads from the HuggingFace Hub."""

    def __init__(self, settings: Settings, registry: ProviderRegistry) -> None:
        self.settings = settings
        self.registry = registry
        self._jobs: Dict[str, _DownloadJobState] = {}
        self._queue: Deque[str] = deque()
        self._active: Dict[str, asyncio.Task] = {}
        self._lock = asyncio.Lock()

    async def queue_download(self, payload: ModelDownloadRequest) -> ModelDownloadJob:
        job = _DownloadJobState(payload)
        async with self._lock:
            self._jobs[job.id] = job
            self._queue.append(job.id)
            self._ensure_capacity_locked()
        return job.to_model()

    async def list_downloads(self) -> List[ModelDownloadJob]:
        async with self._lock:
            return [
                job.to_model()
                for job in sorted(
                    self._jobs.values(),
                    key=lambda entry: entry.created_at,
                    reverse=True,
                )
            ]

    async def get_download(self, job_id: str) -> Optional[ModelDownloadJob]:
        async with self._lock:
            job = self._jobs.get(job_id)
            return job.to_model() if job else None

    async def cancel_download(self, job_id: str) -> Optional[ModelDownloadJob]:
        async with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return None
            if job.status in {
                DownloadStatus.COMPLETED,
                DownloadStatus.FAILED,
                DownloadStatus.CANCELLED,
            }:
                return job.to_model()

            if job.status == DownloadStatus.QUEUED:
                try:
                    self._queue.remove(job_id)
                except ValueError:
                    pass
                job.status = DownloadStatus.CANCELLED
                job.message = "Cancelled before download started."
                job.updated_at = datetime.utcnow()
                job.completed_at = datetime.utcnow()
                return job.to_model()

            task = self._active.get(job_id)
            if task:
                task.cancel()
            job.status = DownloadStatus.CANCELLED
            job.message = "Cancelling download..."
            job.updated_at = datetime.utcnow()
            return job.to_model()

    def _ensure_capacity_locked(self) -> None:
        while (
            len(self._active) < self.settings.huggingface_max_parallel_downloads
            and self._queue
        ):
            job_id = self._queue.popleft()
            job = self._jobs.get(job_id)
            if not job:
                continue
            job.status = DownloadStatus.RUNNING
            job.updated_at = datetime.utcnow()
            task = asyncio.create_task(self._run_job(job))
            job.task = task
            self._active[job_id] = task

    async def _run_job(self, job: _DownloadJobState) -> None:
        loop = asyncio.get_running_loop()

        def _progress_callback(progress: Any) -> None:
            current = getattr(progress, "current", None)
            total = getattr(progress, "total", None)
            loop.call_soon_threadsafe(
                self._update_progress_threadsafe,
                job.id,
                int(current or 0),
                int(total) if total is not None else None,
            )

        try:
            local_dir = Path(self.settings.huggingface_download_path).resolve()
            local_dir.mkdir(parents=True, exist_ok=True)
            token = job.request.token or self.settings.huggingface_token

            await asyncio.to_thread(
                snapshot_download,
                repo_id=job.request.model_id,
                revision=job.request.revision,
                local_dir=str(local_dir),
                local_dir_use_symlinks=False,
                resume_download=True,
                token=token,
                progress_callback=_progress_callback,
            )

            job.status = DownloadStatus.COMPLETED
            job.progress = 1.0
            job.updated_at = datetime.utcnow()
            job.completed_at = datetime.utcnow()
            job.message = None

            if job.request.auto_load:
                try:
                    await self.registry.load_model(
                        "huggingface",
                        job.request.model_id,
                        revision=job.request.revision,
                        quantization=job.request.quantization,
                    )
                    job.message = "Model downloaded and loaded successfully."
                except Exception as exc:  # pragma: no cover - defensive
                    job.message = f"Downloaded but failed to load automatically: {exc}"
            else:
                if job.message is None:
                    job.message = f"Model cached under {str(local_dir)}"
        except asyncio.CancelledError:
            job.status = DownloadStatus.CANCELLED
            job.message = "Download cancelled."
            job.completed_at = datetime.utcnow()
            job.updated_at = datetime.utcnow()
            return
        except Exception as exc:  # pragma: no cover - defensive
            job.status = DownloadStatus.FAILED
            job.message = str(exc)
            job.completed_at = datetime.utcnow()
            job.updated_at = datetime.utcnow()
        finally:
            async with self._lock:
                job.task = None
                self._active.pop(job.id, None)
                self._ensure_capacity_locked()

    def _update_progress_threadsafe(
        self, job_id: str, downloaded: int, total: Optional[int]
    ) -> None:
        job = self._jobs.get(job_id)
        if not job:
            return
        job.update_progress(downloaded, total)
