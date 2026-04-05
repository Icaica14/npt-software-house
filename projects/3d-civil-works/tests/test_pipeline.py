"""
Reconstruction pipeline tests.

SCAFFOLD STATUS: Basic validation tests.
Production tests would include:
- Real image inputs
- Depth estimation accuracy
- Mesh quality metrics
- Performance benchmarks
"""

import pytest
import sys
from pathlib import Path
import os
import tempfile
from PIL import Image
import io

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from backend.pipeline.reconstruct import reconstruct_from_image


@pytest.fixture
def temp_dirs():
    """Create temporary directories for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        upload_dir = Path(tmpdir) / "uploads"
        output_dir = Path(tmpdir) / "outputs"
        upload_dir.mkdir()
        output_dir.mkdir()

        os.environ["UPLOAD_DIR"] = str(upload_dir)
        os.environ["OUTPUT_DIR"] = str(output_dir)

        yield {
            "upload": upload_dir,
            "output": output_dir,
            "tmp": tmpdir
        }


def create_test_image(path: Path, format: str = "JPEG"):
    """Create a minimal test image."""
    img = Image.new("RGB", (256, 256), color="red")
    img.save(path, format=format)


def test_reconstruct_nonexistent_image():
    """Test reconstruction with non-existent image."""
    with pytest.raises(FileNotFoundError):
        reconstruct_from_image("/nonexistent/image.jpg", "test-job")


def test_reconstruct_valid_image(temp_dirs):
    """Test reconstruction with valid image."""
    # Create test image
    image_path = temp_dirs["upload"] / "test.jpg"
    create_test_image(image_path)

    # Run reconstruction
    output_path = reconstruct_from_image(str(image_path), "test-job-123")

    # Verify output
    assert Path(output_path).exists()
    assert output_path.endswith(".glb")
    assert Path(output_path).stat().st_size > 0  # File is not empty


def test_reconstruct_output_is_valid_glb(temp_dirs):
    """Test that reconstruction output is valid GLB format."""
    # Create test image
    image_path = temp_dirs["upload"] / "test.jpg"
    create_test_image(image_path)

    # Run reconstruction
    output_path = reconstruct_from_image(str(image_path), "test-job-456")

    # Check GLB header
    with open(output_path, "rb") as f:
        magic = f.read(4)
        assert magic == b"glTF", "Output file is not valid GLB (wrong magic bytes)"

        # Check version (should be 2.0)
        version = int.from_bytes(f.read(4), "little")
        assert version == 2, "GLB version should be 2"

        # Check file size
        file_size = int.from_bytes(f.read(4), "little")
        actual_size = Path(output_path).stat().st_size
        assert file_size == actual_size, "GLB file size mismatch"


def test_reconstruct_multiple_jobs(temp_dirs):
    """Test reconstruction of multiple jobs simultaneously."""
    jobs = []

    # Create and reconstruct multiple images
    for i in range(3):
        image_path = temp_dirs["upload"] / f"test_{i}.jpg"
        create_test_image(image_path)

        output_path = reconstruct_from_image(str(image_path), f"job-{i}")
        jobs.append(output_path)

    # Verify all outputs exist
    for output_path in jobs:
        assert Path(output_path).exists()
        assert Path(output_path).stat().st_size > 0
