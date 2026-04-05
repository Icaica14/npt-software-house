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
 */

import React, { useCallback, useEffect, useState } from 'react';

const SCALE = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Very Often' },
];

/* ─── Styles ─────────────────────────────────────────────── */

const s = {
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '560px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(79, 70, 229, 0.12)',
  },
  header: {
    marginBottom: '1.25rem',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#6b7280',
    marginBottom: '0.35rem',
  },
  progressTrack: {
    height: '6px',
    background: '#e5e7eb',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  progressFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: '#4f46e5',
    borderRadius: '99px',
    transition: 'width 0.3s ease',
  }),
  badge: (category) => ({
    display: 'inline-block',
    padding: '0.2rem 0.65rem',
    borderRadius: '99px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: category === 'inattention' ? '#ede9fe' : '#fce7f3',
    color: category === 'inattention' ? '#5b21b6' : '#9d174d',
    marginBottom: '0.75rem',
  }),
  question: {
    fontSize: '1.15rem',
    fontWeight: 600,
    lineHeight: 1.5,
    color: '#1e1b4b',
    marginBottom: '1.5rem',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginBottom: '1.75rem',
  },
  option: (selected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    border: `2px solid ${selected ? '#4f46e5' : '#e5e7eb'}`,
    borderRadius: '10px',
    background: selected ? '#eef2ff' : '#fff',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
  }),
  radio: (selected) => ({
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: `2px solid ${selected ? '#4f46e5' : '#9ca3af'}`,
    background: selected ? '#4f46e5' : 'transparent',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  radioDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#fff',
  },
  optionLabel: (selected) => ({
    fontSize: '0.95rem',
    color: selected ? '#312e81' : '#374151',
    fontWeight: selected ? 600 : 400,
  }),
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.75rem',
  },
  btn: (variant) => ({
    flex: variant === 'primary' ? 1 : 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    background: variant === 'primary' ? '#4f46e5' : '#f3f4f6',
    color: variant === 'primary' ? '#fff' : '#374151',
    opacity: 1,
    transition: 'opacity 0.15s',
  }),
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    padding: '2rem',
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

  if (loading) return <div style={s.loading}>Loading questions…</div>;
  if (error) return <div style={s.error}>Failed to load questions: {error}</div>;
  if (!questions.length) return <div style={s.error}>No questions available.</div>;

  const q = questions[current];
  const total = questions.length;
  const progressPct = ((current + 1) / total) * 100;
  const selected = answers[q.id];
  const isFirst = current === 0;
  const isLast = current === total - 1;
  const canAdvance = selected != null;

  return (
    <div style={s.card}>
      {/* Progress */}
      <div style={s.header}>
        <div style={s.progressLabel}>
          <span>Question {current + 1} of {total}</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div style={s.progressTrack}>
          <div style={s.progressFill(progressPct)} />
        </div>
      </div>

      {/* Category badge */}
      <div style={s.badge(q.category)}>
        {q.category === 'inattention' ? 'Inattention' : 'Hyperactivity'}
      </div>

      {/* Question text */}
      <div style={s.question}>{q.text}</div>

      {/* Answer options */}
      <div style={s.options} role="radiogroup" aria-label="Answer options">
        {SCALE.map(({ value, label }) => {
          const isSelected = selected === value;
          return (
            <div
              key={value}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              style={s.option(isSelected)}
              onClick={() => selectAnswer(q.id, value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectAnswer(q.id, value);
                }
              }}
            >
              <div style={s.radio(isSelected)}>
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
          style={{ ...s.btn('secondary'), ...(isFirst ? s.btnDisabled : {}) }}
          onClick={goPrev}
          disabled={isFirst}
          aria-label="Previous question"
        >
          Previous
        </button>

        {isLast ? (
          <button
            style={{ ...s.btn('primary'), ...(!canAdvance ? s.btnDisabled : {}) }}
            onClick={handleSubmit}
            disabled={!canAdvance}
            aria-label="Submit quiz"
          >
            Submit
          </button>
        ) : (
          <button
            style={{ ...s.btn('primary'), ...(!canAdvance ? s.btnDisabled : {}) }}
            onClick={goNext}
            disabled={!canAdvance}
            aria-label="Next question"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
