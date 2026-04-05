import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultsPage from './ResultsPage';

const LOW_RESULT = { total_score: 15, inattention_score: 8, hyperactivity_score: 7, risk_level: 'low' };
const MOD_RESULT = { total_score: 38, inattention_score: 20, hyperactivity_score: 18, risk_level: 'moderate' };
const HIGH_RESULT = { total_score: 62, inattention_score: 33, hyperactivity_score: 29, risk_level: 'high' };

describe('ResultsPage', () => {
  test('renders risk level label for low result', () => {
    render(<ResultsPage result={LOW_RESULT} onRetake={() => {}} />);
    expect(screen.getByText(/low risk/i)).toBeInTheDocument();
  });

  test('renders risk level label for moderate result', () => {
    render(<ResultsPage result={MOD_RESULT} onRetake={() => {}} />);
    expect(screen.getByText(/moderate risk/i)).toBeInTheDocument();
  });

  test('renders elevated risk label for high result', () => {
    render(<ResultsPage result={HIGH_RESULT} onRetake={() => {}} />);
    expect(screen.getByText(/elevated risk/i)).toBeInTheDocument();
  });

  test('displays total score', () => {
    render(<ResultsPage result={HIGH_RESULT} onRetake={() => {}} />);
    expect(screen.getByText('62')).toBeInTheDocument();
  });

  test('renders subscale breakdown section', () => {
    render(<ResultsPage result={MOD_RESULT} onRetake={() => {}} />);
    expect(screen.getByText(/subscale breakdown/i)).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  test('renders confidence metric section', () => {
    render(<ResultsPage result={HIGH_RESULT} onRetake={() => {}} />);
    expect(screen.getByText(/assessment confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/confident/i)).toBeInTheDocument();
  });

  test('renders "How This Works" section', () => {
    render(<ResultsPage result={LOW_RESULT} onRetake={() => {}} />);
    expect(screen.getByText(/how this works/i)).toBeInTheDocument();
  });

  test('renders professional next steps section', () => {
    render(<ResultsPage result={MOD_RESULT} onRetake={() => {}} />);
    expect(screen.getByText(/professional next steps/i)).toBeInTheDocument();
  });

  test('renders resources section with CHADD', () => {
    render(<ResultsPage result={MOD_RESULT} onRetake={() => {}} />);
    expect(screen.getByText(/chadd/i)).toBeInTheDocument();
  });

  test('renders resources section with ADDitude', () => {
    render(<ResultsPage result={MOD_RESULT} onRetake={() => {}} />);
    expect(screen.getByText(/additude/i)).toBeInTheDocument();
  });

  test('renders Psychology Today resource', () => {
    render(<ResultsPage result={MOD_RESULT} onRetake={() => {}} />);
    expect(screen.getByText(/psychology today/i)).toBeInTheDocument();
  });

  test('calls onRetake when retake button clicked', () => {
    const onRetake = jest.fn();
    render(<ResultsPage result={LOW_RESULT} onRetake={onRetake} />);
    fireEvent.click(screen.getByRole('button', { name: /retake the quiz/i }));
    expect(onRetake).toHaveBeenCalledTimes(1);
  });

  test('renders Download PDF button', () => {
    render(<ResultsPage result={HIGH_RESULT} onRetake={() => {}} />);
    expect(screen.getByRole('button', { name: /download.*pdf/i })).toBeInTheDocument();
  });

  test('renders medical disclaimer', () => {
    render(<ResultsPage result={LOW_RESULT} onRetake={() => {}} />);
    expect(screen.getByText(/not a medical diagnosis/i)).toBeInTheDocument();
  });

  test('collapsible sections toggle on click', () => {
    render(<ResultsPage result={MOD_RESULT} onRetake={() => {}} />);
    // "How This Works" starts collapsed (defaultOpen=false); click to expand
    const howBtn = screen.getByRole('button', { name: /how this works/i });
    expect(howBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(howBtn);
    expect(howBtn).toHaveAttribute('aria-expanded', 'true');
  });
});
