import { computeScenario } from './helpers.js';

const scenario = {
  company: { annualBillingUi: 60000000, employees: 40, sector: 'turismo', isNew: false },
  project: {
    ministry: 'mintur',
    machineryUi: 3000000,
    installationsUi: 2500000,
    civilWorksUi: 1500000,
    industrialParkUi: 0,
  },
  employment: {
    base: { noVulnerable: 40, women: 15, youth: 10, disability: 0, dinali: 0, tus: 0 },
    inc: { noVulnerable: 4, women: 2, youth: 2, disability: 0, dinali: 0, tus: 0 },
  },
  exports: {
    currentExports: 1500000,
    exportIncrease: 0,
    indirectExports: [{ pct: 100, increase: 600000 }],
  },
  decentralization: { rocha: 7000000 },
  sustainability: { amountUi: 400000, certification: 'none' },
  iplus: { amountUi: 0, category: 'none' },
  strategic: { priorities: 0 },
};

test('G4 - Tourism project with indirect exports', () => {
  // Policy: tourism receipts count as exports and decentralization should lift the score.
  const { scores } = computeScenario(scenario);
  expect(scores.exports).toBeGreaterThanOrEqual(7);
  expect(scores.decentralization).toBeGreaterThanOrEqual(5);
});

/*
Policy principle: Tourism receipts act like exports and regional location adds weight.
Regression signal: Mintur export handling or decentralization weights stop lifting outcomes.
*/
