# Backend server for ADHD Assessment Dashboard

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from api.quiz import QUESTIONS, calculate_score

app = FastAPI(title="ADHD Assessment API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuizSubmission(BaseModel):
    answers: List[int]

@app.get("/api/quiz/questions")
async def get_questions():
    """Return question bank for quiz."""
    return {
        "questions": QUESTIONS,
        "count": len(QUESTIONS),
        "scale": {"min": 1, "max": 4, "labels": ["Never", "Sometimes", "Often", "Very Often"]}
    }

@app.post("/api/quiz/submit")
async def submit_quiz(submission: QuizSubmission):
    """Submit answers and return assessment."""
    try:
        assessment = calculate_score(submission.answers)
        return {
            "success": True,
            "assessment": assessment,
            "disclaimer": "This is a screening tool only. It is not a medical diagnosis. Please consult a healthcare provider for professional evaluation."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health():
    """Health check."""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
