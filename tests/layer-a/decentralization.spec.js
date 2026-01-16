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
