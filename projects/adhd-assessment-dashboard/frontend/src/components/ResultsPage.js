import React from 'react';
import './ResultsPage.css';

function ResultsPage({ assessment, onRetake }) {
  const riskColors = {
    low: '#10b981',
    moderate: '#f59e0b',
    high: '#ef4444'
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
      details: 'You may benefit from speaking with a doctor, psychiatrist, or psychologist who specializes in ADHD for a comprehensive assessment.'
    },
    high: {
      title: 'High Risk',
      message: 'Your screening results suggest significant ADHD-like traits. Professional evaluation is strongly recommended.',
      details: 'Please schedule an appointment with a healthcare provider to discuss your symptoms and get a proper diagnosis.'
    }
  };

  const interp = interpretations[assessment.risk_level];

  return (
    <div className="results-page">
      <div className="results-header">
        <h2>Your Results</h2>
        <p>Based on your responses to the ADHD screening questionnaire</p>
      </div>

      <div className="results-container">
        {/* Risk Level Card */}
        <div className="risk-card" style={{ borderColor: riskColors[assessment.risk_level] }}>
          <div className="risk-badge" style={{ backgroundColor: riskColors[assessment.risk_level] }}>
            {interp.title}
          </div>
          <div className="risk-score">
            <p className="score-label">Overall Score</p>
            <p className="score-value">{assessment.total_score} / 80</p>
          </div>
        </div>

        {/* Subscores */}
        <div className="subscores">
          <div className="subscore-item">
            <h4>Inattention</h4>
            <div className="subscore-bar">
              <div
                className="subscore-fill"
                style={{
                  width: `${(assessment.inattention_score / 40) * 100}%`,
                  backgroundColor: '#3b82f6'
                }}
              ></div>
            </div>
            <p className="subscore-value">{assessment.inattention_score} / 40</p>
          </div>

          <div className="subscore-item">
            <h4>Hyperactivity/Impulsivity</h4>
            <div className="subscore-bar">
              <div
                className="subscore-fill"
                style={{
                  width: `${(assessment.hyperactivity_score / 40) * 100}%`,
                  backgroundColor: '#8b5cf6'
                }}
              ></div>
            </div>
            <p className="subscore-value">{assessment.hyperactivity_score} / 40</p>
          </div>
        </div>

        {/* Interpretation */}
        <div className="interpretation-card">
          <h3>{interp.title}</h3>
          <p className="interpretation-message">{interp.message}</p>
          <p className="interpretation-details">{interp.details}</p>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer-card">
          <h4>⚠️ Important Disclaimer</h4>
          <p>
            <strong>This is a screening tool only and not a medical diagnosis.</strong> ADHD is a complex neurodevelopmental condition that requires professional evaluation by a qualified healthcare provider (psychiatrist, neurologist, or clinical psychologist).
          </p>
          <p>
            Screening results do not confirm or rule out ADHD. Many conditions can mimic ADHD symptoms, and many ADHD individuals may not exhibit all traits. Only a comprehensive professional assessment can provide an accurate diagnosis.
          </p>
          <p>
            If you have concerns about ADHD, please consult a healthcare provider for proper evaluation and treatment options.
          </p>
        </div>

        {/* Next Steps */}
        <div className="next-steps-card">
          <h4>Recommended Next Steps</h4>
          <ul>
            <li>Schedule an appointment with a healthcare provider</li>
            <li>Prepare a list of symptoms and how they impact your daily life</li>
            <li>Gather information about your medical history and family history</li>
            <li>Consider asking for a formal ADHD evaluation or psychoeducational assessment</li>
          </ul>
        </div>
      </div>

      <div className="results-footer">
        <button className="retake-button" onClick={onRetake}>
          Retake Quiz
        </button>
      </div>
    </div>
  );
}

export default ResultsPage;
