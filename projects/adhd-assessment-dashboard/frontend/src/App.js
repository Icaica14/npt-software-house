// ADHD Assessment Dashboard Frontend
// TODO: UI Developer will implement:
// - QuizFlow component: question-by-question flow with progress bar
// - ResultsPage component: display risk assessment + disclaimer
// - State management: current question, answers, results
// - API integration: fetch questions from /api/quiz/questions, POST to /api/quiz/submit

import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>ADHD Assessment Dashboard</h1>
        <p>Quick screening tool to help you understand ADHD traits</p>
      </header>
      <main>
        {/* TODO: Render QuizFlow or ResultsPage based on state */}
        <p>Loading...</p>
      </main>
    </div>
  );
}

export default App;
