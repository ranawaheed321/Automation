# Playwright Test Automation Project

This project is set up with Playwright for end-to-end testing of web applications.

## Features

- 🚀 **Multi-browser testing** (Chrome, Firefox, Safari)
- 📱 **Mobile testing** (iOS Safari, Android Chrome)
- 📊 **Multiple reporters** (HTML, JSON, JUnit)
- 🎯 **Page Object Model** support
- 📸 **Screenshots and videos** on test failures
- 🔍 **Trace viewer** for debugging
- ⚡ **Parallel test execution**

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npm run install-browsers
   ```

## Project Structure

```
├── tests/
│   ├── example.spec.ts          # Example test file
│   ├── pages/
│   │   └── BasePage.ts          # Base page object model
│   └── utils/
│       └── test-helpers.ts      # Utility functions
├── playwright.config.ts         # Playwright configuration
├── package.json                 # Project dependencies
└── README.md                   # This file
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests in headless mode |
| `npm run test:headed` | Run tests with browser visible |
| `npm run test:ui` | Run tests with Playwright UI mode |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:report` | Show HTML test report |
| `npm run codegen` | Generate tests using Playwright Inspector |
| `npm run test:nord-us` | Run tests under NordVPN (auto connect US) |
| `npm run check-ip:nord` | Check outbound IP via VPN using Playwright |

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Your App/);
});
```

### Using Page Object Model

```typescript
import { test } from '@playwright/test';
import { BasePage } from './pages/BasePage';

test('should use page object model', async ({ page }) => {
  const basePage = new BasePage(page);
  await basePage.goto('/');
  await basePage.waitForPageLoad();
});
```

### Using Test Helpers

```typescript
import { test } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test('should use test helpers', async ({ page }) => {
  await page.goto('/');
  await TestHelpers.assertElementVisible(page, '#header');
  await TestHelpers.assertTextPresent(page, 'Welcome');
});
```

## Configuration

The `playwright.config.ts` file contains:

- **Browser configurations** for desktop and mobile
- **Test retry settings** (2 retries on CI)
- **Parallel execution** settings
- **Reporters** configuration
- **Screenshot and video** capture on failures
- **Trace collection** for debugging

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific browser
```bash
npx playwright test --project=chromium
```

### Run specific test file
```bash
npx playwright test example.spec.ts
```

### Run tests through NordVPN

You can either connect NordVPN manually or let the helper script connect for you.

Manual connect, then run Playwright:
```bash
nordvpn login            # first time only
nordvpn connect --country US
npx playwright test tests/visit.spec.js --headed
# when done
nordvpn disconnect
```

Auto connect/disconnect using the helper:
```bash
 ./scripts/nordvpn-run.sh --country US -- npx playwright test tests/visit.spec.js --config=playwright.config.js --project=chromium --headed
./scripts/nordvpn-run.sh --country US -- npx playwright test tests/visit.spec.js --headed
```

Use the npm script (defaults to US and passes args through):
```bash
npm run test:nord-us -- tests/visit.spec.js
```

Verify VPN routing in Playwright:
```bash
npm run check-ip:nord
```

Tip: If a site blocks bundled Chromium even with VPN, use system Chrome or a persistent profile:
```bash
npx playwright test tests/visit-persistent.spec.js --project=chromium --headed
```

### Run tests with specific tags
```bash
npx playwright test --grep "smoke"
```

## Debugging

### UI Mode
```bash
npm run test:ui
```

### Debug Mode
```bash
npm run test:debug
```

### Code Generation
```bash
npm run codegen
```

## Reports

After running tests, you can view the HTML report:
```bash
npm run test:report
```

## CI/CD Integration

The configuration is optimized for CI environments:
- Tests run in parallel on CI
- Retries are enabled only on CI
- Workers are limited to 1 on CI

## Best Practices

1. **Use Page Object Model** for better maintainability
2. **Write descriptive test names** that explain the scenario
3. **Use data-testid attributes** for reliable element selection
4. **Keep tests independent** - each test should be able to run alone
5. **Use appropriate waits** instead of hard delays
6. **Group related tests** using `test.describe()`

## Troubleshooting

### Common Issues

1. **Browsers not installed:**
   ```bash
   npm run install-browsers
   ```

2. **Tests failing on CI:**
   - Check if all dependencies are installed
   - Verify the application is running on the expected URL
   - Review CI logs for specific error messages

3. **Slow test execution:**
   - Enable parallel execution in config
   - Use appropriate timeouts
   - Optimize selectors for better performance

## Contributing

1. Follow the existing code structure
2. Add appropriate test descriptions
3. Use the provided utility functions
4. Update documentation when adding new features

## License

MIT License 