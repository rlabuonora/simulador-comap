import { computeScenario } from './helpers.js';

const scenario = {
  company: { annualBillingUi: 90000000, employees: 60, sector: 'industria', isNew: false },
  project: {
    ministry: 'miem',
    machineryUi: 1000000,
    installationsUi: 800000,
    civilWorksUi: 400000,
    industrialParkUi: 0,
  },
  employment: {
    base: { women: 15, youth: 10, disability: 0, others: 0 },
    inc: { total: 3, women: 1, youth: 0, disability: 0, others: 0 },
  },
  exports: { miemInitial: 3000000, miemIncrease: 200000 },
  decentralization: { florida: 2200000 },
  sustainability: { amountUi: 1000000, certification: 'sello-eficiencia-energetica-b' },
  iplus: { amountUi: 0, category: 'none' },
  strategic: { priorities: 0 },
};

test('G7 - Environmental upgrade', () => {
  // Policy: heavy efficiency investment should push sustainability to the cap with moderate IRAE.
  const { scores, irae } = computeScenario(scenario);
  expect(scores.sustainability).toBeGreaterThanOrEqual(9);
  expect(irae).toBeGreaterThanOrEqual(0.4);
  expect(irae).toBeLessThanOrEqual(0.7);
});

/*
Policy principle: Environmental upgrades should be strongly rewarded, but not maxed.
Regression signal: Sustainability cap not applied or IRAE shifts outside moderate range.
*/
