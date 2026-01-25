import { clamp, parseNumber } from './helpers.js';

const EXPORT_DIVISOR = 1_000_000;
const MINTUR_COEFFICIENT = 3.22;

const calcMgapIncrement = (items = []) => {
  return items.reduce((sum, item) => {
    const pct = parseNumber(item.pct) / 100;
    const increase = parseNumber(item.increase);
    return sum + pct * increase;
  }, 0);
};

const calcIndirectBaseline = (items = []) => {
  return items.reduce((sum, item) => {
    const pct = parseNumber(item.pct) / 100;
    const initial = parseNumber(item.initial);
    return sum + pct * initial;
  }, 0);
};

const calcExportIncrement = ({ evaluatingMinistry, exportIncrease = 0, indirectExports = [] }) => {
  if (evaluatingMinistry === 'mgap') {
    return parseNumber(exportIncrease) + calcMgapIncrement(indirectExports);
  }

  if (evaluatingMinistry === 'mintur') {
    return parseNumber(exportIncrease) + MINTUR_COEFFICIENT * calcMgapIncrement(indirectExports);
  }

  return parseNumber(exportIncrease);
};

export function scoreExports({
  evaluatingMinistry,
  isNewCompany,
  currentExports = 0,
  exportIncrease = 0,
  totalInvestment = 0,
  indirectExports = [],
}) {
  const exportIncrement = calcExportIncrement({
    evaluatingMinistry,
    exportIncrease,
    indirectExports,
  });

  const baselineExports = parseNumber(currentExports);
  const indirectBaseline = calcIndirectBaseline(indirectExports);
  const totalExports =
    evaluatingMinistry === 'mintur'
      ? baselineExports + MINTUR_COEFFICIENT * indirectBaseline
      : baselineExports + indirectBaseline;

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
    const safeTotalExports = Math.max(totalExports, 0.001);
    const growthRatio = exportIncrement / safeTotalExports;
    const growthBonus = Math.min(growthRatio, 1);
    adjustmentFactor = 1 + growthBonus;
  }

  const rawScore = intensityScore * adjustmentFactor;
  return clamp(rawScore, 0, 10);
}
