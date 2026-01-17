import { scoreStrategic } from '../../src/utils/scoring.js';

describe('Layer A: Strategic VAN scoring', () => {
  test('invalid investment total yields 0', () => {
    const score = scoreStrategic({
      investment: 0,
      mineralProcessingLevel: 'minima',
      mineralEligibleInvestmentUi: 100,
    });
    expect(score).toBe(0);
  });

  test('invalid VAN range yields 0', () => {
    const score = scoreStrategic({
      investment: 100,
      mineralProcessingLevel: 'minima',
      mineralEligibleInvestmentUi: 150,
    });
    expect(score).toBe(0);
  });

  test('minima level caps at 3 when share >= 50%', () => {
    const score = scoreStrategic({
      investment: 100,
      mineralProcessingLevel: 'minima',
      mineralEligibleInvestmentUi: 60,
    });
    expect(score).toBe(3);
  });

  test('intermedia level scales linearly', () => {
    const score = scoreStrategic({
      investment: 200,
      mineralProcessingLevel: 'intermedia',
      mineralEligibleInvestmentUi: 40,
    });
    expect(score).toBeCloseTo(2, 2);
  });

  test('maxima level caps at 10 when share >= 50%', () => {
    const score = scoreStrategic({
      investment: 100,
      mineralProcessingLevel: 'maxima',
      mineralEligibleInvestmentUi: 50,
    });
    expect(score).toBe(10);
  });

  test('invalid level yields 0', () => {
    const score = scoreStrategic({
      investment: 100,
      mineralProcessingLevel: 'unknown',
      mineralEligibleInvestmentUi: 20,
    });
    expect(score).toBe(0);
  });

  test('rounding to 2 decimals on output', () => {
    const score = scoreStrategic({
      investment: 123,
      mineralProcessingLevel: 'intermedia',
      mineralEligibleInvestmentUi: 17,
    });
    expect(score).toBeCloseTo(1.38, 2);
  });
});
