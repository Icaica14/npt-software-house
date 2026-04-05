#!/usr/bin/env python3
"""
CEO Autonomous Issue Creation Script
Creates Phase 1 implementation tasks from IMPLEMENTATION.md roadmap
Assigns all to CTO for delegation to specialist engineers
"""

import os
import json
import requests
import sys

# Get environment variables (auto-injected by Paperclip)
API_URL = os.environ.get('PAPERCLIP_API_URL', 'http://127.0.0.1:3100')
API_KEY = os.environ.get('PAPERCLIP_API_KEY')
COMPANY_ID = os.environ.get('PAPERCLIP_COMPANY_ID')
CEO_ID = os.environ.get('PAPERCLIP_AGENT_ID')

# CTO agent ID (from company setup)
CTO_ID = "007c4ce4-299c-417c-b3e0-f1eee446e1c8"

# Phase 1 implementation tasks
PHASE1_TASKS = [
    {
        "title": "Phase 1.1: ML pipeline Docker image",
        "description": """## ML Pipeline Docker Image

Build Docker image for 3D reconstruction ML pipeline.

**Requirements:**
- COLMAP (structure-from-motion) for image matching and pose estimation
- OpenMVS (multi-view stereo) for dense reconstruction
- Open3D for point cloud processing and mesh generation
- Python entry point: `reconstruct.py` for pipeline orchestration
- Input: directory of JPEG images
- Output: GLB model file + point cloud + metadata JSON

**Success Criteria:**
- Docker image builds successfully
- Can reconstruct a test dataset (civil works sample)
- Output GLB file is valid and viewable
- Handles single image + multi-view gracefully
- Documents limitations (GPU requirements, metric scale, etc.)

**Limitations to document:**
- GPU required for practical use
- Metric scale needs GPS EXIF or calibration markers
- Textureless surfaces degrade quality
- Processing time ~minutes per dataset

See `/projects/3d-civil-works/IMPLEMENTATION.md` for full context."""
    },
    {
        "title": "Phase 1.2: Fastify API scaffold",
        "description": """## Fastify API Scaffold

Build core REST API backend for 3D reconstruction service.

**Requirements:**
- Fastify framework (TypeScript)
- Prisma ORM with PostgreSQL schema
- Image upload endpoint: POST /upload (multipart form-data)
- Local filesystem storage for MVP (no S3 yet)
- Database: track jobs, images, models, users
- Error handling and validation

**API Endpoints:**
- POST /upload - accept JPEG images
- GET /jobs/:id - check reconstruction status
- GET /models/:id - retrieve GLB file
- GET /metadata/:id - retrieve model metadata

**Success Criteria:**
- API starts and listens on port 3000
- Image upload stores files correctly
- Database schema set up and migrations run
- API documentation in README
- Setup instructions for local dev

See `/projects/3d-civil-works/IMPLEMENTATION.md` for full context."""
    },
    {
        "title": "Phase 1.3: BullMQ worker for job processing",
        "description": """## BullMQ Worker for Job Processing

Build async job queue for running ML reconstruction pipeline.

**Requirements:**
- BullMQ for job management
- Redis for queue storage (local dev)
- Worker process that dequeues reconstruction jobs
- Integration with ML Docker image
- Job status tracking (pending, running, done, failed)
- Error handling and retry logic

**Worker Flow:**
1. Dequeue job from queue
2. Call ML pipeline Docker image with image set
3. Poll for completion
4. Save GLB output to filesystem
5. Update job status in database
6. Update model metadata

**Success Criteria:**
- Worker starts and connects to queue
- Can process jobs end-to-end
- Status updates correctly
- Failures are logged and retryable
- Documentation in README

See `/projects/3d-civil-works/IMPLEMENTATION.md` for full context."""
    },
    {
        "title": "Phase 1.4: Model retrieval endpoints",
        "description": """## Model Retrieval Endpoints

Expose reconstructed 3D models and metadata to frontend.

**Requirements:**
- GET /models/:id/file - serve GLB file
- GET /models/:id/metadata - serve JSON metadata
- GET /models/:id/thumbnail - optional preview image
- Content-Type headers correct
- Cache headers for client optimization
- Error handling (model not found, etc.)

**Response Format:**

Metadata JSON:
```json
{
  "id": "model-uuid",
  "createdAt": "2026-04-05T12:00:00Z",
  "inputImageCount": 12,
  "reconstructionTime": 45,
  "vertexCount": 250000,
  "triangleCount": 125000,
  "scale": "metric",
  "limitations": ["GPU required", "metric scale needs GPS"]
}
```

**Success Criteria:**
- GLB files download successfully
- Metadata accurate and complete
- Performance acceptable (large models)
- Documentation in README

See `/projects/3d-civil-works/IMPLEMENTATION.md` for full context."""
    },
    {
        "title": "Phase 1.5: Three.js viewer with React",
        "description": """## Three.js Viewer with React

Build interactive 3D model viewer in browser.

**Requirements:**
- React + React Three Fiber (R3F)
- Three.js for 3D rendering
- Load and display GLB models
- Camera controls: orbit, zoom, pan
- Model measurement tools (distance, area, volume)
- Layer toggle for model components
- Export capabilities (screenshot, download GLB)

**Features:**
- Responsive canvas
- Touch support (mobile)
- Performance optimization (LOD, frustum culling)
- Accessibility basics

**Success Criteria:**
- App starts and loads models
- Orbit controls work smoothly
- Measurement tools are accurate
- All export formats work
- Performance acceptable on average hardware
- Documentation and setup in README

See `/projects/3d-civil-works/IMPLEMENTATION.md` for full context."""
    },
    {
        "title": "Phase 1.6: Docker Compose orchestration",
        "description": """## Docker Compose Orchestration

Set up multi-container local development environment.

**Requirements:**
- Docker Compose file defining all services
- PostgreSQL database container
- Redis for job queue
- Fastify API container
- ML pipeline container
- Frontend development server

**Services:**
```yaml
postgres:
  image: postgres:15
  environment:
    POSTGRES_PASSWORD: dev
    POSTGRES_DB: 3d_civil_works

redis:
  image: redis:7-alpine

api:
  build: ./backend
  ports:
    - "3000:3000"
  depends_on:
    - postgres
    - redis

ml:
  build: ./ml
  volumes:
    - ./data:/data

frontend:
  build: ./frontend
  ports:
    - "3001:3001"
```

**Success Criteria:**
- Single `docker-compose up` starts full stack
- All services healthy and connected
- Data persists between restarts
- Documentation in README

See `/projects/3d-civil-works/IMPLEMENTATION.md` for full context."""
    },
    {
        "title": "Phase 1.7: Bull Board queue dashboard",
        "description": """## Bull Board Queue Dashboard

Build monitoring interface for reconstruction jobs.

**Requirements:**
- Bull Board UI for BullMQ queue visualization
- Dashboard shows: queued, running, completed, failed jobs
- Job details: input images, processing time, output model
- Manual job retry capability
- Real-time updates (WebSocket or polling)

**Dashboard Features:**
- Job list with status indicators
- Filter by status
- Job detail view
- Retry/cancel controls
- Queue statistics

**Success Criteria:**
- Dashboard accessible at /bull-board
- Shows all job states correctly
- Real-time updates work
- Can retry failed jobs
- Documentation in README

See `/projects/3d-civil-works/IMPLEMENTATION.md` for full context."""
    }
]

PROJECT_ID = "a31223f4-5780-437f-a81b-98fee124a1ac"  # 3D civil works project

def create_issue(title, description, assignee_id):
    """Create an issue via Paperclip API"""
    url = f"{API_URL}/api/companies/{COMPANY_ID}/issues"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "X-Paperclip-Run-Id": os.environ.get('PAPERCLIP_RUN_ID', 'cli-run')
    }

    data = {
        "title": title,
        "description": description,
        "status": "todo",
        "priority": "high",
        "projectId": PROJECT_ID,
        "assigneeAgentId": assignee_id
    }

    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        response.raise_for_status()
        result = response.json()
        return result.get('identifier'), result.get('id')
    except requests.exceptions.RequestException as e:
        print(f"❌ Error creating issue: {e}")
        return None, None

def main():
    print("🚀 CEO Autonomous Phase 1 Issue Creation")
    print(f"Company: {COMPANY_ID}")
    print(f"Project: {PROJECT_ID}")
    print(f"Assigning to CTO: {CTO_ID}")
    print()

    if not API_KEY:
        print("❌ PAPERCLIP_API_KEY not set. Exiting.")
        sys.exit(1)

    if not COMPANY_ID:
        print("❌ PAPERCLIP_COMPANY_ID not set. Exiting.")
        sys.exit(1)

    created = []
    failed = []

    for i, task in enumerate(PHASE1_TASKS, 1):
        print(f"Creating issue {i}/{len(PHASE1_TASKS)}: {task['title']}...", end=" ")
        identifier, issue_id = create_issue(task['title'], task['description'], CTO_ID)

        if identifier:
            print(f"✅ {identifier}")
            created.append((identifier, task['title']))
        else:
            print("❌ Failed")
            failed.append(task['title'])

    print()
    print("=" * 60)
    print(f"✅ Created {len(created)} Phase 1 implementation issues")
    print(f"❌ Failed: {len(failed)}")
    print()

    if created:
        print("Created issues:")
        for identifier, title in created:
            print(f"  - {identifier}: {title}")

    if failed:
        print("\nFailed issues:")
        for title in failed:
            print(f"  - {title}")

    print()
    print("=" * 60)
    print("✅ Phase 1 Implementation Ready")
    print()
    print("Next: CTO will review and delegate to specialists")
    print("- ML Engineer: Phase 1.1 (ML pipeline)")
    print("- Software Engineer: Phase 1.2, 1.3, 1.4, 1.7 (Backend)")
    print("- UI Developer: Phase 1.5 (Frontend)")
    print("- Delivery Manager: Phase 1.6 (Infrastructure)")

if __name__ == "__main__":
    main()
