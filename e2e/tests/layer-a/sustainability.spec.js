import { test, expect } from '@playwright/test';
import { assertGlobalInvariants, calculateScores, withMutation } from './fixture.js';

const cases = [
  {
    id: 'SUS-01',
    name: 'zero investment -> score = 0',
    mutation: {
      sustainability: {
        amountUi: 0,
        certification: 'none',
      },
    },
    assert: ({ scores }) => {
      // Rule: zero sustainability amount yields score 0.
      expect(scores.sustainability).toBe(0);
    },
  },
  {
    id: 'SUS-02',
    name: 'very large amount -> score = 10',
    mutation: {
      sustainability: {
        amountUi: 1_000_000_000,
        certification: 'none',
      },
    },
    assert: ({ scores }) => {
      // Rule: extreme amount must clamp at 10.
      expect(scores.sustainability).toBe(10);
    },
  },
];

test.describe('Layer A: Sustainability indicator', () => {
  cases.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, () => {
      const fixture = withMutation(testCase.mutation);
      const results = calculateScores(fixture);
      testCase.assert(results);
      assertGlobalInvariants(expect, results.scores, results.totalScore, results.irae);
    });
  });
});
