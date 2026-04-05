import React, { useState, useEffect } from 'react';
import './QuizFlow.css';

function QuizFlow({ onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/quiz/questions`);
      const data = await response.json();
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(null));
      setLoading(false);
    } catch (err) {
      setError('Failed to load quiz questions. Please check your connection.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="quiz-loading">Loading quiz...</div>;
  }

  if (error) {
    return <div className="quiz-error">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="quiz-error">No questions available</div>;
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isAnswered = answers[currentIndex] !== null;

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!answers.every(a => a !== null)) {
      setError('Please answer all questions before submitting');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const result = await response.json();
      onComplete(result.assessment);
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
    }
  };

  return (
    <div className="quiz-flow">
      <div className="quiz-header">
        <h2>ADHD Assessment Quiz</h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="quiz-content">
        <h3>{currentQuestion.text}</h3>

        <div className="quiz-options">
          {[
            { value: 1, label: 'Never/Rarely' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 4, label: 'Very Often' }
          ].map(option => (
            <button
              key={option.value}
              className={`option-button ${answers[currentIndex] === option.value ? 'selected' : ''}`}
              onClick={() => handleAnswer(option.value)}
            >
              <span className="option-value">{option.value}</span>
              <span className="option-label">{option.label}</span>
            </button>
          ))}
        </div>

        {error && <div className="quiz-error">{error}</div>}
      </div>

      <div className="quiz-footer">
        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!isAnswered}
          >
            Submit Quiz
          </button>
        ) : (
          <button
            className="nav-button"
            onClick={handleNext}
            disabled={!isAnswered}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizFlow;
