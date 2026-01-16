import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreSustainability,
} from '../../src/utils/scoring.js';
import { assertCase, loadJson } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const suites = [
  { title: 'Empleo', file: 'employment.json', handler: scoreEmployment },
  { title: 'Descentralizacion', file: 'decentralization.json', handler: scoreDecentralization },
  { title: 'Sostenibilidad', file: 'sustainability.json', handler: scoreSustainability },
  { title: 'I+', file: 'iplus.json', handler: scoreIPlus },
  { title: 'Exportaciones', file: 'exports.json', handler: scoreExports },
];

const getThrowExpectation = (testCase) => testCase.expectedThrows ?? testCase.throws;

const applyThrowExpectation = (handler, input, expectedThrow) => {
  if (expectedThrow instanceof RegExp) {
    expect(() => handler(input)).toThrow(expectedThrow);
    return;
  }

  if (typeof expectedThrow === 'string') {
    expect(() => handler(input)).toThrow(expectedThrow);
    return;
  }

  expect(() => handler(input)).toThrow();
};

describe('Scripts fixtures', () => {
  suites.forEach((suite) => {
    describe(suite.title, () => {
      const cases = loadJson(path.join(__dirname, suite.file));

      cases.forEach((testCase) => {
        test(testCase.name, () => {
          const expectedThrow = getThrowExpectation(testCase);
          if (expectedThrow) {
            applyThrowExpectation(suite.handler, testCase.input, expectedThrow);
            return;
          }

          const score = suite.handler(testCase.input);
          assertCase(score, testCase.expected, testCase.epsilon);
        });
      });
    });
  });
});
