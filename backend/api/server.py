"""FastAPI application for the ADHD screening quiz backend."""

from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.api.quiz import Question, get_question_by_id, get_questions

app = FastAPI(
    title="DHDA Quiz API",
    description="ADHD screening question bank API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/quiz/questions", response_model=List[Question])
def list_questions() -> List[Question]:
    """Return all 20 screening questions with id, text, and category."""
    return get_questions()


@app.get("/api/quiz/questions/{question_id}", response_model=Question)
def get_question(question_id: int) -> Question:
    """Return a single question by its numeric id."""
    question = get_question_by_id(question_id)
    if question is None:
        raise HTTPException(status_code=404, detail=f"Question {question_id} not found")
    return question


@app.get("/health")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}
