# DHDA Quiz Frontend

React frontend for the ADHD screening quiz.

## Getting Started

```bash
cd frontend
npm install
npm start   # starts on http://localhost:3000
```

The dev server proxies `/api/*` to the FastAPI backend on `http://localhost:8000`.

## QuizFlow Component

`src/components/QuizFlow.js`

Displays the 20-question ADHD screening quiz one question at a time.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onComplete` | `(answers: Record<number, number>) => void` | Yes | Called when the user submits the final question. `answers` maps each question `id` to the selected value (1–4). |

### Answer Scale

| Value | Label |
|-------|-------|
| 1 | Never |
| 2 | Rarely |
| 3 | Sometimes |
| 4 | Very Often |

### Features

- Fetches questions from `GET /api/quiz/questions` on mount
- Progress bar showing question N of 20
- Category badge (Inattention / Hyperactivity) per question
- Keyboard-accessible radio-style answer buttons
- Next / Previous navigation; Submit on the final question
- Answers held in local state — parent receives them via `onComplete`
- Responsive layout (works on mobile)

### Example Usage

```jsx
import QuizFlow from './components/QuizFlow';

function App() {
  const handleComplete = (answers) => {
    // answers: { 1: 3, 2: 1, 3: 4, ... }
    console.log('Quiz answers:', answers);
  };

  return <QuizFlow onComplete={handleComplete} />;
}
```
