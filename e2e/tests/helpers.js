import { expect } from '@playwright/test';
import {
  finalScore,
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreStrategic,
  scoreSustainability,
} from '../../src/utils/scoring.js';

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

export const expectMetricValue = async (page, labelText, expectedValue) => {
  const expectedText =
    typeof expectedValue === 'number' ? expectedValue.toFixed(2) : String(expectedValue);
  const card = page.locator('.metric-card').filter({ hasText: labelText });
  await expect(card.locator('.metric-value')).toHaveText(expectedText);
};

export const DEFAULT_USD_RATE = 38.5;
export const DEFAULT_UI_RATE = 6.5;
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

export {
  finalScore,
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreStrategic,
  scoreSustainability,
};
