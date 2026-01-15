import assert from 'node:assert/strict';
import fs from 'node:fs';

export const approxEqual = (actual, expected, epsilon = 1e-3) => {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `Expected ${expected} +/- ${epsilon}, got ${actual}`
  );
};

export const assertCase = (result, expected, epsilon) => {
  if (epsilon != null) {
    approxEqual(result, expected, epsilon);
    return;
  }

  assert.strictEqual(result, expected, `Expected ${expected}, got ${result}`);
};

export const loadJson = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
};

export const runCases = (title, cases, handler) => {
  cases.forEach((test) => {
    try {
      if (test.expectedThrows || test.throws) {
        let threw = false;
        try {
          handler(test.input);
        } catch (error) {
          threw = true;
          if (test.expectedThrows instanceof RegExp) {
            assert.ok(test.expectedThrows.test(error.message), error.message);
          } else if (typeof test.expectedThrows === 'string') {
            assert.ok(error.message.includes(test.expectedThrows), error.message);
          } else if (test.throws instanceof RegExp) {
            assert.ok(test.throws.test(error.message), error.message);
          } else if (typeof test.throws === 'string') {
            assert.ok(error.message.includes(test.throws), error.message);
          }
        }

        assert.ok(threw, 'Expected handler to throw');
        console.log(`バ" ${title}: ${test.name}`);
        return;
      }

      const score = handler(test.input);
      assertCase(score, test.expected, test.epsilon);
      console.log(`バ" ${title}: ${test.name}`);
    } catch (error) {
      console.error(`バ- ${title}: ${test.name}`);
      console.error(error.message);
      process.exitCode = 1;
    }
  });
};
