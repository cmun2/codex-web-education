import { expect, test, type Page } from "@playwright/test";

const captureBrowserErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

const enterEnglishMission = async (page: Page) => {
  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: "Start Mission" }).click();
  await page.getByRole("button", { name: "Enter broken preview" }).click();
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("learner iterates through independent failures and defeats the boss only with verified behavior", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByText("Fix real frontend bugs. Every passing browser check damages the boss.")).toBeVisible();
  await expect(page.getByText("Boss HP 100 / 100")).toBeVisible();
  await expect(page.getByText("Objectives 0 / 3")).toBeVisible();
  await page.getByRole("button", { name: "Start Mission" }).click();
  await expect(page.getByRole("heading", { name: "Keyboard Trap Boss" })).toBeFocused();
  await page.getByRole("button", { name: "Enter broken preview" }).click();

  await expect(page.getByRole("heading", { name: "Code Lab" })).toBeVisible();
  await expect(page.getByText("Allowlisted DSL")).toBeVisible();
  await expect(page.getByText("Broken Fixture", { exact: true })).toBeVisible();
  await expect(page.getByText("Pending", { exact: true })).toHaveCount(3);
  await expect(page.getByTestId("mission-dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Try Broken UI" }).click();
  const brokenDialog = page.getByTestId("mission-dialog");
  await expect(brokenDialog).toBeVisible();
  await expect(brokenDialog).not.toHaveAttribute("role", "dialog");
  await page.keyboard.press("Escape");
  await expect(brokenDialog).toBeVisible();

  await page.getByRole("button", { name: "Run Checks" }).click();
  await expect(page.getByTestId("boss-hp")).toHaveText("100");
  await expect(page.getByTestId("mission-dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Run Checks" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Attempt 1 · 0/3" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Fixture-region snapshot for attempt 1" })).toBeVisible();

  await page.getByLabel("Dialog role").selectOption("dialog");
  await page.getByLabel("Use aria-modal").check();
  await page.getByLabel("aria-labelledby").selectOption("dialog-title");
  await page.getByLabel("aria-describedby").selectOption("dialog-description");
  const applyChanges = page.getByRole("button", { name: "Apply Changes" });
  await applyChanges.click();
  await expect(applyChanges).toBeFocused();
  await expect(page.getByText("Fixture Modified")).toBeVisible();
  await expect(page.getByTestId("boss-hp")).toHaveText("100");

  await page.getByRole("button", { name: "Run Checks" }).click();
  await expect(page.getByTestId("boss-hp")).toHaveText("70");
  await expect(page.getByRole("button", { name: "Attempt 2 · 1/3" })).toBeVisible();
  await expect(page.getByText("Passed", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Failed", { exact: true })).toHaveCount(4);

  await page.getByRole("button", { name: "Run Checks" }).click();
  await expect(page.getByTestId("boss-hp")).toHaveText("70");
  await expect(page.getByRole("button", { name: "Attempt 3 · 1/3" })).toBeVisible();

  await page.getByLabel("Close on Escape").check();
  await page.getByLabel("Contain focus").check();
  await page.getByLabel("Restore focus").check();
  await page.getByRole("button", { name: "Apply Changes" }).click();
  await expect(page.getByText("Fixture Repaired")).toBeVisible();
  await expect(page.getByTestId("boss-hp")).toHaveText("70");
  await page.getByRole("button", { name: "Run Checks" }).click();

  await expect(page.getByTestId("boss-hp")).toHaveText("0");
  await expect(page.getByText("Victory — all browser checks passed")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Boss Defeated" })).toBeFocused();
  await expect(page.getByText("XP earned 300")).toBeVisible();
  await expect(page.getByText("Mission rank C")).toBeVisible();
  await expect(page.getByText("Accessibility Critical Hit", { exact: true })).toBeVisible();
  await expect(page.getByText("Unavailable for now")).toBeVisible();
  await expect(page.getByRole("button", { name: "Attempt 4 · 3/3" })).toBeVisible();
  await expect(page.getByText("Captured region: mission-fixture")).toBeVisible();

  await page.getByRole("button", { name: "View Diff" }).click();
  await expect(page.getByLabel("Broken code compared with current code")).toContainText('+     <div role="dialog"');
  await page.getByRole("button", { name: "View learning debrief" }).click();
  await expect(page.getByRole("heading", { name: "Learning debrief" })).toBeFocused();
  await page.getByRole("button", { name: "Replay mission" }).click();
  await expect(page.getByRole("button", { name: "Start Mission" })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("reset code restores the constrained broken implementation without erasing attempt evidence", async ({ page }) => {
  await enterEnglishMission(page);
  await page.getByLabel("Dialog role").selectOption("dialog");
  await page.getByLabel("Use aria-modal").check();
  await page.getByRole("button", { name: "Apply Changes" }).click();
  await page.getByRole("button", { name: "Run Checks" }).click();
  await expect(page.getByRole("button", { name: /Attempt 1/ })).toBeVisible();

  await page.getByRole("button", { name: "Reset Code" }).click();
  await expect(page.getByLabel("Dialog role")).toHaveValue("none");
  await expect(page.getByLabel("Use aria-modal")).not.toBeChecked();
  await expect(page.getByText("Fixture Broken")).toBeVisible();
  await expect(page.getByRole("button", { name: /Attempt 1/ })).toBeVisible();
});

test("reveals one requested visual coach hint for the selected failed snapshot", async ({ page }) => {
  await enterEnglishMission(page);
  await expect(page.getByText("Visual observation", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ask Visual Coach" })).toBeDisabled();

  await page.getByRole("button", { name: "Run Checks" }).click();
  await expect(page.getByRole("button", { name: "Attempt 1 · 0/3" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Visual observation", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Ask Visual Coach" }).click();
  await expect(page.getByText("Demo Coach", { exact: true })).toBeVisible();
  await expect(page.getByText("Progressive hint 1 of 3", { exact: true })).toBeVisible();
  await expect(page.getByText("Visual observation", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hint revealed for this attempt" })).toBeDisabled();

  await page.getByRole("button", { name: "Return to Code Lab" }).click();
  await expect(page.getByRole("heading", { name: "Code Lab" })).toBeFocused();

  await page.getByRole("button", { name: "Run Checks" }).click();
  await expect(page.getByRole("button", { name: "Attempt 2 · 0/3" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Ask Visual Coach" }).click();
  await expect(page.getByText("Progressive hint 2 of 3", { exact: true })).toBeVisible();
});

test("switches to Korean, persists the choice, and exposes localized Code Lab actions on mobile", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "한국어" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "미션 시작" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await page.getByRole("button", { name: "미션 시작" }).click();
  await page.getByRole("button", { name: "고장 난 화면으로 이동" }).click();
  await expect(page.getByRole("button", { name: "고장 난 UI 체험" })).toBeVisible();
  await expect(page.getByRole("button", { name: "변경 사항 적용" })).toBeVisible();
  await expect(page.getByRole("button", { name: "검사 실행" })).toBeVisible();
  const viewport = await page.evaluate(() => ({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);
  expect(browserErrors).toEqual([]);
});

test("persists mute without making sound necessary and honors reduced motion", async ({ page }) => {
  await page.getByRole("button", { name: "English" }).click();
  const mute = page.getByRole("button", { name: "Battle sound on. Mute sound" });
  await expect(mute).toBeVisible();
  await mute.click();
  await expect(page.getByRole("button", { name: "Battle sound muted. Turn sound on" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Battle sound muted. Turn sound on" })).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterEnglishMission(page);
  await expect(page.getByRole("heading", { name: "Code Lab" })).toBeVisible();
  const healthTransition = await page.locator(".health div").evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(healthTransition)).toBeLessThanOrEqual(0.00001);
});

test("continues in memory when accessing the localStorage getter is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
  await page.reload();
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("status")).toContainText("Browser storage is unavailable");
  await page.getByRole("button", { name: "Battle sound on. Mute sound" }).click();
  await expect(page.getByRole("button", { name: "Battle sound muted. Turn sound on" })).toBeVisible();
  await page.getByRole("button", { name: "Start Mission" }).click();
  await expect(page.getByRole("heading", { name: "Keyboard Trap Boss" })).toBeFocused();
});

test("shows a truthful Perfect Repair victory and does not duplicate stored XP on replay", async ({ page }) => {
  await enterEnglishMission(page);
  await page.getByLabel("Dialog role").selectOption("dialog");
  await page.getByLabel("Use aria-modal").check();
  await page.getByLabel("aria-labelledby").selectOption("dialog-title");
  await page.getByLabel("aria-describedby").selectOption("dialog-description");
  await page.getByLabel("Close on Escape").check();
  await page.getByLabel("Contain focus").check();
  await page.getByLabel("Restore focus").check();
  await page.getByRole("button", { name: "Apply Changes" }).click();
  await page.getByRole("button", { name: "Run Checks" }).click();
  await expect(page.getByRole("heading", { name: "Boss Defeated" })).toBeFocused();
  await expect(page.getByText("Perfect Repair")).toBeVisible();
  await expect(page.getByText("Mission rank S")).toBeVisible();

  await page.getByRole("button", { name: "Replay mission" }).first().click();
  await expect(page.getByRole("button", { name: "Start Mission" })).toBeVisible();
  const storedXp = await page.evaluate(() => {
    const raw = window.localStorage.getItem("frontend-debugging-arena-progression-v1");
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && "totalXp" in parsed ? parsed.totalXp : null;
  });
  expect(storedXp).toBe(300);
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
