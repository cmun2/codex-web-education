import type {
  DialogCodeState,
  MissionObjectiveId,
  ObjectiveResult,
  SnapshotEvidence,
} from "@/lib/domain/mission";
import { validateDialogCodeState } from "@/lib/mission/code-lab";

export const coachMissionIds = ["keyboard-trap", "flex-tangle"] as const;
export type CoachMissionId = (typeof coachMissionIds)[number];
export const coachMissionId: CoachMissionId = "keyboard-trap";
const isCoachMissionId = (value: unknown): value is CoachMissionId =>
  value === "keyboard-trap" || value === "flex-tangle";
export const maxCoachImageBytes = 512_000;
export const maxCoachRequestBytes = 1_750_000;

export type CoachSnapshot = Pick<
  SnapshotEvidence,
  "contract" | "regionTestId" | "dimensions" | "imageDataUrl"
>;

export type CoachInput = {
  missionId: CoachMissionId;
  failedObjectiveIds: readonly MissionObjectiveId[];
  codeState: DialogCodeState;
  snapshot: CoachSnapshot;
  attemptNumber: number;
  locale: "ko" | "en";
};

export type CoachStructuredOutput = {
  observation: string;
  hint: string;
  whyItMatters: string;
  inspectNext: string;
  bossTaunt: string;
};

export type CoachInsight = CoachStructuredOutput & {
  provider: "demo" | "local-vision";
  usedFallback: boolean;
  hintLevel: 1 | 2 | 3;
};

export interface CoachProvider {
  readonly id: "demo" | "local-vision";
  coach(input: CoachInput): Promise<CoachInsight>;
}

export interface ObjectiveEvaluator {
  evaluate(root: HTMLElement): Promise<ObjectiveResult[]>;
  cleanup(root: HTMLElement): Promise<void>;
}

export type CoachInputError =
  | "INVALID_INPUT"
  | "UNSUPPORTED_FIELD"
  | "INVALID_MISSION"
  | "INVALID_OBJECTIVES"
  | "INVALID_CODE_STATE"
  | "INVALID_SNAPSHOT"
  | "INVALID_IMAGE"
  | "IMAGE_TOO_LARGE"
  | "INVALID_ATTEMPT"
  | "INVALID_LOCALE";

export type CoachInputValidation =
  | { ok: true; value: CoachInput }
  | { ok: false; error: CoachInputError };

export type CoachOutputValidation =
  | { ok: true; value: CoachStructuredOutput }
  | { ok: false };

const objectiveIds: readonly MissionObjectiveId[] = ["identity", "focus", "keyboard", "layout"];
const inputFields = [
  "missionId",
  "failedObjectiveIds",
  "codeState",
  "snapshot",
  "attemptNumber",
  "locale",
] as const;
const snapshotFields = ["contract", "regionTestId", "dimensions", "imageDataUrl"] as const;
const dimensionFields = ["width", "height"] as const;
const outputFields = ["observation", "hint", "whyItMatters", "inspectNext", "bossTaunt"] as const;

const isObject = (value: unknown): value is object =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const read = (input: object, key: string): unknown =>
  Object.getOwnPropertyDescriptor(input, key)?.value;

const hasOnlyFields = (input: object, fields: readonly string[]): boolean => {
  const keys = Object.keys(input);
  return keys.length === fields.length && keys.every((key) => fields.some((field) => field === key));
};

const imageInfo = (imageDataUrl: string): { byteLength: number; safeFormat: boolean } | null => {
  const svgPrefix = "data:image/svg+xml;charset=utf-8,";
  if (imageDataUrl.startsWith(svgPrefix)) {
    try {
      const decoded = decodeURIComponent(imageDataUrl.slice(svgPrefix.length));
      const unsafeSvg = /<\s*(script|iframe|object|embed)\b|<!doctype|<!entity|\son[a-z]+\s*=|(?:href|src)\s*=\s*["']\s*(?:https?:|javascript:|data:)|url\s*\(|@import/i;
      return {
        byteLength: new TextEncoder().encode(decoded).byteLength,
        safeFormat: /^<svg\b/i.test(decoded.trim()) && !unsafeSvg.test(decoded),
      };
    } catch {
      return null;
    }
  }

  const match = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]*={0,2})$/.exec(imageDataUrl);
  if (!match) return null;
  const payload = match[2];
  if (payload.length === 0 || payload.length % 4 !== 0) return null;
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  const format = match[1];
  return {
    byteLength: (payload.length / 4) * 3 - padding,
    safeFormat: format === "png" ? payload.startsWith("iVBORw0KGgo") : payload.startsWith("/9j/"),
  };
};

const validateSnapshot = (input: unknown): { ok: true; value: CoachSnapshot } | { ok: false; error: CoachInputError } => {
  if (!isObject(input) || !hasOnlyFields(input, snapshotFields)) return { ok: false, error: "INVALID_SNAPSHOT" };
  const contract = read(input, "contract");
  const regionTestId = read(input, "regionTestId");
  const dimensions = read(input, "dimensions");
  const imageDataUrl = read(input, "imageDataUrl");
  if (contract !== "fixture-region-v1" || regionTestId !== "mission-fixture") return { ok: false, error: "INVALID_SNAPSHOT" };
  if (!isObject(dimensions) || !hasOnlyFields(dimensions, dimensionFields)) return { ok: false, error: "INVALID_SNAPSHOT" };
  const width = read(dimensions, "width");
  const height = read(dimensions, "height");
  if (
    typeof width !== "number" ||
    typeof height !== "number" ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 2_000 ||
    height > 2_000
  ) return { ok: false, error: "INVALID_SNAPSHOT" };
  if (typeof imageDataUrl !== "string") return { ok: false, error: "INVALID_IMAGE" };
  const image = imageInfo(imageDataUrl);
  if (image === null) return { ok: false, error: "INVALID_IMAGE" };
  if (image.byteLength > maxCoachImageBytes) return { ok: false, error: "IMAGE_TOO_LARGE" };
  if (!image.safeFormat) return { ok: false, error: "INVALID_IMAGE" };
  return {
    ok: true,
    value: { contract, regionTestId, dimensions: { width, height }, imageDataUrl },
  };
};

export function validateCoachInput(input: unknown): CoachInputValidation {
  if (!isObject(input)) return { ok: false, error: "INVALID_INPUT" };
  if (!hasOnlyFields(input, inputFields)) return { ok: false, error: "UNSUPPORTED_FIELD" };

  const missionId = read(input, "missionId");
  const failedObjectiveIds = read(input, "failedObjectiveIds");
  const codeState = validateDialogCodeState(read(input, "codeState"));
  const snapshot = validateSnapshot(read(input, "snapshot"));
  const attemptNumber = read(input, "attemptNumber");
  const locale = read(input, "locale");

  if (!isCoachMissionId(missionId)) return { ok: false, error: "INVALID_MISSION" };
  if (!Array.isArray(failedObjectiveIds) || failedObjectiveIds.length < 1 || failedObjectiveIds.length > objectiveIds.length) {
    return { ok: false, error: "INVALID_OBJECTIVES" };
  }
  const requestedObjectives: MissionObjectiveId[] = [];
  for (let index = 0; index < failedObjectiveIds.length; index += 1) {
    const id = read(failedObjectiveIds, String(index));
    if (
      (id !== "identity" && id !== "focus" && id !== "keyboard" && id !== "layout") ||
      requestedObjectives.some((objectiveId) => objectiveId === id)
    ) return { ok: false, error: "INVALID_OBJECTIVES" };
    requestedObjectives.push(id);
  }
  if (!codeState.ok) return { ok: false, error: "INVALID_CODE_STATE" };
  if (!snapshot.ok) return snapshot;
  if (typeof attemptNumber !== "number" || !Number.isInteger(attemptNumber) || attemptNumber < 1 || attemptNumber > 999) {
    return { ok: false, error: "INVALID_ATTEMPT" };
  }
  if (locale !== "ko" && locale !== "en") return { ok: false, error: "INVALID_LOCALE" };

  const sanitizedObjectives: MissionObjectiveId[] = [];
  for (const objectiveId of objectiveIds) {
    if (requestedObjectives.some((failedId) => failedId === objectiveId)) sanitizedObjectives.push(objectiveId);
  }
  return {
    ok: true,
    value: {
      missionId,
      failedObjectiveIds: sanitizedObjectives,
      codeState: codeState.value,
      snapshot: snapshot.value,
      attemptNumber,
      locale,
    },
  };
}

export function validateCoachStructuredOutput(input: unknown): CoachOutputValidation {
  if (!isObject(input) || !hasOnlyFields(input, outputFields)) return { ok: false };
  const values = outputFields.map((field) => read(input, field));
  if (values.some((value) => typeof value !== "string" || value.trim().length < 1 || value.length > 600)) {
    return { ok: false };
  }
  const [observation, hint, whyItMatters, inspectNext, bossTaunt] = values;
  if (
    typeof observation !== "string" ||
    typeof hint !== "string" ||
    typeof whyItMatters !== "string" ||
    typeof inspectNext !== "string" ||
    typeof bossTaunt !== "string"
  ) return { ok: false };
  return { ok: true, value: { observation, hint, whyItMatters, inspectNext, bossTaunt } };
}

const hintLevelForAttempt = (attemptNumber: number): 1 | 2 | 3 =>
  attemptNumber <= 1 ? 1 : attemptNumber === 2 ? 2 : 3;

const copyFor = (
  locale: "ko" | "en",
  objectiveId: MissionObjectiveId,
  level: 1 | 2 | 3,
): CoachStructuredOutput => {
  const english: Record<MissionObjectiveId, readonly [CoachStructuredOutput, CoachStructuredOutput, CoachStructuredOutput]> = {
    identity: [
      { observation: "The selected snapshot looks like a modal, but the failed identity check says its purpose is not exposed.", hint: "Start by giving the container dialog semantics.", whyItMatters: "Visual placement does not tell assistive technology that focus entered a dialog.", inspectNext: "Inspect the container role and modal state.", bossTaunt: "Looking like a dialog is not the same as being one!" },
      { observation: "Dialog semantics are still incomplete in this attempt.", hint: "Connect the visible title to the dialog with the allowlisted title reference.", whyItMatters: "A dialog needs a programmatic name so users know why it opened.", inspectNext: "Inspect role, aria-modal, and aria-labelledby together.", bossTaunt: "A nameless dialog keeps my trap mysterious!" },
      { observation: "The identity objective still reports a missing part of the complete dialog contract.", hint: "Complete all four identity controls: dialog role, modal state, title reference, and description reference.", whyItMatters: "The complete contract gives assistive technology both purpose and context.", inspectNext: "Compare every identity control with the visible title and description IDs.", bossTaunt: "One missing reference is all I need!" },
    ],
    focus: [
      { observation: "The failed focus check shows that keyboard focus is not reliably contained by the visible modal.", hint: "Move focus into the dialog when it opens.", whyItMatters: "Keyboard users need an immediate, predictable starting point.", inspectNext: "Inspect the first focusable dialog control.", bossTaunt: "Your focus wandered straight into my trap!" },
      { observation: "Focus reaches the dialog, but the focus-boundary objective still fails.", hint: "Keep Tab and Shift+Tab cycling between the first and last dialog controls.", whyItMatters: "Modal content must not let focus escape into the obscured page.", inspectNext: "Inspect both forward and reverse focus movement.", bossTaunt: "Forward or backward, I will find the gap!" },
      { observation: "The selected attempt still lacks the complete focus-loop contract.", hint: "Enable the allowlisted focus-containment behavior and verify both loop directions.", whyItMatters: "A complete loop makes the modal boundary predictable for every keyboard direction.", inspectNext: "Open the fixture and test Tab from the last control and Shift+Tab from the first.", bossTaunt: "Prove the whole loop, not just one lucky Tab!" },
    ],
    keyboard: [
      { observation: "The keyboard objective failed, so the visible close controls do not yet provide the complete keyboard exit path.", hint: "Make Escape close the dialog.", whyItMatters: "A standard keyboard dismissal gives users a fast, expected way out.", inspectNext: "Inspect the Escape-close control.", bossTaunt: "No Escape? Then you stay with me!" },
      { observation: "The dialog can close, but the attempt still fails the return-path contract.", hint: "Restore focus to the button that opened the dialog.", whyItMatters: "Returning focus lets keyboard users continue from the exact place they left.", inspectNext: "Inspect focus after closing with Escape.", bossTaunt: "Close the trap and I will still steal your place!" },
      { observation: "The selected attempt still lacks the full keyboard close-and-return behavior.", hint: "Enable both Escape dismissal and focus restoration, then verify the opener is focused.", whyItMatters: "Dismissal and restoration are one continuous keyboard interaction.", inspectNext: "Open, press Escape, and check the Delete address button for focus.", bossTaunt: "Two steps make the exit—miss either and I win!" },
    ],
    layout: [
      { observation: "The action buttons visibly collide, and the rendered layout check confirms that the CSS combination is incomplete.", hint: "Open CSS layout and start with the highlighted display setting; the remaining glow will show what is still unresolved.", whyItMatters: "A stable layout keeps destructive and cancel actions readable and separately targetable.", inspectNext: "Inspect display, direction, alignment, placement, and gap on the action group.", bossTaunt: "Overlapping buttons make every choice risky!" },
      { observation: "The action group still fails its rendered CSS contract.", hint: "Use a row direction and leave a visible gap between both buttons.", whyItMatters: "Direction without spacing can still make controls look merged.", inspectNext: "Inspect display, flex-direction, and gap together.", bossTaunt: "No gap, no clarity!" },
      { observation: "The selected attempt still has a collapsed action layout.", hint: "Open CSS layout and repair the highlighted display, direction, alignment, placement, and gap values one at a time.", whyItMatters: "The browser check must see the final computed flex layout, not just a code-like claim.", inspectNext: "Compare the rendered button group with each highlighted computed-CSS setting.", bossTaunt: "Only real rendered CSS can beat this trap!" },
    ],
  };
  if (locale === "en") return english[objectiveId][level - 1];

  const korean: Record<MissionObjectiveId, readonly [CoachStructuredOutput, CoachStructuredOutput, CoachStructuredOutput]> = {
    identity: [
      { observation: "선택한 스냅샷은 모달처럼 보이지만 정체성 검사가 목적을 전달하지 못했다고 보고합니다.", hint: "컨테이너에 먼저 대화상자 의미를 부여하세요.", whyItMatters: "화면 배치만으로는 보조 기술이 대화상자 진입을 알 수 없습니다.", inspectNext: "컨테이너 role과 모달 상태를 확인하세요.", bossTaunt: "대화상자처럼 보인다고 진짜 대화상자는 아니지!" },
      { observation: "이번 시도에서도 대화상자 의미 계약이 완전하지 않습니다.", hint: "허용된 제목 참조로 보이는 제목을 대화상자에 연결하세요.", whyItMatters: "사용자가 열린 이유를 알 수 있도록 대화상자에는 프로그램 방식의 이름이 필요합니다.", inspectNext: "role, aria-modal, aria-labelledby를 함께 확인하세요.", bossTaunt: "이름 없는 대화상자가 내 함정을 더 미스터리하게 만들지!" },
      { observation: "정체성 목표에 완전한 대화상자 계약 요소가 아직 빠져 있습니다.", hint: "dialog role, 모달 상태, 제목 참조, 설명 참조 네 항목을 모두 완성하세요.", whyItMatters: "완전한 계약이 보조 기술에 목적과 맥락을 함께 전달합니다.", inspectNext: "모든 정체성 제어 값을 보이는 제목과 설명 ID에 비교하세요.", bossTaunt: "참조 하나만 빠져도 내 승리야!" },
    ],
    focus: [
      { observation: "포커스 검사 실패는 키보드 포커스가 보이는 모달 안에 안정적으로 머물지 않음을 보여 줍니다.", hint: "대화상자가 열릴 때 포커스를 안으로 이동하세요.", whyItMatters: "키보드 사용자에게 즉시 예측 가능한 시작점이 필요합니다.", inspectNext: "대화상자의 첫 포커스 가능 컨트롤을 확인하세요.", bossTaunt: "포커스가 내 함정 밖으로 헤매는군!" },
      { observation: "포커스가 대화상자에 도달해도 경계 목표는 아직 실패합니다.", hint: "Tab과 Shift+Tab이 첫 컨트롤과 마지막 컨트롤 사이에서 순환하게 하세요.", whyItMatters: "모달은 포커스가 가려진 페이지로 빠져나가게 해서는 안 됩니다.", inspectNext: "정방향과 역방향 포커스 이동을 모두 확인하세요.", bossTaunt: "앞이든 뒤든 빈틈은 내가 찾는다!" },
      { observation: "선택한 시도에 완전한 포커스 순환 계약이 아직 없습니다.", hint: "허용된 포커스 가두기 동작을 켜고 두 순환 방향을 검증하세요.", whyItMatters: "완전한 순환은 모든 키보드 방향에서 모달 경계를 예측 가능하게 합니다.", inspectNext: "픽스처를 열고 마지막 컨트롤에서 Tab, 첫 컨트롤에서 Shift+Tab을 시험하세요.", bossTaunt: "운 좋은 Tab 한 번 말고 전체 순환을 증명해 봐!" },
    ],
    keyboard: [
      { observation: "키보드 목표가 실패해 보이는 닫기 컨트롤만으로는 완전한 키보드 탈출 경로가 없습니다.", hint: "Escape로 대화상자가 닫히게 하세요.", whyItMatters: "표준 키보드 닫기는 빠르고 예상 가능한 탈출 방법입니다.", inspectNext: "Escape 닫기 제어 값을 확인하세요.", bossTaunt: "Escape가 없으면 나와 계속 있어야지!" },
      { observation: "대화상자가 닫혀도 이번 시도는 복귀 경로 계약을 통과하지 못했습니다.", hint: "대화상자를 연 버튼으로 포커스를 되돌리세요.", whyItMatters: "포커스 복귀는 키보드 사용자가 중단한 정확한 위치에서 계속하게 합니다.", inspectNext: "Escape로 닫은 뒤 포커스를 확인하세요.", bossTaunt: "함정을 닫아도 네 자리는 내가 훔친다!" },
      { observation: "선택한 시도에 완전한 키보드 닫기와 복귀 동작이 아직 없습니다.", hint: "Escape 닫기와 포커스 복귀를 모두 켜고 열기 버튼에 포커스가 오는지 검증하세요.", whyItMatters: "닫기와 복귀는 하나의 연속된 키보드 상호작용입니다.", inspectNext: "열고 Escape를 누른 뒤 배송지 삭제 버튼의 포커스를 확인하세요.", bossTaunt: "탈출은 두 단계야. 하나라도 놓치면 내가 이긴다!" },
    ],
    layout: [
      { observation: "동작 버튼이 눈에 띄게 겹치고, 렌더된 배치 검사도 CSS 조합이 불완전하다고 확인했습니다.", hint: "CSS 배치 탭에서 표시된 display부터 바꾸세요. 남은 glow가 아직 고칠 값을 보여 줍니다.", whyItMatters: "안정적인 배치는 삭제와 취소 동작을 읽고 각각 누를 수 있게 합니다.", inspectNext: "동작 그룹의 display, 방향, 정렬, 배치, gap을 확인하세요.", bossTaunt: "겹친 버튼은 모든 선택을 위험하게 만들지!" },
      { observation: "동작 그룹이 아직 렌더된 CSS 계약을 통과하지 못했습니다.", hint: "row 방향을 사용하고 두 버튼 사이에 눈에 보이는 간격을 두세요.", whyItMatters: "방향만 맞아도 간격이 없으면 컨트롤이 하나처럼 보일 수 있습니다.", inspectNext: "display, flex-direction, gap을 함께 확인하세요.", bossTaunt: "간격이 없으면 구분도 없다!" },
      { observation: "선택한 시도의 동작 버튼 배치가 여전히 무너져 있습니다.", hint: "CSS 배치 탭에서 표시된 display, 방향, 정렬, 배치, gap 값을 하나씩 고치세요.", whyItMatters: "코드 설명이 아니라 브라우저의 최종 계산 배치가 검사를 통과해야 합니다.", inspectNext: "렌더된 버튼 그룹과 표시된 계산 CSS 설정을 하나씩 비교하세요.", bossTaunt: "진짜 렌더된 CSS만이 이 함정을 이길 수 있지!" },
    ],
  };
  return korean[objectiveId][level - 1];
};

export class DeterministicCoachProvider implements CoachProvider {
  readonly id = "demo" as const;

  async coach(input: CoachInput): Promise<CoachInsight> {
    const validated = validateCoachInput(input);
    if (!validated.ok) throw new Error(validated.error);
    const hintLevel = hintLevelForAttempt(validated.value.attemptNumber);
    const objectiveId = validated.value.failedObjectiveIds[0];
    return {
      ...copyFor(validated.value.locale, objectiveId, hintLevel),
      provider: this.id,
      usedFallback: false,
      hintLevel,
    };
  }
}
