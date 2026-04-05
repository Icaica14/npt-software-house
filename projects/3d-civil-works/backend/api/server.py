"""
FastAPI backend server for 3D civil works reconstruction.

SCAFFOLD STATUS: Minimal MVP. Core endpoints stubbed.
- Upload endpoint accepts image files
- Pipeline integration is placeholder
- Output is dummy 3D mesh (GLB format)
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from pathlib import Path

from .models import UploadResponse, HealthResponse

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from pipeline.reconstruct import reconstruct_from_image
from shared.constants import MAX_IMAGE_SIZE_MB, ALLOWED_IMAGE_FORMATS

# Configuration
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./outputs")
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_FORMATS
MAX_FILE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

# Ensure directories exist
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

# Create FastAPI app
app = FastAPI(
    title="3D Civil Works API",
    description="Reconstruct 3D models from 2D building images",
    version="0.1.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # PLACEHOLDER: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok", version="0.1.0")


@app.post("/upload", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image for 3D reconstruction.

    SCAFFOLD STATUS: Accepts upload, validates format, triggers pipeline.
    Pipeline itself is stubbed and returns dummy mesh.
    """

    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type .{file_ext} not allowed. Allowed: {ALLOWED_EXTENSIONS}"
        )

    # Read and validate file size
    contents = await file.read()
    file_size = len(contents)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File size {file_size / 1024 / 1024:.1f}MB exceeds maximum of {MAX_IMAGE_SIZE_MB}MB"
        )

    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # Validate file is actually an image (basic validation via PIL)
    try:
        from PIL import Image
        from io import BytesIO
        Image.open(BytesIO(contents)).verify()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid image"
        )

    # Generate job ID
    job_id = str(uuid.uuid4())

    # Sanitize filename to prevent path traversal
    safe_filename = Path(file.filename).name
    if not safe_filename or safe_filename.startswith('.'):
        safe_filename = f"upload_{job_id}"

    # Save uploaded file
    input_path = Path(UPLOAD_DIR) / f"{job_id}_{safe_filename}"
    try:
        with open(input_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Trigger reconstruction pipeline (PLACEHOLDER: Async job queue would go here)
    try:
        output_mesh_path = reconstruct_from_image(str(input_path), job_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reconstruction failed: {str(e)}")

    return UploadResponse(
        job_id=job_id,
        filename=file.filename,
        status="completed",  # PLACEHOLDER: Would be "processing" with async queue
        mesh_url=f"/mesh/{job_id}",
        message="Image uploaded and reconstruction completed (PLACEHOLDER: dummy mesh)"
    )


@app.get("/mesh/{job_id}")
async def get_mesh(job_id: str):
    """
    Retrieve the 3D mesh (GLB format) for a job.

    SCAFFOLD STATUS: Returns mesh file if it exists.
    """
    mesh_path = Path(OUTPUT_DIR) / f"{job_id}.glb"

    if not mesh_path.exists():
        raise HTTPException(status_code=404, detail=f"Mesh not found for job {job_id}")

    return FileResponse(
        path=mesh_path,
        media_type="model/gltf-binary",
        filename=f"model_{job_id}.glb"
    )


@app.get("/job/{job_id}")
async def get_job_status(job_id: str):
    """
    Get the status of a reconstruction job.

    SCAFFOLD STATUS: Returns dummy status. Real implementation would query database.
    """
    mesh_path = Path(OUTPUT_DIR) / f"{job_id}.glb"

    if mesh_path.exists():
        status = "completed"
        mesh_url = f"/mesh/{job_id}"
    else:
        # Check if job ID looks valid (UUID format)
        try:
            uuid.UUID(job_id)
            status = "processing"  # Valid job ID but mesh not ready
            mesh_url = None
        except ValueError:
            # Invalid job ID format
            status = "not_found"
            mesh_url = None

    return JSONResponse({
        "job_id": job_id,
        "status": status,
        "mesh_url": mesh_url
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
