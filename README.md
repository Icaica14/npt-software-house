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

---

### `POST /api/quiz/submit`

Submit answers for all 20 questions. Returns a scored result.

**Request body**

```json
{
  "answers": {
    "1": 3,
    "2": 1,
    ...
    "20": 2
  }
}
```

Keys are question ids (1–20); values are 1–4 (Never → Very Often).

**Response** `200 OK`

```json
{
  "inattention_score": 24,
  "hyperactivity_score": 18,
  "total_score": 42,
  "risk_level": "moderate"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `inattention_score` | integer | Sum of questions 1–10 (10–40) |
| `hyperactivity_score` | integer | Sum of questions 11–20 (10–40) |
| `total_score` | integer | Combined score (20–80) |
| `risk_level` | string | `"low"` (≤35), `"moderate"` (36–60), or `"high"` (>60) |

**Response** `422 Unprocessable Entity` — missing or invalid answers.

---

## Frontend

### Setup

```bash
cd frontend
npm install
```

### Running the dev server

```bash
npm start
```

The app proxies `/api` requests to `http://localhost:8000` (set in `package.json`).

### Full-stack flow

1. App loads questions from `GET /api/quiz/questions`.
2. User answers all 20 questions step-by-step in `QuizFlow`.
3. On submit, answers are POSTed to `POST /api/quiz/submit`.
4. `ResultsPage` displays total score, inattention/hyperactivity breakdown, risk level with colour-coding, interpretation text, and a medical disclaimer.
5. User can retake the quiz.

---

## Limitations

- Questions are in-memory only; no persistence layer.
- No authentication or rate-limiting.
