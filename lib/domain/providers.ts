import type { ObjectiveResult, ObjectiveStatus } from "@/lib/domain/mission";

export interface ObjectiveEvaluator {
  evaluate(root: HTMLElement): Promise<ObjectiveResult[]>;
}

export type CoachInsight = {
  source: "deterministic-demo";
  hintCode: "dialog-contract";
};

export interface CoachProvider {
  coach(input: { objectiveStatuses: readonly ObjectiveStatus[]; attempt: number }): Promise<CoachInsight>;
}

export class DeterministicCoachProvider implements CoachProvider {
  async coach(input: { objectiveStatuses: readonly ObjectiveStatus[]; attempt: number }): Promise<CoachInsight> {
    void input;
    return { source: "deterministic-demo", hintCode: "dialog-contract" };
  }
}
