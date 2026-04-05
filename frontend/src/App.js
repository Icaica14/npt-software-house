import React, { useState } from 'react';
import './App.css';
import QuizFlow from './components/QuizFlow';
import ResultsPage from './components/ResultsPage';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  errorBanner: {
    color: '#dc2626',
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    maxWidth: '560px',
    width: '100%',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
};

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleComplete = async (answers) => {
    setError(null);
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (result) {
    return <ResultsPage result={result} onRetake={() => setResult(null)} />;
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div style={styles.container}>
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={styles.errorBanner}
          >
            Submission failed: {error}
          </div>
        )}
        <main id="main-content">
          <QuizFlow onComplete={handleComplete} />
        </main>
      </div>
    </>
  );
}
