import { scoreStrategic } from '../../src/utils/scoring.js';

describe('Layer A: MIEM strategic indicators', () => {
  test('single indicator reaches cap at 50% investment share', () => {
    const score = scoreStrategic({
      evaluatingMinistry: 'miem',
      investment: 100,
      miemEnergyFlag: 'si',
      miemEnergyInvestmentUi: 50,
    });
    expect(score).toBe(10);
  });

  test('indicator scales linearly below 50%', () => {
    const score = scoreStrategic({
      evaluatingMinistry: 'miem',
      investment: 100,
      miemWasteFlag: 'si',
      miemWasteInvestmentUi: 25,
    });
    expect(score).toBeCloseTo(5, 2);
  });

  test('sum of multiple indicators caps at 10', () => {
    const score = scoreStrategic({
      evaluatingMinistry: 'miem',
      investment: 200,
      miemEnergyFlag: 'si',
      miemEnergyInvestmentUi: 100,
      miemHydrogenFlag: 'si',
      miemHydrogenInvestmentUi: 100,
    });
    expect(score).toBe(10);
  });

  test('non-MIEM does not use MIEM indicator sum', () => {
    const score = scoreStrategic({
      evaluatingMinistry: 'mef',
      investment: 100,
      miemEnergyFlag: 'si',
      miemEnergyInvestmentUi: 50,
      strategicPriorities: 0,
    });
    expect(score).toBe(0);
  });

  test('non-MGAP ignores MGAP indicators', () => {
    const score = scoreStrategic({
      evaluatingMinistry: 'mef',
      investment: 100,
      mgapRiegoFlag: 'si',
      mgapRiegoInvestmentUi: 50,
      mgapPescaFlag: 'si',
      mgapPescaInvestmentUi: 50,
      mgapNaturalFieldFlag: 'si',
    });
    expect(score).toBe(0);
  });
});
