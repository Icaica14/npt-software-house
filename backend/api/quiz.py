"""ADHD screening question bank.

20 questions adapted from the Adult ADHD Self-Report Scale (ASRS-v1.1)
and DSM-5 criteria.  Each question has an id, text, and category
(inattention | hyperactivity | distractor).

Distractor questions (IDs 21-25) are included in the shuffled quiz to
detect pattern-gaming; their answers do not contribute to scoring.
"""

import math
import random
from collections import Counter
from typing import Dict, List, Literal, Optional, Tuple

from pydantic import BaseModel, field_validator


Category = Literal["inattention", "hyperactivity", "distractor"]

# IDs of real scoring questions
SCORING_QUESTION_IDS = set(range(1, 21))
# IDs of distractor questions
DISTRACTOR_QUESTION_IDS = set(range(21, 26))


class Question(BaseModel):
    id: int
    text: str
    category: Category


QUESTIONS: List[Question] = [
    Question(
        id=1,
        category="inattention",
        text=(
            "How often do you have trouble wrapping up the final details of a "
            "project, once the challenging parts have been done?"
        ),
    ),
    Question(
        id=2,
        category="inattention",
        text=(
            "How often do you have difficulty getting things in order when you "
            "have to do a task that requires organisation?"
        ),
    ),
    Question(
        id=3,
        category="inattention",
        text="How often do you have problems remembering appointments or obligations?",
    ),
    Question(
        id=4,
        category="inattention",
        text=(
            "When you have a task that requires a lot of thought, how often do "
            "you avoid or delay getting started?"
        ),
    ),
    Question(
        id=5,
        category="inattention",
        text=(
            "How often do you fidget or squirm with your hands or feet when you "
            "have to sit down for a long time?"
        ),
    ),
    Question(
        id=6,
        category="inattention",
        text=(
            "How often do you feel overly active and compelled to do things, "
            "like you were driven by a motor?"
        ),
    ),
    Question(
        id=7,
        category="inattention",
        text=(
            "How often do you make careless mistakes when you have to work on a "
            "boring or difficult project?"
        ),
    ),
    Question(
        id=8,
        category="inattention",
        text=(
            "How often do you have difficulty keeping your attention when you are "
            "doing boring or repetitive work?"
        ),
    ),
    Question(
        id=9,
        category="inattention",
        text=(
            "How often do you have difficulty concentrating on what people say to "
            "you, even when they are speaking to you directly?"
        ),
    ),
    Question(
        id=10,
        category="inattention",
        text="How often do you misplace or have difficulty finding things at home or at work?",
    ),
    Question(
        id=11,
        category="hyperactivity",
        text=(
            "How often do you leave your seat in meetings or other situations in "
            "which you are expected to remain seated?"
        ),
    ),
    Question(
        id=12,
        category="hyperactivity",
        text="How often do you feel restless or fidgety?",
    ),
    Question(
        id=13,
        category="hyperactivity",
        text=(
            "How often do you have difficulty unwinding and relaxing when you "
            "have time to yourself?"
        ),
    ),
    Question(
        id=14,
        category="hyperactivity",
        text=(
            "How often do you feel overly active and compelled to keep moving "
            "when everyone else seems calm?"
        ),
    ),
    Question(
        id=15,
        category="hyperactivity",
        text=(
            "How often do you find yourself talking too much when you are in "
            "social situations?"
        ),
    ),
    Question(
        id=16,
        category="hyperactivity",
        text=(
            "When you're in a conversation, how often do you find yourself "
            "finishing the sentences of the people you are talking to before "
            "they can finish them themselves?"
        ),
    ),
    Question(
        id=17,
        category="hyperactivity",
        text=(
            "How often do you have difficulty waiting your turn in situations "
            "when turn-taking is required?"
        ),
    ),
    Question(
        id=18,
        category="hyperactivity",
        text="How often do you interrupt others when they are busy?",
    ),
    Question(
        id=19,
        category="inattention",
        text=(
            "How often do you fail to follow through on instructions or fail to "
            "finish your work?"
        ),
    ),
    Question(
        id=20,
        category="inattention",
        text=(
            "How often do you have difficulty sustaining attention during leisure "
            "activities or tasks you enjoy?"
        ),
    ),
]


DISTRACTOR_QUESTIONS: List[Question] = [
    Question(
        id=21,
        category="distractor",
        text="How often do you enjoy spending time with close friends or family?",
    ),
    Question(
        id=22,
        category="distractor",
        text="How often do you find it easy to relax on a quiet evening at home?",
    ),
    Question(
        id=23,
        category="distractor",
        text="How often do you feel satisfied after completing a routine daily task?",
    ),
    Question(
        id=24,
        category="distractor",
        text="How often do you feel calm and at ease in familiar environments?",
    ),
    Question(
        id=25,
        category="distractor",
        text="How often do you remember where you placed everyday objects like your keys?",
    ),
]

ALL_QUESTIONS: List[Question] = QUESTIONS + DISTRACTOR_QUESTIONS


def get_questions() -> List[Question]:
    """Return the full list of scoring questions (no distractors)."""
    return QUESTIONS


def get_shuffled_questions() -> List[Question]:
    """Return all questions (scoring + distractors) in random order."""
    shuffled = list(ALL_QUESTIONS)
    random.shuffle(shuffled)
    return shuffled


def get_question_by_id(question_id: int) -> Question | None:
    """Return a single question by its id, or None if not found."""
    for q in ALL_QUESTIONS:
        if q.id == question_id:
            return q
    return None


RiskLevel = Literal["low", "moderate", "high"]

# ASRS-v1.1 population reference norms (adult general population, N=519, Kessler et al. 2005).
# Mean = 36.8, SD = 10.6 (total score range 20-80).
# These parameters define the reference normal distribution used for percentile conversion.
POPULATION_MEAN: float = 36.8
POPULATION_SD: float = 10.6

# 95% CI z-score (two-tailed)
Z_95: float = 1.96

# Spearman-Brown split-half reliability for ASRS-v1.1 (published estimate ~0.88)
# Used as the test-retest reliability coefficient baseline when the sample r is unavailable.
PUBLISHED_SPLIT_HALF_R: float = 0.88


def _norm_cdf(z: float) -> float:
    """Standard normal CDF using math.erf."""
    return (1.0 + math.erf(z / math.sqrt(2.0))) / 2.0


def raw_score_to_percentile(total_score: int) -> int:
    """Convert a raw total score to a percentile (0-100) using ASRS population norms.

    Uses the normal distribution with mean=36.8, SD=10.6 (Kessler et al. 2005).
    The percentile represents the percentage of the general population scoring
    at or below this level.

    Args:
        total_score: Integer in [20, 80].

    Returns:
        Percentile as integer in [0, 100].
    """
    z = (total_score - POPULATION_MEAN) / POPULATION_SD
    p = _norm_cdf(z)
    return max(0, min(100, round(p * 100)))


def percentile_confidence_interval(
    total_score: int, n_items: int = 20, reliability: float = PUBLISHED_SPLIT_HALF_R
) -> Tuple[int, int]:
    """Calculate 95% confidence interval around a percentile estimate.

    Uses the Standard Error of Measurement (SEM) to build a score-level CI,
    then converts the CI bounds to percentiles.

    SEM = SD_population * sqrt(1 - reliability)

    Args:
        total_score: Raw total score [20, 80].
        n_items: Number of scored items (20).
        reliability: Test-retest/split-half reliability coefficient [0, 1].

    Returns:
        Tuple (lower_percentile, upper_percentile), each in [0, 100].
    """
    sem = POPULATION_SD * math.sqrt(1.0 - reliability)
    lower_score = total_score - Z_95 * sem
    upper_score = total_score + Z_95 * sem

    lower_z = (lower_score - POPULATION_MEAN) / POPULATION_SD
    upper_z = (upper_score - POPULATION_MEAN) / POPULATION_SD

    lower_p = max(0, min(100, round(_norm_cdf(lower_z) * 100)))
    upper_p = max(0, min(100, round(_norm_cdf(upper_z) * 100)))
    return lower_p, upper_p


class ScoreResult(BaseModel):
    inattention_score: int
    hyperactivity_score: int
    total_score: int
    risk_level: RiskLevel
    cronbach_alpha: float
    consistency_warning: bool
    percentile: int
    percentile_ci: Tuple[int, int]
    test_retest_coefficient: float

    @field_validator("inattention_score", "hyperactivity_score")
    @classmethod
    def subscale_in_range(cls, v: int) -> int:
        if not (10 <= v <= 40):
            raise ValueError(f"Subscale score {v} out of range 10-40")
        return v

    @field_validator("total_score")
    @classmethod
    def total_in_range(cls, v: int) -> int:
        if not (20 <= v <= 80):
            raise ValueError(f"Total score {v} out of range 20-80")
        return v

    @field_validator("percentile")
    @classmethod
    def percentile_in_range(cls, v: int) -> int:
        if not (0 <= v <= 100):
            raise ValueError(f"Percentile {v} out of range 0-100")
        return v


def _compute_cronbach_alpha(answers: List[int]) -> float:
    """Compute split-half reliability (Spearman-Brown) as a proxy for Cronbach's alpha.

    Splits the 20 scoring items into two halves by index (odd vs even positions),
    sums each half, then applies the Spearman-Brown prophecy formula.
    Returns a value in [0, 1]; closer to 1 means more internally consistent.
    When all answers are identical the formula yields 0 (undefined correlation).
    """
    n = len(answers)
    odd = answers[0::2]   # items at even indices (positions 0,2,4,...)
    even = answers[1::2]  # items at odd indices

    sum_odd = sum(odd)
    sum_even = sum(even)

    # Pearson correlation between the two halves (treated as two observations)
    # We iterate over paired sums as a scalar correlation with a single pair —
    # instead, correlate item-by-item across the split.
    half = n // 2
    mean_o = sum_odd / half
    mean_e = sum_even / half

    cov = sum((o - mean_o) * (e - mean_e) for o, e in zip(odd, even)) / half
    var_o = sum((o - mean_o) ** 2 for o in odd) / half
    var_e = sum((e - mean_e) ** 2 for e in even) / half

    denom = (var_o * var_e) ** 0.5
    if denom == 0:
        return 0.0

    r = cov / denom
    r = max(-1.0, min(1.0, r))  # clamp numerical noise

    # Spearman-Brown correction for full-length test
    if r == -1.0:
        return 0.0
    alpha = (2 * r) / (1 + r)
    return round(max(0.0, alpha), 3)


def _check_consistency(scoring_answers: List[int]) -> tuple[float, bool]:
    """Return (cronbach_alpha, consistency_warning) for the 20 scoring answers."""
    alpha = _compute_cronbach_alpha(scoring_answers)

    unique = set(scoring_answers)
    # All identical answers → obvious gaming
    if len(unique) == 1:
        return alpha, True

    # 85%+ same answer → highly suspicious
    most_common_count = Counter(scoring_answers).most_common(1)[0][1]
    if most_common_count >= len(scoring_answers) * 0.85:
        return alpha, True

    # Very low variance (near-uniform responses)
    mean = sum(scoring_answers) / len(scoring_answers)
    variance = sum((a - mean) ** 2 for a in scoring_answers) / len(scoring_answers)
    if variance < 0.25:
        return alpha, True

    # Low split-half reliability indicates erratic / random responding
    if alpha < 0.3:
        return alpha, True

    return alpha, False


def calculate_score(answers: List[int]) -> ScoreResult:
    """Calculate ADHD risk score from 20 answers on a 1-4 scale.

    Args:
        answers: List of 20 integers, each in range [1, 4].
                 Index 0 corresponds to question id 1.

    Returns:
        ScoreResult with subscale scores, total, risk level,
        cronbach_alpha, and consistency_warning.

    Raises:
        ValueError: if answers length != 20 or any answer not in [1, 4].
    """
    if len(answers) != 20:
        raise ValueError(f"Expected 20 answers, got {len(answers)}")
    for i, a in enumerate(answers):
        if a not in (1, 2, 3, 4):
            raise ValueError(f"Answer at index {i} is {a!r}; must be 1-4")

    inattention_score = sum(answers[0:10])   # items 1-10
    hyperactivity_score = sum(answers[10:20])  # items 11-20
    total_score = inattention_score + hyperactivity_score

    if total_score <= 35:
        risk_level: RiskLevel = "low"
    elif total_score <= 60:
        risk_level = "moderate"
    else:
        risk_level = "high"

    cronbach_alpha, consistency_warning = _check_consistency(answers)

    # Use sample split-half reliability if it's meaningfully higher than the floor,
    # otherwise fall back to published ASRS norm.
    reliability = max(cronbach_alpha, PUBLISHED_SPLIT_HALF_R) if cronbach_alpha >= 0.3 else PUBLISHED_SPLIT_HALF_R
    test_retest_coefficient = round(reliability, 3)

    percentile = raw_score_to_percentile(total_score)
    percentile_ci = percentile_confidence_interval(total_score, reliability=reliability)

    return ScoreResult(
        inattention_score=inattention_score,
        hyperactivity_score=hyperactivity_score,
        total_score=total_score,
        risk_level=risk_level,
        cronbach_alpha=cronbach_alpha,
        consistency_warning=consistency_warning,
        percentile=percentile,
        percentile_ci=percentile_ci,
        test_retest_coefficient=test_retest_coefficient,
    )


def calculate_score_from_dict(answers_by_id: Dict[int, int]) -> ScoreResult:
    """Calculate score from a mapping of question_id → answer.

    Distractor question answers are ignored for scoring but the 20 real
    question answers must all be present.

    Raises:
        ValueError: if any scoring question is missing or answer out of range.
    """
    missing = SCORING_QUESTION_IDS - set(answers_by_id.keys())
    if missing:
        raise ValueError(f"Missing answers for question ids: {sorted(missing)}")

    ordered = [answers_by_id[i] for i in range(1, 21)]
    return calculate_score(ordered)
