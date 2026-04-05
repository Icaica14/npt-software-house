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
    assert len(data) == 20


def test_list_questions_shape():
    resp = client.get("/api/quiz/questions")
    q = resp.json()[0]
    assert set(q.keys()) == {"id", "text", "category"}
    assert q["category"] in ("inattention", "hyperactivity")


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
    assert set(data.keys()) == {"total_score", "inattention_score", "hyperactivity_score", "risk_level"}


def test_submit_missing_question_returns_422():
    answers = {str(i): 1 for i in range(1, 20)}  # only 19 answers
    resp = client.post("/api/quiz/submit", json={"answers": answers})
    assert resp.status_code == 422


def test_submit_extra_questions_returns_422():
    answers = {str(i): 1 for i in range(1, 22)}  # 21 answers
    resp = client.post("/api/quiz/submit", json={"answers": answers})
    assert resp.status_code == 422


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
