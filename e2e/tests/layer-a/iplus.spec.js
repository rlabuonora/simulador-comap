import { test, expect } from '@playwright/test';
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
];

test.describe('Layer A: I+ indicator', () => {
  cases.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, () => {
      const fixture = withMutation(testCase.mutation);
      const results = calculateScores(fixture);
      testCase.assert(results);
      assertGlobalInvariants(expect, results.scores, results.totalScore, results.irae);
    });
  });
});
