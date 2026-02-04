import { clamp } from './helpers.js';

export function scoreEmployment({
  totalPersonnelIncrease = 0,
  othersIncrease = 0,
  womenIncrease = 0,
  youthIncrease = 0,
  disabilityIncrease = 0,
  investmentTotalMillions = 0,
}) {
  if (totalPersonnelIncrease <= 0) {
    return 0;
  }

  const protectedIncrease =
    womenIncrease + youthIncrease + disabilityIncrease + othersIncrease;

  const numerator = totalPersonnelIncrease + 0.25 * protectedIncrease;
  const denominator =
    investmentTotalMillions > 0 ? Math.cbrt(investmentTotalMillions) : 1;
  const points = numerator / denominator;
  return clamp(points, 0, 10);
}
