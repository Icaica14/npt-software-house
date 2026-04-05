/**
 * ConsentScreen — informed consent modal shown before the user starts the quiz.
 *
 * Props:
 *   onAccept (function, required) — called when the user checks the box and clicks "Begin".
 */

import React, { useState } from 'react';

export default function ConsentScreen({ onAccept }) {
  const [checked, setChecked] = useState(false);

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <div style={styles.modal}>
        <header>
          <h1 id="consent-title" style={styles.title}>Before You Begin</h1>
          <p style={styles.subtitle}>Please read the following information carefully.</p>
        </header>

        <section aria-labelledby="about-heading" style={styles.section}>
          <h2 id="about-heading" style={styles.sectionHeading}>About This Tool</h2>
          <p style={styles.body}>
            This is a self-report ADHD screener based on the 18-question Adult ADHD
            Self-Report Scale (ASRS), aligned with DSM-5 criteria. It was developed as an
            educational tool and trained on population-level symptom data.
          </p>
        </section>

        <section aria-labelledby="limitations-heading" style={styles.section}>
          <h2 id="limitations-heading" style={styles.sectionHeading}>Known Limitations &amp; Biases</h2>
          <ul style={styles.list}>
            <li>
              The underlying model was validated on adult self-report data and may perform
              differently across ages, genders, or cultural contexts.
            </li>
            <li>
              Self-report measures are subject to response bias — symptoms may be
              over- or under-reported depending on your current emotional state.
            </li>
            <li>
              This tool works best for raising <em>awareness</em> of potential ADHD symptoms,
              not for confirming or ruling out a diagnosis.
            </li>
            <li>
              Co-occurring conditions (anxiety, depression, sleep disorders) can produce
              similar symptoms and are not distinguished by this screener.
            </li>
          </ul>
        </section>

        <section aria-labelledby="not-diagnosis-heading" style={styles.section}>
          <h2 id="not-diagnosis-heading" style={styles.sectionHeading}>This Is Not a Diagnosis</h2>
          <p style={styles.body}>
            Results from this tool are for informational and educational purposes only.
            A formal ADHD diagnosis requires a comprehensive clinical evaluation by a
            licensed healthcare professional, including structured interviews, behaviour
            rating scales, and a review of medical and developmental history.
          </p>
        </section>

        <div style={styles.checkboxRow}>
          <input
            id="consent-checkbox"
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={styles.checkbox}
            aria-describedby="consent-label"
          />
          <label id="consent-label" htmlFor="consent-checkbox" style={styles.checkboxLabel}>
            I understand that this screening tool is <strong>not a medical diagnosis</strong> and
            that its results are for informational purposes only.
          </label>
        </div>

        <button
          style={checked ? styles.btnEnabled : styles.btnDisabled}
          onClick={onAccept}
          disabled={!checked}
          aria-disabled={!checked}
        >
          Begin Assessment
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '560px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#1e3a8a',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: '#6b7280',
    marginTop: '0.3rem',
    marginBottom: 0,
  },
  section: {
    marginTop: '1.25rem',
  },
  sectionHeading: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#374151',
    margin: '0 0 0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  body: {
    fontSize: '0.88rem',
    color: '#4b5563',
    lineHeight: 1.65,
    margin: 0,
  },
  list: {
    fontSize: '0.88rem',
    color: '#4b5563',
    lineHeight: 1.65,
    paddingLeft: '1.25rem',
    margin: 0,
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#eff6ff',
    borderRadius: '10px',
    border: '1px solid #bfdbfe',
  },
  checkbox: {
    marginTop: '0.15rem',
    width: '18px',
    height: '18px',
    flexShrink: 0,
    cursor: 'pointer',
    accentColor: '#1e40af',
  },
  checkboxLabel: {
    fontSize: '0.88rem',
    color: '#1e3a8a',
    lineHeight: 1.55,
    cursor: 'pointer',
  },
  btnEnabled: {
    marginTop: '1.25rem',
    width: '100%',
    padding: '0.9rem',
    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(30,64,175,0.3)',
    transition: 'opacity 0.15s',
  },
  btnDisabled: {
    marginTop: '1.25rem',
    width: '100%',
    padding: '0.9rem',
    background: '#e5e7eb',
    color: '#9ca3af',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'not-allowed',
  },
};
