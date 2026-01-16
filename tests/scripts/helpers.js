import fs from 'node:fs';

export const loadJson = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const cleaned = raw.replace(/^\uFEFF/, '');
  return JSON.parse(cleaned);
};

export const assertCase = (actual, expected, epsilon) => {
  if (epsilon != null) {
    expect(actual).toBeGreaterThanOrEqual(expected - epsilon);
    expect(actual).toBeLessThanOrEqual(expected + epsilon);
    return;
  }

  expect(actual).toBe(expected);
};
