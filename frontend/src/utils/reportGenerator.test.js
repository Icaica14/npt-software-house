import { computeConfidence, generatePDFReport } from './reportGenerator';

describe('computeConfidence', () => {
  test('low risk near boundary has lower confidence', () => {
    const c1 = computeConfidence(28, 'low'); // close to threshold
    const c2 = computeConfidence(5, 'low');  // far from threshold
    expect(c2).toBeGreaterThan(c1);
  });

  test('high risk confidence increases with score', () => {
    const c1 = computeConfidence(51, 'high');
    const c2 = computeConfidence(75, 'high');
    expect(c2).toBeGreaterThan(c1);
  });

  test('moderate risk confidence is lower near boundaries', () => {
    const cMid = computeConfidence(39, 'moderate');   // midpoint
    const cEdge = computeConfidence(30, 'moderate');  // near low threshold
    expect(cEdge).toBeLessThan(cMid);
  });

  test('confidence is always between 0 and 100', () => {
    const cases = [
      [0, 'low'], [29, 'low'],
      [30, 'moderate'], [39, 'moderate'], [49, 'moderate'],
      [50, 'high'], [80, 'high'],
    ];
    for (const [score, risk] of cases) {
      const c = computeConfidence(score, risk);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(100);
    }
  });
});

describe('generatePDFReport', () => {
  let originalOpen;

  beforeEach(() => {
    originalOpen = window.open;
    const mockWin = {
      document: { write: jest.fn(), close: jest.fn() },
      focus: jest.fn(),
      print: jest.fn(),
    };
    window.open = jest.fn(() => mockWin);
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  test('opens a new window', () => {
    generatePDFReport({ total_score: 40, inattention_score: 20, hyperactivity_score: 20, risk_level: 'moderate', confidence: 60 });
    expect(window.open).toHaveBeenCalledWith('', '_blank', expect.any(String));
  });

  test('writes HTML to the new window', () => {
    const mockDoc = { write: jest.fn(), close: jest.fn() };
    const mockWin = { document: mockDoc, focus: jest.fn(), print: jest.fn() };
    window.open = jest.fn(() => mockWin);
    generatePDFReport({ total_score: 62, inattention_score: 33, hyperactivity_score: 29, risk_level: 'high', confidence: 80 });
    expect(mockDoc.write).toHaveBeenCalledTimes(1);
    const html = mockDoc.write.mock.calls[0][0];
    expect(html).toContain('ADHD Screening Results Report');
    expect(html).toContain('62');
    expect(html).toContain('High Risk');
  });

  test('shows alert when popup is blocked', () => {
    window.open = jest.fn(() => null);
    window.alert = jest.fn();
    generatePDFReport({ total_score: 15, inattention_score: 8, hyperactivity_score: 7, risk_level: 'low', confidence: 90 });
    expect(window.alert).toHaveBeenCalled();
  });
});
