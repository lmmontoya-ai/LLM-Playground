from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from ..core.dependencies import get_hf_download_manager
from ..models.schemas import ModelDownloadJob, ModelDownloadRequest
from ..services.hf_downloads import HuggingFaceDownloadManager

router = APIRouter(prefix="/api/huggingface", tags=["huggingface"])


@router.get("/downloads", response_model=List[ModelDownloadJob])
async def list_downloads(
    manager: HuggingFaceDownloadManager = Depends(get_hf_download_manager),
) -> List[ModelDownloadJob]:
    return await manager.list_downloads()


@router.post(
    "/downloads",
    response_model=ModelDownloadJob,
    status_code=status.HTTP_202_ACCEPTED,
)
async def start_download(
    payload: ModelDownloadRequest,
    manager: HuggingFaceDownloadManager = Depends(get_hf_download_manager),
) -> ModelDownloadJob:
    return await manager.queue_download(payload)


@router.delete(
    "/downloads/{job_id}",
    response_model=ModelDownloadJob,
)
async def cancel_download(
    job_id: str,
    manager: HuggingFaceDownloadManager = Depends(get_hf_download_manager),
) -> ModelDownloadJob:
    job = await manager.cancel_download(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Download job not found.")
    return job
