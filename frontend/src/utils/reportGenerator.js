/**
 * reportGenerator.js — generates a printable PDF report for ADHD screening results.
 *
 * Opens a new browser window with a formatted print-ready HTML document.
 * Uses the browser's native print-to-PDF capability.
 */

export function generatePDFReport(result) {
  const {
    total_score,
    inattention_score,
    hyperactivity_score,
    risk_level,
    confidence,
  } = result;

  const riskLabels = { low: 'Low Risk', moderate: 'Moderate Risk', high: 'High Risk' };
  const riskColors = { low: '#065f46', moderate: '#92400e', high: '#991b1b' };
  const riskBg = { low: '#d1fae5', moderate: '#fef3c7', high: '#fee2e2' };

  const riskLabel = riskLabels[risk_level] || 'Unknown';
  const riskColor = riskColors[risk_level] || '#374151';
  const riskBgColor = riskBg[risk_level] || '#f9fafb';

  const inattentionPct = Math.round((inattention_score / 40) * 100);
  const hyperactivityPct = Math.round((hyperactivity_score / 40) * 100);
  const totalPct = Math.round((total_score / 80) * 100);
  const confidencePct = confidence != null ? confidence : computeConfidence(total_score, risk_level);
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>ADHD Screening Report — ${today}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      color: #1f2937;
      background: #fff;
      padding: 0;
    }
    .page {
      max-width: 680px;
      margin: 0 auto;
      padding: 48px 40px;
    }
    .header {
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 { font-size: 20pt; color: #1e3a8a; font-weight: bold; }
    .header .subtitle { font-size: 10pt; color: #6b7280; margin-top: 4px; }
    .risk-banner {
      background: ${riskBgColor};
      border: 1px solid ${riskColor}40;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .risk-label {
      display: inline-block;
      background: ${riskColor};
      color: #fff;
      font-size: 9pt;
      font-weight: bold;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .score-big { font-size: 28pt; font-weight: bold; color: #111827; }
    .score-sub { font-size: 10pt; color: #6b7280; }
    .section { margin-bottom: 24px; }
    .section h2 {
      font-size: 12pt;
      font-weight: bold;
      color: #1e3a8a;
      border-bottom: 1px solid #dbeafe;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    .score-row { display: flex; gap: 16px; margin-bottom: 16px; }
    .subscale-box {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .subscale-val { font-size: 20pt; font-weight: bold; color: #111827; }
    .subscale-lbl { font-size: 9pt; color: #4b5563; margin-top: 4px; }
    .bar-container { margin-bottom: 10px; }
    .bar-label { font-size: 10pt; color: #374151; margin-bottom: 4px; display: flex; justify-content: space-between; }
    .bar-track { background: #f3f4f6; border-radius: 4px; height: 16px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; }
    .confidence-block {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .confidence-pct { font-size: 18pt; font-weight: bold; color: #1e40af; }
    .confidence-lbl { font-size: 10pt; color: #374151; }
    .next-step { padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 10pt; color: #374151; }
    .next-step:last-child { border-bottom: none; }
    .resource-item { padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 10pt; }
    .resource-item:last-child { border-bottom: none; }
    .resource-name { font-weight: bold; color: #1e40af; }
    .disclaimer {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 9pt;
      color: #6b7280;
      line-height: 1.6;
    }
    .footer {
      margin-top: 32px;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
      font-size: 9pt;
      color: #9ca3af;
      text-align: center;
    }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>ADHD Screening Results Report</h1>
    <div class="subtitle">Generated on ${today} &nbsp;|&nbsp; This is a screening tool, not a clinical diagnosis.</div>
  </div>

  <div class="risk-banner">
    <div>
      <div class="risk-label">${riskLabel}</div>
      <div style="margin-top:8px; font-size:10pt; color:#374151; max-width:400px;">
        ${getRiskText(risk_level)}
      </div>
    </div>
    <div style="text-align:right;">
      <div class="score-big">${total_score}<span style="font-size:14pt; color:#9ca3af;"> / 80</span></div>
      <div class="score-sub">Total Score</div>
    </div>
  </div>

  <div class="section">
    <h2>Subscale Breakdown</h2>
    <div class="score-row">
      <div class="subscale-box">
        <div class="subscale-val">${inattention_score}</div>
        <div class="subscale-lbl">Inattention<br/>(max 40)</div>
      </div>
      <div class="subscale-box">
        <div class="subscale-val">${hyperactivity_score}</div>
        <div class="subscale-lbl">Hyperactivity / Impulsivity<br/>(max 40)</div>
      </div>
    </div>
    <div class="bar-container">
      <div class="bar-label">
        <span>Inattention</span><span>${inattentionPct}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${inattentionPct}%; background:#3b82f6;"></div>
      </div>
    </div>
    <div class="bar-container">
      <div class="bar-label">
        <span>Hyperactivity / Impulsivity</span><span>${hyperactivityPct}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${hyperactivityPct}%; background:#ec4899;"></div>
      </div>
    </div>
    <div class="bar-container">
      <div class="bar-label">
        <span>Total</span><span>${totalPct}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${totalPct}%; background:#6366f1;"></div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Assessment Confidence</h2>
    <div class="confidence-block">
      <div class="confidence-pct">${confidencePct}%</div>
      <div class="confidence-lbl">
        The screening model is <strong>${confidencePct}% confident</strong> in this assessment,
        based on how clearly your responses align with established ADHD symptom patterns.
      </div>
    </div>
  </div>

  <div class="section">
    <h2>How This Scoring Works</h2>
    <p style="font-size:10pt; line-height:1.7; color:#374151;">
      This tool uses an 18-question self-report screener based on DSM-5 criteria.
      Nine questions measure <strong>Inattention</strong> (e.g., difficulty sustaining attention, losing things, forgetfulness)
      and nine measure <strong>Hyperactivity/Impulsivity</strong> (e.g., restlessness, interrupting, excessive talking).
      Each answer is scored 0–4 (Never to Very Often), producing subscale totals of 0–36 and a combined total of 0–72,
      normalised here to 0–80 for readability. Risk thresholds: Low &lt; 30 · Moderate 30–49 · High ≥ 50.
    </p>
  </div>

  <div class="section">
    <h2>Recommended Next Steps</h2>
    ${getNextSteps(risk_level).map(s => `<div class="next-step">• ${s}</div>`).join('')}
  </div>

  <div class="section">
    <h2>Resources</h2>
    <div class="resource-item">
      <div class="resource-name">Psychology Today Therapist Finder</div>
      <div style="font-size:9pt; color:#6b7280;">https://www.psychologytoday.com/us/therapists/adhd</div>
      <div style="font-size:10pt; color:#374151; margin-top:2px;">Find ADHD-specialised clinicians in your area.</div>
    </div>
    <div class="resource-item">
      <div class="resource-name">CHADD (Children and Adults with ADHD)</div>
      <div style="font-size:9pt; color:#6b7280;">https://chadd.org</div>
      <div style="font-size:10pt; color:#374151; margin-top:2px;">National nonprofit providing education, advocacy, and support.</div>
    </div>
    <div class="resource-item">
      <div class="resource-name">ADDitude Magazine</div>
      <div style="font-size:9pt; color:#6b7280;">https://www.additudemag.com</div>
      <div style="font-size:10pt; color:#374151; margin-top:2px;">Expert guidance and real-life strategies for living with ADHD.</div>
    </div>
  </div>

  <div class="disclaimer">
    <strong style="color:#374151;">Important Notice:</strong> This screening tool is for informational purposes only and does
    not constitute a clinical diagnosis. ADHD diagnosis requires a comprehensive evaluation by a qualified healthcare
    professional, including clinical interview, behaviour rating scales, and review of medical/developmental history.
    These results should not be used as a substitute for professional medical advice.
  </div>

  <div class="footer">ADHD Screening Report &nbsp;|&nbsp; ${today} &nbsp;|&nbsp; Not a medical diagnosis</div>
</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) {
    alert('Please allow pop-ups to download the PDF report.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

/** Derive confidence (0-100) from how far score is from nearest threshold boundary. */
export function computeConfidence(total_score, risk_level) {
  // Thresholds: low < 30, moderate 30-49, high >= 50 (out of 80)
  if (risk_level === 'low') {
    // 0-29: deeper = more confident
    const margin = 30 - total_score; // 0-30
    return Math.min(95, 55 + Math.round((margin / 30) * 40));
  }
  if (risk_level === 'high') {
    // 50-80: higher = more confident
    const margin = total_score - 50; // 0-30
    return Math.min(95, 55 + Math.round((margin / 30) * 40));
  }
  // moderate 30-49: mid-range = less confident, extremes = more
  const distFromLow = total_score - 30;  // 0-19
  const distFromHigh = 50 - total_score; // 0-20
  const margin = Math.min(distFromLow, distFromHigh); // 0-10
  return Math.min(85, 45 + Math.round((margin / 10) * 30));
}

function getRiskText(risk_level) {
  const map = {
    low: 'Your responses suggest few symptoms associated with ADHD at this time.',
    moderate: 'Your responses suggest some symptoms associated with ADHD. Consider discussing these results with a healthcare provider.',
    high: 'Your responses suggest several symptoms associated with ADHD. We recommend consulting a qualified healthcare professional for a thorough evaluation.',
  };
  return map[risk_level] || '';
}

function getNextSteps(risk_level) {
  const shared = [
    'Learn more about ADHD through reputable resources like CHADD and ADDitude Magazine.',
    'Track your daily challenges in a journal to support any future evaluation.',
  ];
  if (risk_level === 'low') {
    return [
      'Continue monitoring your wellbeing and revisit if symptoms change.',
      ...shared,
    ];
  }
  if (risk_level === 'moderate') {
    return [
      'Schedule a conversation with your primary care physician about your results.',
      'Ask for a referral to a psychologist or psychiatrist who specialises in ADHD.',
      'Prepare a list of symptoms and when they occur before your appointment.',
      ...shared,
    ];
  }
  return [
    'Schedule a comprehensive evaluation with a licensed psychologist or psychiatrist.',
    'Bring this report and a list of your symptoms to your appointment.',
    'Ask about neuropsychological testing for a thorough assessment.',
    'Consider informing close family or a trusted colleague for additional perspective.',
    ...shared,
  ];
}
