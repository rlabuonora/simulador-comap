import { test, expect } from '@playwright/test';
import { computeIraePct } from '../../../src/utils/scoring.js';
import { baselineFixture } from './fixture.js';

const cases = [
  {
    id: 'IRAE-01',
    name: 'score < 1 -> exemption follows formula',
    score: 0,
    expected: 0.2222222222,
  },
  {
    id: 'IRAE-02',
    name: 'score = 1 -> exemption = 30%',
    score: 1,
    expected: 0.3,
  },
  {
    id: 'IRAE-03',
    name: 'score = 5.5 -> linear scaling',
    score: 5.5,
    expected: 0.65,
  },
  {
    id: 'IRAE-04',
    name: 'score = 10 -> exemption = 100%',
    score: 10,
    expected: 1,
  },
];

test.describe('Layer A: IRAE scaling', () => {
  test.beforeAll(() => {
    // Ensures shared fixture is loaded in this suite.
    expect(baselineFixture.company).toBeTruthy();
  });

  cases.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, () => {
      // Rule: apply the IRAE scaling formula to the aggregate score.
      const irae = computeIraePct(testCase.score);
      expect(irae).toBeGreaterThanOrEqual(0);
      expect(irae).toBeLessThanOrEqual(1);
      expect(irae).toBeCloseTo(testCase.expected, 8);
    });
  });
});
