import { defineConfig, devices } from "@playwright/test";

const testPort = 3107;

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: `http://localhost:${testPort}`,
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `npm run dev -- --port ${testPort}`,
    url: `http://localhost:${testPort}`,
    reuseExistingServer: false,
  },
});
