import { bossHealth, missionComplete, ObjectiveResult } from "@/lib/domain/mission";

export type BattlePhase = "idle" | "inspecting" | "repairing" | "evaluating" | "damaged" | "victory";
export type BattleState = { phase: BattlePhase; results: ObjectiveResult[]; hp: number; repaired: boolean; attempt: number; feed: string[] };
export type BattleAction =
  | { type: "START" }
  | { type: "REPAIRED" }
  | { type: "RESULTS"; results: ObjectiveResult[] }
  | { type: "RESET" };

export const initialBattleState: BattleState = { phase: "idle", results: [], hp: 100, repaired: false, attempt: 0, feed: ["Broken fixture loaded. Browser objectives are waiting."] };

export function battleReducer(state: BattleState, action: BattleAction): BattleState {
  if (action.type === "RESET") return { ...initialBattleState, attempt: state.attempt + 1 };
  if (action.type === "START") return { ...state, phase: "inspecting", feed: [...state.feed, "Inspecting dialog semantics and keyboard paths…", "Applying deterministic demo repair…"] };
  if (action.type === "REPAIRED") return { ...state, phase: "evaluating", repaired: true, feed: [...state.feed, "Repaired fixture mounted. Verifying user behavior…"] };
  const hp = bossHealth(action.results);
  return { ...state, results: action.results, hp, phase: missionComplete(action.results) ? "victory" : "damaged", feed: [...state.feed, ...action.results.map((result) => `${result.objectiveId}: ${result.status}`), missionComplete(action.results) ? "Acceptance checks complete. Keyboard Trap Boss defeated." : "Some browser objectives still fail."] };
}
