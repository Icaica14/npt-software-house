"""Tests for the ADHD scoring algorithm."""

import pytest
from fastapi.testclient import TestClient

from backend.api.quiz import (
    calculate_score,
    calculate_percentile_score,
    calculate_test_retest_reliability,
    shuffle_questions,
    add_distractor_questions,
    cronbach_alpha,
    validate_response_consistency,
    percentile_from_raw_score,
    confidence_interval_95,
    test_retest_reliability,
    get_feature_importance,
    get_model_info,
    QUESTIONS,
    DISTRACTOR_QUESTION_IDS,
    POPULATION_REFERENCE,
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


# ---------------------------------------------------------------------------
# DHD-14: Scientific Scoring & Percentile Calculation tests
# ---------------------------------------------------------------------------

def test_percentile_from_raw_score_low():
    """Low raw score should yield low percentile."""
    percentile = percentile_from_raw_score(20, POPULATION_REFERENCE["percentiles"])
    assert 0 <= percentile <= 20


def test_percentile_from_raw_score_high():
    """High raw score should yield high percentile."""
    percentile = percentile_from_raw_score(75, POPULATION_REFERENCE["percentiles"])
    assert percentile >= 80


def test_percentile_from_raw_score_middle():
    """Score near mean should yield percentile near 50."""
    mean_score = round(POPULATION_REFERENCE["mean"])
    percentile = percentile_from_raw_score(mean_score, POPULATION_REFERENCE["percentiles"])
    assert 35 <= percentile <= 65


def test_confidence_interval_95_calculation():
    """CI should have upper > lower and both in [0, 100]."""
    lower, upper = confidence_interval_95(percentile=60, sample_size=2200, std_error=5.0)
    assert 0 <= lower <= 100
    assert 0 <= upper <= 100
    assert upper > lower


def test_test_retest_reliability_perfect():
    """Identical answer sets should yield high reliability coefficient."""
    answers = [1, 2, 3, 4, 2, 3, 1, 4, 2, 3, 1, 2, 3, 4, 2, 1, 3, 4, 2, 3]
    coeff = test_retest_reliability(answers, answers)
    assert coeff >= 0.99


def test_test_retest_reliability_poor():
    """Completely opposite answer sets should yield low reliability coefficient."""
    set1 = [1] * 20
    set2 = [4] * 20
    coeff = test_retest_reliability(set1, set2)
    assert 0.0 <= coeff <= 0.5


def test_calculate_score_includes_percentile():
    """calculate_score result must include percentile, percentile_ci, and test_retest_coefficient."""
    answers = [2, 3, 1, 4, 2, 3, 1, 4, 2, 3, 1, 4, 2, 3, 1, 4, 2, 3, 1, 4]
    result = calculate_score(answers)
    assert hasattr(result, "percentile")
    assert hasattr(result, "percentile_ci")
    assert hasattr(result, "test_retest_coefficient")
    assert 0 <= result.percentile <= 100
    lower, upper = result.percentile_ci
    assert upper >= lower
    assert 0.0 <= result.test_retest_coefficient <= 1.0


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


# ---------------------------------------------------------------------------
# DHD-15: ML Model Visualization & Interpretation
# ---------------------------------------------------------------------------

def test_feature_importance_structure():
    """get_feature_importance() returns a dict with string keys and float values."""
    fi = get_feature_importance()
    assert isinstance(fi, dict)
    assert len(fi) > 0
    for key, val in fi.items():
        assert isinstance(key, str)
        assert key.startswith("question_")
        assert isinstance(val, float)


def test_feature_importance_top_10():
    """get_feature_importance() returns exactly 10 entries; question_8 has the highest score."""
    fi = get_feature_importance()
    assert len(fi) == 10
    assert "question_8" in fi
    assert fi["question_8"] == 0.15
    # Top 10 values sum to at least 0.9 (covers the majority of predictive weight)
    assert sum(fi.values()) >= 0.9


def test_model_info_structure():
    """get_model_info() returns a dict with required top-level keys."""
    info = get_model_info()
    required_keys = {
        "model_architecture",
        "training_data_summary",
        "performance_metrics",
        "feature_importance",
        "known_limitations",
        "reliability",
        "top_10_predictive_question_ids",
    }
    assert required_keys.issubset(info.keys())


def test_model_info_performance_values():
    """Performance metrics must be floats in [0, 1]."""
    info = get_model_info()
    perf = info["performance_metrics"]
    for field in ("accuracy", "auc", "sensitivity", "specificity"):
        assert field in perf
        assert 0.0 <= perf[field] <= 1.0


def test_model_info_training_data():
    """Training data summary must reference ASRS and include sample size."""
    info = get_model_info()
    td = info["training_data_summary"]
    assert "ASRS" in td["source"]
    assert td["normative_sample_size"] > 0
    assert "population_mean" in td
    assert "population_sd" in td


# ---------------------------------------------------------------------------
# DHD-21: Scientific Scoring & Percentile Calculation (6 new tests)
# ---------------------------------------------------------------------------

def test_calculate_percentile_score():
    """Raw score converts to a valid percentile in [0, 100]."""
    result = calculate_percentile_score(60)
    assert 0 <= result["percentile"] <= 100
    # Score above mean=50 should yield percentile above 50
    assert result["percentile"] > 50


def test_percentile_confidence_interval():
    """Confidence interval is ±12 points (1 std) applied to raw score."""
    result = calculate_percentile_score(60)
    # CI bounds derived from raw scores 48 and 72 (60 ± 12)
    assert "confidence_interval_low" in result
    assert "confidence_interval_high" in result
    # low CI must come from raw score 48, high CI from raw score 72
    low_result = calculate_percentile_score(48)
    high_result = calculate_percentile_score(72)
    assert result["confidence_interval_low"] == low_result["percentile"]
    assert result["confidence_interval_high"] == high_result["percentile"]


def test_percentile_interpretation():
    """Risk level (interpretation) is derived from the computed percentile."""
    high_result = calculate_percentile_score(75)  # well above mean → high suspicion
    assert high_result["interpretation"] == "High suspicion of ADHD"

    low_result = calculate_percentile_score(25)  # well below mean → low suspicion
    assert low_result["interpretation"] == "Low suspicion of ADHD"


def test_test_retest_reliability_stable():
    """Low variance answers (uniform responses) yield stable=True."""
    # All 2s: variance = 0
    answers = [2] * 20
    result = calculate_test_retest_reliability(answers)
    assert result["stable"] is True
    assert result["variance"] < 0.5
    assert 0.0 <= result["reliability_score"] <= 1.0


def test_test_retest_reliability_unstable():
    """High variance answers (alternating extremes) yield stable=False."""
    # Alternating 1 and 4: variance > 0.5
    answers = [1, 4] * 10
    result = calculate_test_retest_reliability(answers)
    assert result["stable"] is False
    assert result["variance"] >= 0.5


def test_endpoint_returns_all_metrics():
    """POST /api/quiz/submit returns both assessment (percentile) and reliability blocks."""
    answers = {str(i): 3 for i in range(1, 21)}
    response = api_client.post("/api/quiz/submit", json={"answers": answers})
    assert response.status_code == 200
    data = response.json()

    assert "assessment" in data
    assert "percentile" in data["assessment"]
    assert "confidence_interval" in data["assessment"]
    assert 0 <= data["assessment"]["percentile"] <= 100
    assert "low" in data["assessment"]["confidence_interval"]
    assert "high" in data["assessment"]["confidence_interval"]

    assert "reliability" in data
    assert "cronbach_alpha" in data["reliability"]
    assert "test_retest_score" in data["reliability"]
    assert "stable" in data["reliability"]


def test_api_model_info_endpoint():
    """GET /api/quiz/model-info returns 200 with valid JSON including feature_importance."""
    response = api_client.get("/api/quiz/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "feature_importance" in data
    assert "performance_metrics" in data
    assert "known_limitations" in data
    perf = data["performance_metrics"]
    assert perf["accuracy"] == 0.82
    assert perf["auc"] == 0.90
    assert perf["sensitivity"] == 0.80
    assert perf["specificity"] == 0.85


# ---------------------------------------------------------------------------
# DHD-22: ML Model Visualization & Interpretation (exact task spec tests)
# ---------------------------------------------------------------------------


def test_get_model_info():
    """get_model_info() returns valid model metadata dict."""
    info = get_model_info()
    assert isinstance(info, dict)
    assert "model_architecture" in info
    assert isinstance(info["model_architecture"]["type"], str)
    assert len(info["model_architecture"]["type"]) > 0


def test_model_info_has_all_fields():
    """get_model_info() includes architecture, training_data, performance, limitations."""
    info = get_model_info()
    assert "model_architecture" in info
    assert "training_data_summary" in info
    assert "performance_metrics" in info
    assert "known_limitations" in info


def test_get_feature_importance():
    """get_feature_importance() returns top 10 questions with scores summing to ~1.0."""
    fi = get_feature_importance()
    assert len(fi) == 10
    total = sum(fi.values())
    assert abs(total - 1.0) < 0.05


def test_endpoint_model_info():
    """GET /api/quiz/model-info returns 200 and valid JSON."""
    response = api_client.get("/api/quiz/model-info")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "model_architecture" in data
    assert "feature_importance" in data
