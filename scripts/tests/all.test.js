import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreSustainability,
} from '../../src/utils/scoring.js';
import { loadJson, runCases } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const suites = [
  { title: 'Empleo', file: 'employment.json', handler: scoreEmployment },
  { title: 'Descentralizacion', file: 'decentralization.json', handler: scoreDecentralization },
  { title: 'Sostenibilidad', file: 'sustainability.json', handler: scoreSustainability },
  { title: 'I+', file: 'iplus.json', handler: scoreIPlus },
  { title: 'Exportaciones', file: 'exports.json', handler: scoreExports },
];

export const run = () => {
  suites.forEach((suite) => {
    const cases = loadJson(path.join(__dirname, suite.file));
    runCases(suite.title, cases, suite.handler);
  });
};
