import { test, expect } from '@playwright/test';
import {
  assertGlobalInvariants,
  baselineFixture,
  calculateScores,
  withMutation,
} from './fixture.js';

const cubeRoot = (value) => Math.cbrt(value);

const cases = [
  {
    id: 'EMP-01',
    name: 'no growth -> employment score = 0',
    mutation: {
      employment: {
        inc: {
          noVulnerable: 0,
          women: 0,
          youth: 0,
          disability: 0,
          dinali: 0,
          tus: 0,
        },
      },
    },
    assert: ({ scores }) => {
      // Rule: delta_total <= 0 yields score 0 and no bonus.
      expect(scores.employment).toBe(0);
    },
  },
  {
    id: 'EMP-02',
    name: 'growth without vulnerable groups',
    mutation: {
      employment: {
        inc: {
          noVulnerable: 4,
          women: 0,
          youth: 0,
          disability: 0,
          dinali: 0,
          tus: 0,
        },
      },
    },
    assert: ({ scores, totalInvestment }) => {
      // Rule: bonus applies when delta_total > 0; non-vulnerable increases are bonus-eligible.
      const deltaTotal = 4;
      const bonus = Math.min(deltaTotal * 0.25, 1);
      const expected = (deltaTotal + bonus) / cubeRoot(totalInvestment);
      expect(scores.employment).toBeCloseTo(expected, 8);
    },
  },
  {
    id: 'EMP-03',
    name: 'vulnerable groups without net growth -> bonus = 0',
    mutation: {
      employment: {
        base: {
          women: 2,
          youth: 2,
          disability: 1,
          dinali: 1,
          tus: 1,
        },
        inc: {
          noVulnerable: 0,
          women: 0,
          youth: 0,
          disability: 0,
          dinali: 0,
          tus: 0,
        },
      },
    },
    assert: ({ scores }) => {
      // Rule: delta_total <= 0 blocks bonus and score.
      expect(scores.employment).toBe(0);
    },
  },
  {
    id: 'EMP-04',
    name: 'many vulnerable groups -> bonus capped at 1',
    mutation: {
      employment: {
        inc: {
          noVulnerable: 0,
          women: 2,
          youth: 2,
          disability: 2,
          dinali: 2,
          tus: 2,
        },
      },
    },
    assert: ({ scores, totalInvestment }) => {
      // Rule: total bonus is capped at 1.
      const deltaTotal = 10;
      const bonus = 1;
      const expected = (deltaTotal + bonus) / cubeRoot(totalInvestment);
      expect(scores.employment).toBeCloseTo(expected, 8);
    },
  },
  {
    id: 'INV-01',
    name: 'very small investment -> score increases but <= 10',
    mutation: {
      project: {
        machineryUi: 1,
        installationsUi: 0,
        civilWorksUi: 0,
        industrialParkUi: 0,
      },
    },
    assert: ({ scores }) => {
      // Rule: smaller investment should not decrease employment score.
      const baseline = calculateScores(baselineFixture).scores.employment;
      expect(scores.employment).toBeGreaterThan(baseline);
      expect(scores.employment).toBeLessThanOrEqual(10);
    },
  },
  {
    id: 'INV-02',
    name: 'very large investment -> score approaches 0 but >= 0',
    mutation: {
      project: {
        machineryUi: 1_000_000_000_000,
        installationsUi: 0,
        civilWorksUi: 0,
        industrialParkUi: 0,
      },
    },
    assert: ({ scores }) => {
      // Rule: large investment reduces indicator but keeps it non-negative.
      const baseline = calculateScores(baselineFixture).scores.employment;
      expect(scores.employment).toBeGreaterThanOrEqual(0);
      expect(scores.employment).toBeLessThan(baseline);
    },
  },
];

test.describe('Layer A: Employment indicator', () => {
  cases.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, () => {
      const fixture = withMutation(testCase.mutation);
      const results = calculateScores(fixture);
      testCase.assert(results);
      assertGlobalInvariants(expect, results.scores, results.totalScore, results.irae);
    });
  });
});
