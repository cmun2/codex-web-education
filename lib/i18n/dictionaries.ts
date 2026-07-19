import type { CheckCode, FailureCode, MissionObjectiveId, ObjectiveStatus } from "@/lib/domain/mission";
import type { MissionRank } from "@/lib/domain/battle";
import type { CodeLabValidationError } from "@/lib/mission/code-lab";

export const supportedLocales = ["ko", "en"] as const;
export type Locale = (typeof supportedLocales)[number];

type Dictionary = {
  language: { label: string; korean: string; english: string };
  product: { workingTitle: string; mission: string; proposition: string; loopLabel: string; loop: readonly [string, string, string] };
  landing: { heading: string; body: string; start: string };
  briefing: { eyebrow: string; heading: string; body: string; objectivesHeading: string; enter: string };
  objectives: Record<MissionObjectiveId, { title: string; description: string; behavior: string; codeArea: string; damage: string }>;
  fixture: {
    regionLabel: string;
    brokenLabel: string;
    modifiedLabel: string;
    repairedLabel: string;
    heading: string;
    introduction: string;
    expectedLabel: string;
    expected: string;
    failureLabel: string;
    failure: string;
    modifiedFailure: string;
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
    fixtureStatus: (status: "broken" | "modified" | "repaired") => string;
    phase: Record<"broken-preview" | "attempting" | "verifying" | "partial-success" | "failure" | "victory", string>;
  };
  actions: { askCoach: string; seeDebrief: string; replay: string };
  progression: {
    attempts: (attempts: number) => string;
    combo: (combo: number) => string;
    xp: (xp: number) => string;
    xpGain: (xp: number) => string;
    xpEarned: (xp: number) => string;
    totalXp: (xp: number) => string;
    rank: (rank: MissionRank) => string;
    victory: string;
    bossDefeated: string;
    criticalHit: string;
    perfectRepair: string;
    restoredHeading: string;
    hitAnnouncement: (damage: number, xp: number, combo: number) => string;
    storageFallback: string;
    soundOn: string;
    soundMuted: string;
    mute: string;
    unmute: string;
    teaserLabel: string;
    teaserTitle: string;
    teaserBody: string;
    unavailable: string;
  };
  codeLab: {
    eyebrow: string;
    heading: string;
    description: string;
    safeBadge: string;
    controlsLegend: string;
    fields: Record<"dialogRole" | "ariaModal" | "labelledBy" | "describedBy" | "escapeCloses" | "focusContainment" | "focusRestoration", string>;
    values: { none: string };
    validationHeading: string;
    validationErrors: Record<CodeLabValidationError, string>;
    sourceLabel: string;
    diffLabel: string;
    actions: { tryUi: string; apply: string; check: string; reset: string; diff: string };
  };
  history: {
    heading: string;
    empty: string;
    selectLabel: string;
    snapshotHeading: string;
    snapshotAlt: (attempt: number) => string;
    attempt: (attempt: number) => string;
    metadata: (attempt: number, locale: "ko" | "en", passed: number, capturedAt: string) => string;
    region: string;
  };
  console: { heading: string; deterministic: string; empty: string };
  feed: Record<"entered-preview" | "changes-applied" | "code-reset" | "verification-started" | "verification-failed" | "verification-partial" | "verification-passed", string>;
  results: { heading: string; pending: string; passed: string; failed: string; checks: string; errors: string; none: string; behavior: string; codeArea: string; verifiedResult: string };
  checkLabels: Record<CheckCode, string>;
  failureCodes: Record<FailureCode, string>;
  coach: {
    label: string;
    eyebrow: string;
    heading: string;
    description: string;
    ask: string;
    loading: string;
    loaded: string;
    revealed: string;
    afterFailure: string;
    demoLabel: string;
    localLabel: string;
    fallback: string;
    observationLabel: string;
    hintLabel: string;
    whyLabel: string;
    inspectLabel: string;
    returnToCodeLab: string;
    progress: (level: 1 | 2 | 3) => string;
    error: string;
  };
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
      identity: { title: "대화상자 정체성", description: "모달 역할, 이름, 설명이 보조 기술에 전달됩니다.", behavior: "스크린 리더가 대화상자 제목과 설명을 알립니다.", codeArea: "role, aria-modal, aria-labelledby, aria-describedby", damage: "피해 30" },
      focus: { title: "포커스 가두기", description: "포커스가 모달 안으로 이동해 머뭅니다.", behavior: "Tab과 Shift+Tab이 모달의 첫 컨트롤과 마지막 컨트롤 사이를 순환합니다.", codeArea: "focusContainment", damage: "피해 35" },
      keyboard: { title: "키보드와 동작", description: "Escape로 닫힌 뒤 포커스가 열기 버튼으로 돌아갑니다.", behavior: "키보드 사용자가 대화상자를 닫고 중단했던 위치에서 계속합니다.", codeArea: "escapeCloses, focusRestoration", damage: "피해 35" },
    },
    fixture: {
      regionLabel: "고장 난 UI 미리보기",
      brokenLabel: "고장 난 픽스처",
      modifiedLabel: "수정된 픽스처",
      repairedLabel: "수리된 픽스처",
      heading: "계정 보호 설정",
      introduction: "모달을 열고 마우스 없이 Tab, Shift+Tab, Escape를 사용해 보세요.",
      expectedLabel: "기대 동작",
      expected: "포커스가 모달 안으로 들어가 순환하고, Escape로 닫히며, 열기 버튼으로 돌아와야 합니다.",
      failureLabel: "현재 실패",
      failure: "모달에 접근 가능한 정체성이 없고 포커스가 들어오거나 갇히지 않으며 Escape로 닫히지 않습니다.",
      modifiedFailure: "일부 구현 값이 변경되었습니다. 브라우저 검사를 실행해 실제 동작을 확인하세요.",
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
      fixtureStatus: (status) => `픽스처 ${status === "broken" ? "고장" : status === "modified" ? "수정됨" : "수리됨"}`,
      phase: { "broken-preview": "고장 난 동작을 조사하는 중", attempting: "코드 변경 사항을 적용함", verifying: "브라우저 검사를 실행하는 중", "partial-success": "일부 검사 통과 — 수리가 더 필요함", failure: "검사 실패 — 고장 난 동작을 다시 살펴보세요", victory: "승리 — 모든 브라우저 검사 통과" },
    },
    actions: { askCoach: "디버그 코치에게 묻기", seeDebrief: "학습 정리 보기", replay: "미션 다시 플레이" },
    progression: {
      attempts: (attempts) => `시도 ${attempts}회`,
      combo: (combo) => `연속 통과 콤보 ×${combo}`,
      xp: (xp) => `미션 XP ${xp}`,
      xpGain: (xp) => `+${xp} XP`,
      xpEarned: (xp) => `획득 XP ${xp}`,
      totalXp: (xp) => `총 XP ${xp}`,
      rank: (rank) => `미션 랭크 ${rank}`,
      victory: "승리",
      bossDefeated: "보스 격파",
      criticalHit: "접근성 크리티컬 히트",
      perfectRepair: "완벽한 수리",
      restoredHeading: "복구한 사용자 동작",
      hitAnnouncement: (damage, xp, combo) => `검증된 새 목표로 보스에게 ${damage} 피해, ${xp} XP를 획득했습니다. 연속 통과 콤보 ${combo}. 접근성 크리티컬 히트.`,
      storageFallback: "브라우저 저장소를 사용할 수 없어 이 세션에서만 진행 상황을 유지합니다. 미션은 계속 플레이할 수 있습니다.",
      soundOn: "전투 소리 켜짐. 음소거하기",
      soundMuted: "전투 소리 꺼짐. 소리 켜기",
      mute: "음소거",
      unmute: "소리 켜기",
      teaserLabel: "다음 미션 미리보기",
      teaserTitle: "레이블 미궁",
      teaserBody: "폼 오류와 접근 가능한 이름을 복구하는 다음 미션이 준비 중입니다.",
      unavailable: "현재 이용할 수 없음",
    },
    codeLab: {
      eyebrow: "안전한 코드 실습",
      heading: "Code Lab",
      description: "허용된 구현 값만 바꾸세요. 아래 코드는 설명용 React 형태이며 실행하거나 평가하지 않습니다.",
      safeBadge: "허용 목록 DSL",
      controlsLegend: "대화상자 구현 값",
      fields: { dialogRole: "대화상자 role", ariaModal: "aria-modal 사용", labelledBy: "aria-labelledby", describedBy: "aria-describedby", escapeCloses: "Escape로 닫기", focusContainment: "포커스 순환", focusRestoration: "포커스 복귀" },
      values: { none: "없음" },
      validationHeading: "변경 사항을 적용하지 못했습니다",
      validationErrors: {
        NOT_AN_OBJECT: "구현 상태는 구조화된 허용 목록 값이어야 합니다.",
        UNSUPPORTED_FIELD: "지원하지 않는 구현 필드가 있습니다.",
        INVALID_DIALOG_ROLE: "role은 없음 또는 dialog만 가능합니다.",
        INVALID_ARIA_MODAL: "aria-modal 값이 올바르지 않습니다.",
        INVALID_LABEL_REFERENCE: "제목 참조가 허용 목록에 없습니다.",
        INVALID_DESCRIPTION_REFERENCE: "설명 참조가 허용 목록에 없습니다.",
        INVALID_ESCAPE_BEHAVIOR: "Escape 동작 값이 올바르지 않습니다.",
        INVALID_FOCUS_CONTAINMENT: "포커스 순환 값이 올바르지 않습니다.",
        INVALID_FOCUS_RESTORATION: "포커스 복귀 값이 올바르지 않습니다.",
      },
      sourceLabel: "React 형태 코드 표현",
      diffLabel: "고장 난 코드와 현재 코드 비교",
      actions: { tryUi: "고장 난 UI 체험", apply: "변경 사항 적용", check: "검사 실행", reset: "코드 초기화", diff: "차이 보기" },
    },
    history: {
      heading: "시도 기록 및 스냅샷 증거",
      empty: "검사를 실행하면 픽스처 영역의 증거가 여기에 저장됩니다.",
      selectLabel: "검증 시도 선택",
      snapshotHeading: "픽스처 스냅샷",
      snapshotAlt: (attempt) => `${attempt}번 시도의 픽스처 영역 스냅샷`,
      attempt: (attempt) => `시도 ${attempt}`,
      metadata: (attempt, locale, passed, capturedAt) => `시도 ${attempt} · ${locale} · 통과 ${passed}/3 · ${capturedAt}`,
      region: "캡처 영역",
    },
    console: { heading: "검증 콘솔", deterministic: "결정적 데모 제공자", empty: "아직 검사를 실행하지 않았습니다." },
    feed: { "entered-preview": "고장 난 픽스처를 불러왔습니다. 검사는 아직 실행하지 않았습니다.", "changes-applied": "검증된 허용 목록 값을 픽스처에 적용했습니다.", "code-reset": "코드를 최초의 고장 난 값으로 초기화했습니다.", "verification-started": "렌더링된 UI에서 실제 키보드 동작을 확인합니다.", "verification-failed": "이번 시도에서 통과한 목표가 없습니다.", "verification-partial": "일부 목표만 통과했습니다. 보스 피해는 새로 통과한 목표로만 계산됩니다.", "verification-passed": "검증 누적 결과로 모든 목표를 통과해 키보드 트랩 보스를 쓰러뜨렸습니다." },
    results: { heading: "브라우저 검사 결과", pending: "대기", passed: "통과", failed: "실패", checks: "확인", errors: "오류", none: "검사 전", behavior: "영향받는 사용자 동작", codeArea: "관련 코드 영역", verifiedResult: "검증 결과" },
    checkLabels: { DIALOG_SEMANTICS_VERIFIED: "역할, 모달 상태, 이름과 설명 참조를 실제 DOM에서 확인했습니다.", FOCUS_LOOP_VERIFIED: "초기 포커스와 양방향 순환을 실제 키보드 이벤트로 확인했습니다.", ESCAPE_AND_RETURN_VERIFIED: "Escape 닫기와 열기 버튼으로의 포커스 복귀를 확인했습니다." },
    failureCodes: { DIALOG_IDENTITY_MISSING: "대화상자의 역할, 모달 상태, 이름 또는 설명이 없습니다.", FOCUS_CONTAINMENT_MISSING: "포커스가 대화상자 안에 있지 않거나 순환 계약이 없습니다.", KEYBOARD_ACTIONS_MISSING: "키보드 닫기, 동작 또는 포커스 복귀 계약이 없습니다." },
    coach: {
      label: "비주얼 디버그 코치 응답",
      eyebrow: "요청할 때만 표시",
      heading: "비주얼 디버그 코치",
      description: "실패한 시도 스냅샷을 선택한 뒤 한 번에 한 단계의 힌트를 요청하세요.",
      ask: "비주얼 코치에게 묻기",
      loading: "선택한 스냅샷을 살펴보는 중…",
      loaded: "비주얼 코치가 단계별 힌트 하나를 준비했습니다.",
      revealed: "이 시도의 힌트 표시됨",
      afterFailure: "실패한 목표가 있는 시도를 선택하면 코치에게 물을 수 있습니다.",
      demoLabel: "데모 코치",
      localLabel: "로컬 비전 코치",
      fallback: "로컬 비전 코치를 사용할 수 없어 신뢰할 수 있는 데모 코치로 전환했습니다.",
      observationLabel: "시각적 관찰",
      hintLabel: "이번 힌트",
      whyLabel: "중요한 이유",
      inspectLabel: "다음 확인",
      returnToCodeLab: "Code Lab으로 돌아가기",
      progress: (level) => `단계별 힌트 ${level} / 3`,
      error: "코치 응답을 불러오지 못했습니다. 미션은 계속 진행할 수 있습니다.",
    },
    debrief: { eyebrow: "미션 완료", heading: "학습 정리", semanticsHeading: "의미가 먼저입니다", semantics: "대화상자 역할과 접근 가능한 이름은 보조 기술에 목적과 맥락을 전달합니다. 화면 모양만으로는 이 계약을 만들 수 없습니다.", behaviorHeading: "사용자 동작으로 검증하세요", behavior: "포커스는 모달 안으로 들어가 머물고 닫을 때 트리거로 돌아가야 합니다. 비슷한 버그에서는 역할, 이름과 설명 참조, 포커스 순서, Escape 닫기, 포커스 복귀를 확인하세요." },
    announcements: { landing: "미션 시작 화면", briefing: "미션 브리핑", "broken-preview": "고장 난 픽스처 준비 완료. 검사는 실행되지 않았습니다.", attempting: "코드 변경 사항을 적용했습니다.", verifying: "브라우저 검사를 실행합니다.", "partial-success": "일부 검사만 통과했습니다.", failure: "브라우저 검사가 실패했습니다.", victory: "모든 검사 통과. 보스를 쓰러뜨렸습니다.", debrief: "학습 정리" },
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
      identity: { title: "Dialog identity", description: "The modal role, name, and description reach assistive technology.", behavior: "A screen reader announces the dialog title and description.", codeArea: "role, aria-modal, aria-labelledby, aria-describedby", damage: "30 damage" },
      focus: { title: "Focus containment", description: "Focus enters the modal and stays inside.", behavior: "Tab and Shift+Tab loop between the first and last modal controls.", codeArea: "focusContainment", damage: "35 damage" },
      keyboard: { title: "Keyboard & actions", description: "Escape closes the dialog and focus returns to its opener.", behavior: "A keyboard user closes the dialog and continues from where they stopped.", codeArea: "escapeCloses, focusRestoration", damage: "35 damage" },
    },
    fixture: {
      regionLabel: "Broken UI preview",
      brokenLabel: "Broken Fixture",
      modifiedLabel: "Modified Fixture",
      repairedLabel: "Repaired Fixture",
      heading: "Account safeguards",
      introduction: "Open the modal and try Tab, Shift+Tab, and Escape without using a mouse.",
      expectedLabel: "Expected Behavior",
      expected: "Focus should enter and loop within the modal, Escape should close it, and focus should return to the opener.",
      failureLabel: "Current Failure",
      failure: "The modal has no accessible identity, focus does not enter or stay inside, and Escape does not close it.",
      modifiedFailure: "Some implementation values changed. Run checks to verify the actual browser behavior.",
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
      fixtureStatus: (status) => `Fixture ${status === "broken" ? "Broken" : status === "modified" ? "Modified" : "Repaired"}`,
      phase: { "broken-preview": "Inspecting the broken behavior", attempting: "Code changes applied", verifying: "Running browser checks", "partial-success": "Some checks passed — more repair needed", failure: "Checks failed — inspect the broken behavior again", victory: "Victory — all browser checks passed" },
    },
    actions: { askCoach: "Ask Debug Coach", seeDebrief: "View learning debrief", replay: "Replay mission" },
    progression: {
      attempts: (attempts) => `Attempts ${attempts}`,
      combo: (combo) => `Consecutive-pass combo ×${combo}`,
      xp: (xp) => `Mission XP ${xp}`,
      xpGain: (xp) => `+${xp} XP`,
      xpEarned: (xp) => `XP earned ${xp}`,
      totalXp: (xp) => `Total XP ${xp}`,
      rank: (rank) => `Mission rank ${rank}`,
      victory: "Victory",
      bossDefeated: "Boss Defeated",
      criticalHit: "Accessibility Critical Hit",
      perfectRepair: "Perfect Repair",
      restoredHeading: "Restored user behaviors",
      hitAnnouncement: (damage, xp, combo) => `Newly verified objectives dealt ${damage} boss damage and earned ${xp} XP. Consecutive-pass combo ${combo}. Accessibility Critical Hit.`,
      storageFallback: "Browser storage is unavailable, so progress is kept for this session only. You can keep playing the mission.",
      soundOn: "Battle sound on. Mute sound",
      soundMuted: "Battle sound muted. Turn sound on",
      mute: "Mute",
      unmute: "Sound on",
      teaserLabel: "Future mission teaser",
      teaserTitle: "The Label Labyrinth",
      teaserBody: "A future mission about form errors and accessible names is being prepared.",
      unavailable: "Unavailable for now",
    },
    codeLab: {
      eyebrow: "Safe code lab",
      heading: "Code Lab",
      description: "Change only allowlisted implementation values. The React-like code below is explanatory and is never executed or evaluated.",
      safeBadge: "Allowlisted DSL",
      controlsLegend: "Dialog implementation values",
      fields: { dialogRole: "Dialog role", ariaModal: "Use aria-modal", labelledBy: "aria-labelledby", describedBy: "aria-describedby", escapeCloses: "Close on Escape", focusContainment: "Contain focus", focusRestoration: "Restore focus" },
      values: { none: "None" },
      validationHeading: "Changes were not applied",
      validationErrors: {
        NOT_AN_OBJECT: "Implementation state must be structured allowlisted values.",
        UNSUPPORTED_FIELD: "An unsupported implementation field was rejected.",
        INVALID_DIALOG_ROLE: "Role must be None or dialog.",
        INVALID_ARIA_MODAL: "The aria-modal value is invalid.",
        INVALID_LABEL_REFERENCE: "The label reference is not allowlisted.",
        INVALID_DESCRIPTION_REFERENCE: "The description reference is not allowlisted.",
        INVALID_ESCAPE_BEHAVIOR: "The Escape behavior value is invalid.",
        INVALID_FOCUS_CONTAINMENT: "The focus-containment value is invalid.",
        INVALID_FOCUS_RESTORATION: "The focus-restoration value is invalid.",
      },
      sourceLabel: "React-like code representation",
      diffLabel: "Broken code compared with current code",
      actions: { tryUi: "Try Broken UI", apply: "Apply Changes", check: "Run Checks", reset: "Reset Code", diff: "View Diff" },
    },
    history: {
      heading: "Attempt history & snapshot evidence",
      empty: "Run checks to preserve fixture-only evidence here.",
      selectLabel: "Select a verified attempt",
      snapshotHeading: "Fixture snapshot",
      snapshotAlt: (attempt) => `Fixture-region snapshot for attempt ${attempt}`,
      attempt: (attempt) => `Attempt ${attempt}`,
      metadata: (attempt, locale, passed, capturedAt) => `Attempt ${attempt} · ${locale} · ${passed}/3 passed · ${capturedAt}`,
      region: "Captured region",
    },
    console: { heading: "Verification console", deterministic: "Deterministic demo provider", empty: "No checks have run yet." },
    feed: { "entered-preview": "Broken fixture loaded. No checks have run yet.", "changes-applied": "Validated allowlisted values were applied to the fixture.", "code-reset": "Code reset to the original broken values.", "verification-started": "Checking real keyboard behavior in the rendered UI.", "verification-failed": "No objectives passed in this attempt.", "verification-partial": "Some objectives passed. Boss damage comes only from newly verified objectives.", "verification-passed": "Accumulated verification passed every objective. Keyboard Trap Boss defeated." },
    results: { heading: "Browser check results", pending: "Pending", passed: "Passed", failed: "Failed", checks: "Verified", errors: "Errors", none: "Not run", behavior: "Affected user behavior", codeArea: "Relevant code area", verifiedResult: "Verified result" },
    checkLabels: { DIALOG_SEMANTICS_VERIFIED: "Verified role, modal state, name, and description references in the rendered DOM.", FOCUS_LOOP_VERIFIED: "Verified initial focus and both loop directions with keyboard events.", ESCAPE_AND_RETURN_VERIFIED: "Verified Escape dismissal and focus return to the opener." },
    failureCodes: { DIALOG_IDENTITY_MISSING: "Dialog role, modal state, name, or description is missing.", FOCUS_CONTAINMENT_MISSING: "Focus is outside the dialog or the focus-loop contract is missing.", KEYBOARD_ACTIONS_MISSING: "Keyboard close, action, or focus-return contract is missing." },
    coach: {
      label: "Visual debug coach response",
      eyebrow: "Shown only on request",
      heading: "Visual Debug Coach",
      description: "Select a failed attempt snapshot, then request one progressive hint at a time.",
      ask: "Ask Visual Coach",
      loading: "Inspecting the selected snapshot…",
      loaded: "The visual coach prepared one progressive hint.",
      revealed: "Hint revealed for this attempt",
      afterFailure: "Select an attempt with a failed objective to ask the coach.",
      demoLabel: "Demo Coach",
      localLabel: "Local Vision Coach",
      fallback: "Local Vision Coach was unavailable, so the reliable Demo Coach answered instead.",
      observationLabel: "Visual observation",
      hintLabel: "This hint",
      whyLabel: "Why it matters",
      inspectLabel: "Inspect next",
      returnToCodeLab: "Return to Code Lab",
      progress: (level) => `Progressive hint ${level} of 3`,
      error: "The coach response could not load. You can continue the mission.",
    },
    debrief: { eyebrow: "Mission complete", heading: "Learning debrief", semanticsHeading: "Meaning comes first", semantics: "Dialog semantics and an accessible name give assistive technology a clear purpose and context. Visual appearance alone cannot establish that contract.", behaviorHeading: "Verify user behavior", behavior: "Focus must enter a modal, remain there, and return to its trigger when it closes. For a similar bug, inspect role, name and description references, focus order, Escape close, and focus restoration." },
    announcements: { landing: "Mission landing screen", briefing: "Mission briefing", "broken-preview": "Broken fixture ready. Checks have not run.", attempting: "Code changes applied.", verifying: "Running browser checks.", "partial-success": "Some browser checks passed.", failure: "Browser checks failed.", victory: "All checks passed. Boss defeated.", debrief: "Learning debrief" },
  },
} satisfies Record<Locale, Dictionary>;

export type MissionDictionary = Dictionary;

export const statusLabel = (dictionary: MissionDictionary, status: ObjectiveStatus): string => dictionary.results[status];
