import { clamp } from './helpers.js';

export function scoreEmployment({
  totalPersonnelIncrease = 0,
  othersIncrease = 0,
  womenIncrease = 0,
  youthIncrease = 0,
  disabilityIncrease = 0,
}) {
  if (totalPersonnelIncrease <= 0) {
    return 0;
  }

  const protectedIncrease =
    womenIncrease + youthIncrease + disabilityIncrease + othersIncrease;

  const points = totalPersonnelIncrease + 0.25 * protectedIncrease;
  return clamp(points, 0, 10);
}
