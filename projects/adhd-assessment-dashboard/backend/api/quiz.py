# Quiz logic: question bank and scoring algorithm
# TODO: Software Engineer will implement:
# - QUESTIONS dict with 20 items (from docs/QUESTIONS.md)
# - calculate_score(answers: list) → dict with score, risk_level, subscores
# - Risk thresholds: 20-35=low, 36-60=moderate, 61-80=high

QUESTIONS = [
    # TODO: Add 20 screening questions from docs/QUESTIONS.md
    # Each: {"id": 1, "text": "...", "category": "inattention"}
]

def calculate_score(answers: list) -> dict:
    """
    Calculate ADHD risk assessment from answers.

    Args:
        answers: List of 20 integers (1-4 scale)

    Returns:
        {
            "total_score": int (20-80),
            "inattention_score": int (10-40),
            "hyperactivity_score": int (10-40),
            "risk_level": "low" | "moderate" | "high",
            "percentile": int (0-100)
        }
    """
    # TODO: Implement scoring
    pass
