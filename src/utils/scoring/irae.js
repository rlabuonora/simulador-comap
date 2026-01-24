import { isOnOrBefore } from './helpers.js';

const INDUSTRIAL_PARK_ELIGIBLE = new Set([
  'actividades-industriales',
  'servicios-logisticos',
  'energia-solar',
  'valorizacion-residuos',
  'servicios-tic-biotecnologia',
]);

const getIndustrialParkMultiplier = ({
  industrialParkUser,
  industrialParkActivity,
  investmentTotal,
  industrialParkInvestment,
}) => {
  if (industrialParkUser !== 'si') {
    return 1;
  }

  const incrementRate = INDUSTRIAL_PARK_ELIGIBLE.has(industrialParkActivity) ? 0.15 : 0.05;

  if (!investmentTotal || investmentTotal <= 0) {
    return 1;
  }

  const boundedParkInvestment = Math.min(Math.max(industrialParkInvestment ?? 0, 0), investmentTotal);
  const share = boundedParkInvestment / investmentTotal;
  return 1 + incrementRate * share;
};

export function computeIraePct(finalScoreValue, options = {}) {
  const {
    scores,
    investmentTotal,
    filedDate,
    firmSize,
    coreScoreSum,
    industrialParkUser,
    industrialParkActivity,
    industrialParkInvestment,
    employees,
  } = options;
  const hasOverrideInputs =
    scores && typeof investmentTotal === 'number' && Number.isFinite(investmentTotal) && filedDate;

  if (hasOverrideInputs) {
    if (coreScoreSum !== undefined && coreScoreSum < 1) {
      return 0;
    }

    const iPlusScore = scores.iPlus ?? 0;
    const employmentScore = scores.employment ?? 0;
    const inWindowA =
      isOnOrBefore(filedDate, '2027-12-31') &&
      investmentTotal >= 180_000_000 &&
      investmentTotal < 300_000_000;
    const inWindowB =
      isOnOrBefore(filedDate, '2028-12-31') && investmentTotal >= 300_000_000;

    if (iPlusScore >= 4 && employmentScore >= 5 && (inWindowA || inWindowB)) {
      return 1;
    }
  }

  if (coreScoreSum !== undefined && coreScoreSum < 1) {
    return 0;
  }

  const roundedScore = Math.round(finalScoreValue * 100) / 100;
  const baseRate = ((roundedScore - 1) / 9) * 0.7 + 0.3;
  let bonus = 0;

  if (firmSize === 'MICRO' || firmSize === 'PEQUEÑA') {
    bonus = 0.15;
  } else if (firmSize === 'MEDIANA' && (employees === undefined || employees <= 50)) {
    bonus = 0.1;
  }

  const baseRateWithBonus = baseRate + bonus;

  const multiplier = getIndustrialParkMultiplier({
    industrialParkUser,
    industrialParkActivity,
    investmentTotal,
    industrialParkInvestment,
  });
  return Math.min(baseRateWithBonus * multiplier, 1);
}

export function computeIraeYears({
  investmentTotal,
  weightedScore,
  coreScoreSum,
  firmSize,
  industrialParkUser,
  industrialParkActivity,
  industrialParkInvestment,
  employees,
  iPlusScore,
}) {
  if (coreScoreSum < 1) {
    return 0;
  }

  let baseYears = 0;
  let maxYears = 0;

  if (investmentTotal <= 3_500_000) {
    baseYears = ((weightedScore - 1) * 12) / 9 + 4;
    maxYears = 16;
  } else if (investmentTotal <= 14_000_000) {
    baseYears = ((weightedScore - 1) * 13) / 9 + 4;
    maxYears = 17;
  } else if (investmentTotal <= 70_000_000) {
    baseYears = ((weightedScore - 1) * 14) / 9 + 4;
    maxYears = 18;
  } else if (investmentTotal <= 140_000_000) {
    baseYears = ((weightedScore - 1) * 16) / 9 + 4;
    maxYears = 20;
  } else if (investmentTotal <= 250_000_000) {
    baseYears = ((weightedScore - 1) * 18) / 9 + 4;
    maxYears = 22;
  } else if (investmentTotal <= 500_000_000) {
    baseYears = ((weightedScore - 1) * 20) / 9 + 4;
    maxYears = 24;
  } else {
    baseYears = ((weightedScore - 1) * 21) / 9 + 4;
    maxYears = 25;
  }

  let years = Math.min(baseYears, maxYears);

  if (firmSize === 'MICRO' || firmSize === 'PEQUEÑA') {
    years += 2;
  } else if (firmSize === 'MEDIANA' && (employees === undefined || employees <= 50)) {
    years += 1;
  }

  if (iPlusScore >= 2) {
    years += 2;
  }

  years = Math.min(years, maxYears);

  const multiplier = getIndustrialParkMultiplier({
    industrialParkUser,
    industrialParkActivity,
    investmentTotal,
    industrialParkInvestment,
  });
  return Math.round(years * multiplier);
}
