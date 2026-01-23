import { computeScenario } from './helpers.js';

const scenario = {
  company: { annualBillingUi: 45000000, employees: 35, sector: 'industria', isNew: false },
  project: {
    ministry: 'miem',
    machineryUi: 1200000,
    installationsUi: 500000,
    civilWorksUi: 300000,
    industrialParkUi: 0,
  },
  employment: {
    base: { women: 10, youth: 5, disability: 0, others: 0 },
    inc: { total: 5, women: 1, youth: 1, disability: 0, others: 0 },
  },
  exports: { currentExports: 1000000, exportIncrease: 1200000 },
  decentralization: { canelones: 2000000 },
  sustainability: { amountUi: 100000, certification: 'none' },
  iplus: { amountUi: 200000, category: 'at' },
  strategic: { priorities: 0 },
};

test('G2 - SME exporter scaling up', () => {
  // Policy: export performance should drive a strong incentive.
  const { scores, total, irae } = computeScenario(scenario);
  expect(scores.exports).toBeGreaterThanOrEqual(7);
  expect(irae).toBeGreaterThanOrEqual(0.35);
  expect(total).toBeGreaterThanOrEqual(1);
});

/*
Policy principle: Export-led growth yields strong incentives.
Regression signal: Export indicator weak or IRAE falls below expected solid range.
*/
