import { test, expect } from '@playwright/test';
import { assertGlobalInvariants, baselineFixture, calculateScores, withMutation } from './fixture.js';

test.describe('Layer A: Global invariants', () => {
  test('baseline scores stay within bounds', () => {
    const results = calculateScores(baselineFixture);
    // Rule: every indicator and aggregate must stay within bounds.
    assertGlobalInvariants(expect, results.scores, results.totalScore, results.irae);
  });

  test('monotonicity: employment increases do not reduce score', () => {
    const baseline = calculateScores(baselineFixture);
    const higher = calculateScores(
      withMutation({
        employment: {
          inc: {
            women: baselineFixture.employment.inc.women + 2,
          },
        },
      })
    );
    // Rule: higher employment driver should not reduce indicator.
    expect(higher.scores.employment).toBeGreaterThanOrEqual(baseline.scores.employment);
    assertGlobalInvariants(expect, higher.scores, higher.totalScore, higher.irae);
  });

  test('monotonicity: export increase does not reduce score', () => {
    const baseline = calculateScores(baselineFixture);
    const higher = calculateScores(
      withMutation({
        exports: {
          minturIncrease: baselineFixture.exports.minturIncrease + 100000,
        },
      })
    );
    // Rule: higher export driver should not reduce indicator.
    expect(higher.scores.exports).toBeGreaterThanOrEqual(baseline.scores.exports);
    assertGlobalInvariants(expect, higher.scores, higher.totalScore, higher.irae);
  });

  test('monotonicity: sustainability amount does not reduce score', () => {
    const baseline = calculateScores(baselineFixture);
    const higher = calculateScores(
      withMutation({
        sustainability: {
          amountUi: baselineFixture.sustainability.amountUi + 100000,
        },
      })
    );
    // Rule: higher sustainability driver should not reduce indicator.
    expect(higher.scores.sustainability).toBeGreaterThanOrEqual(baseline.scores.sustainability);
    assertGlobalInvariants(expect, higher.scores, higher.totalScore, higher.irae);
  });

  test('divide-by-zero safety with zero investment', () => {
    const results = calculateScores(
      withMutation({
        project: {
          machineryUi: 0,
          installationsUi: 0,
          civilWorksUi: 0,
          industrialParkUi: 0,
        },
      })
    );
    // Rule: no NaN/Infinity when investment is zero.
    assertGlobalInvariants(expect, results.scores, results.totalScore, results.irae);
  });
});
