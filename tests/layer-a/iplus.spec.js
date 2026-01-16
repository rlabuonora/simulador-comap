import { assertGlobalInvariants, calculateScores, withMutation } from './fixture.js';

const cases = [
  {
    id: 'IPLUS-01',
    name: 'zero -> score = 0',
    mutation: {
      iplus: {
        amountUi: 0,
      },
    },
    assert: ({ scores }) => {
      // Rule: zero investment share yields score 0.
      expect(scores.iPlus).toBe(0);
    },
  },
  {
    id: 'IPLUS-02',
    name: 'exactly 50% -> score = 10',
    mutation: {
      iplus: {
        amountUi: 2000000,
        category: 'id',
      },
    },
    assert: ({ scores }) => {
      // Rule: 50% of investment at max category yields max score.
      expect(scores.iPlus).toBe(10);
    },
  },
  {
    id: 'IPLUS-03',
    name: 'above 50% -> still 10',
    mutation: {
      iplus: {
        amountUi: 3000000,
        category: 'id',
      },
    },
    assert: ({ scores }) => {
      // Rule: capped at category maximum.
      expect(scores.iPlus).toBe(10);
    },
  },
  {
    id: 'IPLUS-04',
    name: '25% at category AT -> score = 2',
    mutation: {
      iplus: {
        amountUi: 1000000,
        category: 'at',
      },
    },
    assert: ({ scores }) => {
      // Rule: 25% share of investment at AT yields half of 4.
      expect(scores.iPlus).toBeCloseTo(2, 2);
    },
  },
  {
    id: 'IPLUS-05',
    name: '10% at category INN -> score = 1.4',
    mutation: {
      iplus: {
        amountUi: 400000,
        category: 'inn',
      },
    },
    assert: ({ scores }) => {
      // Rule: 10% share yields 0.2 scaled share * 7.
      expect(scores.iPlus).toBeCloseTo(1.4, 2);
    },
  },
  {
    id: 'IPLUS-06',
    name: 'unknown category -> score = 0',
    mutation: {
      iplus: {
        amountUi: 1000000,
        category: 'none',
      },
    },
    assert: ({ scores }) => {
      // Rule: missing category points yields zero score.
      expect(scores.iPlus).toBe(0);
    },
  },
  {
    id: 'IPLUS-07',
    name: 'zero investment -> score = 0',
    mutation: {
      project: {
        machineryUi: 0,
        installationsUi: 0,
        civilWorksUi: 0,
        industrialParkUi: 0,
      },
      iplus: {
        amountUi: 500000,
        category: 'id',
      },
    },
    assert: ({ scores }) => {
      // Rule: no investment total yields zero score.
      expect(scores.iPlus).toBe(0);
    },
  },
];

describe('Layer A: I+ indicator', () => {
  cases.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, () => {
      const fixture = withMutation(testCase.mutation);
      const results = calculateScores(fixture);
      testCase.assert(results);
      assertGlobalInvariants(expect, results.scores, results.totalScore, results.irae);
    });
  });
});
