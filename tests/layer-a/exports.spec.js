import { assertGlobalInvariants, calculateScores, withMutation } from './fixture.js';

const cases = [
  {
    id: 'EXP-01',
    name: 'zero increase -> export score = 0',
    mutation: {
      exports: {
        exportIncrease: 0,
        indirectExports: [],
      },
    },
    assert: ({ scores }) => {
      // Rule: zero increment yields score 0.
      expect(scores.exports).toBe(0);
    },
  },
  {
    id: 'EXP-02',
    name: 'tiny increase -> export score > 0',
    mutation: {
      exports: {
        indirectExports: [{ pct: 100, increase: 1 }],
      },
    },
    assert: ({ scores }) => {
      // Rule: small positive increase should yield a positive score.
      expect(scores.exports).toBeGreaterThan(0);
    },
  },
  {
    id: 'EXP-03',
    name: 'huge increase -> export score = 10',
    mutation: {
      exports: {
        indirectExports: [{ pct: 100, increase: 1_000_000_000 }],
      },
    },
    assert: ({ scores }) => {
      // Rule: extreme increase must clamp at 10.
      expect(scores.exports).toBe(10);
    },
  },
  {
    id: 'EXP-04',
    name: 'zero baseline -> no divide-by-zero',
    mutation: {
      exports: {
        currentExports: 0,
        indirectExports: [{ pct: 100, increase: 100000 }],
      },
    },
    assert: ({ scores }) => {
      // Rule: baseline zero should not introduce NaN or Infinity.
      expect(Number.isFinite(scores.exports)).toBe(true);
      expect(scores.exports).toBeGreaterThanOrEqual(0);
    },
  },
  {
    id: 'EXP-05',
    name: 'mgap rural startup scenario -> export score = 10',
    mutation: {
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
    },
    assert: ({ scores }) => {
      expect(scores.exports).toBe(10);
    },
  },
  {
    id: 'EXP-06',
    name: 'mgap indirect-only uses product coefficient',
    mutation: {
      project: { ministry: 'mgap' },
      exports: {
        currentExports: 800000,
        exportIncrease: 0,
        indirectExports: [{ pct: 75, increase: 200000 }],
      },
    },
    assert: ({ scores }) => {
      expect(scores.exports).toBeCloseTo(0.89, 2);
    },
  },
  {
    id: 'EXP-07',
    name: 'mgap direct + indirect add together',
    mutation: {
      project: { ministry: 'mgap' },
      exports: {
        currentExports: 800000,
        exportIncrease: 200000,
        indirectExports: [{ pct: 75, increase: 200000 }],
      },
    },
    assert: ({ scores }) => {
      expect(scores.exports).toBeCloseTo(2.52, 2);
    },
  },
  {
    id: 'EXP-08',
    name: 'mintur uses coefficient and ignores direct inputs',
    mutation: {
      project: { ministry: 'mintur' },
      exports: {
        currentExports: 500000,
        exportIncrease: 1000000,
        indirectExports: [{ pct: 100, increase: 100000 }],
      },
    },
    assert: ({ scores }) => {
      expect(scores.exports).toBeCloseTo(2.65, 2);
    },
  },
  {
    id: 'EXP-09',
    name: 'miem direct-only',
    mutation: {
      project: { ministry: 'miem' },
      exports: { currentExports: 500000, exportIncrease: 250000 },
    },
    assert: ({ scores }) => {
      expect(scores.exports).toBeCloseTo(1.88, 2);
    },
  },
  {
    id: 'EXP-10',
    name: 'mgap new company doubles adjustment factor',
    mutation: {
      company: { isNew: true },
      project: { ministry: 'mgap' },
      exports: { currentExports: 800000, exportIncrease: 200000, indirectExports: [] },
    },
    assert: ({ scores }) => {
      expect(scores.exports).toBeCloseTo(2, 2);
    },
  },
  {
    id: 'EXP-11',
    name: 'mgap existing company uses growth bonus',
    mutation: {
      company: { isNew: false },
      project: { ministry: 'mgap' },
      exports: { currentExports: 800000, exportIncrease: 200000, indirectExports: [] },
    },
    assert: ({ scores }) => {
      expect(scores.exports).toBeCloseTo(1.25, 2);
    },
  },
];

describe('Layer A: Exports indicator', () => {
  cases.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, () => {
      const fixture = withMutation(testCase.mutation);
      const results = calculateScores(fixture);
      testCase.assert(results);
      assertGlobalInvariants(expect, results.scores, results.totalScore, results.irae);
    });
  });
});
