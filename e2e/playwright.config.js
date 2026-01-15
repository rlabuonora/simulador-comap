import { defineConfig } from '@playwright/test';

const proxyServer =
  process.env.PLAYWRIGHT_PROXY_SERVER || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const proxyBypass =
  process.env.PLAYWRIGHT_PROXY_BYPASS || process.env.NO_PROXY || process.env.no_proxy || '';
const disableProxy = process.env.PLAYWRIGHT_DISABLE_PROXY === '1';
const proxyAutoDetect = process.env.PLAYWRIGHT_PROXY_AUTO_DETECT === '1';
const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL || '';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: 'https://simulador-comap.netlify.app/',
    trace: 'retain-on-failure',
    channel: browserChannel || undefined,
    proxy: proxyServer && !disableProxy
      ? {
          server: proxyServer,
          bypass: proxyBypass,
        }
      : undefined,
    launchOptions: proxyAutoDetect ? { args: ['--proxy-auto-detect'] } : undefined,
  },
});
