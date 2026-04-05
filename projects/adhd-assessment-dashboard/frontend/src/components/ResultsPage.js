import React from 'react';
import './ResultsPage.css';

function ResultsPage({ assessment, onRetake }) {
  const riskConfig = {
    low: { color: '#11863F', label: 'Low Risk' },
    moderate: { color: '#D4A574', label: 'Moderate Risk' },
    high: { color: '#CB2431', label: 'High Risk' }
  };

  const interpretations = {
    low: {
      title: 'Low Risk',
      message: 'Your screening results suggest relatively low levels of ADHD traits. However, ADHD manifests differently in different people. If you have concerns, consider consulting a healthcare provider.',
      details: 'Your responses indicate manageable attention and impulse control in most areas.'
    },
    moderate: {
      title: 'Moderate Risk',
      message: 'Your screening results suggest moderate levels of ADHD-like traits. This warrants further evaluation by a healthcare professional.',
      details: 'You may benefit from speaking with a doctor, psychiatrist, or psychologist who specialises in ADHD for a comprehensive assessment.'
    },
    high: {
      title: 'High Risk',
      message: 'Your screening results suggest significant ADHD-like traits. Professional evaluation is strongly recommended.',
      details: 'Please schedule an appointment with a healthcare provider to discuss your symptoms and get a proper diagnosis.'
    }
  };

  const risk = riskConfig[assessment.risk_level] || riskConfig.low;
  const interp = interpretations[assessment.risk_level] || interpretations.low;

  const inattentionPct = Math.round((assessment.inattention_score / 40) * 100);
  const hyperactivityPct = Math.round((assessment.hyperactivity_score / 40) * 100);

  return (
    <div className="results-page">
      <header className="results-header" role="banner">
        <h1>Your Results</h1>
        <p>Based on your responses to the ADHD screening questionnaire</p>
      </header>

      <main className="results-container" role="main">

        {/* Risk Level Card */}
        <section
          className="risk-card"
          role="region"
          aria-labelledby="risk-heading"
          style={{ borderLeftColor: risk.color }}
        >
          <span
            className="risk-badge"
            style={{ backgroundColor: risk.color }}
            aria-label={`Risk level: ${risk.label}`}
          >
            {risk.label}
          </span>
          <div className="risk-score" aria-label={`Overall score: ${assessment.total_score} out of 80`}>
            <p className="score-label">Overall Score</p>
            <p className="score-value" aria-hidden="true">{assessment.total_score} / 80</p>
          </div>
        </section>

        {/* Subscores Table */}
        <section className="subscores-section" role="region" aria-labelledby="subscores-heading">
          <h2 id="subscores-heading" className="section-heading">Score Breakdown</h2>
          <table className="subscores-table" aria-label="Subscore breakdown by category">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Score</th>
                <th scope="col">Out of</th>
                <th scope="col">Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Inattention</td>
                <td>{assessment.inattention_score}</td>
                <td>40</td>
                <td>
                  <div
                    className="subscore-bar"
                    role="progressbar"
                    aria-valuenow={assessment.inattention_score}
                    aria-valuemin={0}
                    aria-valuemax={40}
                    aria-label={`Inattention: ${assessment.inattention_score} out of 40`}
                  >
                    <div
                      className="subscore-fill subscore-fill--inattention"
                      style={{ width: `${inattentionPct}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Hyperactivity / Impulsivity</td>
                <td>{assessment.hyperactivity_score}</td>
                <td>40</td>
                <td>
                  <div
                    className="subscore-bar"
                    role="progressbar"
                    aria-valuenow={assessment.hyperactivity_score}
                    aria-valuemin={0}
                    aria-valuemax={40}
                    aria-label={`Hyperactivity / Impulsivity: ${assessment.hyperactivity_score} out of 40`}
                  >
                    <div
                      className="subscore-fill subscore-fill--hyperactivity"
                      style={{ width: `${hyperactivityPct}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Interpretation */}
        <section className="interpretation-card" role="region" aria-labelledby="interp-heading">
          <h2 id="interp-heading" className="section-heading">{interp.title}</h2>
          <p className="interpretation-message">{interp.message}</p>
          <p className="interpretation-details">{interp.details}</p>
        </section>

        {/* Disclaimer */}
        <section className="disclaimer-card" role="note" aria-labelledby="disclaimer-heading">
          <h2 id="disclaimer-heading" className="disclaimer-heading">
            <span aria-hidden="true">⚠️</span> Important Disclaimer
          </h2>
          <p>
            <strong>This is a screening tool only and not a medical diagnosis.</strong> ADHD is a complex
            neurodevelopmental condition that requires professional evaluation by a qualified healthcare
            provider (psychiatrist, neurologist, or clinical psychologist).
          </p>
          <p>
            Screening results do not confirm or rule out ADHD. Many conditions can mimic ADHD symptoms,
            and many ADHD individuals may not exhibit all traits. Only a comprehensive professional
            assessment can provide an accurate diagnosis.
          </p>
          <p>
            If you have concerns about ADHD, please consult a healthcare provider for proper evaluation
            and treatment options.
          </p>
        </section>

        {/* Next Steps */}
        <section className="next-steps-card" role="region" aria-labelledby="next-steps-heading">
          <h2 id="next-steps-heading" className="section-heading">Recommended Next Steps</h2>
          <ul>
            <li>Schedule an appointment with a healthcare provider</li>
            <li>Prepare a list of symptoms and how they impact your daily life</li>
            <li>Gather information about your medical and family history</li>
            <li>Consider asking for a formal ADHD evaluation or psychoeducational assessment</li>
          </ul>
        </section>

      </main>

      <footer className="results-footer" role="contentinfo">
        <button
          className="retake-button"
          onClick={onRetake}
          aria-label="Retake the ADHD assessment quiz from the beginning"
          type="button"
        >
          Retake Quiz
        </button>
      </footer>
    </div>
  );
}

export default ResultsPage;
