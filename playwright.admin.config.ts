import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/admin-ui', workers: 1,
  use: { baseURL: 'http://127.0.0.1:3216', launchOptions: { executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] } },
  webServer: [
    { command: '../.venv/bin/python tests/admin-e2e-backend.py', url: 'http://127.0.0.1:3215/health/', reuseExistingServer: false, timeout: 120000 },
    { command: 'npm run dev -- --hostname 127.0.0.1 --port 3216', url: 'http://127.0.0.1:3216/admin/login', reuseExistingServer: false, timeout: 120000,
      env: { NEWS_TEST_INSTANCE: '1', API_SERVER_URL: 'http://127.0.0.1:3215/api', NEXT_PUBLIC_API_BASE_URL: 'http://127.0.0.1:3215/api' } },
  ],
});
