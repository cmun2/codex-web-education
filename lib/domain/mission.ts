export type MissionObjectiveId = "identity" | "focus" | "keyboard";
export type ObjectiveStatus = "pending" | "passed" | "failed";

export type MissionObjective = {
  id: MissionObjectiveId;
  damage: number;
};

export type ObjectiveResult = {
  objectiveId: MissionObjectiveId;
  status: Exclude<ObjectiveStatus, "pending">;
  checks: string[];
  failureCodes: FailureCode[];
};

export type FailureCode = "DIALOG_IDENTITY_MISSING" | "FOCUS_CONTAINMENT_MISSING" | "KEYBOARD_ACTIONS_MISSING";

export type SnapshotEvidence = {
  objectiveId: MissionObjectiveId;
  contract: "rendered-dom";
  passed: boolean;
};

export type MissionAttempt = {
  number: number;
  repairApplied: boolean;
};

export type VerificationResult = {
  attempt: MissionAttempt;
  objectives: ObjectiveResult[];
  evidence: SnapshotEvidence[];
};

export const keyboardTrapObjectives: readonly MissionObjective[] = [
  { id: "identity", damage: 30 },
  { id: "focus", damage: 35 },
  { id: "keyboard", damage: 35 },
];

export const bossHealth = (results: readonly ObjectiveResult[]): number =>
  Math.max(
    0,
    100 - results.filter((result) => result.status === "passed").reduce((sum, result) => sum + (keyboardTrapObjectives.find((objective) => objective.id === result.objectiveId)?.damage ?? 0), 0),
  );

export const missionComplete = (results: readonly ObjectiveResult[]): boolean =>
  keyboardTrapObjectives.every((objective) => results.some((result) => result.objectiveId === objective.id && result.status === "passed"));
