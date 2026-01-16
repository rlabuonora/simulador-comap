import { calcInvestmentPct, clamp } from './helpers.js';

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

export function scoreSustainability({ sustainabilityAmount, certification, investment }) {
  const bonus = CERTIFICATION_BONUS[certification] ?? 0;
  const pct = calcInvestmentPct(sustainabilityAmount, investment);
  return clamp(pct / 5 + bonus, 0, 10);
}
