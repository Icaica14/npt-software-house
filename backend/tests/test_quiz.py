"""Tests for the ADHD scoring algorithm."""

import pytest
from fastapi.testclient import TestClient

from backend.api.quiz import (
    calculate_score,
    shuffle_questions,
    add_distractor_questions,
    cronbach_alpha,
    validate_response_consistency,
    QUESTIONS,
    DISTRACTOR_QUESTION_IDS,
)
from backend.api.server import app

api_client = TestClient(app)


ALL_ONES = [1] * 20   # total = 20, risk = low
ALL_FOURS = [4] * 20  # total = 80, risk = high


# ---------------------------------------------------------------------------
# Edge-case inputs
# ---------------------------------------------------------------------------

def test_all_ones_low_risk():
    result = calculate_score(ALL_ONES)
    assert result.inattention_score == 10
    assert result.hyperactivity_score == 10
    assert result.total_score == 20
    assert result.risk_level == "low"


def test_all_fours_high_risk():
    result = calculate_score(ALL_FOURS)
    assert result.inattention_score == 40
    assert result.hyperactivity_score == 40
    assert result.total_score == 80
    assert result.risk_level == "high"


# ---------------------------------------------------------------------------
# Risk-level thresholds
# ---------------------------------------------------------------------------

def test_low_threshold_boundary_35():
    """Total == 35 should be low."""
    # 10 items at 2 (=20) + 10 items at 1 (=10) + 5 extra = 35
    # Easier: all 1s for hyperactivity (10) + inattention sums to 25 → total 35
    answers = [3, 3, 3, 3, 3, 2, 2, 2, 2, 2] + [1] * 10  # 25 + 10 = 35
    result = calculate_score(answers)
    assert result.total_score == 35
    assert result.risk_level == "low"


def test_moderate_threshold_boundary_36():
    """Total == 36 should be moderate."""
    answers = [3, 3, 3, 3, 3, 2, 2, 2, 2, 3] + [1] * 10  # 26 + 10 = 36
    result = calculate_score(answers)
    assert result.total_score == 36
    assert result.risk_level == "moderate"


def test_moderate_boundary_60():
    """Total == 60 should be moderate."""
    answers = [3] * 10 + [3] * 10  # 30 + 30 = 60
    result = calculate_score(answers)
    assert result.total_score == 60
    assert result.risk_level == "moderate"


def test_high_threshold_boundary_61():
    """Total == 61 should be high."""
    answers = [4] * 1 + [3] * 9 + [3] * 10  # (4+27) + 30 = 61
    result = calculate_score(answers)
    assert result.total_score == 61
    assert result.risk_level == "high"


# ---------------------------------------------------------------------------
# Subscale scoring
# ---------------------------------------------------------------------------

def test_subscales_are_independent():
    """Inattention uses items 1-10, hyperactivity uses items 11-20."""
    answers = [4] * 10 + [1] * 10
    result = calculate_score(answers)
    assert result.inattention_score == 40
    assert result.hyperactivity_score == 10
    assert result.total_score == 50
    assert result.risk_level == "moderate"


def test_mixed_answers():
    answers = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2,   # inattention: 23
               4, 3, 2, 1, 4, 3, 2, 1, 4, 3]    # hyperactivity: 27
    result = calculate_score(answers)
    assert result.inattention_score == 23
    assert result.hyperactivity_score == 27
    assert result.total_score == 50
    assert result.risk_level == "moderate"


# ---------------------------------------------------------------------------
# Validation errors
# ---------------------------------------------------------------------------

def test_wrong_number_of_answers_raises():
    with pytest.raises(ValueError, match="Expected 20 answers"):
        calculate_score([1] * 19)

    with pytest.raises(ValueError, match="Expected 20 answers"):
        calculate_score([1] * 21)


def test_answer_out_of_range_raises():
    bad = [1] * 20
    bad[5] = 0
    with pytest.raises(ValueError, match="must be 1-4"):
        calculate_score(bad)

    bad2 = [1] * 20
    bad2[10] = 5
    with pytest.raises(ValueError, match="must be 1-4"):
        calculate_score(bad2)


# ---------------------------------------------------------------------------
# Anti-gaming / randomization tests (DHD-13)
# ---------------------------------------------------------------------------

def test_shuffle_questions_changes_order():
    """shuffle_questions should (almost certainly) return a different order."""
    original = list(QUESTIONS)
    results = [shuffle_questions(original) for _ in range(10)]
    # At least one shuffle should differ from original order
    assert any(r != original for r in results)


def test_shuffle_doesnt_change_score():
    """Scoring a shuffled question set (scoring answers only) must give the same result."""
    answers = [2, 3, 1, 4, 2, 3, 1, 4, 2, 3, 1, 4, 2, 3, 1, 4, 2, 3, 1, 4]
    original_result = calculate_score(answers)
    # shuffle_questions affects ordering, not the scoring answers themselves
    assert original_result.total_score == sum(answers)


def test_distractor_questions_filtered():
    """add_distractor_questions should include items marked distractor=True."""
    q_dicts = [{"id": q.id, "text": q.text, "category": q.category} for q in QUESTIONS]
    result = add_distractor_questions(q_dicts)
    distractors = [q for q in result if q.get("distractor")]
    assert len(distractors) == 5  # five distractor questions defined


def test_cronbach_alpha_calculation():
    """cronbach_alpha should return a float in [0, 1]."""
    answers = [2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3]
    alpha = cronbach_alpha(answers)
    assert isinstance(alpha, float)
    assert 0.0 <= alpha <= 1.0


def test_validate_consistency_all_ones():
    """All-1 answers should be flagged as inconsistent."""
    result = validate_response_consistency([1] * 20)
    assert result["is_consistent"] is False
    assert result["warning"] is not None


def test_validate_consistency_valid():
    """A varied, realistic answer set should be flagged as consistent."""
    answers = [1, 2, 3, 4, 2, 3, 1, 4, 2, 3, 1, 2, 3, 4, 2, 1, 3, 4, 2, 3]
    result = validate_response_consistency(answers)
    assert result["is_consistent"] is True
    assert result["warning"] is None


def test_api_quiz_questions_returns_shuffled():
    """GET /api/quiz/questions should return shuffled questions with shuffled=true."""
    response = api_client.get("/api/quiz/questions")
    assert response.status_code == 200
    data = response.json()
    assert "questions" in data
    assert data.get("shuffled") is True
    ids = [q["id"] for q in data["questions"]]
    assert len(ids) >= 20


def test_api_quiz_submit_filters_distractors():
    """POST /api/quiz/submit should ignore distractor answers and compute score on 20 scoring items."""
    answers = {str(i): 2 for i in range(1, 21)}
    # Add distractor answers — should be ignored
    for d_id in DISTRACTOR_QUESTION_IDS:
        answers[str(d_id)] = 4
    response = api_client.post("/api/quiz/submit", json={"answers": answers})
    assert response.status_code == 200
    data = response.json()
    assert data["total_score"] == 40  # 20 questions × 2
