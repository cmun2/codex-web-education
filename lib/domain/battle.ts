import {
  bossHealthForVerifiedObjectives,
  damageForObjectives,
  missionComplete,
  xpForObjectives,
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
export type MissionRank = "S" | "A" | "B" | "C";
export type BattleHit = {
  attempt: number;
  objectiveIds: MissionObjectiveId[];
  damage: number;
  xp: number;
  combo: number;
  accessibilityCriticalHit: true;
};
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
  xpEarned: number;
  combo: number;
  lastHit: BattleHit | null;
  rank: MissionRank | null;
  perfectRepair: boolean;
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
  xpEarned: 0,
  combo: 0,
  lastHit: null,
  rank: null,
  perfectRepair: false,
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

const newlyPassed = (
  verified: readonly MissionObjectiveId[],
  results: readonly ObjectiveResult[],
): MissionObjectiveId[] => results
  .filter((result) => result.status === "passed" && !verified.includes(result.objectiveId))
  .map((result) => result.objectiveId);

export const rankForAttempts = (attempts: number): MissionRank => {
  if (attempts <= 1) return "S";
  if (attempts === 2) return "A";
  if (attempts === 3) return "B";
  return "C";
};

export function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case "START_MISSION":
      return { ...state, phase: "briefing" };
    case "ENTER_PREVIEW":
      return { ...state, phase: "broken-preview", feed: ["entered-preview"] };
    case "CHANGES_APPLIED":
      return { ...state, phase: "attempting", fixture: action.fixture, lastHit: null, feed: [...state.feed, "changes-applied"] };
    case "CODE_RESET":
      return { ...state, phase: "broken-preview", fixture: "broken", feed: [...state.feed, "code-reset"] };
    case "BEGIN_VERIFICATION":
      return { ...state, phase: "verifying", lastHit: null, feed: [...state.feed, "verification-started"] };
    case "RESULTS": {
      const newlyPassedObjectiveIds = newlyPassed(state.verifiedObjectiveIds, action.result.objectives);
      const verifiedObjectiveIds = addNewlyPassed(state.verifiedObjectiveIds, action.result.objectives);
      const won = missionComplete(verifiedObjectiveIds);
      const anyPassed = verifiedObjectiveIds.length > 0;
      const phase: MissionPhase = won ? "victory" : anyPassed ? "partial-success" : "failure";
      const outcome: FeedCode = won
        ? "verification-passed"
        : anyPassed
          ? "verification-partial"
          : "verification-failed";
      const damage = damageForObjectives(newlyPassedObjectiveIds);
      const xp = xpForObjectives(newlyPassedObjectiveIds);
      const combo = newlyPassedObjectiveIds.length > 0 ? state.combo + newlyPassedObjectiveIds.length : 0;
      const attempts = state.history.length + 1;
      return {
        ...state,
        results: action.result.objectives,
        verifiedObjectiveIds,
        hp: bossHealthForVerifiedObjectives(verifiedObjectiveIds),
        phase,
        attempt: state.attempt + 1,
        history: [...state.history, action.result],
        feed: [...state.feed, outcome],
        xpEarned: state.xpEarned + xp,
        combo,
        lastHit: newlyPassedObjectiveIds.length > 0
          ? {
              attempt: action.result.attempt.number,
              objectiveIds: newlyPassedObjectiveIds,
              damage,
              xp,
              combo,
              accessibilityCriticalHit: true,
            }
          : null,
        rank: won ? rankForAttempts(attempts) : null,
        perfectRepair: won && attempts === 1,
      };
    }
    case "SHOW_DEBRIEF":
      return state.phase === "victory" ? { ...state, phase: "debrief" } : state;
    case "REPLAY":
      return initialBattleState;
  }
}
