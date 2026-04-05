"""
Shared constants and configurations across frontend and backend.
"""

# File format configuration
ALLOWED_IMAGE_FORMATS = {"png", "jpg", "jpeg"}
OUTPUT_MESH_FORMAT = "glb"

# Size limits
MAX_IMAGE_SIZE_MB = 50
MAX_MESH_SIZE_MB = 200

# Job status constants
JOB_STATUS_PROCESSING = "processing"
JOB_STATUS_COMPLETED = "completed"
JOB_STATUS_FAILED = "failed"

# Error codes
ERROR_INVALID_FILE_FORMAT = "invalid_file_format"
ERROR_FILE_TOO_LARGE = "file_too_large"
ERROR_RECONSTRUCTION_FAILED = "reconstruction_failed"
ERROR_MESH_NOT_FOUND = "mesh_not_found"

# API endpoints
UPLOAD_ENDPOINT = "/upload"
MESH_ENDPOINT = "/mesh"
JOB_STATUS_ENDPOINT = "/job"
HEALTH_ENDPOINT = "/health"
