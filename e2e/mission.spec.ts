import { expect, test, type Page } from "@playwright/test";

const captureBrowserErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("keeps the initial state fresh and completes the English keyboard mission", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByText("Fix real frontend bugs. Every passing browser check damages the boss.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Mission" })).toBeVisible();
  await expect(page.getByText("Boss HP 100 / 100")).toBeVisible();
  await expect(page.getByText("Objectives 0 / 3")).toBeVisible();
  await expect(page.getByText("Fixture Broken")).toBeVisible();
  await expect(page.getByTestId("boss-hp")).toHaveCount(0);

  await page.getByRole("button", { name: "Start Mission" }).click();
  await expect(page.getByRole("heading", { name: "Keyboard Trap Boss" })).toBeFocused();
  await page.getByRole("button", { name: "Enter broken preview" }).click();

  await expect(page.getByText("Boss HP 100 / 100")).toBeVisible();
  await expect(page.getByText("Objectives 0 / 3")).toBeVisible();
  await expect(page.getByText("Fixture Broken")).toBeVisible();
  await expect(page.getByText("Broken Fixture", { exact: true })).toBeVisible();
  await expect(page.getByText("Expected Behavior")).toBeVisible();
  await expect(page.getByText("Current Failure")).toBeVisible();
  await expect(page.getByText("Pending", { exact: true })).toHaveCount(3);
  await expect(page.getByText("Demo Coach")).toHaveCount(0);

  await page.getByRole("button", { name: "Open safeguards" }).click();
  const brokenDialog = page.getByTestId("mission-dialog");
  await expect(brokenDialog).toBeVisible();
  await expect(brokenDialog).not.toHaveAttribute("role", "dialog");
  await expect(page.getByRole("button", { name: "Open safeguards" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Save safeguards" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Apply guided repair" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(brokenDialog).toBeVisible();

  await page.getByRole("button", { name: "Apply guided repair" }).click();
  const repairedDialog = page.getByRole("dialog", { name: "Confirm safeguard changes" });
  await expect(repairedDialog).toBeVisible();
  await expect(page.getByText("Fixture Repaired")).toBeVisible();
  await expect(page.getByTestId("boss-hp")).toHaveText("100");

  await page.getByRole("button", { name: "Run browser checks" }).click();
  await expect(page.getByTestId("boss-hp")).toHaveText("0");
  await expect(page.getByText("Victory — all browser checks passed")).toBeVisible();
  await expect(page.getByText("Passed", { exact: true })).toHaveCount(6);

  await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Save safeguards" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(repairedDialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Open safeguards" })).toBeFocused();

  await page.getByRole("button", { name: "View learning debrief" }).click();
  await expect(page.getByRole("heading", { name: "Learning debrief" })).toBeFocused();
  await page.getByRole("button", { name: "Replay mission" }).click();
  await expect(page.getByRole("button", { name: "Start Mission" })).toBeVisible();
  await expect(page.getByText("Demo Coach")).toHaveCount(0);
  expect(browserErrors).toEqual([]);
});

test("switches to Korean, persists the choice, and remains usable on mobile", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "한국어" }).click();
  await expect(page.getByText("실제 프론트엔드 버그를 고치세요. 통과한 브라우저 검사 하나마다 보스가 피해를 입습니다.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "미션 시작" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await page.getByRole("button", { name: "미션 시작" }).click();
  await page.getByRole("button", { name: "고장 난 화면으로 이동" }).click();
  await expect(page.getByText("고장 난 픽스처", { exact: true })).toBeVisible();
  await expect(page.getByText("보스 HP 100 / 100")).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test.describe("Korean browser default", () => {
  test.use({ locale: "ko-KR" });

  test("defaults to Korean when navigator language starts with ko", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await expect(page.getByRole("button", { name: "미션 시작" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  });
});
