import { expect } from '@playwright/test';
import {
  classifyCompany,
  computeIraePct,
  finalScore,
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreStrategic,
  scoreSustainability,
} from '../../src/utils/scoring.js';
import { WEIGHTS } from '../../src/utils/constants.js';

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
      await locator.first().waitFor({ state: 'visible', timeout: 5000 });
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

export const goNext = async (page) => {
  const nextButton = page.getByRole('button', { name: 'Siguiente' });
  await expect(nextButton).toBeEnabled();
  await nextButton.click();
};

export const expectStepScore = async (page, expectedValue) => {
  const expectedText = expectedValue.toFixed(2);
  await expect(page.locator('.score-pill strong')).toHaveText(expectedText);
};

export const expectMetricValue = async (page, labelText, expectedValue, options = {}) => {
  const expectedText =
    typeof expectedValue === 'number' ? expectedValue.toFixed(2) : String(expectedValue);
  const card = page.locator('.metric-card').filter({ hasText: labelText });
  const targetCard =
    Number.isInteger(options.index) && options.index >= 0 ? card.nth(options.index) : card;
  await expect(targetCard.locator('.metric-value')).toHaveText(expectedText);
};

export const DEFAULT_USD_RATE = 37.454;
export const DEFAULT_UI_RATE = 6.4215;
export const parseLocaleNumber = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return null;
  }

  const normalized = raw.replace(/\s/g, '');
  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');
  const decimalIndex = Math.max(lastComma, lastDot);

  let numberString = normalized;
  if (decimalIndex >= 0) {
    const integerPart = normalized.slice(0, decimalIndex).replace(/[.,]/g, '');
    const decimalPart = normalized.slice(decimalIndex + 1).replace(/[.,]/g, '');
    numberString = `${integerPart}.${decimalPart}`;
  } else {
    numberString = normalized.replace(/[.,]/g, '');
  }

  if (lastComma === -1 && lastDot > -1 && normalized.match(/\.\d{3}$/)) {
    numberString = normalized.replace(/[.,]/g, '');
  }

  const parsed = Number(numberString);
  return Number.isNaN(parsed) ? null : parsed;
};

export const readRateInputs = async (page) => {
  const usdRateValue = await page.locator('#usdRate').inputValue();
  const uiRateValue = await page.locator('#uiRate').inputValue();
  return {
    usdRate: parseLocaleNumber(usdRateValue) ?? DEFAULT_USD_RATE,
    uiRate: parseLocaleNumber(uiRateValue) ?? DEFAULT_UI_RATE,
  };
};

export const toUsdInvestment = (
  uiInvestment,
  uiRate = DEFAULT_UI_RATE,
  usdRate = DEFAULT_USD_RATE
) => {
  if (!uiRate || !usdRate) {
    return 0;
  }
  return (uiInvestment * uiRate) / usdRate;
};

export const formatNumberForDisplay = (value, minFractionDigits = 0, maxFractionDigits = 2) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
};

export const coreScoreSum = (scores) =>
  Object.entries(scores).reduce((sum, [key, value]) => {
    if (key === 'decentralization') {
      return sum;
    }
    return sum + (value ?? 0) * (WEIGHTS[key] ?? 0);
  }, 0);

export const computeExonerationAmount = ({
  scores,
  investmentTotal,
  annualBillingUi,
  employees,
  industrialParkUser = 'no',
  industrialParkActivity = '',
  industrialParkInvestmentUi = 0,
}) => {
  const firmSize = classifyCompany(annualBillingUi, employees);
  const iraePct = computeIraePct(finalScore(scores), {
    scores,
    investmentTotal,
    firmSize,
    coreScoreSum: coreScoreSum(scores),
    industrialParkUser,
    industrialParkActivity,
    industrialParkInvestment: industrialParkInvestmentUi,
    employees,
  });
  return investmentTotal * iraePct;
};

export {
  classifyCompany,
  computeIraePct,
  finalScore,
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreStrategic,
  scoreSustainability,
};
