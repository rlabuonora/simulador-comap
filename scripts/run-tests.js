import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const TESTS_DIR = path.join('scripts', 'tests');
const TEST_FILE = path.join(TESTS_DIR, 'all.test.js');

const run = async () => {
  if (!fs.existsSync(TEST_FILE)) {
    console.error('Test file not found: scripts/tests/all.test.js');
    process.exitCode = 1;
    return;
  }

  const fileUrl = pathToFileURL(TEST_FILE).href;
  const mod = await import(fileUrl);
  if (typeof mod.run !== 'function') {
    console.error('Missing run() in scripts/tests/all.test.js');
    process.exitCode = 1;
    return;
  }
  await mod.run();
};

await run();
