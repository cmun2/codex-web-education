export type MissionObjectiveId = "identity" | "focus" | "keyboard" | "layout";
export type MissionScenarioId = "delete-dialog" | "checkout-sheet";
export type ObjectiveStatus = "pending" | "passed" | "failed";

export type DialogRole = "none" | "dialog";
export type DialogReference = "none" | "dialog-title" | "dialog-description";
export type DialogActionDisplay = "grid" | "flex";
export type DialogFlexDirection = "column" | "row";
export type DialogAlignItems = "stretch" | "center";
export type DialogJustifyContent = "flex-start" | "flex-end" | "space-between";
export type DialogGap = 0 | 8 | 16;

export type DialogCodeState = {
  dialogRole: DialogRole;
  ariaModal: boolean;
  ariaLabelledBy: Extract<DialogReference, "none" | "dialog-title">;
  ariaDescribedBy: Extract<DialogReference, "none" | "dialog-description">;
  escapeCloses: boolean;
  focusContainment: boolean;
  focusRestoration: boolean;
  actionDisplay: DialogActionDisplay;
  actionDirection: DialogFlexDirection;
  actionAlign: DialogAlignItems;
  actionJustify: DialogJustifyContent;
  actionGap: DialogGap;
};

export type MissionObjective = {
  id: MissionObjectiveId;
  damage: number;
  xp: number;
};

export type CheckCode =
  | "DIALOG_SEMANTICS_VERIFIED"
  | "FOCUS_LOOP_VERIFIED"
  | "ESCAPE_AND_RETURN_VERIFIED"
  | "ACTION_LAYOUT_VERIFIED";

export type ObjectiveResult = {
  objectiveId: MissionObjectiveId;
  status: Exclude<ObjectiveStatus, "pending">;
  checks: CheckCode[];
  failureCodes: FailureCode[];
};

export type FailureCode =
  | "DIALOG_IDENTITY_MISSING"
  | "FOCUS_CONTAINMENT_MISSING"
  | "KEYBOARD_ACTIONS_MISSING"
  | "ACTION_LAYOUT_BROKEN";

export type SnapshotEvidence = {
  contract: "fixture-region-v1";
  attemptNumber: number;
  locale: "ko" | "en";
  capturedAt: string;
  regionTestId: "mission-fixture";
  scenarioId: MissionScenarioId;
  dimensions: { width: number; height: number };
  codeState: DialogCodeState;
  objectiveResults: ObjectiveResult[];
  imageDataUrl: string;
};

export type MissionAttempt = {
  number: number;
  scenarioId: MissionScenarioId;
  codeState: DialogCodeState;
};

export type VerificationResult = {
  attempt: MissionAttempt;
  objectives: ObjectiveResult[];
  snapshot: SnapshotEvidence;
};

export const keyboardTrapObjectives: readonly MissionObjective[] = [
  { id: "identity", damage: 25, xp: 75 },
  { id: "focus", damage: 25, xp: 75 },
  { id: "keyboard", damage: 25, xp: 75 },
  { id: "layout", damage: 25, xp: 75 },
];

export const damageForObjectives = (objectiveIds: readonly MissionObjectiveId[]): number =>
  keyboardTrapObjectives
    .filter((objective) => objectiveIds.includes(objective.id))
    .reduce((sum, objective) => sum + objective.damage, 0);

export const xpForObjectives = (objectiveIds: readonly MissionObjectiveId[]): number =>
  keyboardTrapObjectives
    .filter((objective) => objectiveIds.includes(objective.id))
    .reduce((sum, objective) => sum + objective.xp, 0);

export const bossHealthForVerifiedObjectives = (objectiveIds: readonly MissionObjectiveId[]): number =>
  Math.max(0, 100 - damageForObjectives(objectiveIds));

export const bossHealth = (results: readonly ObjectiveResult[]): number =>
  bossHealthForVerifiedObjectives(
    results.filter((result) => result.status === "passed").map((result) => result.objectiveId),
  );

export const missionComplete = (objectiveIds: readonly MissionObjectiveId[]): boolean =>
  keyboardTrapObjectives.every((objective) => objectiveIds.includes(objective.id));
