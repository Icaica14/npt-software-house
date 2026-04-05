# ADHD Assessment Dashboard

Interactive screening tool to help users assess likelihood of ADHD traits.

**Status:** MVP (Phase 1 in progress)

## What It Does

1. **User takes quiz** — 20-30 screening questions about attention, organization, impulsivity, etc.
2. **Real-time scoring** — Each answer weighted and accumulated
3. **Risk assessment** — Dashboard displays likelihood: Low / Moderate / High
4. **Clear disclaimer** — "This is not a medical diagnosis. Please consult a healthcare provider."

## Getting Started

### Setup (Backend)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn api.server:app --reload
# Server runs on http://localhost:8000
# API docs available at http://localhost:8000/docs
```

### Setup (Frontend)
```bash
cd frontend
cp .env.example .env
npm install
npm start
# Frontend runs on http://localhost:3000
```

### Run Tests
```bash
cd backend
pytest tests/ -v
```

### Test API Endpoints
```bash
# Get questions
curl http://localhost:8000/api/quiz/questions

# Submit answers (example: all 2s)
curl -X POST http://localhost:8000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
  }'

# Health check
curl http://localhost:8000/health
```

## Architecture

**Backend:** FastAPI
- `/api/quiz/questions` — GET quiz question bank
- `/api/quiz/submit` — POST answers, returns assessment

**Frontend:** React
- Question carousel component
- Result display component
- Responsive styling

**Scoring:** Simple algorithm
- Each question: 1-4 scale (1=not at all, 4=very much)
- Sum responses, normalize to 0-100
- Thresholds: <30=Low, 30-70=Moderate, >70=High

## Project Structure
```
adhd-assessment-dashboard/
├── .ROADMAP.md
├── README.md
├── backend/
│   ├── requirements.txt
│   ├── api/
│   │   ├── server.py
│   │   └── quiz.py
│   └── tests/
│       └── test_quiz.py
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── QuizFlow.js
│   │   │   └── ResultsPage.js
│   │   └── index.js
│   └── public/
│       └── index.html
└── docs/
    └── QUESTIONS.md
```

## Known Limitations

- **Not a medical diagnosis** — Screening tool only, requires professional evaluation
- **No data persistence** — Results shown but not saved (MVP)
- **No authentication** — Public endpoint (Phase 2 can add API keys)
- **Single language** — English only (Phase 2 can add i18n)
- **Static question bank** — Updates require redeployment (Phase 2 can make dynamic)

## Next Steps (Phase 2)

- [ ] User accounts and result history
- [ ] Multiple assessment types (ASRS, Connor, custom)
- [ ] Export results as PDF
- [ ] Recommendation engine (therapist finder, resources)
- [ ] Data anonymization for research
