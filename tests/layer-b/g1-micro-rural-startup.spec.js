import { computeScenario } from './helpers.js';

const scenario = {
  company: { annualBillingUi: 1500000, employees: 5, sector: 'agro', isNew: true },
  project: {
    ministry: 'mgap',
    machineryUi: 200000,
    installationsUi: 100000,
    civilWorksUi: 50000,
    industrialParkUi: 0,
  },
  employment: {
    base: { noVulnerable: 0, women: 0, youth: 0, disability: 0, dinali: 0, tus: 0 },
    inc: { noVulnerable: 150, women: 30, youth: 20, disability: 0, dinali: 0, tus: 0 },
  },
  exports: {
    currentExports: 800000,
    exportIncrease: 1000000,
    indirectExports: [{ pct: 75, increase: 200000 }],
  },
  decentralization: { artigas: 350000 },
  sustainability: { amountUi: 20000, certification: 'none' },
  iplus: { amountUi: 0, category: 'none' },
  strategic: { priorities: 0 },
};

test('G1 - Micro rural startup', () => {
  // Policy: new rural agro firm should qualify with modest IRAE; employment leads.
  const { scores, total, irae, years } = computeScenario(scenario);

  expect(total).toBeGreaterThanOrEqual(1);
  expect(total).toBeCloseTo(6.73, 2);
  expect(scores.exports).toBeCloseTo(10, 2);
  expect(scores.decentralization).toBe(10);
  expect(scores.sustainability).toBeCloseTo(1.14, 2);
  expect(scores.iPlus).toBe(0);
  expect(irae).toBeCloseTo(0.8957, 4);
  expect(years).toBe(14);
  const maxCoreScore = Math.max(
    scores.exports,
    scores.sustainability,
    scores.iPlus,
    scores.strategic
  );
  expect(scores.employment).toBeGreaterThanOrEqual(maxCoreScore);
});

/*
Policy principle: Rural micro inclusion with employment-led impact.
Regression signal: Employment no longer dominates or IRAE becomes too low/high for micro rural case.
*/
