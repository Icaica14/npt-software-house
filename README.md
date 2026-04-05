# DHDA — ADHD Screening Quiz Backend

FastAPI backend serving the ADHD screening question bank.

## Requirements

- Python 3.11+

## Setup

```bash
pip install -r requirements.txt
```

## Running the server

```bash
uvicorn backend.api.server:app --host 0.0.0.0 --port 8000 --reload
```

Server starts at `http://localhost:8000`.

## API

### `GET /api/quiz/questions`

Returns all 20 screening questions.

**Response** `200 OK`

```json
[
  {
    "id": 1,
    "text": "How often do you have trouble wrapping up the final details...",
    "category": "inattention"
  },
  ...
]
```

Each item has:

| Field | Type | Values |
|-------|------|--------|
| `id` | integer | 1–20 |
| `text` | string | Question text |
| `category` | string | `"inattention"` or `"hyperactivity"` |

---

### `GET /api/quiz/questions/{id}`

Returns a single question by its numeric id.

**Response** `200 OK` — question object as above.
**Response** `404 Not Found` — `{"detail": "Question {id} not found"}`.

---

### `GET /health`

Health check.

**Response** `200 OK` — `{"status": "ok"}`.

---

## Interactive docs

FastAPI auto-generates OpenAPI docs at `http://localhost:8000/docs`.

## Running tests

```bash
pytest tests/
```

## Limitations

- Questions are in-memory only; no persistence layer.
- No authentication or rate-limiting.
- Scoring logic not yet implemented (see future milestones).
