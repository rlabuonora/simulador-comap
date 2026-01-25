import { scoreStrategic } from '../../src/utils/scoring.js';

describe('Layer A: Strategic CIN scoring', () => {
  const compareAcrossMinistries = (inputs) => {
    const ministries = ['mef', 'mgap', 'mintur', 'miem'];
    const expected = scoreStrategic({ evaluatingMinistry: 'mef', ...inputs });
    ministries.forEach((evaluatingMinistry) => {
      const score = scoreStrategic({ evaluatingMinistry, ...inputs });
      expect(score).toBe(expected);
    });
  };

  test('IME threshold mapping for machinery only', () => {
    const scoreLow = scoreStrategic({
      evaluatingMinistry: 'mef',
      machineryUi: 100,
      nationalGoodsUi: 2,
      civilWorksMaterialsUi: 0,
      nationalCivilWorksUi: 0,
      strategicPriorities: 0,
    });
    const scoreMid = scoreStrategic({
      evaluatingMinistry: 'mef',
      machineryUi: 100,
      nationalGoodsUi: 5,
      civilWorksMaterialsUi: 0,
      nationalCivilWorksUi: 0,
      strategicPriorities: 0,
    });
    const scoreHigh = scoreStrategic({
      evaluatingMinistry: 'mef',
      machineryUi: 100,
      nationalGoodsUi: 9,
      civilWorksMaterialsUi: 0,
      nationalCivilWorksUi: 0,
      strategicPriorities: 0,
    });
    const scoreTop = scoreStrategic({
      evaluatingMinistry: 'mef',
      machineryUi: 100,
      nationalGoodsUi: 13,
      civilWorksMaterialsUi: 0,
      nationalCivilWorksUi: 0,
      strategicPriorities: 0,
    });

    expect(scoreLow).toBe(0);
    expect(scoreMid).toBe(5);
    expect(scoreHigh).toBe(7);
    expect(scoreTop).toBe(10);
  });

  test('IMOC threshold mapping for civil works only', () => {
    const scoreLow = scoreStrategic({
      evaluatingMinistry: 'mef',
      machineryUi: 0,
      nationalGoodsUi: 0,
      civilWorksMaterialsUi: 100,
      nationalCivilWorksUi: 15,
      strategicPriorities: 0,
    });
    const scoreMid = scoreStrategic({
      evaluatingMinistry: 'mef',
      machineryUi: 0,
      nationalGoodsUi: 0,
      civilWorksMaterialsUi: 100,
      nationalCivilWorksUi: 20,
      strategicPriorities: 0,
    });
    const scoreHigh = scoreStrategic({
      evaluatingMinistry: 'mef',
      machineryUi: 0,
      nationalGoodsUi: 0,
      civilWorksMaterialsUi: 100,
      nationalCivilWorksUi: 40,
      strategicPriorities: 0,
    });
    const scoreTop = scoreStrategic({
      evaluatingMinistry: 'mef',
      machineryUi: 0,
      nationalGoodsUi: 0,
      civilWorksMaterialsUi: 100,
      nationalCivilWorksUi: 60,
      strategicPriorities: 0,
    });

    expect(scoreLow).toBe(0);
    expect(scoreMid).toBe(5);
    expect(scoreHigh).toBe(7);
    expect(scoreTop).toBe(10);
  });

  test('weighted average when both machinery and civil works present', () => {
    const score = scoreStrategic({
      evaluatingMinistry: 'mef',
      machineryUi: 100,
      nationalGoodsUi: 20,
      civilWorksMaterialsUi: 100,
      nationalCivilWorksUi: 40,
      strategicPriorities: 0,
    });

    expect(score).toBeCloseTo(8.5, 2);
  });

  test('rounds to 2 decimals for mixed weights', () => {
    const score = scoreStrategic({
      evaluatingMinistry: 'mef',
      machineryUi: 100,
      nationalGoodsUi: 9,
      civilWorksMaterialsUi: 333,
      nationalCivilWorksUi: 70,
      strategicPriorities: 0,
    });

    expect(score).toBeCloseTo(5.46, 2);
  });

  test('caps strategic score at 10 when adding base priorities', () => {
    const score = scoreStrategic({
      evaluatingMinistry: 'mef',
      strategicPriorities: 3,
      machineryUi: 100,
      nationalGoodsUi: 13,
      civilWorksMaterialsUi: 100,
      nationalCivilWorksUi: 60,
    });

    expect(score).toBe(10);
  });

  test('CIN yields same results across ministries for IME thresholds', () => {
    compareAcrossMinistries({
      machineryUi: 100,
      nationalGoodsUi: 5,
      civilWorksMaterialsUi: 0,
      nationalCivilWorksUi: 0,
      strategicPriorities: 0,
    });
    compareAcrossMinistries({
      machineryUi: 100,
      nationalGoodsUi: 9,
      civilWorksMaterialsUi: 0,
      nationalCivilWorksUi: 0,
      strategicPriorities: 0,
    });
    compareAcrossMinistries({
      machineryUi: 100,
      nationalGoodsUi: 13,
      civilWorksMaterialsUi: 0,
      nationalCivilWorksUi: 0,
      strategicPriorities: 0,
    });
  });

  test('CIN yields same results across ministries for IMOC thresholds', () => {
    compareAcrossMinistries({
      machineryUi: 0,
      nationalGoodsUi: 0,
      civilWorksMaterialsUi: 100,
      nationalCivilWorksUi: 20,
      strategicPriorities: 0,
    });
    compareAcrossMinistries({
      machineryUi: 0,
      nationalGoodsUi: 0,
      civilWorksMaterialsUi: 100,
      nationalCivilWorksUi: 40,
      strategicPriorities: 0,
    });
    compareAcrossMinistries({
      machineryUi: 0,
      nationalGoodsUi: 0,
      civilWorksMaterialsUi: 100,
      nationalCivilWorksUi: 60,
      strategicPriorities: 0,
    });
  });

  test('CIN yields same results across ministries for mixed weights', () => {
    compareAcrossMinistries({
      machineryUi: 100,
      nationalGoodsUi: 20,
      civilWorksMaterialsUi: 100,
      nationalCivilWorksUi: 40,
      strategicPriorities: 0,
    });
  });
});
