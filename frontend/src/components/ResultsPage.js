/**
 * ResultsPage — displays scored ADHD screening results.
 *
 * Props:
 *   result (object, required)
 *     Shape: { total_score, inattention_score, hyperactivity_score, risk_level }
 *     As returned by POST /api/quiz/submit.
 *   onRetake (function, required)
 *     Called when the user clicks "Retake Quiz".
 */

import React from 'react';

const RISK_META = {
  low: {
    label: 'Low Risk',
    color: '#16a34a',
    bg: '#dcfce7',
    text:
      'Your responses suggest few symptoms associated with ADHD at this time.',
  },
  moderate: {
    label: 'Moderate Risk',
    color: '#d97706',
    bg: '#fef3c7',
    text:
      'Your responses suggest some symptoms associated with ADHD. Consider discussing these results with a healthcare provider.',
  },
  high: {
    label: 'High Risk',
    color: '#dc2626',
    bg: '#fee2e2',
    text:
      'Your responses suggest several symptoms associated with ADHD. We recommend consulting a qualified healthcare professional for a full evaluation.',
  },
};

const s = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(79, 70, 229, 0.12)',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e1b4b',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  riskBadge: (risk) => ({
    display: 'inline-block',
    padding: '0.4rem 1rem',
    borderRadius: '99px',
    background: RISK_META[risk].bg,
    color: RISK_META[risk].color,
    fontWeight: 700,
    fontSize: '1rem',
    marginBottom: '0.5rem',
  }),
  totalScore: {
    fontSize: '3rem',
    fontWeight: 800,
    color: '#312e81',
    lineHeight: 1,
    marginBottom: '0.25rem',
  },
  totalLabel: {
    fontSize: '0.85rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  scoreRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  subscale: (color) => ({
    flex: 1,
    background: color,
    borderRadius: '12px',
    padding: '1rem',
    textAlign: 'center',
  }),
  subscaleValue: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#1e1b4b',
  },
  subscaleLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#4b5563',
    marginTop: '0.25rem',
  },
  interpretation: {
    fontSize: '0.95rem',
    color: '#374151',
    lineHeight: 1.6,
    marginBottom: '1.25rem',
  },
  disclaimer: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '0.9rem 1rem',
    fontSize: '0.82rem',
    color: '#6b7280',
    lineHeight: 1.55,
    marginBottom: '1.5rem',
  },
  disclaimerBold: {
    fontWeight: 700,
    color: '#374151',
  },
  retakeBtn: {
    width: '100%',
    padding: '0.8rem',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  scoreSection: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
};

export default function ResultsPage({ result, onRetake }) {
  const { total_score, inattention_score, hyperactivity_score, risk_level } = result;
  const meta = RISK_META[risk_level];

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.heading}>Your Results</div>

        {/* Total score + risk */}
        <div style={s.scoreSection}>
          <div style={s.riskBadge(risk_level)}>{meta.label}</div>
          <div style={s.totalScore}>{total_score} <span style={{ fontSize: '1.2rem', color: '#9ca3af' }}>/ 80</span></div>
          <div style={s.totalLabel}>Total Score</div>
        </div>

        {/* Subscale breakdown */}
        <div style={s.scoreRow}>
          <div style={s.subscale('#ede9fe')}>
            <div style={s.subscaleValue}>{inattention_score}</div>
            <div style={s.subscaleLabel}>Inattention<br />(max 40)</div>
          </div>
          <div style={s.subscale('#fce7f3')}>
            <div style={s.subscaleValue}>{hyperactivity_score}</div>
            <div style={s.subscaleLabel}>Hyperactivity<br />(max 40)</div>
          </div>
        </div>

        {/* Interpretation */}
        <p style={s.interpretation}>{meta.text}</p>

        {/* Disclaimer */}
        <div style={s.disclaimer}>
          <span style={s.disclaimerBold}>Not a medical diagnosis.</span>{' '}
          This screening tool is for informational purposes only and does not
          constitute a clinical diagnosis. Please consult a qualified healthcare
          provider for a full evaluation.
        </div>

        <button style={s.retakeBtn} onClick={onRetake}>
          Retake Quiz
        </button>
      </div>
    </div>
  );
}
