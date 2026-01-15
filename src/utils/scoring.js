import { WEIGHTS } from './constants.js';

const clamp = (value, min = 0, max = 10) => Math.min(Math.max(value, min), max);

export function scoreEmployment({
  womenIncrease = 0,
  youthIncrease = 0,
  disabilityIncrease = 0,
  dinaliIncrease = 0,
  tusTransIncrease = 0,
  othersIncrease = 0,
}) {
  const vulnerableSum =
    womenIncrease + youthIncrease + disabilityIncrease + dinaliIncrease + tusTransIncrease;
  const points = othersIncrease + vulnerableSum * 1.25;
  return clamp(points, 0, 10);
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
  const totalAllocation = deptAllocations.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const totalInvestment = investment > 0 ? investment : totalAllocation;

  if (!totalInvestment) {
    return 0;
  }

  const weightedScore = deptAllocations.reduce((sum, item) => {
    const deptScore = DEPARTMENT_SCORES[item.id] ?? 0;
    return sum + (item.amount / totalInvestment) * deptScore;
  }, 0);

  return clamp(weightedScore, 0, 10);
}

const EXPORT_DIVISOR = 1_000_000;
const MINTUR_COEFFICIENT = 3.22;

const parseNumber = (value) => {
  const normalized = String(value ?? '').trim().replace(',', '.');
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const calcMgapIncrement = (items = []) => {
  return items.reduce((sum, item) => {
    const pct = parseNumber(item.pct) / 100;
    const increase = parseNumber(item.increase);
    return sum + pct * increase;
  }, 0);
};

const calcExportIncrement = ({
  evaluatingMinistry,
  exportIncrease = 0,
  mgapExportItems = [],
  minturIncrease = 0,
}) => {
  if (evaluatingMinistry === 'mgap') {
    return parseNumber(exportIncrease) + calcMgapIncrement(mgapExportItems);
  }

  if (evaluatingMinistry === 'mintur') {
    return MINTUR_COEFFICIENT * parseNumber(minturIncrease);
  }

  return parseNumber(exportIncrease);
};

export function scoreExports({
  evaluatingMinistry,
  isNewCompany,
  currentExports = 0,
  exportIncrease = 0,
  totalInvestment = 0,
  mgapExportItems = [],
  minturInitial = 0,
  minturIncrease = 0,
}) {
  const exportIncrement = calcExportIncrement({
    evaluatingMinistry,
    exportIncrease,
    mgapExportItems,
    minturIncrease,
  });

  const baselineExports =
    evaluatingMinistry === 'mintur' ? parseNumber(minturInitial) : parseNumber(currentExports);

  if (evaluatingMinistry !== 'mintur' && exportIncrement <= 0) {
    return 0;
  }

  const delta_m = exportIncrement / EXPORT_DIVISOR;
  const invest_m = parseNumber(totalInvestment) / EXPORT_DIVISOR;

  if (delta_m <= 0 || invest_m <= 0) {
    return 0;
  }

  const intensityScore = delta_m / (0.1 * Math.sqrt(invest_m));

  let adjustmentFactor = 1;
  if (isNewCompany === 'si') {
    adjustmentFactor = 2;
  } else {
    const safeBaseline = Math.max(baselineExports, 0.001);
    const growthRatio = exportIncrement / safeBaseline;
    const growthBonus = Math.min(growthRatio, 1);
    adjustmentFactor = 1 + growthBonus;
  }

  const rawScore = intensityScore * adjustmentFactor;
  return clamp(rawScore, 0, 10);
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

export function scoreSustainability({ sustainabilityAmount, certification, investment }) {
  const bonus = CERTIFICATION_BONUS[certification] ?? 0;
  const pct = calcInvestmentPct(sustainabilityAmount, investment);
  return clamp(pct / 5 + bonus, 0, 10);
}

const I_PLUS_CATEGORY_POINTS = {
  at: 4,
  inn: 7,
  id: 10,
};

export function scoreIPlus({ iPlusCategory, iPlusPct, investment }) {
  const pct = calcInvestmentPct(iPlusPct, investment);
  const categoryPoints = I_PLUS_CATEGORY_POINTS[iPlusCategory] ?? 0;
  const share = pct / 100;
  const scaledShare = Math.min(share / 0.5, 1);
  return clamp(scaledShare * categoryPoints, 0, categoryPoints);
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
