import { beforeEach, describe, expect, it } from "vitest";
import { battleReducer, initialBattleState } from "@/lib/domain/battle";
import { bossHealth, missionComplete, type MissionObjectiveId, type ObjectiveResult, type VerificationResult } from "@/lib/domain/mission";
import { DeterministicCoachProvider, DeterministicCodeLab } from "@/lib/domain/providers";
import { DialogObjectiveEvaluator } from "@/lib/mission/evaluator";

const objectiveIds: readonly MissionObjectiveId[] = ["identity", "focus", "keyboard"];
const passingResults: ObjectiveResult[] = objectiveIds.map((objectiveId) => ({ objectiveId, status: "passed", checks: [objectiveId], failureCodes: [] }));
const passingVerification: VerificationResult = {
  attempt: { number: 1, repairApplied: true },
  objectives: passingResults,
  evidence: objectiveIds.map((objectiveId) => ({ objectiveId, contract: "rendered-dom", passed: true })),
};

describe("battle domain", () => {
  it("starts fresh without pre-passed objectives", () => {
    expect(initialBattleState).toMatchObject({ phase: "landing", hp: 100, fixture: "broken", results: [] });
  });

  it("calculates damage only from passed objectives", () => {
    expect(bossHealth(passingResults)).toBe(0);
    expect(bossHealth([{ ...passingResults[0], status: "failed" }, passingResults[1], passingResults[2]])).toBe(30);
  });

  it("moves through victory, debrief, and a completely fresh replay", () => {
    const victory = battleReducer(initialBattleState, { type: "RESULTS", result: passingVerification });
    expect(victory.phase).toBe("victory");
    expect(missionComplete(victory.results)).toBe(true);
    const debrief = battleReducer(victory, { type: "SHOW_DEBRIEF" });
    expect(debrief.phase).toBe("debrief");
    expect(battleReducer(debrief, { type: "REPLAY" })).toEqual(initialBattleState);
  });

  it("keeps failure and partial-success states explicit", () => {
    const failed = passingVerification.objectives.map((objective) => ({ ...objective, status: "failed" as const, checks: [], failureCodes: ["DIALOG_IDENTITY_MISSING" as const] }));
    expect(battleReducer(initialBattleState, { type: "RESULTS", result: { ...passingVerification, objectives: failed } }).phase).toBe("failure");
    expect(battleReducer(initialBattleState, { type: "RESULTS", result: { ...passingVerification, objectives: [passingResults[0], ...failed.slice(1)] } }).phase).toBe("partial-success");
  });

  it("reports deterministic repair progress behind the CodeLab interface", async () => {
    const feed: string[] = [];
    await new DeterministicCodeLab().applyGuidedRepair((event) => feed.push(event.code));
    expect(feed).toEqual(["repair-started", "repair-applied"]);
  });

  it("uses the truthful deterministic coach provider", async () => {
    await expect(new DeterministicCoachProvider().coach({ objectiveStatuses: [], attempt: 1 })).resolves.toEqual({ source: "deterministic-demo", hintCode: "dialog-contract" });
  });
});

describe("dialog objective evaluator", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("recognizes the focus contract marker on the dialog itself", () => {
    const root = document.createElement("main");
    const title = document.createElement("h2");
    title.id = "dialog-title";
    title.textContent = "Dialog title";
    const description = document.createElement("p");
    description.id = "dialog-description";
    description.textContent = "Dialog description";
    const dialog = document.createElement("div");
    dialog.dataset.testid = "mission-dialog";
    dialog.dataset.focusLoop = "true";
    dialog.dataset.initialFocus = "true";
    dialog.dataset.keyboardContract = "true";
    dialog.dataset.focusReturn = "true";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", title.id);
    dialog.setAttribute("aria-describedby", description.id);
    const closeButton = document.createElement("button");
    closeButton.dataset.action = "close";
    const primaryButton = document.createElement("button");
    primaryButton.dataset.action = "primary";
    dialog.append(title, description, closeButton, primaryButton);
    root.append(dialog);
    document.body.append(root);
    closeButton.focus();

    const verification = new DialogObjectiveEvaluator().evaluate(root, { number: 1, repairApplied: true });

    expect(verification.objectives.map((objective) => objective.status)).toEqual(["passed", "passed", "passed"]);
    expect(bossHealth(verification.objectives)).toBe(0);
  });
});
