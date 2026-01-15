import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const TESTS_DIR = path.join('scripts', 'tests');
const TEST_SUFFIX = '.test.js';

const run = async () => {
  const entries = fs.readdirSync(TESTS_DIR).filter((name) => name.endsWith(TEST_SUFFIX));
  if (!entries.length) {
    console.error('No test files found.');
    process.exitCode = 1;
    return;
  }

  for (const entry of entries) {
    const fileUrl = pathToFileURL(path.join(TESTS_DIR, entry)).href;
    // Each test file should export an async run() function.
    const mod = await import(fileUrl);
    if (typeof mod.run !== 'function') {
      console.error(`Missing run() in ${entry}`);
      process.exitCode = 1;
      continue;
    }
    await mod.run();
  }
};

await run();
