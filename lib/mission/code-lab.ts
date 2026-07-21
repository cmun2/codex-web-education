import type { DialogCodeState } from "@/lib/domain/mission";

export const brokenDialogCode: DialogCodeState = {
  dialogRole: "none",
  ariaModal: false,
  ariaLabelledBy: "none",
  ariaDescribedBy: "none",
  escapeCloses: false,
  focusContainment: false,
  focusRestoration: false,
  actionLayout: "overlap",
};

export const repairedDialogCode: DialogCodeState = {
  dialogRole: "dialog",
  ariaModal: true,
  ariaLabelledBy: "dialog-title",
  ariaDescribedBy: "dialog-description",
  escapeCloses: true,
  focusContainment: true,
  focusRestoration: true,
  actionLayout: "flex-row",
};

export type DialogPresetId = "everything-missing" | "unnamed-modal" | "keyboard-trap" | "layout-collapse";
export type DialogRepairField = keyof DialogCodeState;

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
      actionLayout: "overlap",
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
  "actionLayout",
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
  | "INVALID_ACTION_LAYOUT";

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
  const actionLayout = read(input, "actionLayout");

  if (dialogRole !== "none" && dialogRole !== "dialog") errors.push("INVALID_DIALOG_ROLE");
  if (typeof ariaModal !== "boolean") errors.push("INVALID_ARIA_MODAL");
  if (ariaLabelledBy !== "none" && ariaLabelledBy !== "dialog-title") errors.push("INVALID_LABEL_REFERENCE");
  if (ariaDescribedBy !== "none" && ariaDescribedBy !== "dialog-description") errors.push("INVALID_DESCRIPTION_REFERENCE");
  if (typeof escapeCloses !== "boolean") errors.push("INVALID_ESCAPE_BEHAVIOR");
  if (typeof focusContainment !== "boolean") errors.push("INVALID_FOCUS_CONTAINMENT");
  if (typeof focusRestoration !== "boolean") errors.push("INVALID_FOCUS_RESTORATION");
  if (actionLayout !== "overlap" && actionLayout !== "flex-row") errors.push("INVALID_ACTION_LAYOUT");

  if (errors.length > 0) return { ok: false, errors };
  if (
    (dialogRole !== "none" && dialogRole !== "dialog") ||
    typeof ariaModal !== "boolean" ||
    (ariaLabelledBy !== "none" && ariaLabelledBy !== "dialog-title") ||
    (ariaDescribedBy !== "none" && ariaDescribedBy !== "dialog-description") ||
    typeof escapeCloses !== "boolean" ||
    typeof focusContainment !== "boolean" ||
    typeof focusRestoration !== "boolean" ||
    (actionLayout !== "overlap" && actionLayout !== "flex-row")
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
      actionLayout,
    },
  };
}

export type CodeDiffLine = { kind: "same" | "added" | "removed"; text: string };

const sourceLines = (state: DialogCodeState): string[] => [
  "function DeleteAddressDialog() {",
  `  const escapeCloses = ${String(state.escapeCloses)};`,
  `  const containFocus = ${String(state.focusContainment)};`,
  `  const restoreFocus = ${String(state.focusRestoration)};`,
  `  const actionLayout = "${state.actionLayout}";`,
  "  return (",
  `    <div role=${state.dialogRole === "none" ? "{undefined}" : '"dialog"'}`,
  `      aria-modal={${String(state.ariaModal)}}`,
  `      aria-labelledby=${state.ariaLabelledBy === "none" ? "{undefined}" : '"dialog-title"'}`,
  `      aria-describedby=${state.ariaDescribedBy === "none" ? "{undefined}" : '"dialog-description"'}>`,
  "      <DialogActions layout={actionLayout} />",
  "    </div>",
  "  );",
  "}",
];

export const renderDialogCode = (state: DialogCodeState): string => sourceLines(state).join("\n");

export function diffDialogCode(before: DialogCodeState, after: DialogCodeState): CodeDiffLine[] {
  const beforeLines = sourceLines(before);
  const afterLines = sourceLines(after);
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

export interface RepairProvider {
  readonly id: "deterministic";
  apply(input: unknown): CodeLabValidation;
  reset(): DialogCodeState;
  diff(state: DialogCodeState): CodeDiffLine[];
  source(state: DialogCodeState): string;
}

export class AllowlistedDialogCodeLab implements RepairProvider {
  readonly id = "deterministic" as const;

  apply(input: unknown): CodeLabValidation {
    return validateDialogCodeState(input);
  }

  reset(): DialogCodeState {
    return { ...brokenDialogCode };
  }

  diff(state: DialogCodeState): CodeDiffLine[] {
    return diffDialogCode(brokenDialogCode, state);
  }

  source(state: DialogCodeState): string {
    return renderDialogCode(state);
  }
}
