import { assertGlobalInvariants, calculateScores, withMutation } from './fixture.js';

const cases = [
  {
    id: 'DEC-01',
    name: 'Montevideo only -> score = 0',
    mutation: {
      decentralization: {
        rocha: 0,
        montevideo: 4000000,
      },
    },
    assert: ({ scores }) => {
      // Rule: Montevideo has weight 0, so indicator should be 0.
      expect(scores.decentralization).toBe(0);
    },
  },
  {
    id: 'DEC-02',
    name: 'Rocha + Montevideo split -> weighted score',
    mutation: {
      decentralization: {
        rocha: 2000000,
        montevideo: 2000000,
      },
    },
    assert: ({ scores }) => {
      // Rule: weighted average of department scores.
      expect(scores.decentralization).toBeCloseTo(3, 6);
    },
  },
  {
    id: 'DEC-03',
    name: 'Artigas only -> score = 10',
    mutation: {
      decentralization: { artigas: 4000000 },
    },
    assert: ({ scores }) => {
      expect(scores.decentralization).toBe(10);
    },
  },
  {
    id: 'DEC-04',
    name: 'Tacuarembó + Rocha weighted',
    mutation: {
      decentralization: {
        tacuarembo: 1000000,
        rocha: 3000000,
      },
    },
    assert: ({ scores }) => {
      // (1/4)*8 + (3/4)*6 = 6.5
      expect(scores.decentralization).toBeCloseTo(6.5, 5);
    },
  },
  {
    id: 'DEC-05',
    name: 'no allocations -> score = 0',
    mutation: {
      decentralization: {
        rocha: 0,
      },
    },
    assert: ({ scores }) => {
      expect(scores.decentralization).toBe(0);
    },
  },
  {
    id: 'DEC-06',
    name: 'partial allocation uses total investment as denominator',
    mutation: {
      project: {
        machineryUi: 3000000,
        installationsUi: 0,
        civilWorksUi: 1000000,
      },
      decentralization: {
        rocha: 1000000,
      },
    },
    assert: ({ scores }) => {
      // 1M / 4M * 6 = 1.5
      expect(scores.decentralization).toBeCloseTo(1.5, 5);
    },
  },
  {
    id: 'DEC-07',
    name: 'unknown department yields score 0',
    mutation: {
      decentralization: {
        rocha: 0,
        unknownDept: 4000000,
      },
    },
    assert: ({ scores }) => {
      expect(scores.decentralization).toBe(0);
    },
  },
  {
    id: 'DEC-08',
    name: 'negative allocation ignored',
    mutation: {
      project: {
        machineryUi: 0,
        installationsUi: 0,
        civilWorksUi: 0,
        industrialParkUi: 0,
      },
      decentralization: {
        rocha: -100000,
        tacuarembo: 1000000,
      },
    },
    assert: ({ scores }) => {
      expect(scores.decentralization).toBeCloseTo(8, 5);
    },
  },
];

describe('Layer A: Decentralization indicator', () => {
  cases.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, () => {
      const fixture = withMutation(testCase.mutation);
      const results = calculateScores(fixture);
      testCase.assert(results);
      assertGlobalInvariants(expect, results.scores, results.totalScore, results.irae);
    });
  });
});
