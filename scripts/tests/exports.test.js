import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreExports } from '../../src/utils/scoring.js';
import { loadJson, runCases } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cases = loadJson(path.join(__dirname, 'exports.json'));

export const run = () => {
  runCases('Exportaciones', cases, scoreExports);
};
