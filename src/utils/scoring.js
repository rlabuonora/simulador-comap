import { WEIGHTS } from './constants.js';

const clamp = (value, min = 0, max = 10) => Math.min(Math.max(value, min), max);

export function scoreEmployment({ employees }) {
  return clamp((employees / 200) * 10);
}

export const DEPARTMENT_SCORES = {
  artigas: 10,
  treintaYTres: 10,
  cerroLargo: 9,
  rioNegro: 9,
  tacuarembo: 8,
  salto: 8,
  paysandu: 8,
  rivera: 7,
  rocha: 6,
  soriano: 6,
  lavalleja: 5,
  sanJose: 5,
  canelones: 4,
  florida: 4,
  durazno: 3,
  maldonado: 3,
  colonia: 2,
  flores: 2,
  montevideo: 0,
};

export function scoreDecentralization({ deptAllocations = [], investment = 0 }) {
  const totalAllocation = deptAllocations.reduce((sum, item) => sum + (item.pct ?? 0), 0);
  const totalInvestment = investment > 0 ? investment : totalAllocation;

  if (!totalInvestment) {
    return 0;
  }

  const weightedScore = deptAllocations.reduce((sum, item) => {
    const deptScore = DEPARTMENT_SCORES[item.id] ?? 0;
    return sum + (item.pct / totalInvestment) * deptScore;
  }, 0);

  return clamp(weightedScore, 0, 10);
}

export function scoreExports({ exportPct }) {
  return clamp(exportPct / 10);
}

export const CERTIFICATION_BONUS = {
  none: 0,
  leed: 2,
  'leed-plata': 3,
  'leed-oro': 4,
  'leed-platino': 5,
  'breeam-bueno': 2,
  'breeam-muy-bueno': 3,
  'breeam-excelente': 4,
  'breeam-excepcional': 5,
  'sello-b': 2,
  'sello-a': 3,
};

const calcInvestmentPct = (amount, investment) => {
  if (!investment) {
    return 0;
  }
  return (amount / investment) * 100;
};

export function scoreSustainability({ sustainabilityPct, certification, investment }) {
  const bonus = CERTIFICATION_BONUS[certification] ?? 0;
  const pct = calcInvestmentPct(sustainabilityPct, investment);
  return clamp(pct / 2 + bonus);
}

const I_PLUS_CATEGORY_POINTS = {
  at: 4,
  inn: 7,
  id: 10,
};

export function scoreIPlus({ iPlusCategory, iPlusPct, investment }) {
  const pct = calcInvestmentPct(iPlusPct, investment);
  const categoryPoints = I_PLUS_CATEGORY_POINTS[iPlusCategory] ?? 0;
  return clamp((pct / 100) * categoryPoints);
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
