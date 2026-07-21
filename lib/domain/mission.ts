export type MissionObjectiveId =
  | "identity"
  | "focus"
  | "keyboard"
  | "layout"
  | "motion-timing"
  | "motion-safety"
  | "stream-protocol"
  | "stream-recovery"
  | "state-update"
  | "state-reset";
export type MissionScenarioId = "delete-dialog" | "checkout-sheet" | "motion-card" | "ai-stream" | "state-counter";
export type ObjectiveStatus = "pending" | "passed" | "failed";

export type DialogRole = "none" | "dialog";
export type DialogReference = "none" | "dialog-title" | "dialog-description";
export type DialogActionDisplay = "grid" | "flex";
export type DialogFlexDirection = "column" | "row";
export type DialogAlignItems = "stretch" | "center";
export type DialogJustifyContent = "flex-start" | "flex-end" | "space-between";
export type DialogGap = 0 | 8 | 16;
export type MotionDuration = 8000 | 1200;
export type MotionDistance = 48 | 12;
export type StreamProtocol = "buffered" | "event-stream";
export type StreamParsing = "raw" | "event-lines";
export type StreamReconnect = "unbounded" | "bounded";
export type StateUpdate = "mutate" | "immutable";
export type StateReset = "keep-stale" | "reset";
export type StateSource = "duplicated" | "single";

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
  motionDuration: MotionDuration;
  motionDistance: MotionDistance;
  reducedMotionSafe: boolean;
  streamProtocol: StreamProtocol;
  streamParsing: StreamParsing;
  streamReconnect: StreamReconnect;
  stateUpdate: StateUpdate;
  stateReset: StateReset;
  stateSource: StateSource;
};

export type MissionObjective = { id: MissionObjectiveId; damage: number; xp: number };

export type CheckCode =
  | "DIALOG_SEMANTICS_VERIFIED"
  | "FOCUS_LOOP_VERIFIED"
  | "ESCAPE_AND_RETURN_VERIFIED"
  | "ACTION_LAYOUT_VERIFIED"
  | "MOTION_TIMING_VERIFIED"
  | "REDUCED_MOTION_VERIFIED"
  | "EVENT_STREAM_VERIFIED"
  | "STREAM_RECOVERY_VERIFIED"
  | "IMMUTABLE_UPDATE_VERIFIED"
  | "STATE_RESET_VERIFIED";

export type FailureCode =
  | "DIALOG_IDENTITY_MISSING"
  | "FOCUS_CONTAINMENT_MISSING"
  | "KEYBOARD_ACTIONS_MISSING"
  | "ACTION_LAYOUT_BROKEN"
  | "MOTION_TIMING_BROKEN"
  | "REDUCED_MOTION_MISSING"
  | "EVENT_STREAM_BROKEN"
  | "STREAM_RECOVERY_BROKEN"
  | "STATE_MUTATION_BROKEN"
  | "STATE_RESET_BROKEN";

export type ObjectiveResult = {
  objectiveId: MissionObjectiveId;
  status: Exclude<ObjectiveStatus, "pending">;
  checks: CheckCode[];
  failureCodes: FailureCode[];
};

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

export type MissionAttempt = { number: number; scenarioId: MissionScenarioId; codeState: DialogCodeState };
export type VerificationResult = { attempt: MissionAttempt; objectives: ObjectiveResult[]; snapshot: SnapshotEvidence };

export const keyboardTrapObjectives: readonly MissionObjective[] = [
  { id: "identity", damage: 30, xp: 90 },
  { id: "focus", damage: 35, xp: 105 },
  { id: "keyboard", damage: 35, xp: 105 },
];

export const flexTangleObjectives: readonly MissionObjective[] = [{ id: "layout", damage: 100, xp: 300 }];
export const motionPhantomObjectives: readonly MissionObjective[] = [
  { id: "motion-timing", damage: 50, xp: 150 },
  { id: "motion-safety", damage: 50, xp: 150 },
];
export const streamGremlinObjectives: readonly MissionObjective[] = [
  { id: "stream-protocol", damage: 50, xp: 150 },
  { id: "stream-recovery", damage: 50, xp: 150 },
];
export const stateDoppelgangerObjectives: readonly MissionObjective[] = [
  { id: "state-update", damage: 50, xp: 150 },
  { id: "state-reset", damage: 50, xp: 150 },
];

export const damageForObjectives = (objectiveIds: readonly MissionObjectiveId[], objectives: readonly MissionObjective[]): number =>
  objectives.filter((objective) => objectiveIds.includes(objective.id)).reduce((sum, objective) => sum + objective.damage, 0);
export const xpForObjectives = (objectiveIds: readonly MissionObjectiveId[], objectives: readonly MissionObjective[]): number =>
  objectives.filter((objective) => objectiveIds.includes(objective.id)).reduce((sum, objective) => sum + objective.xp, 0);
export const bossHealthForVerifiedObjectives = (objectiveIds: readonly MissionObjectiveId[], objectives: readonly MissionObjective[]): number =>
  Math.max(0, 100 - damageForObjectives(objectiveIds, objectives));
export const bossHealth = (results: readonly ObjectiveResult[], objectives: readonly MissionObjective[]): number =>
  bossHealthForVerifiedObjectives(results.filter((result) => result.status === "passed").map((result) => result.objectiveId), objectives);
export const missionComplete = (objectiveIds: readonly MissionObjectiveId[], objectives: readonly MissionObjective[]): boolean =>
  objectives.every((objective) => objectiveIds.includes(objective.id));
