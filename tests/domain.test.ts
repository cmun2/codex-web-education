import { beforeEach, describe, expect, it } from "vitest";
import { battleReducer, initialBattleState } from "@/lib/domain/battle";
import {
  bossHealth,
  missionComplete,
  type DialogCodeState,
  type MissionObjectiveId,
  type ObjectiveResult,
  type SnapshotEvidence,
  type VerificationResult,
} from "@/lib/domain/mission";
import { coachMissionId, DeterministicCoachProvider } from "@/lib/domain/providers";
import {
  AllowlistedDialogCodeLab,
  brokenDialogCode,
  diffDialogCode,
  repairedDialogCode,
  validateDialogCodeState,
} from "@/lib/mission/code-lab";
import { DialogObjectiveEvaluator } from "@/lib/mission/evaluator";
import { captureSnapshotEvidence } from "@/lib/mission/snapshot";

const objectiveIds: readonly MissionObjectiveId[] = ["identity", "focus", "keyboard"];
const checkCodes = {
  identity: "DIALOG_SEMANTICS_VERIFIED",
  focus: "FOCUS_LOOP_VERIFIED",
  keyboard: "ESCAPE_AND_RETURN_VERIFIED",
} as const;

const result = (objectiveId: MissionObjectiveId, passed: boolean): ObjectiveResult => ({
  objectiveId,
  status: passed ? "passed" : "failed",
  checks: passed ? [checkCodes[objectiveId]] : [],
  failureCodes: passed
    ? []
    : [objectiveId === "identity" ? "DIALOG_IDENTITY_MISSING" : objectiveId === "focus" ? "FOCUS_CONTAINMENT_MISSING" : "KEYBOARD_ACTIONS_MISSING"],
});

const snapshotFor = (attemptNumber: number, objectives: ObjectiveResult[]): SnapshotEvidence => ({
  contract: "fixture-region-v1",
  attemptNumber,
  locale: "en",
  capturedAt: "2026-07-19T00:00:00.000Z",
  regionTestId: "mission-fixture",
  dimensions: { width: 480, height: 440 },
  codeState: { ...repairedDialogCode },
  objectiveResults: objectives,
  imageDataUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E",
});

const verification = (attemptNumber: number, objectives: ObjectiveResult[]): VerificationResult => ({
  attempt: { number: attemptNumber, codeState: { ...repairedDialogCode } },
  objectives,
  snapshot: snapshotFor(attemptNumber, objectives),
});

describe("allowlisted Code Lab", () => {
  it("accepts only the typed mission DSL and applies it behind the interface", () => {
    const lab = new AllowlistedDialogCodeLab();
    expect(lab.apply(repairedDialogCode)).toEqual({ ok: true, value: repairedDialogCode });
    expect(lab.reset()).toEqual(brokenDialogCode);
  });

  it("rejects invalid and unsupported input without executing supplied source", () => {
    let getterRan = false;
    const hostile = {
      ...repairedDialogCode,
      arbitrarySource: "globalThis.compromised = true",
      get escapeCloses() {
        getterRan = true;
        return true;
      },
    };

    const validation = validateDialogCodeState(hostile);
    expect(validation).toMatchObject({ ok: false });
    if (!validation.ok) expect(validation.errors).toContain("UNSUPPORTED_FIELD");
    expect(getterRan).toBe(false);
    expect(Reflect.get(globalThis, "compromised")).toBeUndefined();
  });

  it("generates a line-level before/after diff and resets to the broken values", () => {
    const diff = diffDialogCode(brokenDialogCode, repairedDialogCode);
    expect(diff.some((line) => line.kind === "removed" && line.text.includes("role={undefined}"))).toBe(true);
    expect(diff.some((line) => line.kind === "added" && line.text.includes('role="dialog"'))).toBe(true);
    expect(new AllowlistedDialogCodeLab().reset()).toEqual(brokenDialogCode);
  });
});

describe("battle domain", () => {
  it("starts fresh and applies damage only for newly verified objectives", () => {
    expect(initialBattleState).toMatchObject({ phase: "landing", hp: 100, fixture: "broken", results: [], history: [] });
    const identityOnly = objectiveIds.map((id) => result(id, id === "identity"));
    const first = battleReducer(initialBattleState, { type: "RESULTS", result: verification(1, identityOnly) });
    expect(first.hp).toBe(70);
    expect(first.verifiedObjectiveIds).toEqual(["identity"]);

    const repeated = battleReducer(first, { type: "RESULTS", result: verification(2, identityOnly) });
    expect(repeated.hp).toBe(70);
    expect(repeated.history).toHaveLength(2);

    const focusOnly = objectiveIds.map((id) => result(id, id === "focus"));
    const next = battleReducer(repeated, { type: "RESULTS", result: verification(3, focusOnly) });
    expect(next.hp).toBe(35);
    expect(next.verifiedObjectiveIds).toEqual(["identity", "focus"]);
  });

  it("keeps independent failures visible and completes only through verified results", () => {
    const mixed = objectiveIds.map((id) => result(id, id !== "focus"));
    expect(mixed.map((item) => item.status)).toEqual(["passed", "failed", "passed"]);
    expect(bossHealth(mixed)).toBe(35);
    expect(missionComplete(["identity", "keyboard"])).toBe(false);
    const partial = battleReducer(initialBattleState, { type: "RESULTS", result: verification(1, mixed) });
    expect(partial.phase).toBe("partial-success");
    const final = battleReducer(partial, { type: "RESULTS", result: verification(2, objectiveIds.map((id) => result(id, id === "focus"))) });
    expect(final.phase).toBe("victory");
    expect(final.hp).toBe(0);
  });

  it("uses the truthful deterministic coach provider", async () => {
    await expect(new DeterministicCoachProvider().coach({
      missionId: coachMissionId,
      failedObjectiveIds: ["identity"],
      codeState: brokenDialogCode,
      snapshot: {
        contract: "fixture-region-v1",
        regionTestId: "mission-fixture",
        dimensions: { width: 480, height: 440 },
        imageDataUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E",
      },
      attemptNumber: 1,
      locale: "en",
    })).resolves.toMatchObject({ provider: "demo", usedFallback: false, hintLevel: 1 });
  });
});

const renderFixture = (codeState: DialogCodeState): HTMLElement => {
  const root = document.createElement("main");
  const outside = document.createElement("p");
  outside.textContent = "OUTSIDE_SECRET_DO_NOT_CAPTURE";
  const fixture = document.createElement("section");
  fixture.dataset.testid = "mission-fixture";
  fixture.textContent = "Fixture only";
  const trigger = document.createElement("button");
  trigger.dataset.action = "trigger";
  trigger.textContent = "Open";

  const open = () => {
    if (fixture.querySelector("[data-testid='mission-dialog']")) return;
    const dialog = document.createElement("div");
    dialog.dataset.testid = "mission-dialog";
    if (codeState.dialogRole === "dialog") dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", String(codeState.ariaModal));
    if (codeState.ariaLabelledBy !== "none") dialog.setAttribute("aria-labelledby", codeState.ariaLabelledBy);
    if (codeState.ariaDescribedBy !== "none") dialog.setAttribute("aria-describedby", codeState.ariaDescribedBy);
    const title = document.createElement("h2");
    title.id = "dialog-title";
    title.textContent = "Dialog title";
    const description = document.createElement("p");
    description.id = "dialog-description";
    description.textContent = "Dialog description";
    const close = document.createElement("button");
    close.dataset.action = "close";
    const primary = document.createElement("button");
    primary.dataset.action = "primary";
    const closeDialog = () => {
      dialog.remove();
      if (codeState.focusRestoration) trigger.focus();
    };
    close.addEventListener("click", closeDialog);
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && codeState.escapeCloses) closeDialog();
      if (event.key === "Tab" && codeState.focusContainment) {
        event.preventDefault();
        if (event.shiftKey && document.activeElement === close) primary.focus();
        else if (!event.shiftKey && document.activeElement === primary) close.focus();
      }
    });
    dialog.append(title, description, close, primary);
    fixture.append(dialog);
    if (codeState.focusContainment) close.focus();
  };
  trigger.addEventListener("click", open);
  fixture.append(trigger);
  root.append(outside, fixture);
  document.body.append(root);
  return root;
};

describe("rendered behavior evaluation and snapshot evidence", () => {
  beforeEach(() => document.body.replaceChildren());

  it("runs real independent dialog behavior checks", async () => {
    const root = renderFixture({ ...repairedDialogCode, focusContainment: false });
    const objectives = await new DialogObjectiveEvaluator().evaluate(root);
    expect(objectives.map((objective) => objective.status)).toEqual(["passed", "failed", "passed"]);
  });

  it("captures only fixture-region evidence with attempt metadata and allowlisted state", () => {
    const root = renderFixture(repairedDialogCode);
    const objectives = objectiveIds.map((id) => result(id, true));
    const snapshot = captureSnapshotEvidence({
      root,
      attemptNumber: 4,
      locale: "ko",
      codeState: repairedDialogCode,
      objectiveResults: objectives,
      now: () => new Date("2026-07-19T09:30:00.000Z"),
    });
    const decoded = decodeURIComponent(snapshot.imageDataUrl);
    expect(snapshot).toMatchObject({ contract: "fixture-region-v1", attemptNumber: 4, locale: "ko", regionTestId: "mission-fixture", capturedAt: "2026-07-19T09:30:00.000Z" });
    expect(snapshot.codeState).toEqual(repairedDialogCode);
    expect(snapshot.objectiveResults).toEqual(objectives);
    expect(decoded).toContain("Fixture only");
    expect(decoded).not.toContain("OUTSIDE_SECRET_DO_NOT_CAPTURE");
  });
});
