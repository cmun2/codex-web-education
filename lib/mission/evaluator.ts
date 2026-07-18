import { ObjectiveEvaluator } from "@/lib/domain/providers";
import { ObjectiveResult } from "@/lib/domain/mission";

export class DialogObjectiveEvaluator implements ObjectiveEvaluator {
  evaluate(root: HTMLElement): ObjectiveResult[] {
    const dialog = root.querySelector<HTMLElement>("[data-testid='mission-dialog']");
    const labelled = dialog?.getAttribute("aria-labelledby");
    const described = dialog?.getAttribute("aria-describedby");
    const identity = Boolean(dialog?.getAttribute("role") === "dialog" && dialog?.getAttribute("aria-modal") === "true" && labelled && described && root.querySelector(`#${labelled}`)?.textContent);
    const focus = Boolean(dialog?.contains(document.activeElement) && dialog?.querySelector("[data-focus-loop='true']"));
    const keyboard = Boolean(dialog?.querySelector("[data-action='close']") && dialog?.querySelector("[data-action='primary']"));
    const result = (objectiveId: ObjectiveResult["objectiveId"], pass: boolean, code: string): ObjectiveResult => ({ objectiveId, status: pass ? "passed" : "failed", checks: pass ? ["Rendered behavior verified"] : [], failureCodes: pass ? [] : [code] });
    return [result("identity", identity, "DIALOG_IDENTITY_MISSING"), result("focus", focus, "FOCUS_CONTAINMENT_MISSING"), result("keyboard", keyboard, "KEYBOARD_ACTIONS_MISSING")];
  }
}
