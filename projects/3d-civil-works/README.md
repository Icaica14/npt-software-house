# 3D Civil Works Reconstruction Platform

## What This Is

An MVP scaffold for a system that takes a user-uploaded 2D image of a civil structure or building and reconstructs a 3D model for interactive viewing.

**Current stage**: Implementation scaffold. Core functionality is stubbed and placeholders are marked clearly.

## Project Structure

```
3d-civil-works/
├── backend/               # Python/FastAPI backend
│   ├── api/              # Upload endpoints and request handlers
│   ├── pipeline/         # 3D reconstruction pipeline
│   └── models/           # Model configuration and weights
├── frontend/             # Web-based interactive viewer
│   ├── viewer/           # Three.js or Babylon.js viewer
│   └── public/           # Static assets
├── shared/               # Shared constants, types, utilities
├── tests/                # Test suite
├── docs/                 # Architecture and implementation docs
├── .env.example          # Environment configuration template
├── requirements.txt      # Python dependencies
├── package.json          # Frontend dependencies
└── README.md             # This file
```

## What Each Component Does

### Backend (`backend/`)
- **api/**: FastAPI upload endpoint that accepts image files
- **pipeline/**: Stub for image-to-3D reconstruction (computer vision, depth estimation, 3D mesh generation)
- **models/**: Configuration and paths to ML models (pretrained weights, configs)

### Frontend (`frontend/`)
- **viewer/**: Interactive 3D viewer (rotate, pan, zoom, inspect model)
- **public/**: Static HTML, assets, initial app shell

### Shared (`shared/`)
- Common constants, types, error codes
- Serialization schemas for models

## How to Run

### Prerequisites
- Python 3.9+
- Node.js 16+
- pip and npm

### Backend Setup and Run

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp ../.env.example .env
# Edit .env with your settings (API port, upload directory, etc.)

# Run the API server
python -m uvicorn api.server:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`.

### Frontend Setup and Run

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in terminal).

### Full Stack (Local Development)

```bash
# Terminal 1: Backend
cd backend && python -m uvicorn api.server:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev
```

Navigate to the frontend URL and upload an image to test the pipeline.

## How to Test

### Run Test Suite

```bash
cd tests
python -m pytest . -v
```

This runs:
- API endpoint smoke tests (upload, health check)
- Pipeline input validation tests
- Viewer integration tests (if applicable)

### Manual Testing

1. **Upload Test**: 
   - Open frontend at `http://localhost:5173`
   - Upload a test image from `tests/fixtures/sample-images/`
   - Verify the API receives the upload (check backend logs)

2. **Health Check**:
   ```bash
   curl http://localhost:8000/health
   ```
   Expected: `{"status": "ok"}`

3. **Viewer Test**:
   - After upload completes, verify the 3D viewer loads (currently displays placeholder)
   - Test viewer controls: rotate, pan, zoom

## Architecture

**Data Flow**:
1. User uploads 2D image via frontend
2. Frontend sends to backend upload endpoint
3. Backend validates and enqueues reconstruction job
4. Reconstruction pipeline processes image (PLACEHOLDER)
5. Pipeline outputs 3D mesh (GLB/GLTF format)
6. Frontend fetches and renders mesh in viewer
7. User can inspect model interactively

**Key Technologies** (scaffolded, not yet integrated):
- Backend: FastAPI, Python
- Frontend: React or vanilla JS + Three.js
- Reconstruction: OpenCV, PyTorch (stubs prepared)
- 3D Format: GLB/GLTF

## Current Limitations

- **Reconstruction pipeline**: Completely stubbed. No actual 3D reconstruction implemented.
- **Model inference**: No ML models integrated. Placeholder returns dummy mesh.
- **Viewer**: Basic placeholder. Loads and displays dummy geometry only.
- **Authentication**: None implemented. All endpoints are public.
- **Error handling**: Minimal. Production error codes/messages not in place.
- **Performance**: No optimization, caching, or background job queues (Celery, etc.).
- **Scale**: Single machine only. No distributed processing.
- **Supported formats**: Input expects PNG/JPEG. Output is GLB (hardcoded).
- **Infrastructure**: No cloud deployment (AWS, GCP, etc.) configured.

## Development Roadmap

### Phase 1: Pipeline Integration
- Integrate real 3D reconstruction algorithm (e.g., NeRF, MVS, or similar)
- Connect to pretrained model weights
- Add depth estimation
- Mesh generation and optimization

### Phase 2: Viewer Enhancement
- Implement full interactive controls (lighting, materials, inspection tools)
- Add model annotation/measurement tools
- Export functionality (GLB, USDZ, STL)

### Phase 3: Production Readiness
- Add authentication and API rate limiting
- Implement job queue and async processing
- Add database for job/model tracking
- Deploy to cloud infrastructure
- Performance optimization

## File Descriptions

- `backend/api/server.py` - FastAPI app and upload endpoint
- `backend/api/models.py` - Request/response schemas
- `backend/pipeline/reconstruct.py` - Reconstruction pipeline stub
- `backend/models/config.py` - Model configuration
- `frontend/viewer/index.html` - Viewer entry point
- `frontend/viewer/app.js` - Main application logic
- `frontend/viewer/viewer.js` - Three.js viewer wrapper
- `tests/test_api.py` - API endpoint tests
- `tests/test_pipeline.py` - Pipeline tests
- `shared/constants.py` - Shared constants and configs
- `.env.example` - Environment template

## Next Steps

1. **Integrate reconstruction algorithm**: Choose and integrate a 3D reconstruction method
2. **Connect ML models**: Add pretrained weights and inference code
3. **Implement viewer interactions**: Full rotation, lighting, export
4. **Add persistence**: Database for tracking uploads, models, users
5. **Deploy**: Docker, cloud infrastructure, production scaling

## Questions?

See `/docs/ARCHITECTURE.md` for detailed technical notes on the reconstruction pipeline design.
