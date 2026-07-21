import type { CheckCode, FailureCode, MissionObjectiveId, MissionScenarioId, ObjectiveStatus } from "@/lib/domain/mission";
import type { MissionRank } from "@/lib/domain/battle";
import type { CodeLabValidationError, DialogPresetId } from "@/lib/mission/code-lab";

export const supportedLocales = ["ko", "en"] as const;
export type Locale = (typeof supportedLocales)[number];

type FixtureDictionary = {
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
  defectMapLabel: string;
  defectMapHeading: string;
  signals: Record<MissionObjectiveId, string>;
  signalReady: string;
  signalBroken: string;
};

type Dictionary = {
  language: { label: string; korean: string; english: string };
  product: { workingTitle: string; mission: string; proposition: string; loopLabel: string; loop: readonly [string, string, string] };
  landing: { heading: string; body: string; start: string };
  missionCatalog: Record<MissionScenarioId, { label: string; title: string; summary: string; bossLabel: string; select: string }>;
  briefing: { eyebrow: string; heading: string; body: string; objectivesHeading: string; enter: string };
  objectives: Record<MissionObjectiveId, { title: string; description: string; behavior: string; codeArea: string; damage: string }>;
  fixture: FixtureDictionary;
  fixtureTwo: FixtureDictionary;
  mission: {
    heading: string;
    status: string;
    bossLabel: string;
    hp: (hp: number) => string;
    objectivesProgress: (passed: number) => string;
    fixtureStatus: (status: "broken" | "modified" | "repaired") => string;
    phase: Record<"broken-preview" | "attempting" | "verifying" | "partial-success" | "failure" | "victory", string>;
  };
  actions: { askCoach: string; seeDebrief: string; replay: string; nextMission: string; missionMenu: string };
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
    cssControlsLegend: string;
    presetLabel: string;
    presetName: Record<DialogPresetId, string>;
    presetBehavior: Record<DialogPresetId, string>;
    fields: Record<"dialogRole" | "ariaModal" | "labelledBy" | "describedBy" | "escapeCloses" | "focusContainment" | "focusRestoration" | "actionDisplay" | "actionDirection" | "actionAlign" | "actionJustify" | "actionGap", string>;
    values: { none: string };
    tabs: { label: string; accessibility: string; css: string; hintCount: (count: number) => string };
    verifiedXp: string;
    verifiedProgressHelp: string;
    verifiedProgressLabel: (count: number, xp: number) => string;
    remainingAiHint: string;
    aiTooltipLabel: string;
    validationHeading: string;
    validationErrors: Record<CodeLabValidationError, string>;
    sourceLabel: string;
    diffLabel: string;
    actions: { check: string; checking: string; reset: string; diff: string; newSetup: string };
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
    purposeHeading: string;
    purpose: string;
  };
  console: { heading: string; deterministic: string; attempt: (attempt: number) => string; empty: string };
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
    advanced: string;
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
  announcements: Record<"landing" | "broken-preview" | "attempting" | "verifying" | "partial-success" | "failure" | "victory" | "debrief", string>;
};

export const dictionaries = {
  ko: {
    language: { label: "언어 선택", korean: "한국어", english: "English" },
    product: {
      workingTitle: "프론트엔드 디버깅 아레나 — 작업명",
      mission: "첫 번째 미션 · 키보드 트랩 보스",
      proposition: "실제 프론트엔드 버그를 고치세요. 통과한 브라우저 검사 하나마다 보스가 피해를 입습니다.",
      loopLabel: "미션 진행 방식",
      loop: ["선택한 고장 UI를 직접 써 보기", "옆의 설정 하나 바꾸기", "검사하고 보스 공격하기"],
    },
    landing: { heading: "고칠 프론트엔드 버그를 고르세요.", body: "서로 다른 UI 고장을 직접 써 보고, 접근성과 CSS 설정을 바꾼 뒤 실제 동작을 검사하세요.", start: "선택한 미션 시작" },
    missionCatalog: {
      "delete-dialog": { label: "첫 번째 미션", title: "키보드 트랩", summary: "배송지 삭제 모달의 의미, 포커스, 키보드, 버튼 배치를 고칩니다.", bossLabel: "키보드 트랩 보스", select: "키보드 트랩 미션 선택" },
      "checkout-sheet": { label: "두 번째 미션", title: "플렉스 엉킴", summary: "배송 방법 변경 창의 세로·정렬·간격 문제와 모달 동작을 함께 고칩니다.", bossLabel: "플렉스 엉킴 보스", select: "플렉스 엉킴 미션 선택" },
    },
    briefing: { eyebrow: "미션", heading: "키보드 트랩 보스", body: "삭제 창의 이름, 포커스와 닫기 동작, 무너진 버튼 배치를 되살리세요.", objectivesHeading: "검사할 사용자 동작", enter: "시작" },
    objectives: {
      identity: { title: "대화상자 정체성", description: "모달 역할, 이름, 설명이 보조 기술에 전달됩니다.", behavior: "스크린 리더가 대화상자 제목과 설명을 알립니다.", codeArea: "role, aria-modal, aria-labelledby, aria-describedby", damage: "피해 25" },
      focus: { title: "포커스 가두기", description: "포커스가 모달 안으로 이동해 머뭅니다.", behavior: "Tab과 Shift+Tab이 모달의 첫 컨트롤과 마지막 컨트롤 사이를 순환합니다.", codeArea: "focusContainment", damage: "피해 25" },
      keyboard: { title: "키보드와 동작", description: "Escape로 닫힌 뒤 포커스가 열기 버튼으로 돌아갑니다.", behavior: "키보드 사용자가 대화상자를 닫고 중단했던 위치에서 계속합니다.", codeArea: "escapeCloses, focusRestoration", damage: "피해 25" },
      layout: { title: "버튼 Flex 배치", description: "취소와 삭제 버튼이 겹치지 않는 가로 flex 행으로 렌더됩니다.", behavior: "사용자가 두 동작을 명확히 구분하고 각각 누를 수 있습니다.", codeArea: "display, flex-direction, gap", damage: "피해 25" },
    },
    fixture: {
      regionLabel: "고장 난 UI 미리보기",
      brokenLabel: "고장 난 삭제 창",
      modifiedLabel: "바뀐 삭제 창",
      repairedLabel: "고쳐진 삭제 창",
      heading: "저장된 배송지 삭제",
      introduction: "삭제 버튼을 눌러 확인 창을 열고, 겹친 버튼을 눈으로 확인한 뒤 Tab, Shift+Tab, Escape도 사용해 보세요.",
      expectedLabel: "기대 동작",
      expected: "포커스가 모달 안에서 순환하고 Escape로 닫히며, 취소와 삭제 버튼이 겹치지 않아야 합니다.",
      failureLabel: "현재 실패",
      failure: "버튼이 겹쳐 보이고, 모달의 이름과 포커스 경계가 없으며 Escape로 닫히지 않습니다.",
      modifiedFailure: "일부 구현 값이 변경되었습니다. 브라우저 검사를 실행해 실제 동작을 확인하세요.",
      open: "배송지 삭제",
      dialogTitle: "이 배송지를 삭제할까요?",
      dialogDescription: "서울시 중구 세종대로 110이 저장된 배송지에서 삭제됩니다.",
      close: "취소",
      save: "삭제",
      defectMapLabel: "삭제 창 결함 신호",
      defectMapHeading: "화면에서 바로 확인할 결함",
      signals: { identity: "이름 전달", focus: "포커스 경계", keyboard: "Esc와 복귀", layout: "버튼 Flex" },
      signalReady: "정상",
      signalBroken: "결함",
    },
    fixtureTwo: {
      regionLabel: "고장 난 UI 미리보기", brokenLabel: "고장 난 배송 방법 창", modifiedLabel: "바뀐 배송 방법 창", repairedLabel: "고쳐진 배송 방법 창",
      heading: "배송 방법 변경", introduction: "배송 방법 바꾸기를 눌러 창을 열고, 세로로 늘어나 흩어진 버튼과 키보드 동작을 직접 확인해 보세요.",
      expectedLabel: "기대 동작", expected: "취소와 픽업 변경이 한 가로 행에 가운데 정렬되고 충분한 간격을 가지며, 모달 키보드 동작도 완전해야 합니다.",
      failureLabel: "현재 실패", failure: "버튼 그룹이 grid/세로 방향/늘림 정렬/0px 간격으로 엉켜 있고 모달 연결도 일부 끊겼습니다.", modifiedFailure: "일부 구현 값이 바뀌었습니다. 브라우저 검사로 실제 CSS와 키보드 동작을 확인하세요.",
      open: "배송 방법 바꾸기", dialogTitle: "매장 픽업으로 바꿀까요?", dialogDescription: "오늘 오후 6시부터 시청점에서 주문 상품을 픽업할 수 있습니다.", close: "현재 배송 유지", save: "픽업으로 변경",
      defectMapLabel: "배송 방법 창 결함 신호", defectMapHeading: "화면에서 바로 확인할 결함", signals: { identity: "창 이름", focus: "포커스 경계", keyboard: "Esc와 복귀", layout: "Flex 조합" }, signalReady: "정상", signalBroken: "결함",
    },
    mission: {
      heading: "보스 전투",
      status: "검증 현황",
      bossLabel: "키보드 트랩 보스",
      hp: (hp) => `보스 HP ${hp} / 100`,
      objectivesProgress: (passed) => `목표 ${passed} / 4`,
      fixtureStatus: (status) => `UI ${status === "broken" ? "고장" : status === "modified" ? "바뀜" : "고침"}`,
      phase: { "broken-preview": "고장 난 동작을 조사하는 중", attempting: "코드 변경 사항을 적용함", verifying: "브라우저 검사를 실행하는 중", "partial-success": "일부 검사 통과 — 수리가 더 필요함", failure: "검사 실패 — 고장 난 동작을 다시 살펴보세요", victory: "승리 — 모든 브라우저 검사 통과" },
    },
    actions: { askCoach: "디버그 코치에게 묻기", seeDebrief: "학습 정리 보기", replay: "미션 다시 플레이", nextMission: "다음 미션 시작", missionMenu: "미션 선택으로" },
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
      heading: "수리 설정",
      description: "설정을 바꾸면 왼쪽 미리보기와 아래 코드가 즉시 바뀝니다.",
      safeBadge: "안전한 선택지만 제공",
      controlsLegend: "선택한 창의 접근성 동작 바꾸기",
      cssControlsLegend: "동작 버튼 CSS 조합 바꾸기",
      presetLabel: "현재 연습 설정",
      presetName: { "everything-missing": "모든 연결 끊김", "unnamed-modal": "이름 없는 창", "keyboard-trap": "닫고 돌아올 수 없음", "layout-collapse": "버튼 CSS 전체 무너짐", "vertical-actions": "세로 버튼", "misaligned-actions": "잘못된 정렬", "cramped-actions": "간격 0px" },
      presetBehavior: { "everything-missing": "이름과 키보드 연결이 끊기고 버튼 CSS도 모두 잘못됐습니다.", "unnamed-modal": "키보드는 움직이지만 스크린 리더가 이 창의 이름과 설명을 알 수 없습니다.", "keyboard-trap": "Escape로 닫히지 않고, 닫은 뒤 열기 버튼으로 돌아오지 않습니다.", "layout-collapse": "display, 방향, 정렬, 배치, 간격 값이 모두 잘못됐습니다.", "vertical-actions": "버튼이 column 방향이라 세로로 쌓입니다.", "misaligned-actions": "버튼이 왼쪽에서 시작하고 늘어나 의도한 위치와 크기가 아닙니다.", "cramped-actions": "가로 flex이지만 버튼 사이 gap이 0px라 선택지가 붙어 보입니다." },
      fields: { dialogRole: "대화상자 role", ariaModal: "aria-modal 사용", labelledBy: "aria-labelledby", describedBy: "aria-describedby", escapeCloses: "Escape로 닫기", focusContainment: "포커스 순환", focusRestoration: "포커스 복귀", actionDisplay: "display", actionDirection: "flex-direction", actionAlign: "align-items", actionJustify: "justify-content", actionGap: "gap" },
      values: { none: "없음" },
      tabs: { label: "수리 설정 종류", accessibility: "접근성·키보드", css: "CSS 배치", hintCount: (count) => `AI가 표시한 미해결 설정 ${count}개` },
      verifiedXp: "검사로 확정된 경험치", verifiedProgressHelp: "설정 변경만으로는 오르지 않고, 브라우저 검사를 통과해야 채워집니다.", verifiedProgressLabel: (count, xp) => `검사로 확정된 목표 ${count}개, ${xp} XP`, remainingAiHint: "이 설정도 아직 실패 원인과 연결되어 있습니다. 바꾼 뒤 다시 검사하세요.",
      aiTooltipLabel: "AI가 이 설정을 추천한 이유",
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
        INVALID_ACTION_DISPLAY: "display는 grid 또는 flex만 선택할 수 있습니다.", INVALID_ACTION_DIRECTION: "flex-direction은 column 또는 row만 선택할 수 있습니다.", INVALID_ACTION_ALIGN: "align-items는 stretch 또는 center만 선택할 수 있습니다.", INVALID_ACTION_JUSTIFY: "justify-content 값이 허용 목록에 없습니다.", INVALID_ACTION_GAP: "gap은 0, 8, 16px 중 하나여야 합니다.",
      },
      sourceLabel: "React 형태 코드 표현",
      diffLabel: "고장 난 코드와 현재 코드 비교",
      actions: { check: "검사하고 공격", checking: "검사 중…", reset: "이 설정 초기화", diff: "코드 차이 보기", newSetup: "새 고장 상태" },
    },
    history: {
      heading: "시도 기록 및 스냅샷 증거",
      empty: "검사를 실행하면 선택한 UI의 증거가 여기에 저장됩니다.",
      selectLabel: "검증 시도 선택",
      snapshotHeading: "검사한 UI 스냅샷",
      snapshotAlt: (attempt) => `${attempt}번 시도의 UI 스냅샷`,
      attempt: (attempt) => `시도 ${attempt}`,
      metadata: (attempt, locale, passed, capturedAt) => `시도 ${attempt} · ${locale} · 통과 ${passed}/4 · ${capturedAt}`,
      region: "캡처 영역",
      purposeHeading: "왜 이 화면을 저장하나요?",
      purpose: "검사 순간의 실제 미션 UI만 보관해 전후 상태를 다시 비교하고, 실패 힌트가 어떤 화면을 해석했는지 확인합니다. 페이지 밖 정보는 담지 않습니다.",
    },
    console: { heading: "검사 결과", deterministic: "실제 DOM과 키보드 동작을 검사하고 선택한 시도의 증거를 보관합니다.", attempt: (attempt) => `현재 시도 ${attempt}`, empty: "아직 검사를 실행하지 않았습니다." },
    feed: { "entered-preview": "선택한 고장 UI를 불러왔습니다. 검사는 아직 실행하지 않았습니다.", "changes-applied": "선택한 설정이 미리보기와 코드에 바로 반영됐습니다.", "code-reset": "현재 연습 설정의 처음 값으로 되돌렸습니다.", "verification-started": "화면에 보이는 UI의 실제 DOM, CSS, 키보드 동작을 확인합니다.", "verification-failed": "이번 시도에서 통과한 사용자 동작이 없습니다.", "verification-partial": "일부 사용자 동작만 통과했습니다. 새로 통과한 동작만 보스를 공격합니다.", "verification-passed": "모든 사용자 동작을 검증해 보스를 쓰러뜨렸습니다." },
    results: { heading: "브라우저 검사 결과", pending: "대기", passed: "통과", failed: "실패", checks: "확인", errors: "오류", none: "검사 전", behavior: "영향받는 사용자 동작", codeArea: "관련 코드 영역", verifiedResult: "검증 결과" },
    checkLabels: { DIALOG_SEMANTICS_VERIFIED: "역할, 모달 상태, 이름과 설명 참조를 실제 DOM에서 확인했습니다.", FOCUS_LOOP_VERIFIED: "초기 포커스와 양방향 순환을 실제 키보드 이벤트로 확인했습니다.", ESCAPE_AND_RETURN_VERIFIED: "Escape 닫기와 열기 버튼으로의 포커스 복귀를 확인했습니다.", ACTION_LAYOUT_VERIFIED: "계산된 CSS에서 버튼 그룹의 flex 가로 방향과 간격을 확인했습니다." },
    failureCodes: { DIALOG_IDENTITY_MISSING: "대화상자의 역할, 모달 상태, 이름 또는 설명이 없습니다.", FOCUS_CONTAINMENT_MISSING: "포커스가 대화상자 안에 있지 않거나 순환 계약이 없습니다.", KEYBOARD_ACTIONS_MISSING: "키보드 닫기, 동작 또는 포커스 복귀 계약이 없습니다.", ACTION_LAYOUT_BROKEN: "버튼 그룹이 간격 있는 flex 가로 행으로 렌더되지 않았습니다." },
    coach: {
      label: "비주얼 디버그 코치 응답",
      eyebrow: "요청할 때만 표시",
      heading: "실패 힌트",
      description: "방금 실패한 동작을 바탕으로 한 단계만 알려 드립니다.",
      ask: "왜 실패했지? 힌트 받기",
      loading: "선택한 스냅샷을 살펴보는 중…",
      loaded: "비주얼 코치가 단계별 힌트 하나를 준비했습니다.",
      revealed: "이 시도의 힌트 표시됨",
      advanced: "힌트의 기술 정보",
      demoLabel: "데모 코치",
      localLabel: "로컬 비전 코치",
      fallback: "로컬 비전 코치를 사용할 수 없어 신뢰할 수 있는 데모 코치로 전환했습니다.",
      observationLabel: "시각적 관찰",
      hintLabel: "이번 힌트",
      whyLabel: "중요한 이유",
      inspectLabel: "다음 확인",
      returnToCodeLab: "수리 설정으로 돌아가기",
      progress: (level) => `단계별 힌트 ${level} / 3`,
      error: "코치 응답을 불러오지 못했습니다. 미션은 계속 진행할 수 있습니다.",
    },
    debrief: { eyebrow: "미션 완료", heading: "학습 정리", semanticsHeading: "의미와 모양을 함께 고치세요", semantics: "대화상자 역할과 접근 가능한 이름은 목적을 전달하고, flex 방향과 간격은 실제 선택지를 시각적으로 분리합니다.", behaviorHeading: "브라우저 결과로 검증하세요", behavior: "포커스·Escape·복귀뿐 아니라 계산된 display, flex-direction, gap도 확인해야 합니다. 비슷한 버그에서는 의미, 키보드 동작, CSS 배치를 함께 살펴보세요." },
    announcements: { landing: "미션 시작 화면", "broken-preview": "선택한 고장 UI 준비 완료. 검사는 실행되지 않았습니다.", attempting: "설정이 미리보기와 코드에 반영됐습니다.", verifying: "브라우저 검사를 실행합니다.", "partial-success": "일부 검사만 통과했습니다.", failure: "브라우저 검사가 실패했습니다.", victory: "모든 검사 통과. 보스를 쓰러뜨렸습니다.", debrief: "학습 정리" },
  },
  en: {
    language: { label: "Choose language", korean: "한국어", english: "English" },
    product: {
      workingTitle: "Frontend Debugging Arena — Working Title",
      mission: "Mission one · Keyboard Trap Boss",
      proposition: "Fix real frontend bugs. Every passing browser check damages the boss.",
      loopLabel: "The mission loop",
      loop: ["Try the selected broken UI", "Change one nearby setting", "Check and attack the boss"],
    },
    landing: { heading: "Choose a frontend bug to repair.", body: "Try two different broken UIs, change nearby accessibility and CSS settings, then verify the real behavior.", start: "Start selected mission" },
    missionCatalog: {
      "delete-dialog": { label: "Mission one", title: "Keyboard Trap", summary: "Repair the meaning, focus, keyboard behavior, and button layout of a delivery-address dialog.", bossLabel: "Keyboard Trap Boss", select: "Select Keyboard Trap mission" },
      "checkout-sheet": { label: "Mission two", title: "Flex Tangle", summary: "Repair direction, alignment, spacing, and modal behavior in a delivery-method dialog.", bossLabel: "Flex Tangle Boss", select: "Select Flex Tangle mission" },
    },
    briefing: { eyebrow: "Mission", heading: "Keyboard Trap Boss", body: "Restore the delete dialog’s name, focus and close behavior, and collapsed button layout.", objectivesHeading: "User behaviors to check", enter: "Start" },
    objectives: {
      identity: { title: "Dialog identity", description: "The modal role, name, and description reach assistive technology.", behavior: "A screen reader announces the dialog title and description.", codeArea: "role, aria-modal, aria-labelledby, aria-describedby", damage: "25 damage" },
      focus: { title: "Focus containment", description: "Focus enters the modal and stays inside.", behavior: "Tab and Shift+Tab loop between the first and last modal controls.", codeArea: "focusContainment", damage: "25 damage" },
      keyboard: { title: "Keyboard & actions", description: "Escape closes the dialog and focus returns to its opener.", behavior: "A keyboard user closes the dialog and continues from where they stopped.", codeArea: "escapeCloses, focusRestoration", damage: "25 damage" },
      layout: { title: "Button flex layout", description: "Cancel and Delete render as a spaced horizontal flex row.", behavior: "People can distinguish and target both actions without overlap.", codeArea: "display, flex-direction, gap", damage: "25 damage" },
    },
    fixture: {
      regionLabel: "Broken UI preview",
      brokenLabel: "Broken delete dialog",
      modifiedLabel: "Changed delete dialog",
      repairedLabel: "Repaired delete dialog",
      heading: "Delete saved delivery address",
      introduction: "Open the confirmation dialog, inspect the overlapping buttons, then try Tab, Shift+Tab, and Escape.",
      expectedLabel: "Expected Behavior",
      expected: "Focus should loop inside, Escape should close, and the Cancel and Delete buttons should never overlap.",
      failureLabel: "Current Failure",
      failure: "The buttons overlap, the modal has no announced identity or focus boundary, and Escape does not close it.",
      modifiedFailure: "Some implementation values changed. Run checks to verify the actual browser behavior.",
      open: "Delete address",
      dialogTitle: "Delete this address?",
      dialogDescription: "110 Sejong-daero, Jung-gu, Seoul will be removed from your saved delivery addresses.",
      close: "Cancel",
      save: "Delete",
      defectMapLabel: "Delete-dialog defect signals",
      defectMapHeading: "Defects visible in this UI",
      signals: { identity: "Announced name", focus: "Focus boundary", keyboard: "Esc and return", layout: "Button flex" },
      signalReady: "Ready",
      signalBroken: "Broken",
    },
    fixtureTwo: {
      regionLabel: "Broken UI preview", brokenLabel: "Broken delivery-method dialog", modifiedLabel: "Changed delivery-method dialog", repairedLabel: "Repaired delivery-method dialog",
      heading: "Change delivery method", introduction: "Open Change delivery method, inspect the tall scattered action buttons, then try the keyboard behavior yourself.",
      expectedLabel: "Expected Behavior", expected: "Keep delivery and Switch to pickup should form a centered horizontal row with useful spacing, and the modal keyboard behavior should be complete.",
      failureLabel: "Current Failure", failure: "The action group combines grid, column, stretch alignment, and 0px gap, while some modal connections are also missing.", modifiedFailure: "Some implementation values changed. Run browser checks to verify the computed CSS and keyboard behavior.",
      open: "Change delivery method", dialogTitle: "Switch to store pickup?", dialogDescription: "Your order will be ready for pickup at City Hall Store from 6 PM today.", close: "Keep delivery", save: "Switch to pickup",
      defectMapLabel: "Delivery-method defect signals", defectMapHeading: "Defects visible in this UI", signals: { identity: "Dialog name", focus: "Focus boundary", keyboard: "Esc and return", layout: "Flex combination" }, signalReady: "Ready", signalBroken: "Broken",
    },
    mission: {
      heading: "Boss battle",
      status: "Verification status",
      bossLabel: "Keyboard Trap Boss",
      hp: (hp) => `Boss HP ${hp} / 100`,
      objectivesProgress: (passed) => `Objectives ${passed} / 4`,
      fixtureStatus: (status) => `UI ${status === "broken" ? "broken" : status === "modified" ? "changed" : "repaired"}`,
      phase: { "broken-preview": "Inspecting the broken behavior", attempting: "Code changes applied", verifying: "Running browser checks", "partial-success": "Some checks passed — more repair needed", failure: "Checks failed — inspect the broken behavior again", victory: "Victory — all browser checks passed" },
    },
    actions: { askCoach: "Ask Debug Coach", seeDebrief: "View learning debrief", replay: "Replay mission", nextMission: "Start next mission", missionMenu: "Choose a mission" },
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
      heading: "Repair settings",
      description: "Each setting immediately updates the preview and the code below.",
      safeBadge: "Safe choices only",
      controlsLegend: "Change accessibility behavior for the selected dialog",
      cssControlsLegend: "Change the action-button CSS combination",
      presetLabel: "Current practice setup",
      presetName: { "everything-missing": "Everything disconnected", "unnamed-modal": "Unnamed dialog", "keyboard-trap": "Cannot close and return", "layout-collapse": "All button CSS broken", "vertical-actions": "Vertical actions", "misaligned-actions": "Wrong alignment", "cramped-actions": "0px spacing" },
      presetBehavior: { "everything-missing": "Name and keyboard connections are missing, and every button-layout value is wrong.", "unnamed-modal": "The keyboard works, but a screen reader cannot identify or describe the dialog.", "keyboard-trap": "Escape cannot close the dialog, and focus does not return to its opener.", "layout-collapse": "Display, direction, alignment, placement, and spacing are all wrong.", "vertical-actions": "The column direction stacks the action buttons vertically.", "misaligned-actions": "The actions start at the left and stretch instead of using their intended size and position.", "cramped-actions": "The horizontal flex row has 0px gap, so the choices look stuck together." },
      fields: { dialogRole: "Dialog role", ariaModal: "Use aria-modal", labelledBy: "aria-labelledby", describedBy: "aria-describedby", escapeCloses: "Close on Escape", focusContainment: "Contain focus", focusRestoration: "Restore focus", actionDisplay: "display", actionDirection: "flex-direction", actionAlign: "align-items", actionJustify: "justify-content", actionGap: "gap" },
      values: { none: "None" },
      tabs: { label: "Repair setting category", accessibility: "Accessibility & keyboard", css: "CSS layout", hintCount: (count) => `${count} unresolved settings marked by AI` },
      verifiedXp: "XP verified by checks", verifiedProgressHelp: "Settings alone cannot fill this meter; only passing browser checks do.", verifiedProgressLabel: (count, xp) => `${count} objectives verified by checks, ${xp} XP`, remainingAiHint: "This setting is still connected to a failed behavior. Change it, then run another check.",
      aiTooltipLabel: "Why AI recommends this setting",
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
        INVALID_ACTION_DISPLAY: "Display must be grid or flex.", INVALID_ACTION_DIRECTION: "Flex direction must be column or row.", INVALID_ACTION_ALIGN: "Align items must be stretch or center.", INVALID_ACTION_JUSTIFY: "Justify content is not allowlisted.", INVALID_ACTION_GAP: "Gap must be 0, 8, or 16px.",
      },
      sourceLabel: "React-like code representation",
      diffLabel: "Broken code compared with current code",
      actions: { check: "Check & attack", checking: "Checking…", reset: "Reset this setup", diff: "View code diff", newSetup: "New broken setup" },
    },
    history: {
      heading: "Attempt history & snapshot evidence",
      empty: "Run a check to preserve evidence from the selected UI preview.",
      selectLabel: "Select a verified attempt",
      snapshotHeading: "Checked UI snapshot",
      snapshotAlt: (attempt) => `UI snapshot for attempt ${attempt}`,
      attempt: (attempt) => `Attempt ${attempt}`,
      metadata: (attempt, locale, passed, capturedAt) => `Attempt ${attempt} · ${locale} · ${passed}/4 passed · ${capturedAt}`,
      region: "Captured region",
      purposeHeading: "Why save this view?",
      purpose: "It preserves only the real mission UI at check time, so you can compare before and after and see exactly what the hint interpreted. Nothing outside the fixture is included.",
    },
    console: { heading: "Check results", deterministic: "Checks use the real DOM and keyboard behavior and preserve evidence for each selected attempt.", attempt: (attempt) => `Current attempt ${attempt}`, empty: "No checks have run yet." },
    feed: { "entered-preview": "The selected broken UI is ready. No checks have run yet.", "changes-applied": "The selected setting updated the preview and code immediately.", "code-reset": "This practice setup returned to its starting values.", "verification-started": "Checking the rendered UI’s real DOM, CSS, and keyboard behavior.", "verification-failed": "No user behaviors passed in this attempt.", "verification-partial": "Some user behaviors passed. Only newly passing behavior attacks the boss.", "verification-passed": "Every user behavior is verified. Boss defeated." },
    results: { heading: "Browser check results", pending: "Pending", passed: "Passed", failed: "Failed", checks: "Verified", errors: "Errors", none: "Not run", behavior: "Affected user behavior", codeArea: "Relevant code area", verifiedResult: "Verified result" },
    checkLabels: { DIALOG_SEMANTICS_VERIFIED: "Verified role, modal state, name, and description references in the rendered DOM.", FOCUS_LOOP_VERIFIED: "Verified initial focus and both loop directions with keyboard events.", ESCAPE_AND_RETURN_VERIFIED: "Verified Escape dismissal and focus return to the opener.", ACTION_LAYOUT_VERIFIED: "Verified the action group’s computed flex row and gap." },
    failureCodes: { DIALOG_IDENTITY_MISSING: "Dialog role, modal state, name, or description is missing.", FOCUS_CONTAINMENT_MISSING: "Focus is outside the dialog or the focus-loop contract is missing.", KEYBOARD_ACTIONS_MISSING: "Keyboard close, action, or focus-return contract is missing.", ACTION_LAYOUT_BROKEN: "The action group is not rendered as a spaced horizontal flex row." },
    coach: {
      label: "Visual debug coach response",
      eyebrow: "Shown only on request",
      heading: "Failure hint",
      description: "Get one step based on the user behavior that just failed.",
      ask: "Why did this fail? Get a hint",
      loading: "Inspecting the selected snapshot…",
      loaded: "The visual coach prepared one progressive hint.",
      revealed: "Hint revealed for this attempt",
      advanced: "Hint technical details",
      demoLabel: "Demo Coach",
      localLabel: "Local Vision Coach",
      fallback: "Local Vision Coach was unavailable, so the reliable Demo Coach answered instead.",
      observationLabel: "Visual observation",
      hintLabel: "This hint",
      whyLabel: "Why it matters",
      inspectLabel: "Inspect next",
      returnToCodeLab: "Return to repair settings",
      progress: (level) => `Progressive hint ${level} of 3`,
      error: "The coach response could not load. You can continue the mission.",
    },
    debrief: { eyebrow: "Mission complete", heading: "Learning debrief", semanticsHeading: "Repair meaning and layout together", semantics: "Dialog semantics and an accessible name convey purpose, while flex direction and gap visually separate real choices.", behaviorHeading: "Verify browser outcomes", behavior: "Check focus, Escape, and return behavior alongside computed display, flex-direction, and gap. Similar bugs often combine semantic, keyboard, and CSS layout failures." },
    announcements: { landing: "Mission landing screen", "broken-preview": "Selected broken UI ready. Checks have not run.", attempting: "The setting updated the preview and code.", verifying: "Running browser checks.", "partial-success": "Some browser checks passed.", failure: "Browser checks failed.", victory: "All checks passed. Boss defeated.", debrief: "Learning debrief" },
  },
} satisfies Record<Locale, Dictionary>;

export type MissionDictionary = Dictionary;

export const statusLabel = (dictionary: MissionDictionary, status: ObjectiveStatus): string => dictionary.results[status];
