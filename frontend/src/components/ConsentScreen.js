/**
 * ConsentScreen — informed consent modal shown before the user starts the quiz.
 *
 * Props:
 *   onAccept (function, required) — called when all 3 boxes are checked and user clicks "Begin".
 */

import React, { useState } from 'react';
import './ConsentScreen.css';

export default function ConsentScreen({ onAccept }) {
  const [checks, setChecks] = useState({ tool: false, professional: false, age: false });
  const allChecked = checks.tool && checks.professional && checks.age;

  const toggle = (key) => setChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="consent-overlay" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <div className="consent-modal">
        <header>
          <h1 id="consent-title" className="consent-title">Before You Begin</h1>
          <p className="consent-subtitle">Please read the following information carefully.</p>
        </header>

        {/* Screening tool notice */}
        <div className="consent-alert">
          <span className="consent-alert-icon" aria-hidden="true">⚠</span>
          <strong>This is a SCREENING TOOL, not a diagnosis.</strong>
        </div>

        {/* Important things to know */}
        <section aria-labelledby="consent-know-heading" className="consent-section">
          <h2 id="consent-know-heading" className="consent-section-heading">Important Things to Know</h2>
          <ul className="consent-check-list">
            <li><span aria-hidden="true">✓</span> Based on ASRS v1.1 (validated screening questions)</li>
            <li><span aria-hidden="true">✓</span> Designed for general population self-awareness</li>
            <li><span aria-hidden="true">✓</span> NOT a substitute for professional evaluation</li>
            <li><span aria-hidden="true">✓</span> Works best for English-speaking adults 18–65</li>
          </ul>
        </section>

        {/* Limitations */}
        <section aria-labelledby="consent-limits-heading" className="consent-section">
          <h2 id="consent-limits-heading" className="consent-section-heading">Limitations &amp; Biases</h2>
          <ul className="consent-warn-list">
            <li><span aria-hidden="true">⚠</span> Not validated for children or non-English speakers</li>
            <li><span aria-hidden="true">⚠</span> May underestimate ADHD in women (training data bias)</li>
            <li><span aria-hidden="true">⚠</span> Not designed for severe mental health conditions</li>
            <li><span aria-hidden="true">⚠</span> Cannot replace a clinical interview with a psychiatrist</li>
          </ul>
        </section>

        {/* Privacy */}
        <section aria-labelledby="consent-privacy-heading" className="consent-section">
          <h2 id="consent-privacy-heading" className="consent-section-heading">Your Privacy</h2>
          <ul className="consent-privacy-list">
            <li><span aria-hidden="true">🔒</span> Results are NOT saved</li>
            <li><span aria-hidden="true">🔒</span> No personal data collected</li>
            <li><span aria-hidden="true">🔒</span> Encrypted transmission (HTTPS)</li>
          </ul>
        </section>

        {/* Acknowledgment checkboxes */}
        <section aria-labelledby="consent-ack-heading" className="consent-section">
          <h2 id="consent-ack-heading" className="consent-section-heading">By continuing, you acknowledge:</h2>
          <div className="consent-checkboxes">
            <label className="consent-checkbox-row">
              <input
                type="checkbox"
                checked={checks.tool}
                onChange={() => toggle('tool')}
                className="consent-checkbox"
                aria-label="I understand this is a screening tool only"
              />
              <span>I understand this is a <strong>screening tool only</strong></span>
            </label>
            <label className="consent-checkbox-row">
              <input
                type="checkbox"
                checked={checks.professional}
                onChange={() => toggle('professional')}
                className="consent-checkbox"
                aria-label="I understand I should consult a professional"
              />
              <span>I understand I should <strong>consult a professional</strong></span>
            </label>
            <label className="consent-checkbox-row">
              <input
                type="checkbox"
                checked={checks.age}
                onChange={() => toggle('age')}
                className="consent-checkbox"
                aria-label="I am 18 years old or older"
              />
              <span>I am <strong>18+ years old</strong></span>
            </label>
          </div>
        </section>

        <button
          className={allChecked ? 'consent-btn-primary' : 'consent-btn-disabled'}
          onClick={allChecked ? onAccept : undefined}
          disabled={!allChecked}
          aria-disabled={!allChecked}
        >
          Begin Assessment
        </button>
      </div>
    </div>
  );
}
