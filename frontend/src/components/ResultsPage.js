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
    color: '#065f46',
    bg: '#d1fae5',
    border: '#6ee7b7',
    text: 'Your responses suggest few symptoms associated with ADHD at this time.',
  },
  moderate: {
    label: 'Moderate Risk',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fcd34d',
    text:
      'Your responses suggest some symptoms associated with ADHD. Consider discussing these results with a healthcare provider.',
  },
  high: {
    label: 'High Risk',
    color: '#991b1b',
    bg: '#fee2e2',
    border: '#fca5a5',
    text:
      'Your responses suggest several symptoms associated with ADHD. We recommend consulting a qualified healthcare professional for a full evaluation.',
  },
};

const ADHD_RESOURCES = [
  {
    name: 'CHADD (Children and Adults with ADHD)',
    url: 'https://chadd.org',
    description: 'National nonprofit providing education, advocacy, and support for ADHD.',
  },
  {
    name: 'ADDitude Magazine',
    url: 'https://www.additudemag.com',
    description: 'Expert guidance and real-life strategies for living with ADHD.',
  },
];

const s = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  wrapper: {
    maxWidth: '540px',
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
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)',
  },
  riskBanner: (risk) => ({
    background: RISK_META[risk].bg,
    border: `1px solid ${RISK_META[risk].border}`,
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  }),
  riskLabel: (risk) => ({
    display: 'inline-block',
    padding: '0.3rem 0.9rem',
    borderRadius: '99px',
    background: RISK_META[risk].color,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.85rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  }),
  totalScore: {
    fontSize: '3.5rem',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1,
  },
  totalScoreSuffix: {
    fontSize: '1.3rem',
    color: '#9ca3af',
    fontWeight: 500,
  },
  totalLabel: {
    fontSize: '0.85rem',
    color: '#6b7280',
    marginTop: '0.25rem',
    fontWeight: 500,
  },
  scoreRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  subscale: (bg) => ({
    flex: 1,
    background: bg,
    borderRadius: '12px',
    padding: '1rem',
    textAlign: 'center',
  }),
  subscaleValue: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1,
  },
  subscaleLabel: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#4b5563',
    marginTop: '0.35rem',
    lineHeight: 1.4,
  },
  interpretation: {
    fontSize: '0.95rem',
    color: '#374151',
    lineHeight: 1.65,
    marginBottom: '1.25rem',
  },
  disclaimer: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '0.9rem 1rem',
    fontSize: '0.82rem',
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
  },
  disclaimerBold: {
    fontWeight: 700,
    color: '#374151',
  },
  resources: {
    marginBottom: '1.5rem',
  },
  resourcesHeading: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#374151',
    marginBottom: '0.75rem',
  },
  resourceItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    marginBottom: '0.5rem',
    background: '#f9fafb',
  },
  resourceLink: {
    fontSize: '0.9rem',
    color: '#1e40af',
    fontWeight: 600,
    textDecoration: 'none',
  },
  resourceDesc: {
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  retakeBtn: {
    width: '100%',
    padding: '0.85rem',
    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(30,64,175,0.3)',
    transition: 'opacity 0.15s',
  },
};

export default function ResultsPage({ result, onRetake }) {
  const { total_score, inattention_score, hyperactivity_score, risk_level } = result;
  const meta = RISK_META[risk_level];

  return (
    <div style={s.container}>
      <div style={s.wrapper}>
        <div style={s.heading} aria-hidden="true">
          <div style={s.headingTitle}>Your Results</div>
        </div>

        <main id="main-content">
          <div style={s.card} aria-label="Quiz results">

            {/* Risk banner */}
            <section
              style={s.riskBanner(risk_level)}
              aria-label={`Risk level: ${meta.label}`}
            >
              <div style={s.riskLabel(risk_level)}>{meta.label}</div>
              <div>
                <span style={s.totalScore} aria-label={`Total score: ${total_score} out of 80`}>
                  {total_score}
                  <span style={s.totalScoreSuffix} aria-hidden="true"> / 80</span>
                </span>
                <div style={s.totalLabel}>Total Score</div>
              </div>
            </section>

            {/* Subscale breakdown */}
            <div
              style={s.scoreRow}
              aria-label="Subscale scores"
            >
              <div
                style={s.subscale('#dbeafe')}
                aria-label={`Inattention score: ${inattention_score} out of 40`}
              >
                <div style={s.subscaleValue}>{inattention_score}</div>
                <div style={s.subscaleLabel}>Inattention<br /><span aria-hidden="true">(max 40)</span></div>
              </div>
              <div
                style={s.subscale('#fce7f3')}
                aria-label={`Hyperactivity score: ${hyperactivity_score} out of 40`}
              >
                <div style={s.subscaleValue}>{hyperactivity_score}</div>
                <div style={s.subscaleLabel}>Hyperactivity<br /><span aria-hidden="true">(max 40)</span></div>
              </div>
            </div>

            {/* Interpretation */}
            <p style={s.interpretation}>{meta.text}</p>

            {/* Disclaimer */}
            <div
              style={s.disclaimer}
              role="note"
              aria-label="Medical disclaimer"
            >
              <span style={s.disclaimerBold}>Not a medical diagnosis.</span>{' '}
              This screening tool is for informational purposes only and does not
              constitute a clinical diagnosis. Please consult a qualified healthcare
              provider for a full evaluation.
            </div>

            {/* Learn More Resources */}
            <section style={s.resources} aria-labelledby="resources-heading">
              <div id="resources-heading" style={s.resourcesHeading}>
                Learn More About ADHD
              </div>
              {ADHD_RESOURCES.map((resource) => (
                <div key={resource.url} style={s.resourceItem}>
                  <a
                    href={resource.url}
                    style={s.resourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${resource.name} (opens in new tab)`}
                  >
                    {resource.name} ↗
                  </a>
                  <span style={s.resourceDesc}>{resource.description}</span>
                </div>
              ))}
            </section>

            {/* Retake */}
            <button
              style={s.retakeBtn}
              onClick={onRetake}
              aria-label="Retake the quiz from the beginning"
            >
              Retake Quiz
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
