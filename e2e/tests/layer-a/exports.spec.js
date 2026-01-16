import { test, expect } from '@playwright/test';
import { assertGlobalInvariants, calculateScores, withMutation } from './fixture.js';

const cases = [
  {
    id: 'EXP-01',
    name: 'zero increase -> export score = 0',
    mutation: {
      exports: {
        minturIncrease: 0,
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
        minturIncrease: 1,
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
        minturIncrease: 1_000_000_000,
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
        minturInitial: 0,
      },
    },
    assert: ({ scores }) => {
      // Rule: baseline zero should not introduce NaN or Infinity.
      expect(Number.isFinite(scores.exports)).toBe(true);
      expect(scores.exports).toBeGreaterThanOrEqual(0);
    },
  },
];

test.describe('Layer A: Exports indicator', () => {
  cases.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, () => {
      const fixture = withMutation(testCase.mutation);
      const results = calculateScores(fixture);
      testCase.assert(results);
      assertGlobalInvariants(expect, results.scores, results.totalScore, results.irae);
    });
  });
});
