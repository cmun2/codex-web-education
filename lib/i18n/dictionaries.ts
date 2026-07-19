import type { MissionObjectiveId, ObjectiveStatus } from "@/lib/domain/mission";

export const supportedLocales = ["ko", "en"] as const;
export type Locale = (typeof supportedLocales)[number];

type Dictionary = {
  language: { label: string; korean: string; english: string };
  product: { workingTitle: string; mission: string; proposition: string; loopLabel: string; loop: readonly [string, string, string] };
  landing: { heading: string; body: string; start: string };
  briefing: { eyebrow: string; heading: string; body: string; objectivesHeading: string; enter: string };
  objectives: Record<MissionObjectiveId, { title: string; description: string; damage: string }>;
  fixture: {
    regionLabel: string;
    brokenLabel: string;
    repairedLabel: string;
    heading: string;
    introduction: string;
    expectedLabel: string;
    expected: string;
    failureLabel: string;
    failure: string;
    open: string;
    dialogTitle: string;
    dialogDescription: string;
    close: string;
    save: string;
  };
  mission: {
    heading: string;
    status: string;
    bossLabel: string;
    hp: (hp: number) => string;
    objectivesProgress: (passed: number) => string;
    fixtureStatus: (status: "broken" | "repaired") => string;
    phase: Record<"broken-preview" | "attempting" | "verifying" | "partial-success" | "failure" | "victory", string>;
  };
  actions: { applyRepair: string; runChecks: string; resetAttempt: string; askCoach: string; seeDebrief: string; replay: string };
  console: { heading: string; deterministic: string; empty: string };
  feed: Record<"entered-preview" | "repair-started" | "repair-applied" | "verification-started" | "verification-failed" | "verification-partial" | "verification-passed", string>;
  results: { heading: string; pending: string; passed: string; failed: string; checks: string; errors: string; none: string };
  checkLabels: Record<"identity" | "focus" | "keyboard", string>;
  failureCodes: Record<"DIALOG_IDENTITY_MISSING" | "FOCUS_CONTAINMENT_MISSING" | "KEYBOARD_ACTIONS_MISSING", string>;
  coach: { label: string; source: string; hint: string; whyLabel: string; why: string; inspectLabel: string; inspect: string; taunt: string; error: string };
  debrief: { eyebrow: string; heading: string; semanticsHeading: string; semantics: string; behaviorHeading: string; behavior: string };
  announcements: Record<"landing" | "briefing" | "broken-preview" | "attempting" | "verifying" | "partial-success" | "failure" | "victory" | "debrief", string>;
};

export const dictionaries = {
  ko: {
    language: { label: "언어 선택", korean: "한국어", english: "English" },
    product: {
      workingTitle: "프론트엔드 디버깅 아레나 — 작업명",
      mission: "첫 번째 미션 · 키보드 트랩 보스",
      proposition: "실제 프론트엔드 버그를 고치세요. 통과한 브라우저 검사 하나마다 보스가 피해를 입습니다.",
      loopLabel: "미션 진행 방식",
      loop: ["고장 난 인터페이스 살펴보기", "동작 수리하기", "검사를 통과해 보스 쓰러뜨리기"],
    },
    landing: { heading: "버그를 직접 경험하고, 고치고, 검증하세요.", body: "이 짧은 미션에서는 접근성을 망가뜨린 모달을 키보드로 조사합니다. 계정이나 AI 키 없이도 모든 과정이 결정적으로 동작합니다.", start: "미션 시작" },
    briefing: { eyebrow: "미션 브리핑", heading: "키보드 트랩 보스", body: "모달이 이름, 포커스 경계, 키보드 약속을 잃었습니다. 인터페이스 뒤의 사용자를 보호하도록 세 가지 동작을 복구하세요.", objectivesHeading: "승리 조건", enter: "고장 난 화면으로 이동" },
    objectives: {
      identity: { title: "대화상자 정체성", description: "모달 역할, 이름, 설명이 보조 기술에 전달됩니다.", damage: "피해 30" },
      focus: { title: "포커스 가두기", description: "포커스가 모달 안으로 이동해 머물고 닫은 뒤 원래 위치로 돌아갑니다.", damage: "피해 35" },
      keyboard: { title: "키보드와 동작", description: "Tab, Shift+Tab, Escape와 보이는 버튼이 일관되게 동작합니다.", damage: "피해 35" },
    },
    fixture: {
      regionLabel: "고장 난 UI 미리보기",
      brokenLabel: "고장 난 픽스처",
      repairedLabel: "수리된 픽스처",
      heading: "계정 보호 설정",
      introduction: "모달을 열고 마우스 없이 Tab, Shift+Tab, Escape를 사용해 보세요.",
      expectedLabel: "기대 동작",
      expected: "포커스가 모달 안으로 들어가 순환하고, Escape로 닫히며, 열기 버튼으로 돌아와야 합니다.",
      failureLabel: "현재 실패",
      failure: "모달에 접근 가능한 정체성이 없고 포커스가 들어오거나 갇히지 않으며 Escape로 닫히지 않습니다.",
      open: "보호 설정 열기",
      dialogTitle: "보호 설정 변경 확인",
      dialogDescription: "변경 사항은 이 계정을 보호하며 나중에 다시 검토할 수 있습니다.",
      close: "닫기",
      save: "보호 설정 저장",
    },
    mission: {
      heading: "보스 전투",
      status: "검증 현황",
      bossLabel: "키보드 트랩 보스",
      hp: (hp) => `보스 HP ${hp} / 100`,
      objectivesProgress: (passed) => `목표 ${passed} / 3`,
      fixtureStatus: (status) => `픽스처 ${status === "broken" ? "고장" : "수리됨"}`,
      phase: { "broken-preview": "고장 난 동작을 조사하는 중", attempting: "안내된 수리를 적용함", verifying: "브라우저 검사를 실행하는 중", "partial-success": "일부 검사 통과 — 수리가 더 필요함", failure: "검사 실패 — 고장 난 동작을 다시 살펴보세요", victory: "승리 — 모든 브라우저 검사 통과" },
    },
    actions: { applyRepair: "안내된 수리 적용", runChecks: "브라우저 검사 실행", resetAttempt: "시도 초기화", askCoach: "디버그 코치에게 묻기", seeDebrief: "학습 정리 보기", replay: "미션 다시 플레이" },
    console: { heading: "검증 콘솔", deterministic: "결정적 데모 제공자", empty: "아직 검사를 실행하지 않았습니다." },
    feed: { "entered-preview": "고장 난 픽스처를 불러왔습니다. 검사는 아직 실행하지 않았습니다.", "repair-started": "모달 계약을 조사하고 안내된 수리를 적용합니다.", "repair-applied": "안내된 수리를 적용했습니다. 결과를 확정하려면 브라우저 검사를 실행하세요.", "verification-started": "렌더링된 UI에서 브라우저 계약을 확인합니다.", "verification-failed": "통과한 목표가 없습니다. 픽스처는 여전히 고장 상태입니다.", "verification-partial": "일부 목표만 통과했습니다. HP는 통과한 검사로만 계산됩니다.", "verification-passed": "모든 브라우저 검사가 통과했습니다. 키보드 트랩 보스를 쓰러뜨렸습니다." },
    results: { heading: "브라우저 검사 결과", pending: "대기", passed: "통과", failed: "실패", checks: "확인", errors: "오류", none: "검사 전" },
    checkLabels: { identity: "역할, 모달 상태, 이름과 설명 참조를 확인했습니다.", focus: "초기 포커스와 순환 포커스 계약을 확인했습니다.", keyboard: "닫기, 기본 동작, Escape와 포커스 복귀 계약을 확인했습니다." },
    failureCodes: { DIALOG_IDENTITY_MISSING: "대화상자의 역할, 모달 상태, 이름 또는 설명이 없습니다.", FOCUS_CONTAINMENT_MISSING: "포커스가 대화상자 안에 있지 않거나 순환 계약이 없습니다.", KEYBOARD_ACTIONS_MISSING: "키보드 닫기, 동작 또는 포커스 복귀 계약이 없습니다." },
    coach: { label: "결정적 데모 코치", source: "데모 코치", hint: "대화상자 계약부터 시작하세요. 이름을 연결하고 모달임을 표시한 뒤 포커스를 안으로 옮기세요.", whyLabel: "중요한 이유", why: "그렇지 않으면 키보드 및 보조 기술 사용자가 위치와 맥락을 잃습니다.", inspectLabel: "다음 확인", inspect: "대화상자 요소, 이름·설명 참조, 첫 번째 포커스 가능 컨트롤을 확인하세요.", taunt: "보기 좋은 모달도 키보드가 빠져나가면 여전히 함정이지!", error: "데모 코치 답변을 불러오지 못했습니다. 미션은 계속 진행할 수 있습니다." },
    debrief: { eyebrow: "미션 완료", heading: "학습 정리", semanticsHeading: "의미가 먼저입니다", semantics: "대화상자 역할과 접근 가능한 이름은 보조 기술에 목적과 맥락을 전달합니다. 화면 모양만으로는 이 계약을 만들 수 없습니다.", behaviorHeading: "사용자 동작으로 검증하세요", behavior: "포커스는 모달 안으로 들어가 머물고 닫을 때 트리거로 돌아가야 합니다. 비슷한 버그에서는 역할, 이름과 설명 참조, 포커스 순서, Escape 닫기, 포커스 복귀를 확인하세요." },
    announcements: { landing: "미션 시작 화면", briefing: "미션 브리핑", "broken-preview": "고장 난 픽스처 준비 완료. 검사는 실행되지 않았습니다.", attempting: "안내된 수리를 적용했습니다.", verifying: "브라우저 검사를 실행합니다.", "partial-success": "일부 검사만 통과했습니다.", failure: "브라우저 검사가 실패했습니다.", victory: "모든 검사 통과. 보스를 쓰러뜨렸습니다.", debrief: "학습 정리" },
  },
  en: {
    language: { label: "Choose language", korean: "한국어", english: "English" },
    product: {
      workingTitle: "Frontend Debugging Arena — Working Title",
      mission: "Mission one · Keyboard Trap Boss",
      proposition: "Fix real frontend bugs. Every passing browser check damages the boss.",
      loopLabel: "The mission loop",
      loop: ["Inspect the broken interface", "Repair the behavior", "Pass checks and defeat the boss"],
    },
    landing: { heading: "Experience the bug. Repair it. Prove it.", body: "In this short mission, investigate an accessibility-breaking modal using only the keyboard. The whole flow works deterministically without an account or AI key.", start: "Start Mission" },
    briefing: { eyebrow: "Mission briefing", heading: "Keyboard Trap Boss", body: "The modal lost its identity, focus boundary, and keyboard contract. Restore all three behaviors to protect the users behind the interface.", objectivesHeading: "Victory conditions", enter: "Enter broken preview" },
    objectives: {
      identity: { title: "Dialog identity", description: "The modal role, name, and description reach assistive technology.", damage: "30 damage" },
      focus: { title: "Focus containment", description: "Focus enters the modal, stays inside, and returns after close.", damage: "35 damage" },
      keyboard: { title: "Keyboard & actions", description: "Tab, Shift+Tab, Escape, and visible controls behave consistently.", damage: "35 damage" },
    },
    fixture: {
      regionLabel: "Broken UI preview",
      brokenLabel: "Broken Fixture",
      repairedLabel: "Repaired Fixture",
      heading: "Account safeguards",
      introduction: "Open the modal and try Tab, Shift+Tab, and Escape without using a mouse.",
      expectedLabel: "Expected Behavior",
      expected: "Focus should enter and loop within the modal, Escape should close it, and focus should return to the opener.",
      failureLabel: "Current Failure",
      failure: "The modal has no accessible identity, focus does not enter or stay inside, and Escape does not close it.",
      open: "Open safeguards",
      dialogTitle: "Confirm safeguard changes",
      dialogDescription: "Changes protect this account and can be reviewed later.",
      close: "Close",
      save: "Save safeguards",
    },
    mission: {
      heading: "Boss battle",
      status: "Verification status",
      bossLabel: "Keyboard Trap Boss",
      hp: (hp) => `Boss HP ${hp} / 100`,
      objectivesProgress: (passed) => `Objectives ${passed} / 3`,
      fixtureStatus: (status) => `Fixture ${status === "broken" ? "Broken" : "Repaired"}`,
      phase: { "broken-preview": "Inspecting the broken behavior", attempting: "Guided repair applied", verifying: "Running browser checks", "partial-success": "Some checks passed — more repair needed", failure: "Checks failed — inspect the broken behavior again", victory: "Victory — all browser checks passed" },
    },
    actions: { applyRepair: "Apply guided repair", runChecks: "Run browser checks", resetAttempt: "Reset attempt", askCoach: "Ask Debug Coach", seeDebrief: "View learning debrief", replay: "Replay mission" },
    console: { heading: "Verification console", deterministic: "Deterministic demo provider", empty: "No checks have run yet." },
    feed: { "entered-preview": "Broken fixture loaded. No checks have run yet.", "repair-started": "Inspecting the modal contract and applying the guided repair.", "repair-applied": "Guided repair applied. Run browser checks to establish the result.", "verification-started": "Checking the rendered browser contract.", "verification-failed": "No objectives passed. The fixture remains broken.", "verification-partial": "Only some objectives passed. HP comes only from verified checks.", "verification-passed": "All browser checks passed. Keyboard Trap Boss defeated." },
    results: { heading: "Browser check results", pending: "Pending", passed: "Passed", failed: "Failed", checks: "Verified", errors: "Errors", none: "Not run" },
    checkLabels: { identity: "Verified role, modal state, name, and description references.", focus: "Verified initial focus and the focus-loop contract.", keyboard: "Verified close, primary action, Escape, and focus-return contracts." },
    failureCodes: { DIALOG_IDENTITY_MISSING: "Dialog role, modal state, name, or description is missing.", FOCUS_CONTAINMENT_MISSING: "Focus is outside the dialog or the focus-loop contract is missing.", KEYBOARD_ACTIONS_MISSING: "Keyboard close, action, or focus-return contract is missing." },
    coach: { label: "Deterministic demo coach", source: "Demo Coach", hint: "Start with the dialog contract: connect its name, mark it modal, then move focus inside.", whyLabel: "Why it matters", why: "Keyboard and assistive-technology users otherwise lose their place or context.", inspectLabel: "Inspect next", inspect: "Inspect the dialog element, its label and description references, and the first focusable control.", taunt: "A pretty modal is still my trap if your keyboard can escape!", error: "The demo coach response could not load. You can continue the mission." },
    debrief: { eyebrow: "Mission complete", heading: "Learning debrief", semanticsHeading: "Meaning comes first", semantics: "Dialog semantics and an accessible name give assistive technology a clear purpose and context. Visual appearance alone cannot establish that contract.", behaviorHeading: "Verify user behavior", behavior: "Focus must enter a modal, remain there, and return to its trigger when it closes. For a similar bug, inspect role, name and description references, focus order, Escape close, and focus restoration." },
    announcements: { landing: "Mission landing screen", briefing: "Mission briefing", "broken-preview": "Broken fixture ready. Checks have not run.", attempting: "Guided repair applied.", verifying: "Running browser checks.", "partial-success": "Some browser checks passed.", failure: "Browser checks failed.", victory: "All checks passed. Boss defeated.", debrief: "Learning debrief" },
  },
} satisfies Record<Locale, Dictionary>;

export type MissionDictionary = Dictionary;

export const statusLabel = (dictionary: MissionDictionary, status: ObjectiveStatus): string => dictionary.results[status];
