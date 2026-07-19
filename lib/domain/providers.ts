import type { MissionAttempt, ObjectiveStatus, VerificationResult } from "@/lib/domain/mission";

export type RepairProgressEvent = { code: "repair-started" | "repair-applied" };

export interface CodeLab {
  applyGuidedRepair(onProgress: (event: RepairProgressEvent) => void): Promise<void>;
}

export interface ObjectiveEvaluator {
  evaluate(root: HTMLElement, attempt: MissionAttempt): VerificationResult;
}

export type CoachInsight = {
  source: "deterministic-demo";
  hintCode: "dialog-contract";
};

export interface CoachProvider {
  coach(input: { objectiveStatuses: readonly ObjectiveStatus[]; attempt: number }): Promise<CoachInsight>;
}

export class DeterministicCodeLab implements CodeLab {
  async applyGuidedRepair(onProgress: (event: RepairProgressEvent) => void): Promise<void> {
    onProgress({ code: "repair-started" });
    await Promise.resolve();
    onProgress({ code: "repair-applied" });
  }
}

export class DeterministicCoachProvider implements CoachProvider {
  async coach(input: { objectiveStatuses: readonly ObjectiveStatus[]; attempt: number }): Promise<CoachInsight> {
    void input;
    return { source: "deterministic-demo", hintCode: "dialog-contract" };
  }
}
