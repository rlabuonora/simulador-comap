import { assertGlobalInvariants, calculateScores, withMutation } from './fixture.js';

const cases = [
  {
    id: 'EMP-01',
    name: 'total incremental = 0 -> employment score = 0',
    mutation: {
      employment: {
        inc: {
          total: 0,
          women: 0,
          youth: 0,
          disability: 0,
          others: 0,
        },
      },
    },
    assert: ({ scores }) => {
      // Rule: total incremental <= 0 yields score 0.
      expect(scores.employment).toBe(0);
    },
  },
  {
    id: 'EMP-02',
    name: 'growth without protected groups',
    mutation: {
      employment: {
        inc: {
          total: 4,
          women: 0,
          youth: 0,
          disability: 0,
          others: 0,
        },
      },
    },
    assert: ({ scores }) => {
      // Rule: score = total incremental + 0.25 * protected incrementals.
      const expected = 4;
      expect(scores.employment).toBeCloseTo(expected, 8);
    },
  },
  {
    id: 'EMP-03',
    name: 'protected groups without total increment -> score = 0',
    mutation: {
      employment: {
        base: {
          women: 2,
          youth: 2,
          disability: 1,
          others: 1,
        },
        inc: {
          total: 0,
          women: 1,
          youth: 1,
          disability: 1,
          others: 1,
        },
      },
    },
    assert: ({ scores }) => {
      // Rule: total incremental <= 0 blocks score.
      expect(scores.employment).toBe(0);
    },
  },
  {
    id: 'EMP-04',
    name: 'protected groups add 0.25 each to the score',
    mutation: {
      employment: {
        inc: {
          total: 10,
          women: 2,
          youth: 2,
          disability: 2,
          others: 2,
        },
      },
    },
    assert: ({ scores }) => {
      // Rule: total incremental + 0.25 * protected incrementals, clamped to 10.
      const expected = 10;
      expect(scores.employment).toBe(expected);
    },
  },
];

describe('Layer A: Employment indicator', () => {
  cases.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, () => {
      const fixture = withMutation(testCase.mutation);
      const results = calculateScores(fixture);
      testCase.assert(results);
      assertGlobalInvariants(expect, results.scores, results.totalScore, results.irae);
    });
  });
});
