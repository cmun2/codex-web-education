import type { ObjectiveEvaluator } from "@/lib/domain/providers";
import type {
  CheckCode,
  FailureCode,
  MissionObjectiveId,
  ObjectiveResult,
} from "@/lib/domain/mission";

const resultFor = (
  objectiveId: MissionObjectiveId,
  passed: boolean,
  checkCode: CheckCode,
  failureCode: FailureCode,
): ObjectiveResult => ({
  objectiveId,
  status: passed ? "passed" : "failed",
  checks: passed ? [checkCode] : [],
  failureCodes: passed ? [] : [failureCode],
});

const afterRender = (): Promise<void> =>
  new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      queueMicrotask(resolve);
    }
  });

const currentDialog = (root: HTMLElement): HTMLElement | null =>
  root.querySelector<HTMLElement>("[data-testid='mission-dialog']");

const openDialog = async (root: HTMLElement): Promise<HTMLElement | null> => {
  const existing = currentDialog(root);
  if (existing) return existing;
  root.querySelector<HTMLButtonElement>("[data-action='trigger']")?.click();
  await afterRender();
  return currentDialog(root);
};

const openFreshDialog = async (root: HTMLElement): Promise<HTMLElement | null> => {
  const existing = currentDialog(root);
  existing?.querySelector<HTMLButtonElement>("[data-action='close']")?.click();
  if (existing) await afterRender();
  return openDialog(root);
};

const hasReferencedText = (root: HTMLElement, id: string | null): boolean => {
  if (!id) return false;
  const referencedElement = root.ownerDocument.getElementById(id);
  return Boolean(referencedElement && root.contains(referencedElement) && referencedElement.textContent?.trim());
};

const dispatchKey = (target: HTMLElement, key: string, shiftKey = false): void => {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey, bubbles: true, cancelable: true }));
};

export class DialogObjectiveEvaluator implements ObjectiveEvaluator {
  async evaluate(root: HTMLElement): Promise<ObjectiveResult[]> {
    const dialog = await openFreshDialog(root);
    const labelledBy = dialog?.getAttribute("aria-labelledby") ?? null;
    const describedBy = dialog?.getAttribute("aria-describedby") ?? null;
    const identity = Boolean(
      dialog?.getAttribute("role") === "dialog" &&
        dialog.getAttribute("aria-modal") === "true" &&
        hasReferencedText(root, labelledBy) &&
        hasReferencedText(root, describedBy),
    );

    const closeButton = dialog?.querySelector<HTMLButtonElement>("[data-action='close']") ?? null;
    const primaryButton = dialog?.querySelector<HTMLButtonElement>("[data-action='primary']") ?? null;
    const actions = dialog?.querySelector<HTMLElement>("[data-dialog-actions]") ?? null;
    const actionsStyle = actions && root.ownerDocument.defaultView
      ? root.ownerDocument.defaultView.getComputedStyle(actions)
      : null;
    const layout = Boolean(
      actionsStyle?.display === "flex" &&
      actionsStyle.flexDirection === "row" &&
      Number.parseFloat(actionsStyle.gap || actionsStyle.columnGap) >= 8,
    );
    const initialFocusInside = Boolean(dialog?.contains(root.ownerDocument.activeElement));

    primaryButton?.focus();
    if (dialog) dispatchKey(dialog, "Tab");
    const forwardLooped = root.ownerDocument.activeElement === closeButton;
    closeButton?.focus();
    if (dialog) dispatchKey(dialog, "Tab", true);
    const backwardLooped = root.ownerDocument.activeElement === primaryButton;
    const focus = initialFocusInside && forwardLooped && backwardLooped;

    if (dialog) dispatchKey(dialog, "Escape");
    await afterRender();
    const trigger = root.querySelector<HTMLButtonElement>("[data-action='trigger']");
    const keyboard = currentDialog(root) === null && root.ownerDocument.activeElement === trigger;

    await openDialog(root);

    return [
      resultFor("identity", identity, "DIALOG_SEMANTICS_VERIFIED", "DIALOG_IDENTITY_MISSING"),
      resultFor("focus", focus, "FOCUS_LOOP_VERIFIED", "FOCUS_CONTAINMENT_MISSING"),
      resultFor("keyboard", keyboard, "ESCAPE_AND_RETURN_VERIFIED", "KEYBOARD_ACTIONS_MISSING"),
      resultFor("layout", layout, "ACTION_LAYOUT_VERIFIED", "ACTION_LAYOUT_BROKEN"),
    ];
  }

  async cleanup(root: HTMLElement): Promise<void> {
    const dialog = currentDialog(root);
    dialog?.querySelector<HTMLButtonElement>("[data-action='close']")?.click();
    if (dialog) await afterRender();
  }
}
