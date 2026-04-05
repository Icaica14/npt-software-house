"""Integration tests for the FastAPI quiz server endpoints."""

import pytest
from fastapi.testclient import TestClient

from backend.api.server import app

client = TestClient(app)

ALL_ONES_ANSWERS = {str(i): 1 for i in range(1, 21)}
ALL_FOURS_ANSWERS = {str(i): 4 for i in range(1, 21)}
MIXED_ANSWERS = {str(i): (2 if i <= 10 else 3) for i in range(1, 21)}


# ---------------------------------------------------------------------------
# GET /api/quiz/questions
# ---------------------------------------------------------------------------

def test_list_questions_returns_20():
    resp = client.get("/api/quiz/questions")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["questions"]) >= 20
    assert data["shuffled"] is True


def test_list_questions_shape():
    resp = client.get("/api/quiz/questions")
    q = resp.json()["questions"][0]
    assert "id" in q and "text" in q and "category" in q
    assert q["category"] in ("inattention", "hyperactivity", "distractor")


# ---------------------------------------------------------------------------
# GET /api/quiz/questions/{id}
# ---------------------------------------------------------------------------

def test_get_question_by_id():
    resp = client.get("/api/quiz/questions/1")
    assert resp.status_code == 200
    assert resp.json()["id"] == 1


def test_get_question_not_found():
    resp = client.get("/api/quiz/questions/999")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# POST /api/quiz/submit
# ---------------------------------------------------------------------------

def test_submit_all_ones_low_risk():
    resp = client.post("/api/quiz/submit", json={"answers": ALL_ONES_ANSWERS})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_score"] == 20
    assert data["inattention_score"] == 10
    assert data["hyperactivity_score"] == 10
    assert data["risk_level"] == "low"


def test_submit_all_fours_high_risk():
    resp = client.post("/api/quiz/submit", json={"answers": ALL_FOURS_ANSWERS})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_score"] == 80
    assert data["risk_level"] == "high"


def test_submit_mixed_moderate():
    resp = client.post("/api/quiz/submit", json={"answers": MIXED_ANSWERS})
    assert resp.status_code == 200
    data = resp.json()
    # 10 * 2 + 10 * 3 = 20 + 30 = 50 → moderate
    assert data["total_score"] == 50
    assert data["inattention_score"] == 20
    assert data["hyperactivity_score"] == 30
    assert data["risk_level"] == "moderate"


def test_submit_response_has_required_fields():
    resp = client.post("/api/quiz/submit", json={"answers": ALL_ONES_ANSWERS})
    assert resp.status_code == 200
    data = resp.json()
    required = {"total_score", "inattention_score", "hyperactivity_score", "risk_level", "consistency", "reliability"}
    assert required.issubset(set(data.keys()))


def test_submit_missing_question_returns_422():
    answers = {str(i): 1 for i in range(1, 20)}  # only 19 answers
    resp = client.post("/api/quiz/submit", json={"answers": answers})
    assert resp.status_code == 422


def test_submit_extra_questions_accepted():
    # Answers for ids 1-21 where 21 is a distractor — should succeed (distractors filtered)
    answers = {str(i): 1 for i in range(1, 22)}
    resp = client.post("/api/quiz/submit", json={"answers": answers})
    assert resp.status_code == 200
    assert resp.json()["total_score"] == 20


def test_submit_out_of_range_answer_returns_422():
    answers = dict(ALL_ONES_ANSWERS)
    answers["5"] = 5  # invalid
    resp = client.post("/api/quiz/submit", json={"answers": answers})
    assert resp.status_code == 422


def test_submit_zero_answer_returns_422():
    answers = dict(ALL_ONES_ANSWERS)
    answers["3"] = 0
    resp = client.post("/api/quiz/submit", json={"answers": answers})
    assert resp.status_code == 422


def test_submit_empty_body_returns_422():
    resp = client.post("/api/quiz/submit", json={})
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# CORS headers
# ---------------------------------------------------------------------------

def test_cors_allows_localhost_3000():
    resp = client.options(
        "/api/quiz/submit",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert resp.headers.get("access-control-allow-origin") == "http://localhost:3000"


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------

def test_health_check():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


# ---------------------------------------------------------------------------
# GET /api/quiz/model-info
# ---------------------------------------------------------------------------

def test_model_info_returns_200():
    resp = client.get("/api/quiz/model-info")
    assert resp.status_code == 200


def test_model_info_has_required_top_level_keys():
    resp = client.get("/api/quiz/model-info")
    data = resp.json()
    required_keys = {
        "model_architecture",
        "training_data_summary",
        "performance_metrics",
        "feature_importance",
        "top_10_predictive_question_ids",
        "known_limitations",
        "reliability",
    }
    assert required_keys.issubset(set(data.keys()))


def test_model_info_feature_importance_has_20_items():
    resp = client.get("/api/quiz/model-info")
    data = resp.json()
    fi = data["feature_importance"]
    assert len(fi) == 20


def test_model_info_feature_importance_item_shape():
    resp = client.get("/api/quiz/model-info")
    data = resp.json()
    item = data["feature_importance"][0]
    assert set(item.keys()) == {"question_id", "question_text", "importance", "top_predictor"}
    assert isinstance(item["question_id"], int)
    assert isinstance(item["importance"], float)
    assert isinstance(item["top_predictor"], bool)
    assert isinstance(item["question_text"], str)


def test_model_info_top_10_predictive_ids():
    resp = client.get("/api/quiz/model-info")
    data = resp.json()
    top10 = data["top_10_predictive_question_ids"]
    assert len(top10) == 10
    assert all(1 <= qid <= 20 for qid in top10)


def test_model_info_performance_metrics_fields():
    resp = client.get("/api/quiz/model-info")
    data = resp.json()
    metrics = data["performance_metrics"]
    assert "accuracy" in metrics
    assert "auc" in metrics
    assert "sensitivity" in metrics
    assert "specificity" in metrics


def test_model_info_known_limitations_present():
    resp = client.get("/api/quiz/model-info")
    data = resp.json()
    limitations = data["known_limitations"]
    assert len(limitations) >= 3
    types = [lim["type"] for lim in limitations]
    assert "dataset_bias" in types
    assert "age_range" in types
    assert "gender_effects" in types


def test_model_info_is_valid_json():
    import json
    resp = client.get("/api/quiz/model-info")
    assert resp.status_code == 200
    reparsed = json.loads(resp.text)
    assert isinstance(reparsed, dict)


# ---------------------------------------------------------------------------
# DHD-20: Question Randomization & Anti-Gaming Measures (8 new tests)
# ---------------------------------------------------------------------------

def test_get_questions_endpoint():
    """GET /api/quiz/questions returns 200 with shuffled=True."""
    resp = client.get("/api/quiz/questions")
    assert resp.status_code == 200
    data = resp.json()
    assert "questions" in data
    assert data["shuffled"] is True


def test_get_questions_includes_distractors():
    """Response has distractor questions and correct counts."""
    resp = client.get("/api/quiz/questions")
    assert resp.status_code == 200
    data = resp.json()
    assert data["distractor_count"] > 0
    assert data["scoring_count"] == 20
    distractor_ids = {q["id"] for q in data["questions"] if q["category"] == "distractor"}
    assert len(distractor_ids) == data["distractor_count"]


def test_submit_quiz_valid():
    """POST /api/quiz/submit with 20 valid answers returns 200."""
    resp = client.post("/api/quiz/submit", json={"answers": MIXED_ANSWERS})
    assert resp.status_code == 200
    data = resp.json()
    assert "total_score" in data


def test_submit_quiz_includes_consistency_check():
    """Response from POST /api/quiz/submit includes consistency field."""
    resp = client.post("/api/quiz/submit", json={"answers": MIXED_ANSWERS})
    assert resp.status_code == 200
    data = resp.json()
    assert "consistency" in data
    consistency = data["consistency"]
    assert "is_consistent" in consistency
    assert "warning" in consistency


def test_submit_quiz_includes_cronbach_alpha():
    """Response from POST /api/quiz/submit includes reliability with cronbach_alpha."""
    resp = client.post("/api/quiz/submit", json={"answers": MIXED_ANSWERS})
    assert resp.status_code == 200
    data = resp.json()
    assert "reliability" in data
    reliability = data["reliability"]
    assert "cronbach_alpha" in reliability
    assert "interpretation" in reliability
    assert 0.0 <= reliability["cronbach_alpha"] <= 1.0
    assert reliability["interpretation"] in ("Good", "Adequate", "Poor")


def test_submit_quiz_detects_all_ones():
    """All-ones answers should trigger a consistency warning."""
    resp = client.post("/api/quiz/submit", json={"answers": ALL_ONES_ANSWERS})
    assert resp.status_code == 200
    data = resp.json()
    assert data["consistency"]["is_consistent"] is False
    assert data["consistency"]["warning"] is not None


def test_submit_quiz_filters_extra_answers():
    """Providing >20 answers (including distractors) is filtered to 20 scoring answers."""
    answers = {str(i): 2 for i in range(1, 26)}  # ids 1-25, distractors 21-25 ignored
    resp = client.post("/api/quiz/submit", json={"answers": answers})
    assert resp.status_code == 200
    assert resp.json()["total_score"] == 40  # 20 scoring × 2


def test_submit_quiz_invalid_answer_count():
    """Fewer than 20 scoring answers returns a 4xx error."""
    answers = {str(i): 1 for i in range(1, 15)}  # only 14 answers
    resp = client.post("/api/quiz/submit", json={"answers": answers})
    assert resp.status_code >= 400
