import type { ObjectiveEvaluator } from "@/lib/domain/providers";
import type { CheckCode, FailureCode, MissionObjectiveId, MissionScenarioId, ObjectiveResult } from "@/lib/domain/mission";

const resultFor = (objectiveId: MissionObjectiveId, passed: boolean, checkCode: CheckCode, failureCode: FailureCode): ObjectiveResult => ({ objectiveId, status: passed ? "passed" : "failed", checks: passed ? [checkCode] : [], failureCodes: passed ? [] : [failureCode] });
const afterRender = (): Promise<void> => new Promise((resolve) => { if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve()); else queueMicrotask(resolve); });
const currentDialog = (root: HTMLElement): HTMLElement | null => root.querySelector<HTMLElement>("[data-testid='mission-dialog']");
const openDialog = async (root: HTMLElement): Promise<HTMLElement | null> => { const existing = currentDialog(root); if (existing) return existing; root.querySelector<HTMLButtonElement>("[data-action='trigger']")?.click(); await afterRender(); return currentDialog(root); };
const openFreshDialog = async (root: HTMLElement): Promise<HTMLElement | null> => { const existing = currentDialog(root); existing?.querySelector<HTMLButtonElement>("[data-action='close']")?.click(); if (existing) await afterRender(); return openDialog(root); };
const hasReferencedText = (root: HTMLElement, id: string | null): boolean => { if (!id) return false; const element = root.ownerDocument.getElementById(id); return Boolean(element && root.contains(element) && element.textContent?.trim()); };
const dispatchKey = (target: HTMLElement, key: string, shiftKey = false): void => { target.dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey, bubbles: true, cancelable: true })); };
const numberFrom = (element: Element | null): number => Number.parseInt(element?.textContent?.trim() ?? "", 10);

export class DialogObjectiveEvaluator implements ObjectiveEvaluator {
  async evaluate(root: HTMLElement, scenarioId: MissionScenarioId): Promise<ObjectiveResult[]> {
    if (scenarioId === "motion-card") {
      const demo = root.querySelector<HTMLElement>("[data-motion-demo]");
      const stage = root.querySelector<HTMLElement>("[data-motion-safe]");
      const duration = Number.parseFloat(demo?.style.transitionDuration ?? "");
      const distance = Number.parseFloat(/translateX\((\d+)px\)/.exec(demo?.style.transform ?? "")?.[1] ?? "");
      return [
        resultFor("motion-timing", duration <= 1200 && distance <= 12, "MOTION_TIMING_VERIFIED", "MOTION_TIMING_BROKEN"),
        resultFor("motion-safety", stage?.dataset.motionSafe === "true", "REDUCED_MOTION_VERIFIED", "REDUCED_MOTION_MISSING"),
      ];
    }
    if (scenarioId === "ai-stream") {
      const demo = root.querySelector<HTMLElement>("[data-stream-protocol]");
      root.querySelector<HTMLButtonElement>("[data-action='run-stream']")?.click();
      await afterRender();
      const hasOutput = Boolean(root.querySelector<HTMLElement>("[data-stream-output]")?.textContent?.trim());
      return [
        resultFor("stream-protocol", hasOutput && demo?.dataset.streamProtocol === "event-stream" && demo.dataset.streamParsing === "event-lines", "EVENT_STREAM_VERIFIED", "EVENT_STREAM_BROKEN"),
        resultFor("stream-recovery", demo?.dataset.streamReconnect === "bounded", "STREAM_RECOVERY_VERIFIED", "STREAM_RECOVERY_BROKEN"),
      ];
    }
    if (scenarioId === "state-counter") {
      const demo = root.querySelector<HTMLElement>("[data-state-update]");
      root.querySelector<HTMLButtonElement>("[data-action='increment-state']")?.click();
      await afterRender();
      const viewAfterUpdate = numberFrom(root.querySelector("[data-state-view]"));
      const storeAfterUpdate = numberFrom(root.querySelector("[data-state-store]"));
      const updatePassed = demo?.dataset.stateUpdate === "immutable" && demo.dataset.stateSource === "single" && viewAfterUpdate === 1 && storeAfterUpdate === 1;
      root.querySelector<HTMLButtonElement>("[data-action='reset-state']")?.click();
      await afterRender();
      const resetPassed = demo?.dataset.stateReset === "reset" && demo.dataset.stateSource === "single" && numberFrom(root.querySelector("[data-state-view]")) === 0 && numberFrom(root.querySelector("[data-state-store]")) === 0;
      return [
        resultFor("state-update", updatePassed, "IMMUTABLE_UPDATE_VERIFIED", "STATE_MUTATION_BROKEN"),
        resultFor("state-reset", resetPassed, "STATE_RESET_VERIFIED", "STATE_RESET_BROKEN"),
      ];
    }

    const dialog = await openFreshDialog(root);
    const actions = dialog?.querySelector<HTMLElement>("[data-dialog-actions]") ?? null;
    const actionsStyle = actions && root.ownerDocument.defaultView ? root.ownerDocument.defaultView.getComputedStyle(actions) : null;
    const layout = Boolean(actionsStyle?.display === "flex" && actionsStyle.flexDirection === "row" && actionsStyle.alignItems === "center" && actionsStyle.justifyContent === "flex-end" && Number.parseFloat(actionsStyle.gap || actionsStyle.columnGap) >= 8);
    if (scenarioId === "checkout-sheet") return [resultFor("layout", layout, "ACTION_LAYOUT_VERIFIED", "ACTION_LAYOUT_BROKEN")];

    const labelledBy = dialog?.getAttribute("aria-labelledby") ?? null;
    const describedBy = dialog?.getAttribute("aria-describedby") ?? null;
    const identity = Boolean(dialog?.getAttribute("role") === "dialog" && dialog.getAttribute("aria-modal") === "true" && hasReferencedText(root, labelledBy) && hasReferencedText(root, describedBy));
    const closeButton = dialog?.querySelector<HTMLButtonElement>("[data-action='close']") ?? null;
    const primaryButton = dialog?.querySelector<HTMLButtonElement>("[data-action='primary']") ?? null;
    const initialFocusInside = Boolean(dialog?.contains(root.ownerDocument.activeElement));
    primaryButton?.focus(); if (dialog) dispatchKey(dialog, "Tab"); const forwardLooped = root.ownerDocument.activeElement === closeButton;
    closeButton?.focus(); if (dialog) dispatchKey(dialog, "Tab", true); const backwardLooped = root.ownerDocument.activeElement === primaryButton;
    const focus = initialFocusInside && forwardLooped && backwardLooped;
    if (dialog) dispatchKey(dialog, "Escape"); await afterRender();
    const trigger = root.querySelector<HTMLButtonElement>("[data-action='trigger']");
    const keyboard = currentDialog(root) === null && root.ownerDocument.activeElement === trigger;
    await openDialog(root);
    return [
      resultFor("identity", identity, "DIALOG_SEMANTICS_VERIFIED", "DIALOG_IDENTITY_MISSING"),
      resultFor("focus", focus, "FOCUS_LOOP_VERIFIED", "FOCUS_CONTAINMENT_MISSING"),
      resultFor("keyboard", keyboard, "ESCAPE_AND_RETURN_VERIFIED", "KEYBOARD_ACTIONS_MISSING"),
    ];
  }

  async cleanup(root: HTMLElement): Promise<void> {
    const dialog = currentDialog(root);
    dialog?.querySelector<HTMLButtonElement>("[data-action='close']")?.click();
    root.querySelector<HTMLButtonElement>("[data-action='reset-state']")?.click();
    if (dialog) await afterRender();
  }
}
