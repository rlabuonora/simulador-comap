import { expect, test } from '@playwright/test';
import {
  expectMetricValue,
  expectStepScore,
  finalScore,
  fillIfVisible,
  goNext,
  goToLocator,
  readRateInputs,
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreStrategic,
  scoreSustainability,
  toUsdInvestment,
} from './helpers.js';

test('flow: mgap agricultural project', async ({ page }) => {
  const investment = {
    machineryUi: 1500000,
    civilWorksUi: 500000,
    industrialParkInvestmentUi: 0,
  };
  const totalInvestment = investment.machineryUi + investment.civilWorksUi;
  const totalInvestmentUsd = toUsdInvestment(totalInvestment);

  const employmentInputs = {
    totalPersonnelBase: 0,
    totalPersonnelIncrease: 4,
    othersBase: 0,
    othersIncrease: 1,
    womenBase: 0,
    womenIncrease: 2,
    youthBase: 0,
    youthIncrease: 0,
    disabilityBase: 0,
    disabilityIncrease: 1,
  };
  const exportInputs = {
    evaluatingMinistry: 'mgap',
    isNewCompany: 'no',
    currentExports: 800000,
    exportIncrease: 1000000,
    totalInvestment: totalInvestmentUsd,
    indirectExports: [{ pct: 75, increase: 200000 }],
  };
  const decentralizationInputs = {
    investment: totalInvestment,
    deptAllocations: [
      { id: 'tacuarembo', amount: 2000000 },
      { id: 'montevideo', amount: 1000000 },
    ],
  };
  const sustainabilityInputs = {
    investment: totalInvestment,
    sustainabilityAmount: 300000,
    certification: 'sello-b',
  };
  const iPlusInputs = {
    investment: totalInvestment,
    iPlusPct: 900000,
    iPlusCategory: 'at',
  };
  const strategicInputs = {
    evaluatingMinistry: 'mgap',
    investment: totalInvestment,
    mgapRiegoFlag: 'si',
    mgapRiegoInvestmentUi: 1000000,
    mgapNaturalFieldFlag: 'si',
  };

  const scores = {
    employment: scoreEmployment(employmentInputs),
    exports: scoreExports(exportInputs),
    decentralization: scoreDecentralization(decentralizationInputs),
    sustainability: scoreSustainability(sustainabilityInputs),
    iPlus: scoreIPlus(iPlusInputs),
    strategic: scoreStrategic(strategicInputs),
  };
  let expectedExportsScore = scores.exports;

  await page.goto('/');

  const companyStep = page.locator('.step.active');
  const billingInput = page.locator('#annualBillingUi');
  const employeesInput = page.locator('#employees');
  const sectorSelect = page.locator('#sector');
  const ministrySelect = page.locator('#evaluatingMinistry');
  const newCompanyNo = page.locator('input[name="isNewCompany"][value="no"]');
  await goToLocator(page, billingInput);
  await billingInput.fill('18000000');
  await employeesInput.fill('40');
  await sectorSelect.selectOption('agro');
  await newCompanyNo.check();
  await ministrySelect.selectOption('mgap');
  await goNext(page);

  const projectStep = page.locator('.step.active');
  const machineryInput = page.locator('#machineryUi');
  const civilWorksInput = page.locator('#civilWorksUi');
  const industrialParkInput = page.locator('#industrialParkInvestmentUi');
  await goToLocator(page, machineryInput);
  await machineryInput.fill(String(investment.machineryUi));
  await civilWorksInput.fill(String(investment.civilWorksUi));
  await fillIfVisible(industrialParkInput, investment.industrialParkInvestmentUi);
  const { uiRate, usdRate } = await readRateInputs(page);
  expectedExportsScore = scoreExports({
    ...exportInputs,
    totalInvestment: toUsdInvestment(totalInvestment, uiRate, usdRate),
  });
  scores.exports = expectedExportsScore;
  await goNext(page);

  const employmentStep = page.locator('.step.active');
  const totalPersonnelBaseInput = page.locator('#totalPersonnelBase');
  const totalPersonnelIncreaseInput = page.locator('#totalPersonnelIncrease');
  const othersBaseInput = page.locator('#othersBase');
  const othersInput = page.locator('#othersIncrease');
  const womenBaseInput = page.locator('#womenBase');
  const womenInput = page.locator('#womenIncrease');
  const youthBaseInput = page.locator('#youthBase');
  const youthInput = page.locator('#youthIncrease');
  const disabilityBaseInput = page.locator('#disabilityBase');
  const disabilityInput = page.locator('#disabilityIncrease');
  await goToLocator(page, totalPersonnelIncreaseInput);
  await totalPersonnelBaseInput.fill(String(employmentInputs.totalPersonnelBase));
  await totalPersonnelIncreaseInput.fill(String(employmentInputs.totalPersonnelIncrease));
  await othersBaseInput.fill(String(employmentInputs.othersBase));
  await othersInput.fill(String(employmentInputs.othersIncrease));
  await womenBaseInput.fill(String(employmentInputs.womenBase));
  await womenInput.fill(String(employmentInputs.womenIncrease));
  await youthBaseInput.fill(String(employmentInputs.youthBase));
  await youthInput.fill(String(employmentInputs.youthIncrease));
  await disabilityBaseInput.fill(String(employmentInputs.disabilityBase));
  await disabilityInput.fill(String(employmentInputs.disabilityIncrease));
  await expectStepScore(page, scores.employment);
  await goNext(page);

  const exportsStep = page.locator('.step.active');
  const currentExportsInput = page.locator('#currentExports');
  const exportIncreaseInput = page.locator('#exportIncrease');
  const mgapSelect = page.locator('#mgapExportSelection');
  const mgapInitial = page.locator('#mgapExportInitial');
  const mgapIncrease = page.locator('#mgapExportIncrease');
  await goToLocator(page, currentExportsInput);
  await currentExportsInput.fill(String(exportInputs.currentExports));
  await exportIncreaseInput.fill(String(exportInputs.exportIncrease));
  await mgapSelect.selectOption('semillas');
  await mgapInitial.fill('100000');
  await mgapIncrease.fill('200000');
  await exportsStep.getByRole('button', { name: '+' }).click();
  await expect(exportsStep.locator('.field-error')).toHaveCount(0);
  await expect(exportsStep.locator('.table-row')).toHaveCount(2);
  await expectStepScore(page, expectedExportsScore);
  await goNext(page);

  const decentralizationStep = page.locator('.step.active');
  const deptSelect = page.locator('#deptSelection');
  const deptAmountInput = page.locator('#deptPctValue');
  await goToLocator(page, deptSelect);
  await deptSelect.selectOption('tacuarembo');
  await deptAmountInput.fill('2000000');
  await decentralizationStep.getByRole('button', { name: '+' }).click();
  await deptSelect.selectOption('montevideo');
  await deptAmountInput.fill('1000000');
  await decentralizationStep.getByRole('button', { name: '+' }).click();
  await expect(
    decentralizationStep.locator('.table-row').filter({ hasText: 'Tacuarembo' })
  ).toHaveCount(1);
  await expectStepScore(page, scores.decentralization);
  await goNext(page);

  const sustainabilityStep = page.locator('.step.active');
  const sustainabilityAmountInput = page.locator('#sustainabilityAmount');
  const certificationSelect = page.locator('#certification');
  await goToLocator(page, sustainabilityAmountInput);
  await sustainabilityAmountInput.fill(String(sustainabilityInputs.sustainabilityAmount));
  await certificationSelect.selectOption(sustainabilityInputs.certification);
  await expectStepScore(page, scores.sustainability);
  await goNext(page);

  const iPlusStep = page.locator('.step.active');
  const iPlusAmountInput = page.locator('#iPlusPct');
  const iPlusCategorySelect = page.locator('#iPlusCategory');
  await goToLocator(page, iPlusAmountInput);
  await iPlusAmountInput.fill(String(iPlusInputs.iPlusPct));
  await iPlusCategorySelect.selectOption(iPlusInputs.iPlusCategory);
  await expectStepScore(page, scores.iPlus);
  await goNext(page);

  const strategicStep = page.locator('.step.active');
  const mgapRiegoYes = page.locator('input[name="mgapRiegoFlag"][value="si"]');
  const mgapRiegoInput = page.locator('#mgapRiegoInvestmentUi');
  const mgapNaturalYes = page.locator('input[name="mgapNaturalFieldFlag"][value="si"]');
  await goToLocator(page, mgapRiegoYes);
  await mgapRiegoYes.check();
  await mgapRiegoInput.fill(String(strategicInputs.mgapRiegoInvestmentUi));
  await mgapNaturalYes.check();
  await expectStepScore(page, scores.strategic);
  await goNext(page);

  await goToLocator(page, page.locator('.metric-card'));
  await expectMetricValue(page, 'Puntaje total', finalScore(scores));
});
