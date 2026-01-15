import assert from 'node:assert/strict';
import fs from 'node:fs';

export const approxEqual = (actual, expected, epsilon = 1e-3) => {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `Expected ${expected} +/- ${epsilon}, got ${actual}`
  );
};

export const loadJson = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
};

export const runCases = (title, cases, handler) => {
  cases.forEach((test) => {
    try {
      const score = handler(test.input);
      approxEqual(score, test.expected, test.epsilon);
      console.log(`✓ ${title}: ${test.name}`);
    } catch (error) {
      console.error(`✗ ${title}: ${test.name}`);
      console.error(error.message);
      process.exitCode = 1;
    }
  });
};
