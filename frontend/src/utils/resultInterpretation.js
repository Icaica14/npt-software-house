/**
 * resultInterpretation.js — score interpretation utilities for ADHD screening results.
 *
 * Provides functions to interpret ASRS v1.1 scores, classify risk levels,
 * derive confidence metrics, and generate professional recommendations.
 */

/* ─── Risk thresholds (out of 80) ───────────────────────────────────────── */

const THRESHOLDS = { low: 30, moderate: 50 }; // < 30 = low, 30-49 = moderate, >= 50 = high

export function classifyRisk(totalScore) {
  if (totalScore < THRESHOLDS.low) return 'low';
  if (totalScore < THRESHOLDS.moderate) return 'moderate';
  return 'high';
}

/* ─── Subscale interpretation ───────────────────────────────────────────── */

/**
 * Returns a human-readable interpretation of a subscale score (0-40).
 * @param {number} score - subscale score (0-40)
 * @param {'inattention'|'hyperactivity'} subscale
 */
export function interpretSubscale(score, subscale) {
  const pct = (score / 40) * 100;
  const label = subscale === 'inattention' ? 'inattention' : 'hyperactivity/impulsivity';

  if (pct < 40) {
    return `Your ${label} score (${score}/40) is low, suggesting few symptoms in this area.`;
  }
  if (pct < 65) {
    return `Your ${label} score (${score}/40) is moderate, suggesting some symptoms in this area.`;
  }
  return `Your ${label} score (${score}/40) is high, suggesting several symptoms consistent with ADHD in this area.`;
}

/* ─── Confidence metric ─────────────────────────────────────────────────── */

/**
 * Derives a confidence percentage (0-100) from how far the total score sits
 * from the nearest risk-category boundary.
 *
 * Scores clearly within one category yield higher confidence;
 * borderline scores yield lower confidence.
 *
 * @param {number} totalScore - combined score (0-80)
 * @param {string} riskLevel  - 'low' | 'moderate' | 'high'
 * @returns {number} confidence percentage (integer, 0-100)
 */
export function computeConfidence(totalScore, riskLevel) {
  if (riskLevel === 'low') {
    const margin = THRESHOLDS.low - totalScore; // 0-30
    return Math.min(95, 55 + Math.round((margin / THRESHOLDS.low) * 40));
  }
  if (riskLevel === 'high') {
    const margin = totalScore - THRESHOLDS.moderate; // 0-30
    return Math.min(95, 55 + Math.round((margin / 30) * 40));
  }
  // moderate: mid-range = less confident, extremes = more confident
  const distFromLow = totalScore - THRESHOLDS.low;            // 0-19
  const distFromHigh = THRESHOLDS.moderate - totalScore;      // 0-20
  const margin = Math.min(distFromLow, distFromHigh);         // 0-10
  return Math.min(85, 45 + Math.round((margin / 10) * 30));
}

/**
 * Returns a label for a confidence value.
 * @param {number} pct - confidence (0-100)
 */
export function confidenceLabel(pct) {
  if (pct >= 80) return 'High';
  if (pct >= 60) return 'Moderate';
  return 'Low';
}

/* ─── Professional recommendations ─────────────────────────────────────── */

/**
 * Returns an ordered list of next-step recommendations appropriate for the
 * given risk level.  Language avoids fear or shame; emphasis is on "next steps".
 *
 * @param {'low'|'moderate'|'high'} riskLevel
 * @returns {string[]}
 */
export function getNextSteps(riskLevel) {
  const shared = [
    'Learn about ADHD through reputable sources such as CHADD (chadd.org) and ADDitude Magazine.',
    'Track situations where you notice focus or restlessness challenges — a simple journal works well.',
  ];

  if (riskLevel === 'low') {
    return [
      'Continue monitoring your wellbeing and revisit this screener if you notice changes.',
      ...shared,
    ];
  }

  if (riskLevel === 'moderate') {
    return [
      'Schedule a conversation with your primary care physician and share these results.',
      'Ask for a referral to a psychologist or psychiatrist who specialises in adult ADHD.',
      'Prepare a list of specific situations where symptoms affect your daily life before your appointment.',
      ...shared,
    ];
  }

  // high
  return [
    'Schedule a comprehensive evaluation with a licensed psychologist or psychiatrist.',
    'Bring this report and a symptom log to your appointment.',
    'Ask your provider about neuropsychological testing for a thorough assessment.',
    'Consider asking a trusted family member or colleague for their perspective on your symptoms.',
    ...shared,
  ];
}

/* ─── Feature importance helpers ────────────────────────────────────────── */

/**
 * Returns the top N questions by feature importance.
 * @param {Array<{question_id, question_text, importance}>} features
 * @param {number} n
 */
export function topFeatures(features, n = 5) {
  return [...features]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, n);
}

/**
 * Returns a color and label for a feature importance value.
 * @param {number} importance
 */
export function featureImpactMeta(importance) {
  if (importance >= 0.13) return { label: 'High', color: '#dc2626' };
  if (importance >= 0.09) return { label: 'Moderate', color: '#d97706' };
  return { label: 'Low', color: '#059669' };
}
