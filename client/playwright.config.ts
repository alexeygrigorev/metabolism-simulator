import { defineConfig, devices } from '@playwright/test';

export default defineConfig(
  {
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 1, // Retry failed tests once
    reporter: 'html',
    timeout: 30000, // 30 seconds per test
    use: {
      baseURL: 'http://localhost:9999',
      trace: 'retain-on-failure',
      actionTimeout: 10000,
      navigationTimeout: 15000,
      screenshot: 'only-on-failure',
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
    webServer: {
      command: 'npm run dev -- --port 9999 --host',
      url: 'http://localhost:9999',
      reuseExistingServer: false, // Always start fresh server
      timeout: 180000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  }
);
