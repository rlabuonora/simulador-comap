import { computeIraePct } from '../../src/utils/scoring.js';
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

describe('Layer A: IRAE scaling', () => {
  beforeAll(() => {
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

  test('IRAE-05: override window A -> 100% exemption', () => {
    // Rule: I+ and employment thresholds with 2027 window yield full exemption.
    const irae = computeIraePct(4, {
      scores: { iPlus: 4, employment: 5 },
      investmentTotal: 200_000_000,
      filedDate: '2027-12-31',
    });
    expect(irae).toBe(1);
  });

  test('IRAE-06: override window B -> 100% exemption', () => {
    // Rule: I+ and employment thresholds with 2028 window yield full exemption.
    const irae = computeIraePct(4, {
      scores: { iPlus: 6, employment: 7 },
      investmentTotal: 300_000_000,
      filedDate: '2028-12-31',
    });
    expect(irae).toBe(1);
  });

  test('IRAE-07: SME bonus applies for micro/pequena', () => {
    // Rule: SME bonus boosts the base rate for micro/pequena firms.
    const irae = computeIraePct(1, { firmSize: 'MICRO' });
    expect(irae).toBeCloseTo(0.45, 8);
  });

  test('IRAE-08: SME bonus applies for mediana', () => {
    // Rule: MEDIANA bonus is lower than micro/pequena.
    const irae = computeIraePct(1, { firmSize: 'MEDIANA' });
    expect(irae).toBeCloseTo(0.4, 8);
  });
});
