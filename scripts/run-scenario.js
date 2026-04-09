import fs from 'node:fs/promises';
import path from 'node:path';
import { computeScenario } from '../src/utils/simulator.js';

const [, , inputArg, outputArg] = process.argv;
const defaultOutputPath = path.resolve(process.cwd(), 'outputs', 'scenario-result.json');

if (!inputArg) {
  console.error('Usage: node scripts/run-scenario.js <input.json> [output.json]');
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputArg);
const outputPath = outputArg ? path.resolve(process.cwd(), outputArg) : defaultOutputPath;

const rawInput = await fs.readFile(inputPath, 'utf8');
const scenario = JSON.parse(rawInput);
const result = computeScenario(scenario);
const serialized = `${JSON.stringify(result, null, 2)}\n`;

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, serialized, 'utf8');
process.stdout.write(`Scenario result written to ${outputPath}\n`);
