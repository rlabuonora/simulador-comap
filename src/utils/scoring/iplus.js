import { calcInvestmentPct, clamp } from './helpers.js';

export const I_PLUS_CATEGORY_POINTS = {
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
