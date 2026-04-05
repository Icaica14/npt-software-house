"""FastAPI application for the ADHD screening quiz backend."""

from typing import Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.api.quiz import Question, ScoreResult, calculate_score, get_question_by_id, get_questions

app = FastAPI(
    title="DHDA Quiz API",
    description="ADHD screening question bank API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
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


class SubmitRequest(BaseModel):
    answers: Dict[int, int]


@app.post("/api/quiz/submit", response_model=ScoreResult)
def submit_quiz(body: SubmitRequest) -> ScoreResult:
    """Accept answers for all 20 questions and return a scored result.

    Body: ``{"answers": {"1": 3, "2": 2, ...}}`` — keys are question ids (1-20),
    values are 1-4.
    """
    if len(body.answers) != 20:
        raise HTTPException(
            status_code=422,
            detail=f"Expected 20 answers, got {len(body.answers)}",
        )
    try:
        ordered = [body.answers[i] for i in range(1, 21)]
    except KeyError as exc:
        raise HTTPException(
            status_code=422, detail=f"Missing answer for question {exc}"
        ) from exc
    try:
        return calculate_score(ordered)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/health")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}
