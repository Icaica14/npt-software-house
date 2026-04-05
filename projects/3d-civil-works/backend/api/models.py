"""
Pydantic models for API requests and responses.
"""

from pydantic import BaseModel
from typing import Optional


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str


class UploadResponse(BaseModel):
    """Response from image upload endpoint."""
    job_id: str
    filename: str
    status: str  # "processing" or "completed"
    mesh_url: Optional[str] = None  # URL to fetch GLB mesh
    message: Optional[str] = None


class JobStatusResponse(BaseModel):
    """Response for job status query."""
    job_id: str
    status: str  # "processing", "completed", or "failed"
    mesh_url: Optional[str] = None
    error: Optional[str] = None
