import {
  bossHealthForVerifiedObjectives,
  missionComplete,
  type MissionObjectiveId,
  type ObjectiveResult,
  type VerificationResult,
} from "@/lib/domain/mission";

export type MissionPhase =
  | "landing"
  | "briefing"
  | "broken-preview"
  | "attempting"
  | "verifying"
  | "partial-success"
  | "failure"
  | "victory"
  | "debrief";
export type FixtureStatus = "broken" | "modified" | "repaired";
export type FeedCode =
  | "entered-preview"
  | "changes-applied"
  | "code-reset"
  | "verification-started"
  | "verification-failed"
  | "verification-partial"
  | "verification-passed";

export type BattleState = {
  phase: MissionPhase;
  results: ObjectiveResult[];
  verifiedObjectiveIds: MissionObjectiveId[];
  hp: number;
  fixture: FixtureStatus;
  attempt: number;
  history: VerificationResult[];
  feed: FeedCode[];
};

export type BattleAction =
  | { type: "START_MISSION" }
  | { type: "ENTER_PREVIEW" }
  | { type: "CHANGES_APPLIED"; fixture: Exclude<FixtureStatus, "broken"> }
  | { type: "CODE_RESET" }
  | { type: "BEGIN_VERIFICATION" }
  | { type: "RESULTS"; result: VerificationResult }
  | { type: "SHOW_DEBRIEF" }
  | { type: "REPLAY" };

export const initialBattleState: BattleState = {
  phase: "landing",
  results: [],
  verifiedObjectiveIds: [],
  hp: 100,
  fixture: "broken",
  attempt: 1,
  history: [],
  feed: [],
};

const addNewlyPassed = (
  verified: readonly MissionObjectiveId[],
  results: readonly ObjectiveResult[],
): MissionObjectiveId[] => {
  const updated = [...verified];
  for (const result of results) {
    if (result.status === "passed" && !updated.includes(result.objectiveId)) updated.push(result.objectiveId);
  }
  return updated;
};

export function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case "START_MISSION":
      return { ...state, phase: "briefing" };
    case "ENTER_PREVIEW":
      return { ...state, phase: "broken-preview", feed: ["entered-preview"] };
    case "CHANGES_APPLIED":
      return { ...state, phase: "attempting", fixture: action.fixture, feed: [...state.feed, "changes-applied"] };
    case "CODE_RESET":
      return { ...state, phase: "broken-preview", fixture: "broken", feed: [...state.feed, "code-reset"] };
    case "BEGIN_VERIFICATION":
      return { ...state, phase: "verifying", feed: [...state.feed, "verification-started"] };
    case "RESULTS": {
      const verifiedObjectiveIds = addNewlyPassed(state.verifiedObjectiveIds, action.result.objectives);
      const won = missionComplete(verifiedObjectiveIds);
      const anyPassed = verifiedObjectiveIds.length > 0;
      const phase: MissionPhase = won ? "victory" : anyPassed ? "partial-success" : "failure";
      const outcome: FeedCode = won
        ? "verification-passed"
        : anyPassed
          ? "verification-partial"
          : "verification-failed";
      return {
        ...state,
        results: action.result.objectives,
        verifiedObjectiveIds,
        hp: bossHealthForVerifiedObjectives(verifiedObjectiveIds),
        phase,
        attempt: state.attempt + 1,
        history: [...state.history, action.result],
        feed: [...state.feed, outcome],
      };
    }
    case "SHOW_DEBRIEF":
      return state.phase === "victory" ? { ...state, phase: "debrief" } : state;
    case "REPLAY":
      return initialBattleState;
  }
}
