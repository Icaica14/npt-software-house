"""
Configuration for ML models and reconstruction parameters.

SCAFFOLD STATUS: Placeholder configuration.
Production implementation will specify model weights, paths, and hyperparameters.
"""

import os

# Model paths (these will point to downloaded weights in production)
DEPTH_MODEL_PATH = os.getenv("DEPTH_MODEL_PATH", "./models/depth_model")
MESH_GEN_MODEL_PATH = os.getenv("MESH_GEN_MODEL_PATH", "./models/mesh_model")

# Reconstruction parameters
DEPTH_ESTIMATION_METHOD = "placeholder"  # e.g., "midas", "dpt", "custom"
MESH_GENERATION_METHOD = "placeholder"   # e.g., "marching_cubes", "poisson", "custom"

# Input/output configuration
MAX_INPUT_RESOLUTION = 1024  # Resize images to this max dimension
OUTPUT_MESH_FORMAT = "glb"   # GLTF Binary format

# Processing parameters
DEPTH_SCALE = 1.0            # Scaling factor for depth maps
MESH_SIMPLIFICATION = 0.5    # Mesh complexity reduction (0.0-1.0)

# Device configuration
DEVICE = os.getenv("DEVICE", "cpu")  # "cpu" or "cuda" or "mps"
