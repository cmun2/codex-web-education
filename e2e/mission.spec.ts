import { expect, test, type Page } from "@playwright/test";

const captureBrowserErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

const enterEnglishMission = async (page: Page) => {
  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: "Start Mission" }).click();
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("start opens the concrete workspace and settings update preview and source immediately", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await enterEnglishMission(page);

  await expect(page.getByRole("heading", { name: "Keyboard Trap Boss" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Delete saved delivery address" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enter broken preview" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Apply Changes" })).toHaveCount(0);
  await expect(page.getByText("Everything disconnected", { exact: true })).toBeVisible();
  await expect(page.getByTestId("boss-hp")).toHaveText("100");
  await expect(page.getByLabel("Delete-dialog defect signals").getByText("Broken", { exact: true })).toHaveCount(4);

  await page.getByLabel("Dialog role").selectOption("dialog");
  await expect(page.getByLabel("React-like code representation")).toContainText('role="dialog"');
  await expect(page.getByTestId("boss-hp")).toHaveText("100");

  await page.getByRole("button", { name: "Delete address" }).click();
  await expect(page.getByTestId("mission-dialog")).toHaveAttribute("role", "dialog");
  await expect(page.getByRole("heading", { name: "Delete this address?" })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("damage comes only from newly passed real browser checks", async ({ page }) => {
  await enterEnglishMission(page);
  await page.getByLabel("Dialog role").selectOption("dialog");
  await page.getByLabel("Use aria-modal").check();
  await page.getByLabel("aria-labelledby").selectOption("dialog-title");
  await page.getByLabel("aria-describedby").selectOption("dialog-description");
  await expect(page.getByTestId("boss-hp")).toHaveText("100");

  const attack = page.getByRole("button", { name: "Check & attack" });
  await attack.click();
  await expect(page.getByTestId("boss-hp")).toHaveText("75");
  await expect(attack).toBeFocused();
  await attack.click();
  await expect(page.getByTestId("boss-hp")).toHaveText("75");

  await page.getByLabel("Close on Escape").check();
  await page.getByLabel("Contain focus").check();
  await page.getByLabel("Restore focus").check();
  await page.getByLabel("Action-button CSS layout").selectOption("flex-row");
  await expect(page.getByTestId("boss-hp")).toHaveText("75");
  await attack.click();
  await expect(page.getByTestId("boss-hp")).toHaveText("0");
  await expect(page.getByRole("heading", { name: "Boss Defeated" })).toBeFocused();
});

test("new broken setup is deterministic and clears stale battle, evidence, and coach state", async ({ page }) => {
  await enterEnglishMission(page);
  await page.getByRole("button", { name: "Check & attack" }).click();
  await expect(page.getByRole("button", { name: "Why did this fail? Get a hint" })).toBeVisible();
  await page.getByRole("button", { name: "Why did this fail? Get a hint" }).click();
  await expect(page.getByText("Visual observation", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "New broken setup" }).click();
  await expect(page.getByText("Unnamed dialog", { exact: true })).toBeVisible();
  await expect(page.getByText("Visual observation", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Why did this fail? Get a hint" })).toHaveCount(0);
  await expect(page.getByTestId("boss-hp")).toHaveText("100");
  await expect(page.getByLabel("aria-labelledby")).toHaveValue("none");
  await expect(page.getByLabel("Contain focus")).toBeChecked();

  await page.getByRole("button", { name: "New broken setup" }).click();
  await expect(page.getByText("Collapsed button layout", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Action-button CSS layout")).toHaveValue("overlap");
  await page.getByRole("button", { name: "New broken setup" }).click();
  await expect(page.getByText("Cannot close and return", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Close on Escape")).not.toBeChecked();
});

test("a visible flex-layout defect is verified and its AI hint points back to the CSS control", async ({ page }) => {
  await enterEnglishMission(page);
  await page.getByRole("button", { name: "New broken setup" }).click();
  await page.getByRole("button", { name: "New broken setup" }).click();
  await expect(page.getByText("Collapsed button layout", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Delete address" }).click();
  const actions = page.locator("[data-dialog-actions]");
  await expect(actions).toHaveCSS("display", "grid");
  await expect(page.getByText("flex ×", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByRole("button", { name: "Check & attack" }).click();
  await expect(page.getByTestId("boss-hp")).toHaveText("25");
  await page.getByRole("button", { name: "Why did this fail? Get a hint" }).click();
  const layoutControl = page.getByLabel("Action-button CSS layout");
  await expect(layoutControl.locator("xpath=..")).toHaveClass(/ai-highlight/);
  await expect(page.getByRole("button", { name: /Why AI recommends this setting/ })).toBeVisible();

  await layoutControl.selectOption("flex-row");
  await page.getByRole("button", { name: "Delete address" }).click();
  await expect(actions).toHaveCSS("display", "flex");
  await expect(actions).toHaveCSS("flex-direction", "row");
});

test("coach is absent until a failed verification and reveals one requested hint inline", async ({ page }) => {
  await enterEnglishMission(page);
  await expect(page.getByRole("button", { name: "Why did this fail? Get a hint" })).toHaveCount(0);
  await page.getByRole("button", { name: "Check & attack" }).click();
  const ask = page.getByRole("button", { name: "Why did this fail? Get a hint" });
  await expect(ask).toBeVisible();
  await expect(page.getByText("Visual observation", { exact: true })).toHaveCount(0);
  await ask.click();
  await expect(page.getByText("Visual observation", { exact: true })).toBeVisible();
  await expect(page.getByText("This hint", { exact: true })).toBeVisible();
  await expect(page.getByText("Demo Coach", { exact: true })).not.toBeVisible();
  await page.getByText("Hint technical details", { exact: true }).click();
  await expect(page.getByText("Demo Coach", { exact: true })).toBeVisible();
  await expect(page.locator(".repair-control.ai-highlight")).toHaveCount(4);
  await expect(page.getByRole("button", { name: /Why AI recommends this setting/ }).first()).toBeVisible();

  await page.getByLabel("Dialog role").selectOption("dialog");
  await expect(page.getByText("Visual observation", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Why did this fail? Get a hint" })).toHaveCount(0);
  await page.getByRole("button", { name: "Check & attack" }).click();
  await expect(page.getByRole("button", { name: "Why did this fail? Get a hint" })).toBeVisible();
});

test("replay is clean and Korean mobile keeps preview then controls without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "한국어" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(page.getByRole("button", { name: "한국어" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "미션 시작" }).click();
  await expect(page.getByRole("heading", { name: "저장된 배송지 삭제" })).toBeVisible();
  await expect(page.getByRole("button", { name: "검사하고 공격" })).toBeVisible();
  await expect(page.getByRole("button", { name: "변경 사항 적용" })).toHaveCount(0);
  const positions = await page.locator(".preview, .code-lab").evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top));
  expect(positions[0]).toBeLessThan(positions[1]);
  const viewport = await page.evaluate(() => ({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);

  await page.getByLabel("대화상자 role").selectOption("dialog");
  await page.getByLabel("aria-modal 사용").check();
  await page.getByLabel("aria-labelledby").selectOption("dialog-title");
  await page.getByLabel("aria-describedby").selectOption("dialog-description");
  await page.getByLabel("Escape로 닫기").check();
  await page.getByLabel("포커스 순환").check();
  await page.getByLabel("포커스 복귀").check();
  await page.getByLabel("동작 버튼 CSS 배치").selectOption("flex-row");
  await page.getByRole("button", { name: "검사하고 공격" }).click();
  await page.getByRole("button", { name: "미션 다시 플레이" }).first().click();
  await expect(page.getByRole("button", { name: "미션 시작" })).toBeVisible();
});

test("keyboard-only dialog flow and reduced-motion styles remain available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterEnglishMission(page);
  const trigger = page.getByRole("button", { name: "Delete address" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("mission-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("mission-dialog")).toBeVisible();
  const duration = await page.locator(".boss").evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.00001);
});

test("language and mute preferences persist while sound remains optional", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: "Battle sound on. Mute sound" }).click();
  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Battle sound muted. Turn sound on" })).toBeVisible();
  await page.getByRole("button", { name: "Start Mission" }).click();
  await expect(page.getByRole("button", { name: "Check & attack" })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("first-attempt repair preserves evidence and diff, ranks S, and replay does not duplicate XP", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await enterEnglishMission(page);
  await page.getByLabel("Dialog role").selectOption("dialog");
  await page.getByLabel("Use aria-modal").check();
  await page.getByLabel("aria-labelledby").selectOption("dialog-title");
  await page.getByLabel("aria-describedby").selectOption("dialog-description");
  await page.getByLabel("Close on Escape").check();
  await page.getByLabel("Contain focus").check();
  await page.getByLabel("Restore focus").check();
  await page.getByLabel("Action-button CSS layout").selectOption("flex-row");
  await page.getByRole("button", { name: "Check & attack" }).click();

  await expect(page.getByRole("heading", { name: "Boss Defeated" })).toBeFocused();
  await expect(page.getByText("Perfect Repair", { exact: true })).toBeVisible();
  await expect(page.getByText("Mission rank S", { exact: true })).toBeVisible();
  await page.getByText("Attempt history & snapshot evidence", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Attempt 1 · 4/4" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Delete-dialog snapshot for attempt 1" })).toBeVisible();
  await expect(page.getByText(/Attempt 1 · en · 4\/4 passed/)).toBeVisible();
  await expect(page.getByText("Why save this view?", { exact: true })).toBeVisible();
  await expect(page.getByText("Captured region: mission-fixture", { exact: true })).toBeVisible();

  await page.getByText("View code diff", { exact: true }).click();
  const diff = page.getByLabel("Broken code compared with current code");
  await expect(diff).toContainText('+     <div role="dialog"');
  await expect(diff).toContainText("+   const restoreFocus = true;");

  await expect.poll(async () => page.evaluate(() => {
    const raw = window.localStorage.getItem("frontend-debugging-arena-progression-v1");
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && "totalXp" in parsed ? parsed.totalXp : null;
  })).toBe(300);
  await page.getByRole("button", { name: "Replay mission" }).first().click();
  await expect(page.getByRole("button", { name: "Start Mission" })).toBeVisible();
  const storedXp = await page.evaluate(() => {
    const raw = window.localStorage.getItem("frontend-debugging-arena-progression-v1");
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && "totalXp" in parsed ? parsed.totalXp : null;
  });
  expect(storedXp).toBe(300);
  expect(browserErrors).toEqual([]);
});

test("storage fallback remains usable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { configurable: true, get: () => { throw new DOMException("blocked", "SecurityError"); } });
  });
  await page.reload();
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("status")).toContainText("Browser storage is unavailable");
  await page.getByRole("button", { name: "Battle sound on. Mute sound" }).click();
  await expect(page.getByRole("button", { name: "Battle sound muted. Turn sound on" })).toBeVisible();
  await page.getByRole("button", { name: "Start Mission" }).click();
  await expect(page.getByRole("button", { name: "Check & attack" })).toBeVisible();
});

test.describe("Korean browser default", () => {
  test.use({ locale: "ko-KR" });
  test("defaults to Korean", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "미션 시작" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  });
});
