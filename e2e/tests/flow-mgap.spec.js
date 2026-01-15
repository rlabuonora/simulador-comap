import { expect, test } from '@playwright/test';
import {
  expectMetricValue,
  expectStepScore,
  finalScore,
  fillIfVisible,
  goToLocator,
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreStrategic,
  scoreSustainability,
} from './helpers.js';

test('flow: mgap agricultural project', async ({ page }) => {
  const investment = {
    machineryUi: 1500000,
    installationsUi: 1000000,
    civilWorksUi: 500000,
    industrialParkInvestmentUi: 0,
  };
  const totalInvestment =
    investment.machineryUi + investment.installationsUi + investment.civilWorksUi;

  const employmentInputs = {
    othersIncrease: 1,
    womenIncrease: 2,
    youthIncrease: 0,
    disabilityIncrease: 1,
    dinaliIncrease: 0,
    tusTransIncrease: 1,
  };
  const exportInputs = {
    evaluatingMinistry: 'mgap',
    isNewCompany: 'no',
    currentExports: 800000,
    exportIncrease: 1000000,
    totalInvestment,
    mgapExportItems: [{ pct: 75, increase: 200000 }],
  };
  const decentralizationInputs = {
    investment: totalInvestment,
    deptAllocations: [
      { amount: 2000000, score: 8 },
      { amount: 1000000, score: 0 },
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
  const newCompanyNo = page.locator('input[name="isNewCompany"][value="no"]');
  await goToLocator(page, billingInput);
  await billingInput.fill('18000000');
  await employeesInput.fill('40');
  await sectorSelect.selectOption('agro');
  await newCompanyNo.check();

  const projectStep = page.locator('.step.active');
  const ministrySelect = page.locator('#evaluatingMinistry');
  const machineryInput = page.locator('#machineryUi');
  const installationsInput = page.locator('#installationsUi');
  const civilWorksInput = page.locator('#civilWorksUi');
  const industrialParkInput = page.locator('#industrialParkInvestmentUi');
  await goToLocator(page, machineryInput);
  await ministrySelect.selectOption('mgap');
  await machineryInput.fill(String(investment.machineryUi));
  await installationsInput.fill(String(investment.installationsUi));
  await civilWorksInput.fill(String(investment.civilWorksUi));
  await fillIfVisible(industrialParkInput, investment.industrialParkInvestmentUi);

  const employmentStep = page.locator('.step.active');
  const othersInput = page.locator('#othersIncrease');
  const womenInput = page.locator('#womenIncrease');
  const youthInput = page.locator('#youthIncrease');
  const disabilityInput = page.locator('#disabilityIncrease');
  const dinaliInput = page.locator('#dinaliIncrease');
  const transInput = page.locator('#tusTransIncrease');
  await goToLocator(page, othersInput);
  await othersInput.fill(String(employmentInputs.othersIncrease));
  await womenInput.fill(String(employmentInputs.womenIncrease));
  await youthInput.fill(String(employmentInputs.youthIncrease));
  await disabilityInput.fill(String(employmentInputs.disabilityIncrease));
  await dinaliInput.fill(String(employmentInputs.dinaliIncrease));
  await transInput.fill(String(employmentInputs.tusTransIncrease));
  await expectStepScore(page, scores.employment);

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
  await expect(exportsStep.getByText('Semillas')).toBeVisible();
  await expectStepScore(page, scores.exports);

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
  await expect(decentralizationStep.getByText('Tacuarembo')).toBeVisible();
  await expectStepScore(page, scores.decentralization);

  const sustainabilityStep = page.locator('.step.active');
  const sustainabilityAmountInput = page.locator('#sustainabilityAmount');
  const certificationSelect = page.locator('#certification');
  await goToLocator(page, sustainabilityAmountInput);
  await sustainabilityAmountInput.fill(String(sustainabilityInputs.sustainabilityAmount));
  await certificationSelect.selectOption(sustainabilityInputs.certification);
  await expectStepScore(page, scores.sustainability);

  const iPlusStep = page.locator('.step.active');
  const iPlusAmountInput = page.locator('#iPlusPct');
  const iPlusCategorySelect = page.locator('#iPlusCategory');
  await goToLocator(page, iPlusAmountInput);
  await iPlusAmountInput.fill(String(iPlusInputs.iPlusPct));
  await iPlusCategorySelect.selectOption(iPlusInputs.iPlusCategory);
  await expectStepScore(page, scores.iPlus);

  const strategicStep = page.locator('.step.active');
  const strategicLineSelect = page.locator('#strategicLine');
  const strategicAmountInput = page.locator('#strategicInvestmentPct');
  const fieldNaturalInput = page.locator('#fieldNaturalPct');
  await goToLocator(page, strategicLineSelect);
  await strategicLineSelect.selectOption('produccion-ganadera');
  await strategicAmountInput.fill('120000');
  await fieldNaturalInput.fill('35');
  await expectStepScore(page, scores.strategic);

  await goToLocator(page, page.locator('.metric-card'));
  await expectMetricValue(page, 'Puntaje total', finalScore(scores));
});
