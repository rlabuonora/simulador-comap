import { computeScenario } from './helpers.js';

const scenario = {
  company: { annualBillingUi: 800000000, employees: 300, sector: 'industria', isNew: false },
  project: {
    ministry: 'miem',
    machineryUi: 200000000,
    installationsUi: 100000000,
    civilWorksUi: 80000000,
    industrialParkUi: 0,
    filedDate: '2028-12-31',
  },
  employment: {
    base: { women: 80, youth: 40, disability: 5, others: 3 },
    inc: { total: 3670, women: 400, youth: 200, disability: 50, others: 20 },
  },
  exports: { miemInitial: 50000000, miemIncrease: 20000000 },
  decentralization: { rioNegro: 380000000 },
  sustainability: { amountUi: 15000000, certification: 'iso14001' },
  iplus: { amountUi: 100000000, category: 'id' },
  strategic: { priorities: 0 },
};

test('G10 - Mega strategic project', () => {
  // Policy: major project should max out IRAE and obtain the maximum years.
  const { irae, years } = computeScenario(scenario);
  expect(irae).toBeGreaterThanOrEqual(0.99);
  expect(years).toBeGreaterThanOrEqual(5);
});

/*
Policy principle: Mega projects should reach maximum IRAE and years.
Regression signal: IRAE ceiling or year thresholds shifted downward.
*/
