import { defineConfig, devices } from "@playwright/test";

const testPort = 3107;
const reviewBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = reviewBaseUrl ?? `http://localhost:${testPort}`;

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
  },
  webServer: reviewBaseUrl
    ? undefined
    : {
        command: `npm run dev -- --port ${testPort}`,
        url: `http://localhost:${testPort}`,
        reuseExistingServer: false,
      },
});
