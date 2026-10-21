import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/ui",
  use: {
    timezoneId: "America/Chicago",
    baseURL: "http://127.0.0.1:3210",
    launchOptions: {
      executablePath: process.env.CHROME_PATH || undefined,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
  },
  webServer: [
    {
      command: "node tests/ui/fixture-api.cjs",
      url: "http://127.0.0.1:3213",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3210",
      url: "http://127.0.0.1:3210",
      reuseExistingServer: !process.env.CI,
      env: {
        NEXT_PUBLIC_API_BASE_URL: "http://news-api.test/api",
        API_SERVER_URL: "http://127.0.0.1:3213/api",
      },
      timeout: 120000,
    },
  ],
});
