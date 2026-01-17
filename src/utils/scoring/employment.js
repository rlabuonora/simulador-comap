import { clamp } from './helpers.js';

export function scoreEmployment({
  investmentUi = 0,
  othersBase = 0,
  womenBase = 0,
  youthBase = 0,
  disabilityBase = 0,
  dinaliBase = 0,
  tusTransBase = 0,
  protectedProgramBase = 0,
  othersIncrease = 0,
  womenIncrease = 0,
  youthIncrease = 0,
  disabilityIncrease = 0,
  dinaliIncrease = 0,
  tusTransIncrease = 0,
  protectedProgramIncrease = 0,
}) {
  const increaseTotal =
    othersIncrease +
    womenIncrease +
    youthIncrease +
    disabilityIncrease +
    dinaliIncrease +
    tusTransIncrease +
    protectedProgramIncrease;
  const deltaTotal = increaseTotal;

  let bonus = 0;
  if (deltaTotal > 0) {
    const groups = [
      { key: 'women', delta: womenIncrease, base: womenBase, type: 'women' },
      { key: 'youth', delta: youthIncrease, base: youthBase, type: 'youth' },
      {
        key: 'disability',
        delta: disabilityIncrease,
        base: disabilityBase,
        type: 'protected',
      },
      { key: 'dinali', delta: dinaliIncrease, base: dinaliBase, type: 'protected' },
      { key: 'tusTrans', delta: tusTransIncrease, base: tusTransBase, type: 'protected' },
      {
        key: 'protectedProgram',
        delta: protectedProgramIncrease,
        base: protectedProgramBase,
        type: 'protected',
      },
      { key: 'others', delta: othersIncrease, base: othersBase, type: 'others' },
    ];

    groups.forEach((group) => {
      if (group.delta <= 0) {
        return;
      }
      if (group.type === 'protected' && group.base > 0) {
        return;
      }
      bonus += 0.25 * group.delta;
    });

    bonus = Math.min(bonus, 1);
  }

  const adjustedEmployment = deltaTotal + bonus;
  if (adjustedEmployment <= 0 || investmentUi <= 0) {
    return 0;
  }

  const investmentMillions = investmentUi / 1_000_000;
  const indicator = adjustedEmployment / Math.cbrt(investmentMillions);
  return clamp(indicator, 0, 10);
}
