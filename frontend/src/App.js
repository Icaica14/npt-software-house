import React, { useState } from 'react';
import QuizFlow from './components/QuizFlow';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  resultCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(79, 70, 229, 0.12)',
    textAlign: 'center',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#4f46e5',
    marginBottom: '1rem',
  },
  score: {
    fontSize: '3rem',
    fontWeight: 800,
    color: '#312e81',
    margin: '0.5rem 0',
  },
  retakeBtn: {
    marginTop: '1.5rem',
    padding: '0.75rem 2rem',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default function App() {
  const [result, setResult] = useState(null);

  if (result) {
    const total = Object.values(result).reduce((sum, v) => sum + v, 0);
    const max = Object.keys(result).length * 4;
    return (
      <div style={styles.container}>
        <div style={styles.resultCard}>
          <div style={styles.heading}>Quiz Complete</div>
          <div style={styles.score}>{total} / {max}</div>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Higher scores may indicate more frequent ADHD-related symptoms.
            This is a screening tool, not a diagnosis.
          </p>
          <button style={styles.retakeBtn} onClick={() => setResult(null)}>
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <QuizFlow onComplete={setResult} />
    </div>
  );
}
