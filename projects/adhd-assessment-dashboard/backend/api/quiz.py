# Quiz logic: question bank and scoring algorithm
from typing import List, Dict

QUESTIONS = [
    # Inattention items (1-10)
    {
        "id": 1,
        "text": "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
        "category": "inattention"
    },
    {
        "id": 2,
        "text": "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
        "category": "inattention"
    },
    {
        "id": 3,
        "text": "How often do you have problems remembering appointments or obligations?",
        "category": "inattention"
    },
    {
        "id": 4,
        "text": "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
        "category": "inattention"
    },
    {
        "id": 5,
        "text": "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
        "category": "inattention"
    },
    {
        "id": 6,
        "text": "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
        "category": "inattention"
    },
    {
        "id": 7,
        "text": "How often do you make careless mistakes when you have to work on a boring or difficult project?",
        "category": "inattention"
    },
    {
        "id": 8,
        "text": "How often do you have trouble concentrating on what people say to you, even when they are speaking directly to you?",
        "category": "inattention"
    },
    {
        "id": 9,
        "text": "How often do you have difficulty sustaining attention to tasks or recreational activities?",
        "category": "inattention"
    },
    {
        "id": 10,
        "text": "How often do you lose important things?",
        "category": "inattention"
    },
    # Hyperactivity/Impulsivity items (11-20)
    {
        "id": 11,
        "text": "How often do you feel restless or fidgety?",
        "category": "hyperactivity"
    },
    {
        "id": 12,
        "text": "How often do you have trouble waiting your turn?",
        "category": "hyperactivity"
    },
    {
        "id": 13,
        "text": "How often do you interrupt others when they are speaking?",
        "category": "hyperactivity"
    },
    {
        "id": 14,
        "text": "How often do you do things without thinking about the consequences?",
        "category": "hyperactivity"
    },
    {
        "id": 15,
        "text": "How often do you have trouble organizing your time and meeting deadlines?",
        "category": "hyperactivity"
    },
    {
        "id": 16,
        "text": "How often do you leave your seat in situations when you are expected to remain seated?",
        "category": "hyperactivity"
    },
    {
        "id": 17,
        "text": "How often do you speak without thinking, saying things you later regret?",
        "category": "hyperactivity"
    },
    {
        "id": 18,
        "text": "How often do you have racing thoughts?",
        "category": "hyperactivity"
    },
    {
        "id": 19,
        "text": "How often do you struggle to filter distractions?",
        "category": "hyperactivity"
    },
    {
        "id": 20,
        "text": "How often do you misplace your keys, wallet, or phone?",
        "category": "hyperactivity"
    }
]

def calculate_score(answers: List[int]) -> Dict:
    """
    Calculate ADHD risk assessment from answers.

    Args:
        answers: List of 20 integers (1-4 scale)

    Returns:
        {
            "total_score": int (20-80),
            "inattention_score": int (10-40),
            "hyperactivity_score": int (10-40),
            "risk_level": "low" | "moderate" | "high"
        }
    """
    if len(answers) != 20:
        raise ValueError("Expected 20 answers")

    if not all(1 <= a <= 4 for a in answers):
        raise ValueError("All answers must be between 1 and 4")

    # Inattention: items 0-9 (sum 10-40)
    inattention_score = sum(answers[0:10])

    # Hyperactivity: items 10-19 (sum 10-40)
    hyperactivity_score = sum(answers[10:20])

    # Total score (20-80)
    total_score = inattention_score + hyperactivity_score

    # Determine risk level
    if total_score <= 35:
        risk_level = "low"
    elif total_score <= 60:
        risk_level = "moderate"
    else:
        risk_level = "high"

    return {
        "total_score": total_score,
        "inattention_score": inattention_score,
        "hyperactivity_score": hyperactivity_score,
        "risk_level": risk_level
    }
