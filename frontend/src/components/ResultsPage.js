/**
 * ResultsPage — enhanced ADHD screening results with model explanation,
 * feature importance chart, confidence metric, resources, and PDF export.
 *
 * Props:
 *   result (object, required)
 *     Shape: { total_score, inattention_score, hyperactivity_score, risk_level }
 *     As returned by POST /api/quiz/submit.
 *   onRetake (function, required)
 *     Called when the user clicks "Retake Quiz".
 */

import React, { useState } from 'react';
import { generatePDFReport, computeConfidence } from '../utils/reportGenerator';
import './ResultsPage.css';

/* ─── Constants ─────────────────────────────────────────────────────────── */

const RISK_META = {
  low: {
    label: 'Low Risk',
    color: '#065f46',
    bg: '#d1fae5',
    border: '#6ee7b7',
    text: 'Your responses suggest few symptoms associated with ADHD at this time. Continue monitoring your wellbeing and revisit if anything changes.',
  },
  moderate: {
    label: 'Moderate Risk',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fcd34d',
    text: 'Your responses suggest some symptoms consistent with ADHD. Consider discussing these results with a healthcare provider — early awareness is a positive step.',
  },
  high: {
    label: 'Elevated Risk',
    color: '#991b1b',
    bg: '#fee2e2',
    border: '#fca5a5',
    text: 'Your responses suggest several symptoms consistent with ADHD. A professional evaluation can give you clear answers and open the door to effective support.',
  },
};

const RESOURCES = [
  {
    name: 'Psychology Today — Find a Therapist',
    url: 'https://www.psychologytoday.com/us/therapists/adhd',
    description: 'Search for ADHD-specialised clinicians near you.',
  },
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

/* ─── Sub-components ─────────────────────────────────────────────────────── */

/** Horizontal bar chart for a single subscale. */
function FeatureBar({ label, value, max, color, ariaLabel }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: '1rem' }} aria-label={ariaLabel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: '0.88rem', color: '#6b7280' }}>
          {value} / {max} &nbsp;<span style={{ color, fontWeight: 700 }}>({pct}%)</span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel}
        style={{
          background: '#f3f4f6',
          borderRadius: '6px',
          height: '14px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: '6px',
            transition: 'width 0.8s ease',
          }}
        />
      </div>
    </div>
  );
}

/** Circular confidence badge. */
function ConfidenceBadge({ pct }) {
  const radius = 32;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#2563eb"
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="44" y="48" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#1e40af">
          {pct}%
        </text>
      </svg>
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e40af' }}>
          {pct}% confident
        </div>
        <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5, maxWidth: '280px' }}>
          How clearly your responses align with established ADHD symptom patterns.
        </div>
      </div>
    </div>
  );
}

/** Collapsible section. */
function Section({ id, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section aria-labelledby={id} style={{ marginBottom: '1.5rem' }}>
      <button
        id={id}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="results-section-toggle"
        style={{ marginBottom: open ? '1rem' : 0 }}
      >
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e3a8a' }}>{title}</span>
        <span style={{ fontSize: '1rem', color: '#6b7280', userSelect: 'none' }} aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function ResultsPage({ result, onRetake }) {
  const { total_score, inattention_score, hyperactivity_score, risk_level } = result;
  const meta = RISK_META[risk_level] || RISK_META.moderate;
  const confidence = computeConfidence(total_score, risk_level);
  const [pdfLoading, setPdfLoading] = useState(false);

  function handleDownloadPDF() {
    setPdfLoading(true);
    try {
      generatePDFReport({ ...result, confidence });
    } finally {
      setTimeout(() => setPdfLoading(false), 1000);
    }
  }

  const nextSteps = getNextSteps(risk_level);

  return (
    <div style={styles.container}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div style={styles.wrapper}>

        {/* Page heading */}
        <header style={styles.heading}>
          <div style={styles.headingTitle}>Your Screening Results</div>
          <div style={styles.headingSubtitle}>
            Based on your responses — not a clinical diagnosis
          </div>
        </header>

        <main id="main-content">
          <div style={styles.card} aria-label="Quiz results">

            {/* ── Risk banner ── */}
            <section style={styles.riskBanner(risk_level)} aria-label={`Risk level: ${meta.label}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={styles.riskLabel(risk_level)}>{meta.label}</div>
                  <p style={styles.riskText}>{meta.text}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div
                    style={styles.totalScore}
                    aria-label={`Total score: ${total_score} out of 80`}
                  >
                    {total_score}
                    <span style={styles.totalScoreSuffix} aria-hidden="true"> / 80</span>
                  </div>
                  <div style={styles.totalLabel}>Total Score</div>
                </div>
              </div>
            </section>

            {/* ── Subscale breakdown ── */}
            <Section id="subscale-heading" title="Subscale Breakdown">
              <div
                style={styles.scoreRow}
                aria-label="Subscale scores"
              >
                <div
                  style={styles.subscale('#dbeafe')}
                  aria-label={`Inattention score: ${inattention_score} out of 40`}
                >
                  <div style={styles.subscaleValue}>{inattention_score}</div>
                  <div style={styles.subscaleLabel}>
                    Inattention<br />
                    <span aria-hidden="true" style={{ fontWeight: 400, color: '#9ca3af' }}>(max 40)</span>
                  </div>
                </div>
                <div
                  style={styles.subscale('#fce7f3')}
                  aria-label={`Hyperactivity score: ${hyperactivity_score} out of 40`}
                >
                  <div style={styles.subscaleValue}>{hyperactivity_score}</div>
                  <div style={styles.subscaleLabel}>
                    Hyperactivity<br />
                    <span aria-hidden="true" style={{ fontWeight: 400, color: '#9ca3af' }}>(max 40)</span>
                  </div>
                </div>
              </div>

              <FeatureBar
                label="Inattention"
                value={inattention_score}
                max={40}
                color="#3b82f6"
                ariaLabel={`Inattention: ${inattention_score} out of 40`}
              />
              <FeatureBar
                label="Hyperactivity / Impulsivity"
                value={hyperactivity_score}
                max={40}
                color="#ec4899"
                ariaLabel={`Hyperactivity: ${hyperactivity_score} out of 40`}
              />
              <FeatureBar
                label="Combined Total"
                value={total_score}
                max={80}
                color="#6366f1"
                ariaLabel={`Combined total: ${total_score} out of 80`}
              />
              <p style={styles.smallNote}>
                Inattention questions measure focus, organisation, and follow-through.
                Hyperactivity/Impulsivity questions measure restlessness, interrupting, and impulsive behaviour.
              </p>
            </Section>

            {/* ── Confidence metric ── */}
            <Section id="confidence-heading" title="Assessment Confidence">
              <ConfidenceBadge pct={confidence} />
              <p style={{ ...styles.smallNote, marginTop: '0.75rem' }}>
                Confidence reflects how far your score falls from the nearest risk threshold.
                Scores clearly within one range yield higher confidence; borderline scores yield lower confidence.
              </p>
            </Section>

            {/* ── How This Works ── */}
            <Section id="how-heading" title="How This Works" defaultOpen={false}>
              <p style={styles.bodyText}>
                This tool uses an 18-question self-report screener based on DSM-5 criteria —
                the same diagnostic framework used by clinicians. Nine questions assess{' '}
                <strong>Inattention</strong> (e.g., difficulty sustaining attention, losing things,
                forgetfulness) and nine assess{' '}
                <strong>Hyperactivity/Impulsivity</strong> (e.g., restlessness, interrupting, excessive talking).
              </p>
              <p style={{ ...styles.bodyText, marginTop: '0.6rem' }}>
                Each answer is scored 0 (Never) to 4 (Very Often), producing subscale totals of 0–36,
                normalised here to 0–40 for clarity, with a combined total of 0–80.
              </p>
              <div style={styles.thresholdTable} aria-label="Risk thresholds">
                {[
                  { range: '0 – 29', label: 'Low Risk', color: '#065f46', bg: '#d1fae5' },
                  { range: '30 – 49', label: 'Moderate Risk', color: '#92400e', bg: '#fef3c7' },
                  { range: '50 – 80', label: 'Elevated Risk', color: '#991b1b', bg: '#fee2e2' },
                ].map(({ range, label, color, bg }) => (
                  <div
                    key={label}
                    style={{ ...styles.thresholdRow, background: bg, borderColor: color + '40' }}
                  >
                    <span style={{ fontWeight: 700, color }}>{label}</span>
                    <span style={{ color: '#374151' }}>{range}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Next Steps ── */}
            <Section id="nextsteps-heading" title="Professional Next Steps">
              <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {nextSteps.map((step, i) => (
                  <li
                    key={i}
                    style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.65, marginBottom: '0.5rem' }}
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </Section>

            {/* ── Resources ── */}
            <Section id="resources-heading" title="Resources">
              {RESOURCES.map((r) => (
                <div key={r.url} style={styles.resourceItem}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="results-resource-link"
                    aria-label={`${r.name} (opens in new tab)`}
                  >
                    {r.name} ↗
                  </a>
                  <span style={styles.resourceDesc}>{r.description}</span>
                </div>
              ))}
            </Section>

            {/* ── Disclaimer ── */}
            <div style={styles.disclaimer} role="note" aria-label="Medical disclaimer">
              <div style={styles.disclaimerHeader}>
                <span style={styles.disclaimerIcon} aria-hidden="true">⚠️</span>
                <span style={styles.disclaimerBold}>Professional Evaluation Strongly Recommended</span>
              </div>
              <p style={styles.disclaimerBody}>
                These results are for <strong>informational and educational purposes only</strong> — they do not
                constitute a medical diagnosis. ADHD diagnosis requires a comprehensive evaluation by a
                licensed healthcare professional, including a structured clinical interview, behaviour
                rating scales, and a review of medical and developmental history.
              </p>
              <p style={styles.disclaimerBody}>
                <strong>Self-report bias note:</strong> This tool relies solely on your own responses.
                Anxiety, depression, sleep disorders, and other conditions can produce overlapping
                symptoms. A clinician can help distinguish between them.
              </p>
              <p style={{ ...styles.disclaimerBody, marginBottom: 0 }}>
                <strong>Accessibility note:</strong> This screener works best as a starting point for
                self-reflection and conversation with a healthcare provider. It is not a substitute for
                a professional assessment.
              </p>
            </div>

            {/* ── Actions ── */}
            <div style={styles.actions}>
              <button
                className="results-btn-secondary"
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                aria-label="Download a PDF report of your results"
              >
                {pdfLoading ? 'Preparing…' : '⬇ Download PDF Report'}
              </button>
              <button
                className="results-btn-primary"
                onClick={onRetake}
                aria-label="Retake the quiz from the beginning"
              >
                Retake Quiz
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function getNextSteps(risk_level) {
  const shared = [
    'Track your daily challenges in a journal to help any future evaluation.',
    'Learn about ADHD through reputable resources like CHADD and ADDitude Magazine.',
  ];
  if (risk_level === 'low') {
    return [
      'Continue monitoring your wellbeing and revisit this screener if symptoms change.',
      ...shared,
    ];
  }
  if (risk_level === 'moderate') {
    return [
      'Schedule a conversation with your primary care physician and share these results.',
      'Ask for a referral to a psychologist or psychiatrist who specialises in adult ADHD.',
      'Prepare a list of specific situations where symptoms affect your daily life.',
      ...shared,
    ];
  }
  return [
    'Schedule a comprehensive evaluation with a licensed psychologist or psychiatrist.',
    'Bring this report and a symptom log to your appointment.',
    'Ask your provider about neuropsychological testing for a thorough assessment.',
    'Consider informing a trusted family member or colleague for an additional perspective.',
    ...shared,
  ];
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem 3rem',
    background: '#f0f4f8',
  },
  wrapper: {
    maxWidth: '620px',
    width: '100%',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  headingTitle: {
    fontSize: '1.7rem',
    fontWeight: 800,
    color: '#1e3a8a',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  headingSubtitle: {
    fontSize: '0.88rem',
    color: '#6b7280',
    marginTop: '0.3rem',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  },
  riskBanner: (risk) => ({
    background: RISK_META[risk].bg,
    border: `1px solid ${RISK_META[risk].border}`,
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1.75rem',
  }),
  riskLabel: (risk) => ({
    display: 'inline-block',
    padding: '0.3rem 0.9rem',
    borderRadius: '99px',
    background: RISK_META[risk].color,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.8rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  }),
  riskText: {
    fontSize: '0.88rem',
    color: '#374151',
    lineHeight: 1.6,
    maxWidth: '380px',
    marginTop: '0.35rem',
  },
  totalScore: {
    fontSize: '3rem',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1,
  },
  totalScoreSuffix: {
    fontSize: '1.2rem',
    color: '#9ca3af',
    fontWeight: 500,
  },
  totalLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginTop: '0.2rem',
    fontWeight: 500,
  },
  scoreRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.25rem',
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
  bodyText: {
    fontSize: '0.9rem',
    color: '#374151',
    lineHeight: 1.65,
  },
  smallNote: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    lineHeight: 1.55,
  },
  thresholdTable: {
    marginTop: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  thresholdRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.88rem',
  },
  disclaimer: {
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '10px',
    padding: '1rem 1.1rem',
    fontSize: '0.82rem',
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '1.25rem',
  },
  disclaimerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.6rem',
  },
  disclaimerIcon: {
    fontSize: '1rem',
  },
  disclaimerBold: {
    fontWeight: 700,
    color: '#9a3412',
    fontSize: '0.88rem',
  },
  disclaimerBody: {
    fontSize: '0.82rem',
    color: '#6b7280',
    lineHeight: 1.6,
    marginTop: 0,
    marginBottom: '0.55rem',
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
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  pdfBtn: {
    width: '100%',
    padding: '0.85rem',
    background: '#fff',
    color: '#1e40af',
    border: '2px solid #1e40af',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
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
