import { defineConfig, devices } from '@playwright/test';

export default defineConfig(
  {
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    reporter: 'html',
    timeout: 30000, // 30 seconds per test
    use: {
      baseURL: 'http://localhost:5173',
      trace: 'on-first-retry',
      actionTimeout: 10000,
      navigationTimeout: 10000,
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 180000,
    },
  }
);
