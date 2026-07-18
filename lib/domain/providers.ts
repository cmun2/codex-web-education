import { ObjectiveResult, ObjectiveStatus } from "@/lib/domain/mission";

export type RepairProgressEvent = { message: string };
export interface RepairProvider { repair(onProgress: (event: RepairProgressEvent) => void): Promise<void>; }
export interface ObjectiveEvaluator { evaluate(root: HTMLElement): ObjectiveResult[]; }
export type CoachInsight = { hint: string; whyItMatters: string; inspectNext: string; bossTaunt: string; source: "Demo Coach" | "Live Codex Coach" };
export interface CoachProvider { coach(input: { objectiveStatuses: ObjectiveStatus[]; attempt: number }): Promise<CoachInsight>; }

export class MockRepairProvider implements RepairProvider {
  async repair(onProgress: (event: RepairProgressEvent) => void) { onProgress({ message: "Mapped the dialog’s interactive controls." }); onProgress({ message: "Restored semantics, focus management, and keyboard handlers." }); }
}

export class DeterministicCoachProvider implements CoachProvider {
  async coach(input: { objectiveStatuses: ObjectiveStatus[]; attempt: number }): Promise<CoachInsight> { void input; return { source: "Demo Coach", hint: "Start with the dialog contract: name it, mark it modal, then move focus into it.", whyItMatters: "Keyboard and assistive-technology users otherwise lose their place or context.", inspectNext: "Inspect the dialog element, its labelled-by and described-by references, and the first focusable control.", bossTaunt: "A pretty modal is still my trap if your keyboard can escape." }; }
}
