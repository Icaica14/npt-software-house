"""Tests for the question bank and API endpoints."""

import pytest
from fastapi.testclient import TestClient

from backend.api.quiz import QUESTIONS, get_question_by_id, get_questions
from backend.api.server import app

client = TestClient(app)

EXPECTED_QUESTION_COUNT = 20
VALID_CATEGORIES = {"inattention", "hyperactivity"}


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
        assert q.category in VALID_CATEGORIES, (
            f"Question {q.id} has invalid category: {q.category!r}"
        )


def test_both_categories_present():
    categories = {q.category for q in get_questions()}
    assert categories == VALID_CATEGORIES


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


def test_list_questions_returns_20():
    response = client.get("/api/quiz/questions")
    data = response.json()
    assert len(data) == EXPECTED_QUESTION_COUNT


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
