import { defineConfig, devices } from '@playwright/test';
import { appDevUrl } from './src/lib/dev-port';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: appDevUrl,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: appDevUrl,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
