import { expect, test } from '@playwright/test';
import {
  expectMetricValue,
  expectStepScore,
  finalScore,
  fillIfVisible,
  goNext,
  goToLocator,
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreStrategic,
  scoreSustainability,
} from './helpers.js';

test('flow: miem new exporting company', async ({ page }) => {
  const investment = {
    machineryUi: 1000000,
    civilWorksUi: 500000,
    industrialParkInvestmentUi: 0,
  };
  const totalInvestment = investment.machineryUi + investment.civilWorksUi;

  const employmentInputs = {
    investmentUi: totalInvestment,
    othersBase: 0,
    womenBase: 0,
    youthBase: 0,
    disabilityBase: 0,
    dinaliBase: 0,
    tusTransBase: 0,
    othersIncrease: 2,
    womenIncrease: 1,
    youthIncrease: 1,
    disabilityIncrease: 0,
    dinaliIncrease: 0,
    tusTransIncrease: 0,
  };
  const exportInputs = {
    evaluatingMinistry: 'miem',
    isNewCompany: 'si',
    currentExports: 0,
    exportIncrease: 500000,
    totalInvestment,
  };
  const decentralizationInputs = {
    investment: totalInvestment,
    deptAllocations: [{ id: 'artigas', amount: totalInvestment }],
  };
  const sustainabilityInputs = {
    investment: totalInvestment,
    sustainabilityAmount: 200000,
    certification: 'leed-oro',
  };
  const iPlusInputs = {
    investment: totalInvestment,
    iPlusPct: 600000,
    iPlusCategory: 'inn',
  };
  const strategicInputs = {
    strategicPriorities: 2,
  };

  const scores = {
    employment: scoreEmployment(employmentInputs),
    exports: scoreExports(exportInputs),
    decentralization: scoreDecentralization(decentralizationInputs),
    sustainability: scoreSustainability(sustainabilityInputs),
    iPlus: scoreIPlus(iPlusInputs),
    strategic: scoreStrategic(strategicInputs),
  };

  await page.goto('/');

  const companyStep = page.locator('.step.active');
  const billingInput = page.locator('#annualBillingUi');
  const employeesInput = page.locator('#employees');
  const sectorSelect = page.locator('#sector');
  const newCompanyYes = page.locator('input[name="isNewCompany"][value="si"]');
  await goToLocator(page, billingInput);
  await billingInput.fill('25000000');
  await employeesInput.fill('25');
  await sectorSelect.selectOption('industria');
  await newCompanyYes.check();
  await goNext(page);

  const projectStep = page.locator('.step.active');
  const ministrySelect = page.locator('#evaluatingMinistry');
  const machineryInput = page.locator('#machineryUi');
  const civilWorksInput = page.locator('#civilWorksUi');
  const industrialParkInput = page.locator('#industrialParkInvestmentUi');
  await goToLocator(page, machineryInput);
  await ministrySelect.selectOption('miem');
  await machineryInput.fill(String(investment.machineryUi));
  await civilWorksInput.fill(String(investment.civilWorksUi));
  await fillIfVisible(industrialParkInput, investment.industrialParkInvestmentUi);
  await goNext(page);

  const employmentStep = page.locator('.step.active');
  const othersBaseInput = page.locator('#othersBase');
  const othersInput = page.locator('#othersIncrease');
  const womenBaseInput = page.locator('#womenBase');
  const womenInput = page.locator('#womenIncrease');
  const youthBaseInput = page.locator('#youthBase');
  const youthInput = page.locator('#youthIncrease');
  const disabilityBaseInput = page.locator('#disabilityBase');
  const disabilityInput = page.locator('#disabilityIncrease');
  const dinaliBaseInput = page.locator('#dinaliBase');
  const dinaliInput = page.locator('#dinaliIncrease');
  const transBaseInput = page.locator('#tusTransBase');
  const transInput = page.locator('#tusTransIncrease');
  await goToLocator(page, othersInput);
  await othersBaseInput.fill(String(employmentInputs.othersBase));
  await othersInput.fill(String(employmentInputs.othersIncrease));
  await womenBaseInput.fill(String(employmentInputs.womenBase));
  await womenInput.fill(String(employmentInputs.womenIncrease));
  await youthBaseInput.fill(String(employmentInputs.youthBase));
  await youthInput.fill(String(employmentInputs.youthIncrease));
  await disabilityBaseInput.fill(String(employmentInputs.disabilityBase));
  await disabilityInput.fill(String(employmentInputs.disabilityIncrease));
  await dinaliBaseInput.fill(String(employmentInputs.dinaliBase));
  await dinaliInput.fill(String(employmentInputs.dinaliIncrease));
  await transBaseInput.fill(String(employmentInputs.tusTransBase));
  await transInput.fill(String(employmentInputs.tusTransIncrease));
  await expectStepScore(page, scores.employment);
  await goNext(page);

  const exportsStep = page.locator('.step.active');
  const currentExportsInput = page.locator('#currentExports');
  const exportIncreaseInput = page.locator('#exportIncrease');
  await goToLocator(page, currentExportsInput);
  await currentExportsInput.fill(String(exportInputs.currentExports));
  await exportIncreaseInput.fill(String(exportInputs.exportIncrease));
  await expectStepScore(page, scores.exports);
  await goNext(page);

  const decentralizationStep = page.locator('.step.active');
  const deptSelect = page.locator('#deptSelection');
  const deptAmountInput = page.locator('#deptPctValue');
  await goToLocator(page, deptSelect);
  await deptSelect.selectOption('artigas');
  await deptAmountInput.fill(String(totalInvestment));
  await decentralizationStep.getByRole('button', { name: '+' }).click();
  await expect(
    decentralizationStep.locator('.table-row').filter({ hasText: 'Artigas' })
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
  const strategicLineSelect = page.locator('#strategicLine');
  const strategicAmountInput = page.locator('#strategicInvestmentPct');
  const mineralSelect = page.locator('#mineralProcessingLevel');
  await goToLocator(page, strategicLineSelect);
  await strategicLineSelect.selectOption('riego');
  await strategicAmountInput.fill('100000');
  await mineralSelect.selectOption('minima');
  await expectStepScore(page, scores.strategic);
  await goNext(page);

  await goToLocator(page, page.locator('.metric-card'));
  await expectMetricValue(page, 'Puntaje total', finalScore(scores));
});
