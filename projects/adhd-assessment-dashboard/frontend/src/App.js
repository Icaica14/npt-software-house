import React, { useState } from 'react';
import QuizFlow from './components/QuizFlow';
import ResultsPage from './components/ResultsPage';
import './App.css';

function App() {
  const [screen, setScreen] = useState('quiz'); // 'quiz' or 'results'
  const [assessment, setAssessment] = useState(null);

  const handleQuizComplete = (assessmentResult) => {
    setAssessment(assessmentResult);
    setScreen('results');
  };

  const handleRetake = () => {
    setAssessment(null);
    setScreen('quiz');
  };

  return (
    <div className="App">
      {screen === 'quiz' ? (
        <QuizFlow onComplete={handleQuizComplete} />
      ) : (
        <ResultsPage assessment={assessment} onRetake={handleRetake} />
      )}
    </div>
  );
}

export default App;
