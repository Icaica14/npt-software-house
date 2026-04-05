import React, { useState, useEffect, useCallback } from 'react';
import './QuizFlow.css';

function QuizFlow({ onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const fetchQuestions = useCallback(async () => {
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
  }, [API_BASE]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  if (loading) {
    return (
      <div className="quiz-loading" role="status" aria-live="polite">
        Loading quiz...
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="quiz-error" role="alert">
        {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-error" role="alert">
        No questions available
      </div>
    );
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

  const optionLabels = [
    { value: 1, label: 'Never / Rarely' },
    { value: 2, label: 'Sometimes' },
    { value: 3, label: 'Often' },
    { value: 4, label: 'Very Often' }
  ];

  return (
    <div className="quiz-flow">
      <header className="quiz-header" role="banner">
        <h1 className="quiz-title">ADHD Assessment Quiz</h1>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-label={`Question ${currentIndex + 1} of ${questions.length}`}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text" aria-live="polite">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </header>

      <main className="quiz-content" role="main">
        <section role="region" aria-labelledby={`question-${currentIndex}`}>
          <fieldset className="question-fieldset">
            <legend id={`question-${currentIndex}`} className="question-legend">
              {currentQuestion.text}
            </legend>

            <div className="quiz-options" role="group" aria-label="Select frequency">
              {optionLabels.map(option => {
                const isSelected = answers[currentIndex] === option.value;
                return (
                  <button
                    key={option.value}
                    className={`option-button${isSelected ? ' selected' : ''}`}
                    onClick={() => handleAnswer(option.value)}
                    aria-pressed={isSelected}
                    aria-label={`${option.label} — option ${option.value} of 4`}
                    type="button"
                  >
                    <span className="option-value" aria-hidden="true">{option.value}</span>
                    <span className="option-label">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && (
            <div className="quiz-error" role="alert" aria-live="assertive">
              {error}
            </div>
          )}
        </section>
      </main>

      <nav className="quiz-footer" role="navigation" aria-label="Quiz navigation">
        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          aria-label="Go to previous question"
          type="button"
        >
          ← Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!isAnswered}
            aria-label="Submit quiz answers"
            aria-disabled={!isAnswered}
            type="button"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            className="nav-button nav-button--next"
            onClick={handleNext}
            disabled={!isAnswered}
            aria-label="Go to next question"
            aria-disabled={!isAnswered}
            type="button"
          >
            Next →
          </button>
        )}
      </nav>
    </div>
  );
}

export default QuizFlow;
