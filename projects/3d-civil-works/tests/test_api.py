"""
API endpoint tests for 3D civil works backend.

SCAFFOLD STATUS: Smoke tests for basic functionality.
Production tests would include comprehensive error handling,
edge cases, and integration tests.
"""

import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from backend.api.server import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_upload_no_file(client):
    """Test upload endpoint with no file."""
    response = client.post("/upload")
    assert response.status_code == 422  # Unprocessable Entity


def test_upload_invalid_format(client):
    """Test upload endpoint with invalid file format."""
    invalid_file = ("test.txt", b"invalid file content", "text/plain")
    response = client.post("/upload", files={"file": invalid_file})
    assert response.status_code == 400
    assert "not allowed" in response.json()["detail"]


def test_upload_valid_image(client, tmp_path):
    """Test upload endpoint with valid image."""
    import os
    from io import BytesIO
    from PIL import Image

    os.environ["OUTPUT_DIR"] = str(tmp_path)

    # Create a real valid JPEG image in memory
    img = Image.new("RGB", (256, 256), color="red")
    img_bytes = BytesIO()
    img.save(img_bytes, format="JPEG")
    image_content = img_bytes.getvalue()

    test_file = ("test.jpg", image_content, "image/jpeg")
    response = client.post("/upload", files={"file": test_file})

    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    assert data["filename"] == "test.jpg"
    assert data["status"] in ["processing", "completed"]
    assert "mesh_url" in data


def test_mesh_not_found(client):
    """Test retrieving non-existent mesh."""
    response = client.get("/mesh/nonexistent-job-id")
    assert response.status_code == 404


def test_job_status(client, tmp_path):
    """Test job status endpoint."""
    import os
    os.environ["OUTPUT_DIR"] = str(tmp_path)

    response = client.get("/job/test-job-123")
    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    assert "status" in data
    assert data["job_id"] == "test-job-123"
