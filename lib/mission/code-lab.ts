import type { DialogCodeState } from "@/lib/domain/mission";

export const repairedDialogCode: DialogCodeState = {
  dialogRole: "dialog", ariaModal: true, ariaLabelledBy: "dialog-title", ariaDescribedBy: "dialog-description",
  escapeCloses: true, focusContainment: true, focusRestoration: true,
  actionDisplay: "flex", actionDirection: "row", actionAlign: "center", actionJustify: "flex-end", actionGap: 16,
  motionDuration: 1200, motionDistance: 12, reducedMotionSafe: true,
  streamProtocol: "event-stream", streamParsing: "event-lines", streamReconnect: "bounded",
  stateUpdate: "immutable", stateReset: "reset", stateSource: "single",
};

export const brokenDialogCode: DialogCodeState = {
  ...repairedDialogCode,
  dialogRole: "none", ariaModal: false, ariaLabelledBy: "none", ariaDescribedBy: "none",
  escapeCloses: false, focusContainment: false, focusRestoration: false,
};

export type DialogPresetId =
  | "everything-missing" | "unnamed-modal" | "keyboard-trap"
  | "layout-collapse" | "vertical-actions" | "misaligned-actions" | "cramped-actions"
  | "motion-marathon" | "motion-no-fallback"
  | "stream-buffered" | "stream-reconnect-loop"
  | "state-mutation" | "state-stale-reset";
export type DialogRepairField = keyof DialogCodeState;
export type RepairTabId = "accessibility" | "css" | "motion" | "stream" | "state";

export const accessibilityRepairFields: readonly DialogRepairField[] = ["dialogRole", "ariaModal", "ariaLabelledBy", "ariaDescribedBy", "escapeCloses", "focusContainment", "focusRestoration"];
export const cssRepairFields: readonly DialogRepairField[] = ["actionDisplay", "actionDirection", "actionAlign", "actionJustify", "actionGap"];
export const motionRepairFields: readonly DialogRepairField[] = ["motionDuration", "motionDistance", "reducedMotionSafe"];
export const streamRepairFields: readonly DialogRepairField[] = ["streamProtocol", "streamParsing", "streamReconnect"];
export const stateRepairFields: readonly DialogRepairField[] = ["stateUpdate", "stateReset", "stateSource"];
export const repairFieldsByTab: Record<RepairTabId, readonly DialogRepairField[]> = {
  accessibility: accessibilityRepairFields, css: cssRepairFields, motion: motionRepairFields, stream: streamRepairFields, state: stateRepairFields,
};

export type DialogPreset = { id: DialogPresetId; code: DialogCodeState };
export const dialogPresets: readonly DialogPreset[] = [
  { id: "everything-missing", code: brokenDialogCode },
  { id: "unnamed-modal", code: { ...repairedDialogCode, ariaLabelledBy: "none", ariaDescribedBy: "none" } },
  { id: "keyboard-trap", code: { ...repairedDialogCode, escapeCloses: false, focusRestoration: false } },
  { id: "layout-collapse", code: { ...repairedDialogCode, actionDisplay: "grid", actionDirection: "column", actionAlign: "stretch", actionJustify: "flex-start", actionGap: 0 } },
  { id: "vertical-actions", code: { ...repairedDialogCode, actionDirection: "column" } },
  { id: "misaligned-actions", code: { ...repairedDialogCode, actionAlign: "stretch", actionJustify: "space-between" } },
  { id: "cramped-actions", code: { ...repairedDialogCode, actionGap: 0 } },
  { id: "motion-marathon", code: { ...repairedDialogCode, motionDuration: 8000, motionDistance: 48, reducedMotionSafe: false } },
  { id: "motion-no-fallback", code: { ...repairedDialogCode, reducedMotionSafe: false } },
  { id: "stream-buffered", code: { ...repairedDialogCode, streamProtocol: "buffered", streamParsing: "raw", streamReconnect: "unbounded" } },
  { id: "stream-reconnect-loop", code: { ...repairedDialogCode, streamReconnect: "unbounded" } },
  { id: "state-mutation", code: { ...repairedDialogCode, stateUpdate: "mutate", stateReset: "keep-stale", stateSource: "duplicated" } },
  { id: "state-stale-reset", code: { ...repairedDialogCode, stateReset: "keep-stale", stateSource: "duplicated" } },
] as const;

export const dialogPreset = (id: DialogPresetId): DialogCodeState => ({ ...(dialogPresets.find((preset) => preset.id === id) ?? dialogPresets[0]).code });

const fieldNames: readonly DialogRepairField[] = [
  "dialogRole", "ariaModal", "ariaLabelledBy", "ariaDescribedBy", "escapeCloses", "focusContainment", "focusRestoration",
  "actionDisplay", "actionDirection", "actionAlign", "actionJustify", "actionGap", "motionDuration", "motionDistance",
  "reducedMotionSafe", "streamProtocol", "streamParsing", "streamReconnect", "stateUpdate", "stateReset", "stateSource",
];
export type CodeLabValidationError =
  | "NOT_AN_OBJECT" | "UNSUPPORTED_FIELD" | "INVALID_DIALOG_ROLE" | "INVALID_ARIA_MODAL" | "INVALID_LABEL_REFERENCE" | "INVALID_DESCRIPTION_REFERENCE"
  | "INVALID_ESCAPE_BEHAVIOR" | "INVALID_FOCUS_CONTAINMENT" | "INVALID_FOCUS_RESTORATION" | "INVALID_ACTION_DISPLAY" | "INVALID_ACTION_DIRECTION"
  | "INVALID_ACTION_ALIGN" | "INVALID_ACTION_JUSTIFY" | "INVALID_ACTION_GAP" | "INVALID_MOTION_DURATION" | "INVALID_MOTION_DISTANCE" | "INVALID_REDUCED_MOTION"
  | "INVALID_STREAM_PROTOCOL" | "INVALID_STREAM_PARSING" | "INVALID_STREAM_RECONNECT" | "INVALID_STATE_UPDATE" | "INVALID_STATE_RESET" | "INVALID_STATE_SOURCE";
export type CodeLabValidation = { ok: true; value: DialogCodeState } | { ok: false; errors: CodeLabValidationError[] };
const read = (input: object, key: string): unknown => Object.getOwnPropertyDescriptor(input, key)?.value;

export function validateDialogCodeState(input: unknown): CodeLabValidation {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return { ok: false, errors: ["NOT_AN_OBJECT"] };
  const errors: CodeLabValidationError[] = [];
  if (Object.keys(input).some((key) => !fieldNames.some((field) => field === key))) errors.push("UNSUPPORTED_FIELD");
  const dialogRole = read(input, "dialogRole"), ariaModal = read(input, "ariaModal"), ariaLabelledBy = read(input, "ariaLabelledBy"), ariaDescribedBy = read(input, "ariaDescribedBy");
  const escapeCloses = read(input, "escapeCloses"), focusContainment = read(input, "focusContainment"), focusRestoration = read(input, "focusRestoration");
  const actionDisplay = read(input, "actionDisplay"), actionDirection = read(input, "actionDirection"), actionAlign = read(input, "actionAlign"), actionJustify = read(input, "actionJustify"), actionGap = read(input, "actionGap");
  const motionDuration = read(input, "motionDuration"), motionDistance = read(input, "motionDistance"), reducedMotionSafe = read(input, "reducedMotionSafe");
  const streamProtocol = read(input, "streamProtocol"), streamParsing = read(input, "streamParsing"), streamReconnect = read(input, "streamReconnect");
  const stateUpdate = read(input, "stateUpdate"), stateReset = read(input, "stateReset"), stateSource = read(input, "stateSource");
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
  if (motionDuration !== 8000 && motionDuration !== 1200) errors.push("INVALID_MOTION_DURATION");
  if (motionDistance !== 48 && motionDistance !== 12) errors.push("INVALID_MOTION_DISTANCE");
  if (typeof reducedMotionSafe !== "boolean") errors.push("INVALID_REDUCED_MOTION");
  if (streamProtocol !== "buffered" && streamProtocol !== "event-stream") errors.push("INVALID_STREAM_PROTOCOL");
  if (streamParsing !== "raw" && streamParsing !== "event-lines") errors.push("INVALID_STREAM_PARSING");
  if (streamReconnect !== "unbounded" && streamReconnect !== "bounded") errors.push("INVALID_STREAM_RECONNECT");
  if (stateUpdate !== "mutate" && stateUpdate !== "immutable") errors.push("INVALID_STATE_UPDATE");
  if (stateReset !== "keep-stale" && stateReset !== "reset") errors.push("INVALID_STATE_RESET");
  if (stateSource !== "duplicated" && stateSource !== "single") errors.push("INVALID_STATE_SOURCE");
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: {
    dialogRole: dialogRole === "dialog" ? "dialog" : "none",
    ariaModal: ariaModal === true,
    ariaLabelledBy: ariaLabelledBy === "dialog-title" ? "dialog-title" : "none",
    ariaDescribedBy: ariaDescribedBy === "dialog-description" ? "dialog-description" : "none",
    escapeCloses: escapeCloses === true,
    focusContainment: focusContainment === true,
    focusRestoration: focusRestoration === true,
    actionDisplay: actionDisplay === "flex" ? "flex" : "grid",
    actionDirection: actionDirection === "row" ? "row" : "column",
    actionAlign: actionAlign === "center" ? "center" : "stretch",
    actionJustify: actionJustify === "flex-end" ? "flex-end" : actionJustify === "space-between" ? "space-between" : "flex-start",
    actionGap: actionGap === 16 ? 16 : actionGap === 8 ? 8 : 0,
    motionDuration: motionDuration === 1200 ? 1200 : 8000,
    motionDistance: motionDistance === 12 ? 12 : 48,
    reducedMotionSafe: reducedMotionSafe === true,
    streamProtocol: streamProtocol === "event-stream" ? "event-stream" : "buffered",
    streamParsing: streamParsing === "event-lines" ? "event-lines" : "raw",
    streamReconnect: streamReconnect === "bounded" ? "bounded" : "unbounded",
    stateUpdate: stateUpdate === "immutable" ? "immutable" : "mutate",
    stateReset: stateReset === "reset" ? "reset" : "keep-stale",
    stateSource: stateSource === "single" ? "single" : "duplicated",
  } };
}

export type CodeDiffLine = { kind: "same" | "added" | "removed"; text: string };
const sourceLines = (state: DialogCodeState, functionName = "DeleteAddressDialog"): string[] => [
  `function ${functionName}() {`,
  `  const a11y = { role: "${state.dialogRole}", modal: ${state.ariaModal}, labelledBy: "${state.ariaLabelledBy}", describedBy: "${state.ariaDescribedBy}", escape: ${state.escapeCloses}, trap: ${state.focusContainment}, restore: ${state.focusRestoration} };`,
  `  const actionCss = { display: "${state.actionDisplay}", flexDirection: "${state.actionDirection}", alignItems: "${state.actionAlign}", justifyContent: "${state.actionJustify}", gap: ${state.actionGap} };`,
  `  const motion = { duration: ${state.motionDuration}, distance: ${state.motionDistance}, reducedMotionSafe: ${state.reducedMotionSafe} };`,
  `  const stream = { protocol: "${state.streamProtocol}", parsing: "${state.streamParsing}", reconnect: "${state.streamReconnect}" };`,
  `  const state = { update: "${state.stateUpdate}", reset: "${state.stateReset}", source: "${state.stateSource}" };`,
  "  return <InteractiveFixture a11y={a11y} actionCss={actionCss} motion={motion} stream={stream} state={state} />;",
  "}",
];
export const renderDialogCode = (state: DialogCodeState, functionName?: string): string => sourceLines(state, functionName).join("\n");
export function diffDialogCode(before: DialogCodeState, after: DialogCodeState, functionName?: string): CodeDiffLine[] {
  const previous = sourceLines(before, functionName), next = sourceLines(after, functionName), diff: CodeDiffLine[] = [];
  for (let index = 0; index < previous.length; index += 1) {
    if (previous[index] === next[index]) diff.push({ kind: "same", text: previous[index] });
    else diff.push({ kind: "removed", text: previous[index] }, { kind: "added", text: next[index] });
  }
  return diff;
}
export const isFullyRepaired = (state: DialogCodeState): boolean => fieldNames.every((field) => state[field] === repairedDialogCode[field]);
export const isRepairFieldResolved = (state: DialogCodeState, field: DialogRepairField): boolean => state[field] === repairedDialogCode[field];
export const isActionLayoutRepaired = (state: DialogCodeState): boolean => cssRepairFields.every((field) => isRepairFieldResolved(state, field));

export interface RepairProvider { readonly id: "deterministic"; apply(input: unknown): CodeLabValidation; reset(): DialogCodeState; diff(state: DialogCodeState, baseline?: DialogCodeState, functionName?: string): CodeDiffLine[]; source(state: DialogCodeState, functionName?: string): string }
export class AllowlistedDialogCodeLab implements RepairProvider {
  readonly id = "deterministic" as const;
  apply(input: unknown): CodeLabValidation { return validateDialogCodeState(input); }
  reset(): DialogCodeState { return { ...brokenDialogCode }; }
  diff(state: DialogCodeState, baseline = brokenDialogCode, functionName?: string): CodeDiffLine[] { return diffDialogCode(baseline, state, functionName); }
  source(state: DialogCodeState, functionName?: string): string { return renderDialogCode(state, functionName); }
}
