import { computeScenario } from './helpers.js';

const scenario = {
  company: { annualBillingUi: 400000000, employees: 120, sector: 'industria', isNew: false },
  project: {
    ministry: 'miem',
    machineryUi: 80000000,
    installationsUi: 30000000,
    civilWorksUi: 20000000,
    industrialParkUi: 0,
  },
  employment: {
    base: { noVulnerable: 120, women: 20, youth: 10, disability: 0, dinali: 0, tus: 0 },
    inc: { noVulnerable: 5, women: 1, youth: 1, disability: 0, dinali: 0, tus: 0 },
  },
  exports: { currentExports: 20000000, exportIncrease: 3000000 },
  decentralization: { sanJose: 130000000 },
  sustainability: { amountUi: 8000000, certification: 'none' },
  iplus: { amountUi: 3000000, category: 'at' },
  strategic: { priorities: 0 },
};

test('G3 - Large capital-intensive project', () => {
  // Policy: low job creation should keep employment low; sustainability and I+ lead.
  const { scores } = computeScenario(scenario);
  expect(scores.employment).toBeLessThanOrEqual(2);
  expect(scores.sustainability).toBeLessThan(scores.employment);
  expect(scores.iPlus).toBeLessThan(scores.employment);
});

/*
Policy principle: Capital intensity shifts scoring to sustainability/I+ over employment.
Regression signal: Employment dominates despite low job creation or other drivers undervalued.
*/
