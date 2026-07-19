import type { ObjectiveEvaluator } from "@/lib/domain/providers";
import type { FailureCode, MissionAttempt, MissionObjectiveId, ObjectiveResult, VerificationResult } from "@/lib/domain/mission";

const resultFor = (objectiveId: MissionObjectiveId, passed: boolean, failureCode: FailureCode): ObjectiveResult => ({
  objectiveId,
  status: passed ? "passed" : "failed",
  checks: passed ? [objectiveId] : [],
  failureCodes: passed ? [] : [failureCode],
});

export class DialogObjectiveEvaluator implements ObjectiveEvaluator {
  evaluate(root: HTMLElement, attempt: MissionAttempt): VerificationResult {
    const dialog = root.querySelector<HTMLElement>("[data-testid='mission-dialog']");
    const labelledBy = dialog?.getAttribute("aria-labelledby");
    const describedBy = dialog?.getAttribute("aria-describedby");
    const hasReferencedText = (id: string | null | undefined): boolean => {
      if (!id) return false;
      const referencedElement = root.ownerDocument.getElementById(id);
      return Boolean(referencedElement && root.contains(referencedElement) && referencedElement.textContent?.trim());
    };

    const identity = Boolean(
      dialog?.getAttribute("role") === "dialog" &&
        dialog.getAttribute("aria-modal") === "true" &&
        hasReferencedText(labelledBy) &&
        hasReferencedText(describedBy),
    );
    const focus = Boolean(dialog?.contains(document.activeElement) && dialog.dataset.initialFocus === "true" && dialog.dataset.focusLoop === "true");
    const keyboard = Boolean(
      dialog?.querySelector("[data-action='close']") &&
        dialog.querySelector("[data-action='primary']") &&
        dialog.dataset.keyboardContract === "true" &&
        dialog.dataset.focusReturn === "true",
    );

    const objectives = [
      resultFor("identity", identity, "DIALOG_IDENTITY_MISSING"),
      resultFor("focus", focus, "FOCUS_CONTAINMENT_MISSING"),
      resultFor("keyboard", keyboard, "KEYBOARD_ACTIONS_MISSING"),
    ];

    return {
      attempt,
      objectives,
      evidence: objectives.map((objective) => ({ objectiveId: objective.objectiveId, contract: "rendered-dom", passed: objective.status === "passed" })),
    };
  }
}
