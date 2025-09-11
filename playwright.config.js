const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
const { PROXY_SERVER, PROXY_USERNAME, PROXY_PASSWORD } = process.env;
const envProxy = PROXY_SERVER
  ? { server: PROXY_SERVER, username: PROXY_USERNAME, password: PROXY_PASSWORD }
  : undefined;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 90000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: 'https://service.emedpractice.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
    hasTouch: false,
    deviceScaleFactor: 1,
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Upgrade-Insecure-Requests': '1'
    },
    // Route traffic via proxy if provided (set PROXY_SERVER to a US proxy)
    proxy: envProxy,
    launchOptions: {
      headless: false,
      slowMo: 300,
      channel: 'chrome',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=DnsOverHttps,UseDnsHttps,AsyncDns',
        '--proxy-bypass-list=*',
        '--no-first-run',
        '--no-default-browser-check',
        '--no-first-run',
        '--disable-gpu'
      ]
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
    }
  ],
}); 