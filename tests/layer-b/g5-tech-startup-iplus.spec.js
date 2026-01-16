import { computeScenario } from './helpers.js';

const scenario = {
  company: { annualBillingUi: 8000000, employees: 10, sector: 'servicios', isNew: true },
  project: {
    ministry: 'miem',
    machineryUi: 200000,
    installationsUi: 100000,
    civilWorksUi: 50000,
    industrialParkUi: 0,
  },
  employment: {
    base: { noVulnerable: 0, women: 0, youth: 0, disability: 0, dinali: 0, tus: 0 },
    inc: { noVulnerable: 4, women: 2, youth: 2, disability: 0, dinali: 0, tus: 0 },
  },
  exports: { miemInitial: 0, miemIncrease: 100000 },
  decentralization: { montevideo: 350000 },
  sustainability: { amountUi: 20000, certification: 'none' },
  iplus: { amountUi: 200000, category: 'id' },
  strategic: { priorities: 0 },
};

test('G5 - Tech startup with high I+', () => {
  // Policy: R&D intensity should hit the cap and qualify even with low exports.
  const { scores, total } = computeScenario(scenario);
  expect(scores.iPlus).toBe(10);
  expect(scores.exports).toBeLessThanOrEqual(4);
  expect(total).toBeGreaterThanOrEqual(1);
});

/*
Policy principle: High I+ intensity can qualify a small new firm.
Regression signal: I+ cap not applied or qualification blocked by low exports.
*/
