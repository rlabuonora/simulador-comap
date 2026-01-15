import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreSustainability } from '../../src/utils/scoring.js';
import { loadJson, runCases } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cases = loadJson(path.join(__dirname, 'sustainability.json'));

export const run = () => {
  runCases('Sostenibilidad', cases, scoreSustainability);
};
