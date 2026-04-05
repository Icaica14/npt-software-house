"""ADHD screening question bank.

20 questions adapted from the Adult ADHD Self-Report Scale (ASRS-v1.1)
and DSM-5 criteria.  Each question has an id, text, and category
(inattention | hyperactivity).
"""

from typing import List, Literal

from pydantic import BaseModel, field_validator


Category = Literal["inattention", "hyperactivity"]


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


def get_questions() -> List[Question]:
    """Return the full list of screening questions."""
    return QUESTIONS


def get_question_by_id(question_id: int) -> Question | None:
    """Return a single question by its id, or None if not found."""
    for q in QUESTIONS:
        if q.id == question_id:
            return q
    return None


RiskLevel = Literal["low", "moderate", "high"]


class ScoreResult(BaseModel):
    inattention_score: int
    hyperactivity_score: int
    total_score: int
    risk_level: RiskLevel

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


def calculate_score(answers: List[int]) -> ScoreResult:
    """Calculate ADHD risk score from 20 answers on a 1-4 scale.

    Args:
        answers: List of 20 integers, each in range [1, 4].
                 Index 0 corresponds to question id 1.

    Returns:
        ScoreResult with subscale scores, total, and risk level.

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

    return ScoreResult(
        inattention_score=inattention_score,
        hyperactivity_score=hyperactivity_score,
        total_score=total_score,
        risk_level=risk_level,
    )
