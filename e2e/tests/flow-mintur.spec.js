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

test('flow: mintur tourism project', async ({ page }) => {
  const investment = {
    machineryUi: 2000000,
    installationsUi: 1500000,
    civilWorksUi: 500000,
    industrialParkInvestmentUi: 0,
  };
  const totalInvestment =
    investment.machineryUi + investment.installationsUi + investment.civilWorksUi;

  const employmentInputs = {
    othersIncrease: 0,
    womenIncrease: 1,
    youthIncrease: 1,
    disabilityIncrease: 1,
    dinaliIncrease: 1,
    tusTransIncrease: 0,
  };
  const exportInputs = {
    evaluatingMinistry: 'mintur',
    isNewCompany: 'no',
    currentExports: 0,
    exportIncrease: 0,
    totalInvestment,
    minturInitial: 2000000,
    minturIncrease: 100000,
  };
  const decentralizationInputs = {
    investment: totalInvestment,
    deptAllocations: [{ amount: totalInvestment, score: 6 }],
  };
  const sustainabilityInputs = {
    investment: totalInvestment,
    sustainabilityAmount: 800000,
    certification: 'none',
  };
  const iPlusInputs = {
    investment: totalInvestment,
    iPlusPct: 2000000,
    iPlusCategory: 'id',
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
  await billingInput.fill('22000000');
  await employeesInput.fill('30');
  await sectorSelect.selectOption('turismo');
  await newCompanyNo.check();
  await goNext(page);

  const projectStep = page.locator('.step.active');
  const ministrySelect = page.locator('#evaluatingMinistry');
  const machineryInput = page.locator('#machineryUi');
  const installationsInput = page.locator('#installationsUi');
  const civilWorksInput = page.locator('#civilWorksUi');
  const industrialParkInput = page.locator('#industrialParkInvestmentUi');
  await goToLocator(page, machineryInput);
  await ministrySelect.selectOption('mintur');
  await machineryInput.fill(String(investment.machineryUi));
  await installationsInput.fill(String(investment.installationsUi));
  await civilWorksInput.fill(String(investment.civilWorksUi));
  await fillIfVisible(industrialParkInput, investment.industrialParkInvestmentUi);
  await goNext(page);

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
  await goNext(page);

  const exportsStep = page.locator('.step.active');
  const minturInitialInput = page.locator('#minturInitial');
  const minturIncreaseInput = page.locator('#minturIncrease');
  await goToLocator(page, minturInitialInput);
  await minturInitialInput.fill(String(exportInputs.minturInitial));
  await minturIncreaseInput.fill(String(exportInputs.minturIncrease));
  await expectStepScore(page, scores.exports);
  await goNext(page);

  const decentralizationStep = page.locator('.step.active');
  const deptSelect = page.locator('#deptSelection');
  const deptAmountInput = page.locator('#deptPctValue');
  await goToLocator(page, deptSelect);
  await deptSelect.selectOption('rocha');
  await expect(deptSelect).toHaveValue('rocha');
  await deptAmountInput.fill(String(totalInvestment));
  await decentralizationStep.getByRole('button', { name: '+' }).click();
  await expect(decentralizationStep.locator('.field-error')).toHaveCount(0);
  await expect(
    decentralizationStep
      .locator('.table-row')
      .filter({ hasText: 'Rocha' })
      .locator('.table-cell')
      .first()
  ).toBeVisible();
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
  const tourismZoneYes = page.locator('input[name="tourismZoneLocation"][value="si"]');
  await goToLocator(page, strategicLineSelect);
  await strategicLineSelect.selectOption('infraestructura-turistica');
  await strategicAmountInput.fill('160000');
  await tourismZoneYes.check();
  await expectStepScore(page, scores.strategic);
  await goNext(page);

  await goToLocator(page, page.locator('.metric-card'));
  await expectMetricValue(page, 'Puntaje total', finalScore(scores));
});
