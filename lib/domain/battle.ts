import { bossHealth, missionComplete, type ObjectiveResult, type VerificationResult } from "@/lib/domain/mission";

export type MissionPhase = "landing" | "briefing" | "broken-preview" | "attempting" | "verifying" | "partial-success" | "failure" | "victory" | "debrief";
export type FixtureStatus = "broken" | "repaired";
export type FeedCode = "entered-preview" | "repair-started" | "repair-applied" | "verification-started" | "verification-failed" | "verification-partial" | "verification-passed";

export type BattleState = {
  phase: MissionPhase;
  results: ObjectiveResult[];
  hp: number;
  fixture: FixtureStatus;
  attempt: number;
  feed: FeedCode[];
};

export type BattleAction =
  | { type: "START_MISSION" }
  | { type: "ENTER_PREVIEW" }
  | { type: "BEGIN_REPAIR" }
  | { type: "REPAIR_APPLIED" }
  | { type: "BEGIN_VERIFICATION" }
  | { type: "RESULTS"; result: VerificationResult }
  | { type: "RESET_ATTEMPT" }
  | { type: "SHOW_DEBRIEF" }
  | { type: "REPLAY" };

export const initialBattleState: BattleState = {
  phase: "landing",
  results: [],
  hp: 100,
  fixture: "broken",
  attempt: 1,
  feed: [],
};

const verificationPhase = (results: readonly ObjectiveResult[]): "partial-success" | "failure" | "victory" => {
  if (missionComplete(results)) return "victory";
  return results.some((result) => result.status === "passed") ? "partial-success" : "failure";
};

export function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case "START_MISSION":
      return { ...state, phase: "briefing" };
    case "ENTER_PREVIEW":
      return { ...state, phase: "broken-preview", feed: ["entered-preview"] };
    case "BEGIN_REPAIR":
      return { ...state, phase: "attempting", feed: [...state.feed, "repair-started"] };
    case "REPAIR_APPLIED":
      return { ...state, fixture: "repaired", feed: [...state.feed, "repair-applied"] };
    case "BEGIN_VERIFICATION":
      return { ...state, phase: "verifying", feed: [...state.feed, "verification-started"] };
    case "RESULTS": {
      const results = action.result.objectives;
      const phase = verificationPhase(results);
      const outcome: FeedCode = phase === "victory" ? "verification-passed" : phase === "partial-success" ? "verification-partial" : "verification-failed";
      return { ...state, results, hp: bossHealth(results), phase, feed: [...state.feed, outcome] };
    }
    case "RESET_ATTEMPT":
      return { ...initialBattleState, phase: "broken-preview", attempt: state.attempt + 1, feed: ["entered-preview"] };
    case "SHOW_DEBRIEF":
      return state.phase === "victory" ? { ...state, phase: "debrief" } : state;
    case "REPLAY":
      return initialBattleState;
  }
}
