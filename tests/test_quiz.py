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
