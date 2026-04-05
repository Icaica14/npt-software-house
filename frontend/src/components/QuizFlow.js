/**
 * QuizFlow — step-by-step ADHD screening quiz component.
 *
 * Props:
 *   onComplete (function, required)
 *     Called with `answers` object when the user submits the final question.
 *     Shape: { [questionId: number]: number }  — value is 1-4 (Never…Very Often).
 *
 * Behaviour:
 *   - Fetches all questions from GET /api/quiz/questions on mount.
 *   - Displays one question at a time with a progress bar.
 *   - Supports Next / Previous navigation; Submit on the final question.
 *   - Answers are stored in local state and never sent to the server by this
 *     component — the parent receives them via `onComplete`.
 *   - Fully keyboard navigable and screen-reader friendly (WCAG 2.1 AA).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import './QuizFlow.css';

const SCALE = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Very Often' },
];

/* ─── Styles ─────────────────────────────────────────────── */

const s = {
  wrapper: {
    maxWidth: '580px',
    width: '100%',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  headingTitle: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#1e3a8a',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  headingSubtitle: {
    fontSize: '0.92rem',
    color: '#6b7280',
    marginTop: '0.3rem',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)',
  },
  header: {
    marginBottom: '1.5rem',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  progressTrack: {
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  progressFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: 'linear-gradient(90deg, #1e40af, #3b82f6)',
    borderRadius: '99px',
    transition: 'width 0.35s ease',
  }),
  badge: (category) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '99px',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    background: category === 'inattention' ? '#dbeafe' : '#fce7f3',
    color: category === 'inattention' ? '#1e40af' : '#9d174d',
    marginBottom: '0.85rem',
  }),
  question: {
    fontSize: '1.1rem',
    fontWeight: 600,
    lineHeight: 1.55,
    color: '#111827',
    marginBottom: '1.5rem',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
    marginBottom: '1.75rem',
  },
  option: (selected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.8rem 1rem',
    border: `2px solid ${selected ? '#1e40af' : '#e5e7eb'}`,
    borderRadius: '10px',
    background: selected ? '#dbeafe' : '#fff',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
    userSelect: 'none',
  }),
  radio: (selected) => ({
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: `2px solid ${selected ? '#1e40af' : '#9ca3af'}`,
    background: selected ? '#1e40af' : 'transparent',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.15s, background 0.15s',
  }),
  radioDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#fff',
  },
  optionLabel: (selected) => ({
    fontSize: '0.95rem',
    color: selected ? '#1e3a8a' : '#374151',
    fontWeight: selected ? 600 : 400,
  }),
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.75rem',
  },
  btnSecondary: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    background: '#fff',
    color: '#374151',
    transition: 'border-color 0.15s, background 0.15s',
  },
  btnSecondaryDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  btnPrimary: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    color: '#fff',
    transition: 'opacity 0.15s, transform 0.1s',
    boxShadow: '0 2px 4px rgba(30,64,175,0.3)',
  },
  btnPrimaryDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    padding: '2rem',
    fontWeight: 500,
  },
  loading: {
    color: '#6b7280',
    textAlign: 'center',
    padding: '2rem',
  },
};

/* ─── Component ──────────────────────────────────────────── */

export default function QuizFlow({ onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const questionRef = useRef(null);

  useEffect(() => {
    fetch('/api/quiz/questions')
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Move focus to question heading on navigation for screen readers
  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.focus();
    }
  }, [current]);

  const selectAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const goNext = useCallback(() => {
    setCurrent((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length]);

  const goPrev = useCallback(() => {
    setCurrent((i) => Math.max(i - 1, 0));
  }, []);

  const handleSubmit = useCallback(() => {
    onComplete(answers);
  }, [answers, onComplete]);

  if (loading) return <div style={s.loading} aria-live="polite" aria-busy="true">Loading questions…</div>;
  if (error) return <div style={s.error} role="alert">Failed to load questions: {error}</div>;
  if (!questions.length) return <div style={s.error} role="alert">No questions available.</div>;

  const q = questions[current];
  const total = questions.length;
  const progressPct = ((current + 1) / total) * 100;
  const selected = answers[q.id];
  const isFirst = current === 0;
  const isLast = current === total - 1;
  const canAdvance = selected != null;
  const categoryLabel = q.category === 'inattention' ? 'Inattention' : 'Hyperactivity';

  return (
    <div style={s.wrapper}>
      {/* App heading */}
      <div style={s.heading} aria-hidden="true">
        <div style={s.headingTitle}>ADHD Screening Quiz</div>
        <div style={s.headingSubtitle}>Answer honestly — there are no right or wrong answers.</div>
      </div>

      <div style={s.card}>
        {/* Progress */}
        <div style={s.header}>
          <div style={s.progressLabel}>
            <span>Question {current + 1} of {total}</span>
            <span aria-hidden="true">{Math.round(progressPct)}% complete</span>
          </div>
          <div
            style={s.progressTrack}
            role="progressbar"
            aria-valuenow={current + 1}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-label={`Question ${current + 1} of ${total}`}
          >
            <div style={s.progressFill(progressPct)} />
          </div>
        </div>

        {/* Category badge */}
        <div style={s.badge(q.category)} aria-hidden="true">
          {categoryLabel}
        </div>

        {/* Question text — focusable for screen reader announcement */}
        <div
          ref={questionRef}
          style={s.question}
          tabIndex={-1}
          aria-label={`${categoryLabel} question ${current + 1}: ${q.text}`}
          id="quiz-question"
        >
          {q.text}
        </div>

        {/* Answer options */}
        <div
          style={s.options}
          role="radiogroup"
          aria-labelledby="quiz-question"
          aria-required="true"
        >
          {SCALE.map(({ value, label }) => {
            const isSelected = selected === value;
            const optionId = `option-${q.id}-${value}`;
            return (
              <div
                key={value}
                id={optionId}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className="quiz-option"
                style={s.option(isSelected)}
                onClick={() => selectAnswer(q.id, value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectAnswer(q.id, value);
                  }
                  // Arrow key navigation within group
                  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const idx = SCALE.findIndex((s) => s.value === value);
                    const next = SCALE[Math.min(idx + 1, SCALE.length - 1)];
                    selectAnswer(q.id, next.value);
                  }
                  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const idx = SCALE.findIndex((s) => s.value === value);
                    const prev = SCALE[Math.max(idx - 1, 0)];
                    selectAnswer(q.id, prev.value);
                  }
                }}
              >
                <div style={s.radio(isSelected)} aria-hidden="true">
                  {isSelected && <div style={s.radioDot} />}
                </div>
                <span style={s.optionLabel(isSelected)}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={s.nav}>
          <button
            className="quiz-btn-secondary"
            style={{
              ...(isFirst ? s.btnSecondaryDisabled : {}),
            }}
            onClick={goPrev}
            disabled={isFirst}
            aria-label="Go to previous question"
          >
            Previous
          </button>

          {isLast ? (
            <button
              className="quiz-btn-primary"
              style={{ flex: 1 }}
              onClick={handleSubmit}
              disabled={!canAdvance}
              aria-label="Submit your quiz answers"
              aria-describedby={!canAdvance ? 'submit-hint' : undefined}
            >
              Submit
            </button>
          ) : (
            <button
              className="quiz-btn-primary"
              style={{ flex: 1 }}
              onClick={goNext}
              disabled={!canAdvance}
              aria-label="Go to next question"
              aria-describedby={!canAdvance ? 'submit-hint' : undefined}
            >
              Next
            </button>
          )}
        </div>

        {!canAdvance && (
          <p
            id="submit-hint"
            style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6b7280', marginTop: '0.75rem' }}
            aria-live="polite"
          >
            Please select an answer to continue.
          </p>
        )}
      </div>
    </div>
  );
}
