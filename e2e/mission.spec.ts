import { expect, test, type Page } from "@playwright/test";

const captureBrowserErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

const enterEnglishMission = async (page: Page) => {
  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: /Start selected mission/ }).click();
};

const repairCss = async (page: Page) => {
  await page.getByRole("tab", { name: "CSS layout" }).click();
  await page.getByLabel("display").selectOption("flex");
  await page.getByLabel("flex-direction").selectOption("row");
  await page.getByLabel("align-items").selectOption("center");
  await page.getByLabel("justify-content").selectOption("flex-end");
  await page.getByLabel("gap").selectOption("16");
};

const repairAccessibility = async (page: Page) => {
  await page.getByRole("tab", { name: "Accessibility & keyboard" }).click();
  await page.getByLabel("Dialog role").selectOption("dialog");
  await page.getByLabel("Use aria-modal").check();
  await page.getByLabel("aria-labelledby").selectOption("dialog-title");
  await page.getByLabel("aria-describedby").selectOption("dialog-description");
  await page.getByLabel("Close on Escape").check();
  await page.getByLabel("Contain focus").check();
  await page.getByLabel("Restore focus").check();
};

const chooseMission = async (page: Page, accessibleName: string, heading: string) => {
  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: accessibleName }).click();
  await page.getByRole("button", { name: new RegExp(`Start selected mission: ${heading}`) }).click();
  await expect(page.getByRole("heading", { name: heading })).toBeFocused();
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("start opens the concrete workspace and settings update preview and source immediately", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await enterEnglishMission(page);

  await expect(page.getByRole("heading", { name: "Keyboard Trap" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Delete saved delivery address" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enter broken preview" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Apply Changes" })).toHaveCount(0);
  await expect(page.getByText("All accessibility links missing", { exact: true })).toBeVisible();
  await expect(page.getByTestId("boss-hp")).toHaveText("100");
  await expect(page.getByLabel("Delete-dialog defect signals").getByText("Broken", { exact: true })).toHaveCount(3);
  await expect(page.getByRole("tab", { name: "CSS layout" })).toHaveCount(0);

  await page.getByLabel("Dialog role").selectOption("dialog");
  await expect(page.getByLabel("React-like code representation")).toContainText('role: "dialog"');
  await expect(page.getByTestId("boss-hp")).toHaveText("100");

  await page.getByRole("button", { name: "Delete address" }).click();
  await expect(page.getByTestId("mission-dialog")).toHaveAttribute("role", "dialog");
  await expect(page.getByRole("heading", { name: "Delete this address?" })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("mission picker starts a distinct Flex Tangle scenario and victory swaps to its defeated boss", async ({ page }) => {
  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: "Select Flex Tangle mission" }).click();
  await page.getByRole("button", { name: /Start selected mission: Flex Tangle/ }).click();
  await expect(page.getByRole("heading", { name: "Flex Tangle" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Change delivery method" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Change delivery method" })).toBeVisible();
  await expect(page.locator(".boss img")).toHaveAttribute("src", /flex-tangle-alive/);
  await expect(page.getByTestId("verified-xp")).toHaveText("0 / 300 XP");

  await repairCss(page);
  await expect(page.getByTestId("verified-xp")).toHaveText("0 / 300 XP");
  await page.getByRole("button", { name: "Check & attack" }).click();
  await expect(page.getByTestId("verified-xp")).toHaveText("300 / 300 XP");
  await expect(page.locator(".boss img")).toHaveAttribute("src", /flex-tangle-defeated/);
  await expect(page.getByRole("heading", { name: "Boss Defeated" })).toBeFocused();
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
  await expect(page.getByTestId("boss-hp")).toHaveText("70");
  await expect(attack).toBeFocused();
  await attack.click();
  await expect(page.getByTestId("boss-hp")).toHaveText("70");

  await page.getByLabel("Close on Escape").check();
  await page.getByLabel("Contain focus").check();
  await page.getByLabel("Restore focus").check();
  await expect(page.getByTestId("boss-hp")).toHaveText("70");
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
  await expect(page.getByText("Cannot close and return", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Close on Escape")).not.toBeChecked();
  await page.getByRole("button", { name: "New broken setup" }).click();
  await expect(page.getByText("All accessibility links missing", { exact: true })).toBeVisible();
});

test("a visible flex-layout defect is verified and its AI hint points back to the CSS control", async ({ page }) => {
  await chooseMission(page, "Select Flex Tangle mission", "Flex Tangle");
  await expect(page.getByText("All button CSS broken", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Change delivery method" }).click();
  const actions = page.locator("[data-dialog-actions]");
  await expect(actions).toHaveCSS("display", "grid");
  await expect(page.getByText("flex ×", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Keep delivery" }).click();

  await page.getByRole("button", { name: "Check & attack" }).click();
  await expect(page.getByTestId("boss-hp")).toHaveText("100");
  await page.getByRole("button", { name: "Why did this fail? Get a hint" }).click();
  await page.getByRole("tab", { name: /CSS layout/ }).click();
  const layoutControl = page.getByLabel("display");
  await expect(layoutControl.locator("xpath=..")).toHaveClass(/ai-highlight/);
  await expect(page.getByRole("button", { name: /Why AI recommends this setting/ }).first()).toBeVisible();

  await layoutControl.selectOption("flex");
  await expect(page.getByText("Visual observation", { exact: true })).toHaveCount(0);
  await expect(page.locator(".repair-control.ai-highlight")).toHaveCount(4);
  await page.getByLabel("flex-direction").selectOption("row");
  await page.getByLabel("align-items").selectOption("center");
  await page.getByLabel("justify-content").selectOption("flex-end");
  await page.getByLabel("gap").selectOption("16");
  await page.getByRole("button", { name: "Change delivery method" }).click();
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
  await expect(page.locator(".repair-control.ai-highlight")).toHaveCount(7);
  await expect(page.getByRole("tab", { name: /Accessibility & keyboard/ })).toHaveClass(/ai-tab-highlight/);
  await expect(page.getByRole("button", { name: /Why AI recommends this setting/ }).first()).toBeVisible();

  await page.getByLabel("Dialog role").selectOption("dialog");
  await expect(page.getByText("Visual observation", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Why did this fail? Get a hint" })).toHaveCount(0);
  await expect(page.locator(".repair-control.ai-highlight")).toHaveCount(6);
  await expect(page.getByRole("tab", { name: /Accessibility & keyboard/ })).toHaveClass(/ai-tab-highlight/);
  await page.getByRole("button", { name: "Check & attack" }).click();
  await expect(page.getByRole("button", { name: "Why did this fail? Get a hint" })).toBeVisible();
});

test("Motion Phantom uses real rendered timing, reduced-motion settings, and verified damage", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await chooseMission(page, "Select Motion Phantom mission", "Motion Phantom");
  await expect(page.getByRole("tab", { name: "Animation" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Accessibility & keyboard" })).toHaveCount(0);
  await expect(page.getByTestId("boss-hp")).toHaveText("100");
  await page.getByLabel("Duration").selectOption("1200");
  await page.getByLabel("Travel distance").selectOption("12");
  await page.getByLabel("Reduced-motion fallback").check();
  await expect(page.getByTestId("boss-hp")).toHaveText("100");
  const animationDuration = await page.locator("[data-motion-demo]").evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(animationDuration)).toBeLessThanOrEqual(0.00001);
  await page.getByRole("button", { name: "Check & attack" }).click();
  await expect(page.getByTestId("boss-hp")).toHaveText("0");
  await expect(page.locator(".boss img")).toHaveAttribute("src", /motion-phantom-defeated/);
});

test("Stream Gremlin verifies the safe SSE simulation before awarding damage", async ({ page }) => {
  await chooseMission(page, "Select Stream Gremlin mission", "Stream Gremlin");
  await expect(page.getByRole("tab", { name: "AI stream" })).toBeVisible();
  await page.getByRole("button", { name: "Run simulated AI reply" }).click();
  await expect(page.locator("[data-stream-output]")).toContainText("buffers the whole reply");
  await page.getByLabel("Delivery protocol").selectOption("event-stream");
  await page.getByLabel("Event parsing").selectOption("event-lines");
  await page.getByLabel("Reconnect policy").selectOption("bounded");
  await expect(page.getByTestId("boss-hp")).toHaveText("100");
  await page.getByRole("button", { name: "Check & attack" }).click();
  await expect(page.getByTestId("boss-hp")).toHaveText("0");
  await expect(page.locator(".boss img")).toHaveAttribute("src", /stream-gremlin-defeated/);
});

test("State Doppelganger verifies immutable shared updates and a complete reset", async ({ page }) => {
  await chooseMission(page, "Select State Doppelganger mission", "State Doppelganger");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.locator("[data-state-view]")).toHaveText("0");
  await expect(page.locator("[data-state-store]")).toHaveText("1");
  await page.getByLabel("State update").selectOption("immutable");
  await page.getByLabel("Reset behavior").selectOption("reset");
  await page.getByLabel("State source").selectOption("single");
  await expect(page.getByTestId("boss-hp")).toHaveText("100");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.locator("[data-state-view]")).toHaveText("1");
  await expect(page.locator("[data-state-store]")).toHaveText("1");
  await page.getByRole("button", { name: "Reset quantity" }).click();
  await expect(page.locator("[data-state-view]")).toHaveText("0");
  await expect(page.locator("[data-state-store]")).toHaveText("0");
  await page.getByRole("button", { name: "Check & attack" }).click();
  await expect(page.getByTestId("boss-hp")).toHaveText("0");
  await expect(page.locator(".boss img")).toHaveAttribute("src", /state-doppelganger-defeated/);
});

test("replay is clean and Korean mobile keeps preview then controls without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "한국어" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(page.getByRole("button", { name: "한국어" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /선택한 미션 시작/ }).click();
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
  await page.getByRole("button", { name: "검사하고 공격" }).click();
  await page.getByRole("button", { name: "미션 다시 플레이" }).first().click();
  await expect(page.getByRole("button", { name: /선택한 미션 시작/ })).toBeVisible();
});

test("keyboard-only dialog flow and reduced-motion styles remain available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterEnglishMission(page);
  const accessibilityTab = page.getByRole("tab", { name: "Accessibility & keyboard" });
  await accessibilityTab.focus();
  await page.keyboard.press("Home");
  await expect(accessibilityTab).toBeFocused();
  await expect(page.getByRole("tab", { name: "CSS layout" })).toHaveCount(0);
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
  await page.getByRole("button", { name: /Start selected mission/ }).click();
  await expect(page.getByRole("button", { name: "Check & attack" })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("first-attempt repair preserves evidence and diff, ranks S, and replay does not duplicate XP", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await enterEnglishMission(page);
  await repairAccessibility(page);
  await page.getByRole("button", { name: "Check & attack" }).click();

  await expect(page.getByRole("heading", { name: "Boss Defeated" })).toBeFocused();
  await expect(page.getByText("Perfect Repair", { exact: true })).toBeVisible();
  await expect(page.getByText("Mission rank S", { exact: true })).toBeVisible();
  await page.getByText("Attempt history & snapshot evidence", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Attempt 1 · 3/3" })).toBeVisible();
  await expect(page.getByRole("img", { name: "UI snapshot for attempt 1" })).toBeVisible();
  await expect(page.getByText(/Attempt 1 · en · 3\/3 passed/)).toBeVisible();
  await expect(page.getByText("Why save this view?", { exact: true })).toBeVisible();
  await expect(page.getByText("Captured region: mission-fixture", { exact: true })).toBeVisible();

  await page.getByText("View code diff", { exact: true }).click();
  const diff = page.getByLabel("Broken code compared with current code");
  await expect(diff).toContainText('+   const a11y = { role: "dialog"');
  await expect(diff).toContainText("restore: true");

  await expect.poll(async () => page.evaluate(() => {
    const raw = window.localStorage.getItem("frontend-debugging-arena-progression-v1");
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && "totalXp" in parsed ? parsed.totalXp : null;
  })).toBe(300);
  await page.getByRole("button", { name: "Replay mission" }).first().click();
  await expect(page.getByRole("button", { name: /Start selected mission/ })).toBeVisible();
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
  await page.getByRole("button", { name: /Start selected mission/ }).click();
  await expect(page.getByRole("button", { name: "Check & attack" })).toBeVisible();
});

test.describe("Korean browser default", () => {
  test.use({ locale: "ko-KR" });
  test("defaults to Korean", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /선택한 미션 시작/ })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  });
});
