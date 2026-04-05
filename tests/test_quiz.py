"""Tests for the question bank and API endpoints."""

import pytest
from fastapi.testclient import TestClient

from backend.api.quiz import (
    QUESTIONS,
    DISTRACTOR_QUESTIONS,
    SCORING_QUESTION_IDS,
    DISTRACTOR_QUESTION_IDS,
    POPULATION_MEAN,
    POPULATION_SD,
    get_question_by_id,
    get_questions,
    get_shuffled_questions,
    calculate_score,
    calculate_score_from_dict,
    raw_score_to_percentile,
    percentile_confidence_interval,
    _check_consistency,
)
from backend.api.server import app

client = TestClient(app)

EXPECTED_QUESTION_COUNT = 20
EXPECTED_DISTRACTOR_COUNT = 5
VALID_CATEGORIES = {"inattention", "hyperactivity", "distractor"}


# --- Unit tests for quiz.py ---


def test_question_count():
    questions = get_questions()
    assert len(questions) == EXPECTED_QUESTION_COUNT, (
        f"Expected {EXPECTED_QUESTION_COUNT} questions, got {len(questions)}"
    )


def test_question_ids_are_unique():
    ids = [q.id for q in get_questions()]
    assert len(ids) == len(set(ids)), "Question IDs are not unique"


def test_question_ids_sequential():
    ids = sorted(q.id for q in get_questions())
    assert ids == list(range(1, EXPECTED_QUESTION_COUNT + 1))


def test_all_questions_have_text():
    for q in get_questions():
        assert q.text.strip(), f"Question {q.id} has empty text"


def test_all_questions_have_valid_category():
    for q in get_questions():
        assert q.category in {"inattention", "hyperactivity"}, (
            f"Question {q.id} has invalid category: {q.category!r}"
        )


def test_both_categories_present():
    categories = {q.category for q in get_questions()}
    assert categories == {"inattention", "hyperactivity"}


def test_get_question_by_id_valid():
    q = get_question_by_id(1)
    assert q is not None
    assert q.id == 1


def test_get_question_by_id_invalid():
    assert get_question_by_id(999) is None


# --- API endpoint tests ---


def test_list_questions_status_200():
    response = client.get("/api/quiz/questions")
    assert response.status_code == 200


def test_list_questions_returns_25():
    """Endpoint returns 20 scoring + 5 distractor questions."""
    response = client.get("/api/quiz/questions")
    data = response.json()
    assert len(data) == EXPECTED_QUESTION_COUNT + EXPECTED_DISTRACTOR_COUNT


def test_list_questions_shuffled():
    """Two calls should (eventually) return different orders."""
    orders = set()
    for _ in range(10):
        resp = client.get("/api/quiz/questions")
        ids = tuple(q["id"] for q in resp.json())
        orders.add(ids)
    assert len(orders) > 1, "Questions appear to always return in the same order"


def test_list_questions_structure():
    response = client.get("/api/quiz/questions")
    questions = response.json()
    for q in questions:
        assert "id" in q
        assert "text" in q
        assert "category" in q
        assert q["category"] in VALID_CATEGORIES
        assert isinstance(q["id"], int)
        assert isinstance(q["text"], str)
        assert q["text"].strip()


def test_list_questions_contains_distractors():
    response = client.get("/api/quiz/questions")
    categories = {q["category"] for q in response.json()}
    assert "distractor" in categories


def test_shuffle_does_not_change_score():
    """Submitting the same answers regardless of presentation order yields identical score."""
    answers = {i: (i % 4) + 1 for i in range(1, 21)}
    r1 = client.post("/api/quiz/submit", json={"answers": answers}).json()
    r2 = client.post("/api/quiz/submit", json={"answers": answers}).json()
    assert r1["total_score"] == r2["total_score"]
    assert r1["risk_level"] == r2["risk_level"]


def test_get_single_question():
    response = client.get("/api/quiz/questions/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1


def test_get_question_not_found():
    response = client.get("/api/quiz/questions/999")
    assert response.status_code == 404


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# --- Submit endpoint tests ---

ALL_ONES = {str(i): 1 for i in range(1, 21)}  # total=20 → low risk


def test_submit_valid_answers():
    response = client.post("/api/quiz/submit", json={"answers": ALL_ONES})
    assert response.status_code == 200
    data = response.json()
    assert data["total_score"] == 20
    assert data["inattention_score"] == 10
    assert data["hyperactivity_score"] == 10
    assert data["risk_level"] == "low"
    assert "cronbach_alpha" in data
    assert "consistency_warning" in data
    assert isinstance(data["cronbach_alpha"], float)
    assert isinstance(data["consistency_warning"], bool)


def test_submit_high_risk():
    answers = {str(i): 4 for i in range(1, 21)}  # total=80 → high
    response = client.post("/api/quiz/submit", json={"answers": answers})
    assert response.status_code == 200
    assert response.json()["risk_level"] == "high"


def test_submit_moderate_risk():
    # total=50 → moderate (36-60)
    answers = {str(i): 3 for i in range(1, 11)}
    answers.update({str(i): 2 for i in range(11, 21)})
    response = client.post("/api/quiz/submit", json={"answers": answers})
    assert response.status_code == 200
    assert response.json()["risk_level"] == "moderate"


def test_submit_missing_answers_returns_422():
    partial = {str(i): 2 for i in range(1, 15)}  # only 14 answers
    response = client.post("/api/quiz/submit", json={"answers": partial})
    assert response.status_code == 422


def test_submit_invalid_answer_value_returns_422():
    bad = {str(i): 2 for i in range(1, 21)}
    bad["5"] = 9  # out of range
    response = client.post("/api/quiz/submit", json={"answers": bad})
    assert response.status_code == 422


def test_submit_empty_body_returns_422():
    response = client.post("/api/quiz/submit", json={})
    assert response.status_code == 422


def test_submit_with_distractor_answers_ignored():
    """Including distractor answers does not affect score."""
    answers_without = {str(i): 2 for i in range(1, 21)}
    answers_with = dict(answers_without)
    answers_with.update({str(i): 4 for i in range(21, 26)})  # distractors

    r1 = client.post("/api/quiz/submit", json={"answers": answers_without}).json()
    r2 = client.post("/api/quiz/submit", json={"answers": answers_with}).json()

    assert r1["total_score"] == r2["total_score"]
    assert r1["risk_level"] == r2["risk_level"]


# --- Consistency / anti-gaming tests ---


def test_all_same_answers_flags_consistency_warning():
    """All-identical answers (e.g. all 1s or all 4s) must trigger consistency_warning."""
    for value in (1, 4):
        answers = [value] * 20
        _, warning = _check_consistency(answers)
        assert warning, f"Expected consistency_warning=True for all-{value}s"


def test_varied_answers_no_consistency_warning():
    """A plausible mixed response should not trigger a warning."""
    answers = [1, 2, 3, 4, 2, 3, 1, 4, 2, 3, 1, 2, 3, 4, 2, 3, 1, 4, 2, 3]
    _, warning = _check_consistency(answers)
    assert not warning


def test_cronbach_alpha_range():
    """cronbach_alpha must be in [0, 1]."""
    for test_answers in (
        [1] * 20,
        [4] * 20,
        [1, 2, 3, 4] * 5,
        [(i % 4) + 1 for i in range(20)],
    ):
        alpha, _ = _check_consistency(test_answers)
        assert 0.0 <= alpha <= 1.0, f"alpha={alpha} out of range for {test_answers[:5]}..."


def test_submit_all_same_returns_consistency_warning():
    """API submit with all-identical answers should return consistency_warning=True."""
    answers = {str(i): 1 for i in range(1, 21)}
    data = client.post("/api/quiz/submit", json={"answers": answers}).json()
    assert data["consistency_warning"] is True


def test_distractors_ignored_for_score():
    """calculate_score_from_dict ignores distractor question ids."""
    base = {i: 2 for i in range(1, 21)}
    with_distractors = dict(base)
    with_distractors.update({i: 4 for i in range(21, 26)})

    r1 = calculate_score_from_dict(base)
    r2 = calculate_score_from_dict(with_distractors)

    assert r1.total_score == r2.total_score
    assert r1.inattention_score == r2.inattention_score
    assert r1.hyperactivity_score == r2.hyperactivity_score


# --- Percentile and CI tests ---


def test_percentile_at_population_mean():
    """Score equal to population mean should be ~50th percentile."""
    score = round(POPULATION_MEAN)
    p = raw_score_to_percentile(score)
    assert 45 <= p <= 55, f"Expected ~50th percentile at mean, got {p}"


def test_percentile_low_score():
    """Score of 20 (minimum) should be in a low percentile."""
    p = raw_score_to_percentile(20)
    assert 0 <= p <= 20, f"Min score should be low percentile, got {p}"


def test_percentile_high_score():
    """Score of 80 (maximum) should be in a high percentile."""
    p = raw_score_to_percentile(80)
    assert p >= 80, f"Max score should be high percentile, got {p}"


def test_percentile_monotone():
    """Higher raw scores must yield higher or equal percentiles."""
    prev = raw_score_to_percentile(20)
    for score in range(21, 81):
        current = raw_score_to_percentile(score)
        assert current >= prev, f"Percentile not monotone at score {score}"
        prev = current


def test_percentile_in_range():
    """All scores in [20, 80] must yield a percentile in [0, 100]."""
    for score in range(20, 81):
        p = raw_score_to_percentile(score)
        assert 0 <= p <= 100


def test_percentile_ci_lower_le_upper():
    """Lower CI bound must always be <= upper CI bound."""
    for score in range(20, 81):
        lo, hi = percentile_confidence_interval(score)
        assert lo <= hi, f"CI inverted at score {score}: [{lo}, {hi}]"


def test_percentile_ci_contains_point_estimate():
    """95% CI should bracket the point-estimate percentile."""
    for score in range(20, 81):
        p = raw_score_to_percentile(score)
        lo, hi = percentile_confidence_interval(score)
        assert lo <= p <= hi, f"Point estimate {p} outside CI [{lo}, {hi}] at score {score}"


def test_percentile_ci_width_reasonable():
    """95% CI should be non-trivial for mid-range scores, and never wider than 60 points."""
    # Check width only for scores in the middle range where clamping doesn't apply
    for score in range(25, 56):
        lo, hi = percentile_confidence_interval(score)
        width = hi - lo
        assert width >= 5, f"CI suspiciously narrow ({width}) at score {score}"
        assert width <= 60, f"CI suspiciously wide ({width}) at score {score}"


def test_submit_returns_percentile_fields():
    """POST /api/quiz/submit response must include percentile, percentile_ci, test_retest_coefficient."""
    answers = {str(i): 2 for i in range(1, 21)}
    data = client.post("/api/quiz/submit", json={"answers": answers}).json()
    assert "percentile" in data
    assert "percentile_ci" in data
    assert "test_retest_coefficient" in data
    assert isinstance(data["percentile"], int)
    assert isinstance(data["percentile_ci"], list)
    assert len(data["percentile_ci"]) == 2
    assert 0 <= data["percentile"] <= 100
    assert isinstance(data["test_retest_coefficient"], float)
    assert 0.0 <= data["test_retest_coefficient"] <= 1.0


def test_calculate_score_percentile_fields():
    """calculate_score must populate percentile fields correctly."""
    answers = [2] * 20  # total=40
    result = calculate_score(answers)
    assert hasattr(result, "percentile")
    assert hasattr(result, "percentile_ci")
    assert hasattr(result, "test_retest_coefficient")
    assert 0 <= result.percentile <= 100
    lo, hi = result.percentile_ci
    assert lo <= result.percentile <= hi
    assert 0.0 <= result.test_retest_coefficient <= 1.0
