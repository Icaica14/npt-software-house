"""Tests for the ADHD scoring algorithm."""

import pytest

from backend.api.quiz import calculate_score


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
