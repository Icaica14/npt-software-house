# Tests for quiz API and scoring

import pytest
from api.quiz import calculate_score, QUESTIONS

def test_question_count():
    """Test that question bank has 20 questions."""
    assert len(QUESTIONS) == 20

def test_question_structure():
    """Test that each question has required fields."""
    for q in QUESTIONS:
        assert "id" in q
        assert "text" in q
        assert "category" in q
        assert q["category"] in ["inattention", "hyperactivity"]

def test_scoring_all_ones():
    """Test scoring with minimum answers (all 1s = 20 total)."""
    answers = [1] * 20
    result = calculate_score(answers)
    assert result["total_score"] == 20
    assert result["inattention_score"] == 10
    assert result["hyperactivity_score"] == 10
    assert result["risk_level"] == "low"

def test_scoring_all_fours():
    """Test scoring with maximum answers (all 4s = 80 total)."""
    answers = [4] * 20
    result = calculate_score(answers)
    assert result["total_score"] == 80
    assert result["inattention_score"] == 40
    assert result["hyperactivity_score"] == 40
    assert result["risk_level"] == "high"

def test_scoring_low_risk():
    """Test low risk threshold (20-35)."""
    answers = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2]  # total = 30
    result = calculate_score(answers)
    assert result["total_score"] == 30
    assert result["risk_level"] == "low"

def test_scoring_moderate_risk():
    """Test moderate risk threshold (36-60)."""
    answers = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]  # total = 40
    result = calculate_score(answers)
    assert result["total_score"] == 40
    assert result["risk_level"] == "moderate"

def test_scoring_high_risk():
    """Test high risk threshold (61-80)."""
    answers = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]  # total = 60
    result = calculate_score(answers)
    assert result["total_score"] == 60
    assert result["risk_level"] == "moderate"

    # Now test high risk
    answers = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]  # total = 70
    result = calculate_score(answers)
    assert result["total_score"] == 70
    assert result["risk_level"] == "high"

def test_scoring_invalid_count():
    """Test error handling for wrong answer count."""
    with pytest.raises(ValueError):
        calculate_score([1, 2, 3])  # Only 3 answers

def test_scoring_invalid_range():
    """Test error handling for answers outside 1-4 range."""
    answers = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 5]  # Last is 5
    with pytest.raises(ValueError):
        calculate_score(answers)
