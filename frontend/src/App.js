import React, { useState } from 'react';
import QuizFlow from './components/QuizFlow';
import ResultsPage from './components/ResultsPage';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
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
    <div style={styles.container}>
      {error && (
        <div style={{ color: '#dc2626', marginBottom: '1rem', maxWidth: '560px', width: '100%' }}>
          Submission failed: {error}
        </div>
      )}
      <QuizFlow onComplete={handleComplete} />
    </div>
  );
}
