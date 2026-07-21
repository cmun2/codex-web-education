import type { DialogCodeState } from "@/lib/domain/mission";

export const brokenDialogCode: DialogCodeState = {
  dialogRole: "none",
  ariaModal: false,
  ariaLabelledBy: "none",
  ariaDescribedBy: "none",
  escapeCloses: false,
  focusContainment: false,
  focusRestoration: false,
  actionDisplay: "grid",
  actionDirection: "column",
  actionAlign: "stretch",
  actionJustify: "flex-start",
  actionGap: 0,
};

export const repairedDialogCode: DialogCodeState = {
  dialogRole: "dialog",
  ariaModal: true,
  ariaLabelledBy: "dialog-title",
  ariaDescribedBy: "dialog-description",
  escapeCloses: true,
  focusContainment: true,
  focusRestoration: true,
  actionDisplay: "flex",
  actionDirection: "row",
  actionAlign: "center",
  actionJustify: "flex-end",
  actionGap: 16,
};

export type DialogPresetId =
  | "everything-missing"
  | "unnamed-modal"
  | "keyboard-trap"
  | "layout-collapse"
  | "vertical-actions"
  | "misaligned-actions"
  | "cramped-actions";
export type DialogRepairField = keyof DialogCodeState;
export type RepairTabId = "accessibility" | "css";

export const accessibilityRepairFields: readonly DialogRepairField[] = [
  "dialogRole",
  "ariaModal",
  "ariaLabelledBy",
  "ariaDescribedBy",
  "escapeCloses",
  "focusContainment",
  "focusRestoration",
];

export const cssRepairFields: readonly DialogRepairField[] = [
  "actionDisplay",
  "actionDirection",
  "actionAlign",
  "actionJustify",
  "actionGap",
];

export const repairTabForField = (field: DialogRepairField): RepairTabId =>
  cssRepairFields.some((candidate) => candidate === field) ? "css" : "accessibility";

export type DialogPreset = {
  id: DialogPresetId;
  code: DialogCodeState;
};

export const dialogPresets: readonly DialogPreset[] = [
  { id: "everything-missing", code: brokenDialogCode },
  {
    id: "unnamed-modal",
    code: {
      ...repairedDialogCode,
      ariaLabelledBy: "none",
      ariaDescribedBy: "none",
    },
  },
  {
    id: "layout-collapse",
    code: {
      ...repairedDialogCode,
      actionDisplay: "grid",
      actionDirection: "column",
      actionAlign: "stretch",
      actionJustify: "flex-start",
      actionGap: 0,
    },
  },
  {
    id: "vertical-actions",
    code: {
      ...repairedDialogCode,
      actionDirection: "column",
    },
  },
  {
    id: "misaligned-actions",
    code: {
      ...repairedDialogCode,
      actionAlign: "stretch",
      actionJustify: "space-between",
    },
  },
  {
    id: "cramped-actions",
    code: {
      ...repairedDialogCode,
      actionGap: 0,
    },
  },
  {
    id: "keyboard-trap",
    code: {
      ...repairedDialogCode,
      escapeCloses: false,
      focusRestoration: false,
    },
  },
] as const;

export const dialogPreset = (id: DialogPresetId): DialogCodeState => {
  const preset = dialogPresets.find((candidate) => candidate.id === id) ?? dialogPresets[0];
  return { ...preset.code };
};

const fieldNames = [
  "dialogRole",
  "ariaModal",
  "ariaLabelledBy",
  "ariaDescribedBy",
  "escapeCloses",
  "focusContainment",
  "focusRestoration",
  "actionDisplay",
  "actionDirection",
  "actionAlign",
  "actionJustify",
  "actionGap",
] as const;

export type CodeLabValidationError =
  | "NOT_AN_OBJECT"
  | "UNSUPPORTED_FIELD"
  | "INVALID_DIALOG_ROLE"
  | "INVALID_ARIA_MODAL"
  | "INVALID_LABEL_REFERENCE"
  | "INVALID_DESCRIPTION_REFERENCE"
  | "INVALID_ESCAPE_BEHAVIOR"
  | "INVALID_FOCUS_CONTAINMENT"
  | "INVALID_FOCUS_RESTORATION"
  | "INVALID_ACTION_DISPLAY"
  | "INVALID_ACTION_DIRECTION"
  | "INVALID_ACTION_ALIGN"
  | "INVALID_ACTION_JUSTIFY"
  | "INVALID_ACTION_GAP";

export type CodeLabValidation =
  | { ok: true; value: DialogCodeState }
  | { ok: false; errors: CodeLabValidationError[] };

const read = (input: object, key: string): unknown => Object.getOwnPropertyDescriptor(input, key)?.value;

export function validateDialogCodeState(input: unknown): CodeLabValidation {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, errors: ["NOT_AN_OBJECT"] };
  }

  const errors: CodeLabValidationError[] = [];
  if (Object.keys(input).some((key) => !fieldNames.some((fieldName) => fieldName === key))) errors.push("UNSUPPORTED_FIELD");

  const dialogRole = read(input, "dialogRole");
  const ariaModal = read(input, "ariaModal");
  const ariaLabelledBy = read(input, "ariaLabelledBy");
  const ariaDescribedBy = read(input, "ariaDescribedBy");
  const escapeCloses = read(input, "escapeCloses");
  const focusContainment = read(input, "focusContainment");
  const focusRestoration = read(input, "focusRestoration");
  const actionDisplay = read(input, "actionDisplay");
  const actionDirection = read(input, "actionDirection");
  const actionAlign = read(input, "actionAlign");
  const actionJustify = read(input, "actionJustify");
  const actionGap = read(input, "actionGap");

  if (dialogRole !== "none" && dialogRole !== "dialog") errors.push("INVALID_DIALOG_ROLE");
  if (typeof ariaModal !== "boolean") errors.push("INVALID_ARIA_MODAL");
  if (ariaLabelledBy !== "none" && ariaLabelledBy !== "dialog-title") errors.push("INVALID_LABEL_REFERENCE");
  if (ariaDescribedBy !== "none" && ariaDescribedBy !== "dialog-description") errors.push("INVALID_DESCRIPTION_REFERENCE");
  if (typeof escapeCloses !== "boolean") errors.push("INVALID_ESCAPE_BEHAVIOR");
  if (typeof focusContainment !== "boolean") errors.push("INVALID_FOCUS_CONTAINMENT");
  if (typeof focusRestoration !== "boolean") errors.push("INVALID_FOCUS_RESTORATION");
  if (actionDisplay !== "grid" && actionDisplay !== "flex") errors.push("INVALID_ACTION_DISPLAY");
  if (actionDirection !== "column" && actionDirection !== "row") errors.push("INVALID_ACTION_DIRECTION");
  if (actionAlign !== "stretch" && actionAlign !== "center") errors.push("INVALID_ACTION_ALIGN");
  if (actionJustify !== "flex-start" && actionJustify !== "flex-end" && actionJustify !== "space-between") errors.push("INVALID_ACTION_JUSTIFY");
  if (actionGap !== 0 && actionGap !== 8 && actionGap !== 16) errors.push("INVALID_ACTION_GAP");

  if (errors.length > 0) return { ok: false, errors };
  if (
    (dialogRole !== "none" && dialogRole !== "dialog") ||
    typeof ariaModal !== "boolean" ||
    (ariaLabelledBy !== "none" && ariaLabelledBy !== "dialog-title") ||
    (ariaDescribedBy !== "none" && ariaDescribedBy !== "dialog-description") ||
    typeof escapeCloses !== "boolean" ||
    typeof focusContainment !== "boolean" ||
    typeof focusRestoration !== "boolean" ||
    (actionDisplay !== "grid" && actionDisplay !== "flex") ||
    (actionDirection !== "column" && actionDirection !== "row") ||
    (actionAlign !== "stretch" && actionAlign !== "center") ||
    (actionJustify !== "flex-start" && actionJustify !== "flex-end" && actionJustify !== "space-between") ||
    (actionGap !== 0 && actionGap !== 8 && actionGap !== 16)
  ) {
    return { ok: false, errors: ["NOT_AN_OBJECT"] };
  }

  return {
    ok: true,
    value: {
      dialogRole,
      ariaModal,
      ariaLabelledBy,
      ariaDescribedBy,
      escapeCloses,
      focusContainment,
      focusRestoration,
      actionDisplay,
      actionDirection,
      actionAlign,
      actionJustify,
      actionGap,
    },
  };
}

export type CodeDiffLine = { kind: "same" | "added" | "removed"; text: string };

const sourceLines = (state: DialogCodeState, functionName = "DeleteAddressDialog"): string[] => [
  `function ${functionName}() {`,
  `  const escapeCloses = ${String(state.escapeCloses)};`,
  `  const containFocus = ${String(state.focusContainment)};`,
  `  const restoreFocus = ${String(state.focusRestoration)};`,
  `  const actionStyles = { display: "${state.actionDisplay}",`,
  `    flexDirection: "${state.actionDirection}", alignItems: "${state.actionAlign}",`,
  `    justifyContent: "${state.actionJustify}", gap: ${state.actionGap} };`,
  "  return (",
  `    <div role=${state.dialogRole === "none" ? "{undefined}" : '"dialog"'}`,
  `      aria-modal={${String(state.ariaModal)}}`,
  `      aria-labelledby=${state.ariaLabelledBy === "none" ? "{undefined}" : '"dialog-title"'}`,
  `      aria-describedby=${state.ariaDescribedBy === "none" ? "{undefined}" : '"dialog-description"'}>`,
  "      <DialogActions style={actionStyles} />",
  "    </div>",
  "  );",
  "}",
];

export const renderDialogCode = (state: DialogCodeState, functionName?: string): string => sourceLines(state, functionName).join("\n");

export function diffDialogCode(before: DialogCodeState, after: DialogCodeState, functionName?: string): CodeDiffLine[] {
  const beforeLines = sourceLines(before, functionName);
  const afterLines = sourceLines(after, functionName);
  const diff: CodeDiffLine[] = [];
  for (let index = 0; index < beforeLines.length; index += 1) {
    const previous = beforeLines[index];
    const next = afterLines[index];
    if (previous === next) {
      diff.push({ kind: "same", text: previous });
    } else {
      diff.push({ kind: "removed", text: previous });
      diff.push({ kind: "added", text: next });
    }
  }
  return diff;
}

export const isFullyRepaired = (state: DialogCodeState): boolean =>
  fieldNames.every((fieldName) => state[fieldName] === repairedDialogCode[fieldName]);

export const isRepairFieldResolved = (state: DialogCodeState, field: DialogRepairField): boolean =>
  state[field] === repairedDialogCode[field];

export const isActionLayoutRepaired = (state: DialogCodeState): boolean =>
  cssRepairFields.every((field) => isRepairFieldResolved(state, field));

export interface RepairProvider {
  readonly id: "deterministic";
  apply(input: unknown): CodeLabValidation;
  reset(): DialogCodeState;
  diff(state: DialogCodeState, baseline?: DialogCodeState, functionName?: string): CodeDiffLine[];
  source(state: DialogCodeState, functionName?: string): string;
}

export class AllowlistedDialogCodeLab implements RepairProvider {
  readonly id = "deterministic" as const;

  apply(input: unknown): CodeLabValidation {
    return validateDialogCodeState(input);
  }

  reset(): DialogCodeState {
    return { ...brokenDialogCode };
  }

  diff(state: DialogCodeState, baseline = brokenDialogCode, functionName?: string): CodeDiffLine[] {
    return diffDialogCode(baseline, state, functionName);
  }

  source(state: DialogCodeState, functionName?: string): string {
    return renderDialogCode(state, functionName);
  }
}
