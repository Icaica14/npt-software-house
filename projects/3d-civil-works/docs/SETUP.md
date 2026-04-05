# Setup Instructions for 3D Civil Works MVP

## Prerequisites

- Python 3.9+
- Node.js 16+
- pip (Python package manager)
- npm (Node package manager)
- Git (optional, for version control)

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- FastAPI: Web framework
- Uvicorn: ASGI server
- Pydantic: Data validation
- Pillow: Image processing
- NumPy: Numerical computing

### 2. Create Environment File

```bash
cp ../.env.example .env
```

Edit `.env` if you need to customize:
- `API_PORT` (default: 8000)
- `UPLOAD_DIR` (default: ./uploads)
- `OUTPUT_DIR` (default: ./outputs)
- `DEVICE` (default: cpu, options: cpu, cuda, mps)

### 3. Create Required Directories

```bash
mkdir -p uploads outputs models
```

These directories will store:
- `uploads/` - User-uploaded images
- `outputs/` - Generated GLB mesh files
- `models/` - ML model weights (to be added later)

### 4. Run Backend Server

```bash
python -m uvicorn api.server:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

The API is now available at `http://localhost:8000`.

### 5. Verify Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "ok", "version": "0.1.0"}
```

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd ../frontend
npm install
```

This installs:
- `http-server` - Simple local web server

### 2. Run Frontend Server

```bash
npm run dev
```

Expected output:
```
Starting up http-server, serving public directory...
Available on:
  http://127.0.0.1:5173
  ...
```

Open `http://localhost:5173` in your browser.

## Full Stack Local Development

**Terminal 1: Backend**
```bash
cd backend
python -m uvicorn api.server:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```

**Browser**: Open http://localhost:5173

## Testing

### Run All Tests

```bash
# From project root
cd tests
python -m pytest . -v
```

### Run Specific Test File

```bash
python -m pytest test_api.py -v
```

### Run Specific Test

```bash
python -m pytest test_api.py::test_health_check -v
```

## Troubleshooting

### Backend won't start: "Address already in use"

Port 8000 is already in use. Either:
1. Kill the process using port 8000
2. Change the port: `--port 8001`

### Frontend can't connect to backend: CORS error

Ensure backend is running and the CORS middleware is configured correctly in `backend/api/server.py`.

Current setup allows all origins (for development). Restrict in production.

### Image upload fails: "No such file or directory"

Ensure the `uploads/` and `outputs/` directories exist:
```bash
cd backend
mkdir -p uploads outputs
```

### Tests fail to find modules

Ensure you're running pytest from the `tests/` directory:
```bash
cd tests
python -m pytest . -v
```

## Development Workflow

1. Make changes to backend or frontend code
2. Backend auto-reloads due to `--reload` flag
3. Frontend served by http-server (refresh browser to see changes)
4. Run tests to verify changes: `pytest . -v`

## Next Steps

1. **Integrate ML models**: Add depth estimation and mesh generation code
2. **Connect real reconstruction pipeline**: Replace placeholder in `backend/pipeline/reconstruct.py`
3. **Add database**: Track jobs, users, and models
4. **Implement async processing**: Use Celery + Redis for background jobs
5. **Deploy to cloud**: Docker, Kubernetes, AWS/GCP
