import { computeIraePct, computeIraeYears } from '../../src/utils/scoring.js';
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

  test('IRAE-09: MEDIANA bonus excluded when employees > 50', () => {
    // Rule: MEDIANA bonus only applies up to 50 employees.
    const irae = computeIraePct(1, { firmSize: 'MEDIANA', employees: 51 });
    expect(irae).toBeCloseTo(0.3, 8);
  });

  test('IRAE-10: industrial park eligible activity gets proportional 15% boost', () => {
    // Rule: apply 15% increment proportionally to investment inside the park.
    const irae = computeIraePct(1, {
      firmSize: 'GRAN EMPRESA',
      investmentTotal: 100,
      industrialParkUser: 'si',
      industrialParkActivity: 'actividades-industriales',
      industrialParkInvestment: 50,
    });
    expect(irae).toBeCloseTo(0.3225, 6);
  });

  test('IRAE-11: industrial park other activity gets proportional 5% boost', () => {
    // Rule: apply 5% increment proportionally to investment inside the park.
    const irae = computeIraePct(1, {
      firmSize: 'GRAN EMPRESA',
      investmentTotal: 100,
      industrialParkUser: 'si',
      industrialParkActivity: 'otra',
      industrialParkInvestment: 50,
    });
    expect(irae).toBeCloseTo(0.3075, 6);
  });

  test('IRAE-12: no park user -> no increment applied', () => {
    // Rule: park increment only applies to park users.
    const irae = computeIraePct(1, {
      firmSize: 'GRAN EMPRESA',
      investmentTotal: 100,
      industrialParkUser: 'no',
      industrialParkActivity: 'actividades-industriales',
      industrialParkInvestment: 100,
    });
    expect(irae).toBeCloseTo(0.3, 8);
  });

  test('IRAE-13: park investment is capped at total', () => {
    // Rule: park share cannot exceed total investment.
    const irae = computeIraePct(1, {
      firmSize: 'GRAN EMPRESA',
      investmentTotal: 100,
      industrialParkUser: 'si',
      industrialParkActivity: 'actividades-industriales',
      industrialParkInvestment: 200,
    });
    expect(irae).toBeCloseTo(0.345, 6);
  });
});

describe('Layer A: IRAE years scaling', () => {
  test('IRAE-Y-01: industrial park boost scales years proportionally', () => {
    // Rule: years increase proportionally to park investment share.
    const years = computeIraeYears({
      investmentTotal: 3_000_000,
      weightedScore: 5,
      coreScoreSum: 2,
      firmSize: 'GRAN EMPRESA',
      industrialParkUser: 'si',
      industrialParkActivity: 'actividades-industriales',
      industrialParkInvestment: 1_500_000,
    });
    expect(years).toBe(10);
  });

  test('IRAE-Y-02: no park user -> years unchanged', () => {
    // Rule: years only increase for park users.
    const years = computeIraeYears({
      investmentTotal: 3_000_000,
      weightedScore: 5,
      coreScoreSum: 2,
      firmSize: 'GRAN EMPRESA',
      industrialParkUser: 'no',
      industrialParkActivity: 'actividades-industriales',
      industrialParkInvestment: 1_500_000,
    });
    expect(years).toBe(9);
  });

  test('IRAE-Y-03: I+ >= 2 adds 2 years capped by tramo', () => {
    // Rule: I+ bonus adds 2 years without exceeding max for the tramo.
    const years = computeIraeYears({
      investmentTotal: 3_000_000,
      weightedScore: 5,
      coreScoreSum: 2,
      firmSize: 'GRAN EMPRESA',
      industrialParkUser: 'no',
      industrialParkActivity: 'actividades-industriales',
      industrialParkInvestment: 0,
      iPlusScore: 2,
    });
    expect(years).toBe(11);
  });

  test('IRAE-Y-04: I+ bonus does not exceed tramo max', () => {
    const years = computeIraeYears({
      investmentTotal: 3_000_000,
      weightedScore: 10,
      coreScoreSum: 2,
      firmSize: 'GRAN EMPRESA',
      industrialParkUser: 'no',
      industrialParkActivity: 'actividades-industriales',
      industrialParkInvestment: 0,
      iPlusScore: 2,
    });
    expect(years).toBe(16);
  });

  test('IRAE-Y-05: cap applies before industrial park multiplier', () => {
    const years = computeIraeYears({
      investmentTotal: 3_000_000,
      weightedScore: 10,
      coreScoreSum: 2,
      firmSize: 'GRAN EMPRESA',
      industrialParkUser: 'si',
      industrialParkActivity: 'actividades-industriales',
      industrialParkInvestment: 3_000_000,
      iPlusScore: 2,
    });
    expect(years).toBe(18);
  });
});
