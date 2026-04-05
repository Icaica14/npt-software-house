# 3D Civil Works Architecture

## System Overview

The platform reconstructs 3D models from 2D images of buildings and civil structures.

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │      │   Backend    │      │  Storage     │
│              │      │              │      │              │
│  • Viewer    │──→   │  • API       │──→   │  • GLB files │
│  • Upload    │  ←──│  • Pipeline  │  ←──│  • Configs   │
└──────────────┘      └──────────────┘      └──────────────┘
```

## Components

### Frontend (Vanilla JS + Three.js)

**Purpose**: User-facing web application for image upload and 3D model inspection.

**Key Files**:
- `index.html` - App shell and UI layout
- `app.js` - Main application logic, upload handling, viewer orchestration
- `styles.css` - Styling and responsive design
- `viewer.js` - Three.js wrapper for 3D rendering (embedded in app.js for MVP)

**Responsibilities**:
- Accept image uploads (drag-drop or click)
- Send to backend API
- Display loading/status messages
- Render 3D model with interactive controls (rotate, zoom, pan)
- Provide download option for mesh

**Technologies**:
- Vanilla JavaScript (no build step for MVP)
- Three.js for 3D rendering
- Fetch API for HTTP communication
- CSS Grid/Flexbox for layout

### Backend (FastAPI + Python)

**Purpose**: API server, image validation, 3D reconstruction pipeline.

**Key Files**:
- `api/server.py` - FastAPI app, endpoints
- `api/models.py` - Pydantic request/response schemas
- `pipeline/reconstruct.py` - Reconstruction pipeline (PLACEHOLDER)
- `pipeline/config.py` - Model and pipeline configuration

**Endpoints**:
- `POST /upload` - Accept image file, trigger reconstruction
- `GET /mesh/{job_id}` - Retrieve GLB mesh file
- `GET /job/{job_id}` - Query job status
- `GET /health` - Health check

**Responsibilities**:
- Validate uploaded images
- Persist uploads to disk
- Coordinate reconstruction pipeline
- Manage job lifecycle
- Serve mesh files

**Technologies**:
- FastAPI web framework
- Pydantic for validation
- Python 3.9+

### Reconstruction Pipeline (PLACEHOLDER)

**Purpose**: Convert 2D image to 3D model.

**Current Status**: STUBBED. Returns dummy cube mesh.

**Real Implementation** (roadmap):
1. **Input Processing**
   - Load and validate image
   - Preprocess (resize, normalize, etc.)

2. **Depth Estimation**
   - Run depth estimation model (e.g., MiDaS, DPT)
   - Produces depth map

3. **3D Reconstruction**
   - Multi-view stereo (MVS) or depth-based meshing
   - Convert depth to point cloud
   - Mesh generation (e.g., Poisson reconstruction, marching cubes)

4. **Mesh Optimization**
   - Simplification
   - Smoothing
   - Decimation

5. **Output**
   - Export to GLB/GLTF format
   - Store on disk

**Technologies** (planned):
- OpenCV for image processing
- PyTorch for ML models
- Open3D or trimesh for 3D operations
- trimesh or Assimp for GLB export

## Data Flow

### User Upload

```
User selects image
    ↓
Frontend validates file type
    ↓
Frontend POST /upload (multipart/form-data)
    ↓
Backend receives and saves file
    ↓
Backend triggers reconstruct_from_image()
    ↓
Pipeline processes and generates GLB
    ↓
Backend returns mesh_url
    ↓
Frontend fetches mesh from GET /mesh/{job_id}
    ↓
Three.js loads and renders GLB
    ↓
User inspects 3D model
```

## Configuration

- **Environment Variables**: `.env` file (template: `.env.example`)
- **Model Paths**: Configured in `backend/pipeline/config.py`
- **Input/Output Directories**: UPLOAD_DIR, OUTPUT_DIR environment variables
- **Processing Parameters**: Resolution, simplification, depth scale

## Scalability (Future)

**Current (MVP)**: Single-machine, synchronous processing.

**Roadmap**:
1. **Async Job Queue** (Celery + Redis)
   - Non-blocking upload
   - Job status polling
   - Background processing

2. **Database** (PostgreSQL)
   - Track jobs, users, models
   - Persist metadata
   - Query history

3. **Cloud Storage** (AWS S3, GCP Cloud Storage)
   - Off-machine file storage
   - Scalable uploads/downloads

4. **Distributed Processing**
   - Multiple workers for pipeline
   - GPU acceleration
   - Model serving (TorchServe, TFServing)

5. **Web Infrastructure**
   - Load balancer
   - API gateway
   - CDN for mesh downloads

## Security Considerations

**Current (MVP)**:
- No authentication (PLACEHOLDER)
- Public CORS (PLACEHOLDER)
- File validation only (extension + basic checks)

**Roadmap**:
- JWT/OAuth authentication
- Rate limiting per user
- File size limits
- Virus scanning
- HTTPS/TLS
- CORS restriction to known domains

## Testing

**Unit Tests**:
- API endpoint tests (`tests/test_api.py`)
- Pipeline tests (`tests/test_pipeline.py`)

**Run tests**:
```bash
cd tests
python -m pytest . -v
```

**Future**:
- Integration tests (full pipeline)
- End-to-end tests (frontend + backend)
- Performance/load tests
- Model accuracy benchmarks

## Limitations (MVP)

- No ML model integrated
- Dummy mesh output
- Synchronous processing (blocks on upload)
- No job persistence
- No authentication
- Single file format (PNG/JPEG input, GLB output)
- No error recovery or retry logic
- Limited viewer features (no materials, lighting controls, annotations)

## Next Steps

1. **Integrate depth estimation model** (MiDaS or equivalent)
2. **Implement mesh generation** from depth maps
3. **Add async job queue** for scalability
4. **Implement database** for persistence
5. **Enhance viewer** with more interactive features
6. **Add cloud deployment** (Docker, K8s, serverless)
