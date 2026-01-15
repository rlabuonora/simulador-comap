import { expect } from '@playwright/test';

export const clamp = (value, min = 0, max = 10) => Math.min(Math.max(value, min), max);

export const clickNextTimes = async (page, count) => {
  for (let i = 0; i < count; i += 1) {
    await page.getByRole('button', { name: 'Siguiente' }).click();
  }
};

export const goToSelector = async (page, selector, maxSteps = 8) => {
  const locator = page.locator(selector);
  await goToLocator(page, locator, maxSteps);
};

export const goToLocator = async (page, locator, maxSteps = 8) => {
  await page.waitForLoadState('domcontentloaded');
  for (let i = 0; i < maxSteps; i += 1) {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return;
    } catch (error) {
      const nextButton = page.getByRole('button', { name: 'Siguiente' });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }
  }
  await expect(locator).toBeVisible();
};

export const fillIfVisible = async (locator, value) => {
  if (await locator.isVisible()) {
    await locator.fill(String(value));
  }
};

export const expectStepScore = async (page, expectedValue) => {
  const expectedText = expectedValue.toFixed(2);
  await expect(page.locator('.score-pill strong')).toHaveText(expectedText);
};

export const expectMetricValue = async (page, labelText, expectedValue) => {
  const expectedText =
    typeof expectedValue === 'number' ? expectedValue.toFixed(2) : String(expectedValue);
  const card = page.locator('.metric-card').filter({ hasText: labelText });
  await expect(card.locator('.metric-value')).toHaveText(expectedText);
};

export const scoreEmployment = ({
  womenIncrease = 0,
  youthIncrease = 0,
  disabilityIncrease = 0,
  dinaliIncrease = 0,
  tusTransIncrease = 0,
  othersIncrease = 0,
}) => {
  const vulnerableSum =
    womenIncrease + youthIncrease + disabilityIncrease + dinaliIncrease + tusTransIncrease;
  const points = othersIncrease + vulnerableSum * 1.25;
  return clamp(points, 0, 10);
};

export const scoreDecentralization = ({ deptAllocations = [], investment = 0 }) => {
  const totalAllocation = deptAllocations.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const totalInvestment = investment > 0 ? investment : totalAllocation;

  if (!totalInvestment) {
    return 0;
  }

  const weightedScore = deptAllocations.reduce((sum, item) => {
    const deptScore = item.score ?? 0;
    return sum + (item.amount / totalInvestment) * deptScore;
  }, 0);

  return clamp(weightedScore, 0, 10);
};

export const scoreExports = ({
  evaluatingMinistry,
  isNewCompany,
  currentExports = 0,
  exportIncrease = 0,
  totalInvestment = 0,
  mgapExportItems = [],
  minturInitial = 0,
  minturIncrease = 0,
}) => {
  const exportIncrement =
    evaluatingMinistry === 'mgap'
      ? exportIncrease +
        mgapExportItems.reduce((sum, item) => sum + (item.pct / 100) * item.increase, 0)
      : evaluatingMinistry === 'mintur'
        ? 3.22 * minturIncrease
        : exportIncrease;

  const baselineExports = evaluatingMinistry === 'mintur' ? minturInitial : currentExports;

  if (evaluatingMinistry !== 'mintur' && exportIncrement <= 0) {
    return 0;
  }

  const delta_m = exportIncrement / 1_000_000;
  const invest_m = totalInvestment / 1_000_000;

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

  return clamp(intensityScore * adjustmentFactor, 0, 10);
};

export const scoreSustainability = ({ sustainabilityAmount, certification, investment }) => {
  const bonusByCertification = {
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
  const bonus = bonusByCertification[certification] ?? 0;
  const pct = investment > 0 ? (sustainabilityAmount / investment) * 100 : 0;
  return clamp(pct / 5 + bonus, 0, 10);
};

export const scoreIPlus = ({ iPlusCategory, iPlusPct, investment }) => {
  const categoryPoints = { at: 4, inn: 7, id: 10 }[iPlusCategory] ?? 0;
  const share = investment > 0 ? iPlusPct / investment : 0;
  const scaledShare = Math.min(share / 0.5, 1);
  return clamp(scaledShare * categoryPoints, 0, categoryPoints);
};

export const scoreStrategic = ({ strategicPriorities }) => {
  return clamp(strategicPriorities * 3.5, 0, 10);
};

export const finalScore = (scores) => {
  const weights = {
    employment: 0.4,
    decentralization: 0.1,
    exports: 0.15,
    sustainability: 0.2,
    iPlus: 0.2,
    strategic: 0.25,
  };

  const total = Object.keys(weights).reduce((sum, key) => {
    return sum + (scores[key] ?? 0) * weights[key];
  }, 0);

  return clamp(total, 0, 10);
};
