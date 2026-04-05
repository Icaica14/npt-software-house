"""FastAPI application for the ADHD screening quiz backend."""

from typing import Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.api.quiz import (
    DISTRACTOR_QUESTION_IDS,
    Question,
    ScoreResult,
    calculate_percentile_score,
    calculate_score_from_dict,
    calculate_test_retest_reliability,
    get_model_info,
    get_question_by_id,
    get_shuffled_questions,
    validate_response_consistency,
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


@app.get("/api/quiz/questions")
def list_questions() -> dict:
    """Return all questions (20 scoring + 5 distractors) in shuffled order."""
    questions = get_shuffled_questions()
    q_list = [q.model_dump() for q in questions]
    distractor_count = sum(1 for q in questions if q.id in DISTRACTOR_QUESTION_IDS)
    scoring_count = len(questions) - distractor_count
    return {
        "questions": q_list,
        "shuffled": True,
        "distractor_count": distractor_count,
        "scoring_count": scoring_count,
    }


@app.get("/api/quiz/questions/{question_id}", response_model=Question)
def get_question(question_id: int) -> Question:
    """Return a single question by its numeric id."""
    question = get_question_by_id(question_id)
    if question is None:
        raise HTTPException(status_code=404, detail=f"Question {question_id} not found")
    return question


class SubmitRequest(BaseModel):
    answers: Dict[int, int]


@app.post("/api/quiz/submit")
def submit_quiz(body: SubmitRequest) -> dict:
    """Accept answers for quiz questions and return a scored result.

    Body: ``{"answers": {"1": 3, "2": 2, ...}}`` — keys are question ids (1-25),
    values are 1-4.  Answers for distractor questions (ids 21-25) are accepted
    but ignored for scoring.  All 20 scoring questions (ids 1-20) must be present.
    Response includes ``consistency`` and ``reliability`` fields.
    """
    try:
        # Extract only scoring answers (ignore distractors and any extra keys)
        scoring_answers = {k: v for k, v in body.answers.items() if k not in DISTRACTOR_QUESTION_IDS}
        result = calculate_score_from_dict(scoring_answers)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    scoring_list = [scoring_answers.get(i, body.answers.get(i)) for i in range(1, 21)]
    consistency = validate_response_consistency(scoring_list)

    # Percentile and confidence interval using DHD-21 scoring functions
    percentile_data = calculate_percentile_score(result.total_score)
    retest = calculate_test_retest_reliability(scoring_list)

    alpha = result.cronbach_alpha
    if alpha >= 0.7:
        reliability_interpretation = "High reliability - results are trustworthy"
    elif alpha >= 0.5:
        reliability_interpretation = "Moderate reliability - results are adequate"
    else:
        reliability_interpretation = "Low reliability - results may be unreliable"

    return {
        **result.model_dump(),
        "consistency": consistency,
        "assessment": {
            "raw_score": result.total_score,
            "percentile": percentile_data["percentile"],
            "confidence_interval": {
                "low": percentile_data["confidence_interval_low"],
                "high": percentile_data["confidence_interval_high"],
            },
            "risk_level": result.risk_level,
        },
        "reliability": {
            "cronbach_alpha": alpha,
            "test_retest_score": retest["reliability_score"],
            "stable": retest["stable"],
            "interpretation": reliability_interpretation,
        },
    }


@app.get("/api/quiz/model-info")
def model_info() -> dict:
    """Return model architecture, training data summary, performance metrics,
    feature importance for all 20 scoring questions, and known limitations.

    Response fields:
    - model_architecture: type, description, subscales, score_range, response_scale
    - training_data_summary: source, citation, normative_sample_size, population,
      population_mean, population_sd, age_range
    - performance_metrics: accuracy, auc, sensitivity, specificity
    - feature_importance: list of {question_id, question_text, importance, top_predictor}
    - top_10_predictive_question_ids: list of 10 most predictive question IDs
    - known_limitations: list of {type, description} covering dataset_bias, age_range,
      gender_effects, self_report_bias, screening_only
    - reliability: split_half_reliability, method, note
    """
    return get_model_info()


@app.get("/health")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}
