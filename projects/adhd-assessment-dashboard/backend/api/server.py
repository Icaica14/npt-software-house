# Backend server for ADHD Assessment Dashboard
# TODO: Implement FastAPI app with:
# - GET /api/quiz/questions — return question bank
# - POST /api/quiz/submit — accept answers, return assessment
# - CORS enabled for frontend

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ADHD Assessment API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/quiz/questions")
async def get_questions():
    """Return question bank for quiz."""
    # TODO: Implement question endpoint
    pass

@app.post("/api/quiz/submit")
async def submit_quiz(answers: dict):
    """Submit answers and return assessment."""
    # TODO: Implement scoring algorithm
    # Input: {"answers": [1, 2, 1, ...], "version": "v1"}
    # Output: {"score": 45, "risk_level": "moderate", "inattention": 22, "hyperactivity": 23}
    pass

@app.get("/health")
async def health():
    """Health check."""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
