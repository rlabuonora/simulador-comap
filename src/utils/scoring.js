import { WEIGHTS } from './constants.js';

const clamp = (value, min = 0, max = 10) => Math.min(Math.max(value, min), max);

export function scoreEmployment({ employees }) {
  return clamp((employees / 200) * 10);
}

export function scoreDecentralization({ regionTier }) {
  if (regionTier === 'interior') {
    return 9;
  }

  if (regionTier === 'metro') {
    return 6;
  }

  return 3;
}

export function scoreExports({ exportPct }) {
  return clamp(exportPct / 10);
}

export function scoreSustainability({ sustainabilityPct }) {
  return clamp(sustainabilityPct / 2);
}

export function scoreIPlus({ iPlusType, iPlusPct }) {
  const typeBoost = {
    a: 2,
    b: 1,
    c: 0,
  };

  const boost = typeBoost[iPlusType] ?? 0;
  return clamp(iPlusPct / 1.5 + boost);
}

export function scoreStrategic({ strategicPriorities }) {
  return clamp(strategicPriorities * 3.5);
}

export function finalScore(scores) {
  const total = Object.keys(WEIGHTS).reduce((sum, key) => {
    return sum + (scores[key] ?? 0) * WEIGHTS[key];
  }, 0);

  return clamp(total, 0, 10);
}

export function computeIraePct(finalScoreValue) {
  return Math.min(((finalScoreValue - 1) / 9) * 0.7 + 0.3, 1);
}
