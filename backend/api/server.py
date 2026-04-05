"""FastAPI application for the ADHD screening quiz backend."""

from typing import Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.api.quiz import (
    Question,
    ScoreResult,
    calculate_score_from_dict,
    get_question_by_id,
    get_shuffled_questions,
)

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
    """Return all questions (20 scoring + 5 distractors) in shuffled order."""
    return get_shuffled_questions()


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
    """Accept answers for quiz questions and return a scored result.

    Body: ``{"answers": {"1": 3, "2": 2, ...}}`` — keys are question ids (1-25),
    values are 1-4.  Answers for distractor questions (ids 21-25) are accepted
    but ignored for scoring.  All 20 scoring questions (ids 1-20) must be present.
    The response includes ``cronbach_alpha`` and ``consistency_warning`` fields.
    """
    try:
        return calculate_score_from_dict(body.answers)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/health")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}
