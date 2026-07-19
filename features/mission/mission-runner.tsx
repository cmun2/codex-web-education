"use client";

import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { AttemptHistory } from "@/components/attempt-history";
import { CodeLabPanel } from "@/components/code-lab";
import { MissionDialog } from "@/components/mission-dialog";
import { VisualCoach } from "@/components/visual-coach";
import { battleReducer, initialBattleState, type MissionPhase } from "@/lib/domain/battle";
import { keyboardTrapObjectives, type ObjectiveResult, type ObjectiveStatus, type VerificationResult } from "@/lib/domain/mission";
import { coachMissionId, type CoachInsight } from "@/lib/domain/providers";
import { dictionaries, statusLabel, type Locale, type MissionDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleSnapshot, getServerLocaleSnapshot, selectLocale, subscribeToLocale } from "@/lib/i18n/locale";
import { AllowlistedDialogCodeLab, brokenDialogCode, isFullyRepaired } from "@/lib/mission/code-lab";
import { DialogObjectiveEvaluator } from "@/lib/mission/evaluator";
import { captureSnapshotEvidence } from "@/lib/mission/snapshot";
import {
  defaultProgression,
  keyboardTrapMissionId,
  LocalProgressionStorage,
  type SoundChoice,
  type StoredProgression,
} from "@/lib/progression/storage";
import { WebAudioBattleSoundPlayer } from "@/lib/progression/sound";

type ActiveMissionPhase = Exclude<MissionPhase, "landing" | "briefing" | "debrief">;
const activeMissionPhases: readonly ActiveMissionPhase[] = ["broken-preview", "attempting", "verifying", "partial-success", "failure", "victory"];
const isActivePhase = (phase: MissionPhase): phase is ActiveMissionPhase => activeMissionPhases.some((activePhase) => activePhase === phase);
const codeLab = new AllowlistedDialogCodeLab();

function LanguageSwitcher({ locale, copy, onChange }: { locale: Locale; copy: MissionDictionary; onChange: (locale: Locale) => void }) {
  return (
    <div className="language-switcher" role="group" aria-label={copy.language.label}>
      <button type="button" aria-pressed={locale === "ko"} onClick={() => onChange("ko")}>{copy.language.korean}</button>
      <button type="button" aria-pressed={locale === "en"} onClick={() => onChange("en")}>{copy.language.english}</button>
    </div>
  );
}

function SoundControl({ choice, copy, onChange }: { choice: SoundChoice; copy: MissionDictionary; onChange: (choice: SoundChoice) => void }) {
  const muted = choice === "muted";
  return (
    <button
      className="sound-control"
      type="button"
      aria-pressed={muted}
      aria-label={muted ? copy.progression.soundMuted : copy.progression.soundOn}
      onClick={() => onChange(muted ? "on" : "muted")}
    >
      <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span> {muted ? copy.progression.unmute : copy.progression.mute}
    </button>
  );
}

function MissionLoop({ copy }: { copy: MissionDictionary }) {
  return (
    <section className="mission-loop" aria-labelledby="loop-heading">
      <h2 id="loop-heading" className="sr-only">{copy.product.loopLabel}</h2>
      <ol>{copy.product.loop.map((step, index) => <li key={step}><span aria-hidden="true">{index + 1}</span>{step}</li>)}</ol>
    </section>
  );
}

function ObjectiveList({ copy, results, detailed = false }: { copy: MissionDictionary; results: readonly ObjectiveResult[]; detailed?: boolean }) {
  return (
    <ol className="objective-list">
      {keyboardTrapObjectives.map((objective) => {
        const result = results.find((item) => item.objectiveId === objective.id);
        const status: ObjectiveStatus = result?.status ?? "pending";
        return (
          <li key={objective.id} className={`objective objective-${status}`}>
            <span className="objective-marker" aria-hidden="true">{status === "passed" ? "✓" : status === "failed" ? "!" : "○"}</span>
            <div>
              <strong>{copy.objectives[objective.id].title}</strong>
              {detailed && (
                <>
                  <p><b>{copy.results.behavior}:</b> {copy.objectives[objective.id].behavior}</p>
                  <p><b>{copy.results.codeArea}:</b> <code>{copy.objectives[objective.id].codeArea}</code></p>
                </>
              )}
              {result && (
                <p className="result-detail">
                  <b>{copy.results.verifiedResult}:</b>{" "}
                  {result.status === "passed"
                    ? result.checks.map((code) => copy.checkLabels[code]).join(" ")
                    : result.failureCodes.map((code) => copy.failureCodes[code]).join(" ")}
                </p>
              )}
            </div>
            <span className={`status-pill status-${status}`}>{statusLabel(copy, status)}</span>
            <small>{copy.objectives[objective.id].damage}</small>
          </li>
        );
      })}
    </ol>
  );
}

export function MissionRunner() {
  const [state, dispatch] = useReducer(battleReducer, initialBattleState);
  const locale = useSyncExternalStore(subscribeToLocale, getLocaleSnapshot, getServerLocaleSnapshot);
  const [coach, setCoach] = useState<CoachInsight | null>(null);
  const [coachError, setCoachError] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachedAttempt, setCoachedAttempt] = useState<number | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null);
  const [draftCode, setDraftCode] = useState({ ...brokenDialogCode });
  const [appliedCode, setAppliedCode] = useState({ ...brokenDialogCode });
  const [validationErrors, setValidationErrors] = useState<readonly string[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [openRequest, setOpenRequest] = useState(0);
  const [checking, setChecking] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const phaseHeadingRef = useRef<HTMLHeadingElement>(null);
  const codeLabHeadingRef = useRef<HTMLHeadingElement>(null);
  const coachRequestRef = useRef(0);
  const previousPhaseRef = useRef(state.phase);
  const victoryHeadingRef = useRef<HTMLHeadingElement>(null);
  const progressionStorageRef = useRef<LocalProgressionStorage | null>(null);
  const soundPlayerRef = useRef<WebAudioBattleSoundPlayer | null>(null);
  const completionRecordedRef = useRef(false);
  const [progression, setProgression] = useState<StoredProgression>(defaultProgression);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const copy = dictionaries[locale];

  if (progressionStorageRef.current === null) progressionStorageRef.current = new LocalProgressionStorage();
  if (soundPlayerRef.current === null) soundPlayerRef.current = new WebAudioBattleSoundPlayer();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (previousPhaseRef.current !== state.phase) {
      if (state.phase === "victory") victoryHeadingRef.current?.focus();
      else phaseHeadingRef.current?.focus();
    }
    previousPhaseRef.current = state.phase;
  }, [state.phase]);

  useEffect(() => {
    const stored = progressionStorageRef.current?.read();
    if (!stored) return;
    setProgression(stored.value);
    setStorageAvailable(stored.storageAvailable);
  }, []);

  useEffect(() => {
    if (!state.lastHit || progression.soundChoice === "muted") return;
    if (state.phase === "victory") soundPlayerRef.current?.playVictory();
    else soundPlayerRef.current?.playHit();
  }, [progression.soundChoice, state.lastHit, state.phase]);

  useEffect(() => {
    if (state.phase !== "victory" || completionRecordedRef.current) return;
    completionRecordedRef.current = true;
    const completion = progressionStorageRef.current?.recordCompletion(
      keyboardTrapMissionId,
      state.history.length,
      state.xpEarned,
    );
    if (!completion) return;
    setProgression(completion.value);
    setStorageAvailable(completion.storageAvailable);
  }, [state.history.length, state.phase, state.xpEarned]);

  const applyChanges = () => {
    const validation = codeLab.apply(draftCode);
    if (!validation.ok) {
      setValidationErrors(validation.errors.map((error) => copy.codeLab.validationErrors[error]));
      return;
    }
    setValidationErrors([]);
    setAppliedCode(validation.value);
    dispatch({ type: "CHANGES_APPLIED", fixture: isFullyRepaired(validation.value) ? "repaired" : "modified" });
  };

  const runChecks = async () => {
    if (!rootRef.current || checking) return;
    setChecking(true);
    dispatch({ type: "BEGIN_VERIFICATION" });
    try {
      const objectiveResults = await new DialogObjectiveEvaluator().evaluate(rootRef.current);
      if (!rootRef.current) return;
      const snapshot = captureSnapshotEvidence({
        root: rootRef.current,
        attemptNumber: state.attempt,
        locale,
        codeState: appliedCode,
        objectiveResults,
      });
      setSelectedAttempt(state.attempt);
      setCoach(null);
      setCoachError(false);
      coachRequestRef.current += 1;
      setCoachLoading(false);
      dispatch({
        type: "RESULTS",
        result: { attempt: { number: state.attempt, codeState: { ...appliedCode } }, objectives: objectiveResults, snapshot },
      });
    } finally {
      setChecking(false);
    }
  };

  const resetCode = () => {
    const reset = codeLab.reset();
    setDraftCode(reset);
    setAppliedCode({ ...reset });
    setValidationErrors([]);
    setShowDiff(false);
    dispatch({ type: "CODE_RESET" });
  };

  const resetMissionUi = () => {
    setCoach(null);
    setCoachError(false);
    setCoachLoading(false);
    setCoachedAttempt(null);
    setSelectedAttempt(null);
    setDraftCode({ ...brokenDialogCode });
    setAppliedCode({ ...brokenDialogCode });
    setValidationErrors([]);
    setShowDiff(false);
    setOpenRequest(0);
    coachRequestRef.current += 1;
    completionRecordedRef.current = false;
  };

  const replayMission = () => {
    dispatch({ type: "REPLAY" });
    resetMissionUi();
  };

  const updateSound = (choice: SoundChoice) => {
    const updated = progressionStorageRef.current?.setSoundChoice(choice);
    if (!updated) return;
    setProgression(updated.value);
    setStorageAvailable(updated.storageAvailable);
  };

  const selectedVerification: VerificationResult | undefined =
    state.history.find((entry) => entry.attempt.number === selectedAttempt) ?? state.history[state.history.length - 1];

  const askCoach = async () => {
    if (!selectedVerification || coachLoading) return;
    const requestId = coachRequestRef.current + 1;
    coachRequestRef.current = requestId;
    setCoachError(false);
    setCoachLoading(true);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          missionId: coachMissionId,
          failedObjectiveIds: selectedVerification.objectives
            .filter((result) => result.status === "failed")
            .map((result) => result.objectiveId),
          codeState: selectedVerification.attempt.codeState,
          snapshot: {
            contract: selectedVerification.snapshot.contract,
            regionTestId: selectedVerification.snapshot.regionTestId,
            dimensions: selectedVerification.snapshot.dimensions,
            imageDataUrl: selectedVerification.snapshot.imageDataUrl,
          },
          attemptNumber: selectedVerification.attempt.number,
          locale,
        }),
      });
      if (!response.ok) throw new Error("Coach request failed");
      const insight: unknown = await response.json();
      if (
        typeof insight !== "object" ||
        insight === null ||
        !("observation" in insight) ||
        !("hint" in insight) ||
        !("whyItMatters" in insight) ||
        !("inspectNext" in insight) ||
        !("bossTaunt" in insight) ||
        !("provider" in insight) ||
        !("usedFallback" in insight) ||
        !("hintLevel" in insight)
      ) throw new Error("Coach response invalid");
      const candidate = insight;
      if (
        typeof candidate.observation !== "string" ||
        typeof candidate.hint !== "string" ||
        typeof candidate.whyItMatters !== "string" ||
        typeof candidate.inspectNext !== "string" ||
        typeof candidate.bossTaunt !== "string" ||
        (candidate.provider !== "demo" && candidate.provider !== "local-vision") ||
        typeof candidate.usedFallback !== "boolean" ||
        (candidate.hintLevel !== 1 && candidate.hintLevel !== 2 && candidate.hintLevel !== 3)
      ) throw new Error("Coach response invalid");
      if (coachRequestRef.current !== requestId) return;
      setCoach({
        observation: candidate.observation,
        hint: candidate.hint,
        whyItMatters: candidate.whyItMatters,
        inspectNext: candidate.inspectNext,
        bossTaunt: candidate.bossTaunt,
        provider: candidate.provider,
        usedFallback: candidate.usedFallback,
        hintLevel: candidate.hintLevel,
      });
      setCoachedAttempt(selectedVerification.attempt.number);
    } catch {
      if (coachRequestRef.current === requestId) setCoachError(true);
    } finally {
      if (coachRequestRef.current === requestId) setCoachLoading(false);
    }
  };

  const passedCount = state.verifiedObjectiveIds.length;
  return (
    <main ref={rootRef} className="arena">
      <div className="topbar">
        <p className="working-title">{copy.product.workingTitle}</p>
        <div className="preferences">
          <SoundControl choice={progression.soundChoice} copy={copy} onChange={updateSound} />
          <LanguageSwitcher locale={locale} copy={copy} onChange={selectLocale} />
        </div>
      </div>
      {!storageAvailable && <p className="storage-fallback" role="status">{copy.progression.storageFallback}</p>}
      <p className="sr-only" aria-live="polite" aria-atomic="true">{copy.announcements[state.phase]}</p>
      <p className="sr-only" aria-live="assertive" aria-atomic="true">
        {state.lastHit ? copy.progression.hitAnnouncement(state.lastHit.damage, state.lastHit.xp, state.lastHit.combo) : ""}
      </p>

      {state.phase === "landing" && (
        <div className="landing-shell">
          <header className="hero">
            <p className="eyebrow">{copy.product.mission}</p>
            <h1 ref={phaseHeadingRef} tabIndex={-1}>{copy.landing.heading}</h1>
            <p className="proposition">{copy.product.proposition}</p>
            <p className="lead">{copy.landing.body}</p>
            <div className="fresh-status" aria-label={copy.mission.status}>
              <span>{copy.mission.hp(state.hp)}</span><span>{copy.mission.objectivesProgress(0)}</span><span>{copy.progression.totalXp(progression.totalXp)}</span>
            </div>
            <button className="primary-action start-action" type="button" onClick={() => dispatch({ type: "START_MISSION" })}>{copy.landing.start}</button>
          </header>
          <MissionLoop copy={copy} />
        </div>
      )}

      {state.phase === "briefing" && (
        <section className="briefing-screen" aria-labelledby="briefing-heading">
          <p className="eyebrow">{copy.briefing.eyebrow}</p>
          <h1 id="briefing-heading" ref={phaseHeadingRef} tabIndex={-1}>{copy.briefing.heading}</h1>
          <p className="lead">{copy.briefing.body}</p>
          <h2>{copy.briefing.objectivesHeading}</h2>
          <ObjectiveList copy={copy} results={state.results} detailed />
          <button className="primary-action" type="button" onClick={() => dispatch({ type: "ENTER_PREVIEW" })}>{copy.briefing.enter}</button>
        </section>
      )}

      {isActivePhase(state.phase) && (
        <>
          <header className="mission-header">
            <div><p className="eyebrow">{copy.product.mission}</p><h1 ref={phaseHeadingRef} tabIndex={-1}>{copy.briefing.heading}</h1></div>
            <p className="compact-proposition">{copy.product.proposition}</p>
          </header>
          <div className="status-strip" aria-label={copy.mission.status}>
            <span>{copy.mission.hp(state.hp)}</span><span>{copy.mission.objectivesProgress(passedCount)}</span><span>{copy.mission.fixtureStatus(state.fixture)}</span><span>{copy.progression.attempts(state.history.length)}</span><span>{copy.progression.xp(state.xpEarned)}</span><span>{copy.progression.combo(state.combo)}</span>
          </div>

          <div className="mission-grid">
            <section className="panel objectives-panel" aria-labelledby="objectives-heading">
              <h2 id="objectives-heading">{copy.briefing.objectivesHeading}</h2>
              <ObjectiveList copy={copy} results={state.results} />
            </section>

            <MissionDialog codeState={appliedCode} copy={copy.fixture} openRequest={openRequest} onPrimary={() => undefined} />

            <section className="panel battle" aria-labelledby="battle-heading">
              <h2 id="battle-heading" className="sr-only">{copy.mission.heading}</h2>
              <div key={state.lastHit?.attempt ?? 0} className={`boss ${state.lastHit ? "boss-hit" : ""}`} role="img" aria-label={copy.mission.bossLabel}><span aria-hidden="true">⌘</span><div className="eye left" /><div className="eye right" /><p>{copy.mission.bossLabel}</p></div>
              {state.lastHit && (
                <div key={`hit-${state.lastHit.attempt}`} className="hit-feedback">
                  <strong className="damage-number">−{state.lastHit.damage} HP</strong>
                  <span>{copy.progression.xpGain(state.lastHit.xp)}</span>
                  <span className="critical-hit">{copy.progression.criticalHit}</span>
                  {state.lastHit.combo > 1 && <span className="combo-indicator">{copy.progression.combo(state.lastHit.combo)}</span>}
                  <span className="particles" aria-hidden="true"><i /><i /><i /></span>
                </div>
              )}
              <div className="health" aria-hidden="true"><div style={{ width: `${state.hp}%` }} /></div>
              <p className="hp-copy" aria-label={copy.mission.hp(state.hp)}><strong data-testid="boss-hp">{state.hp}</strong> / 100</p>
              <p className="phase" aria-live="polite">{copy.mission.phase[state.phase]}</p>
            </section>
          </div>

          <CodeLabPanel
            copy={copy.codeLab}
            draft={draftCode}
            source={codeLab.source(draftCode)}
            diff={codeLab.diff(draftCode)}
            showDiff={showDiff}
            validationErrors={validationErrors}
            checking={checking}
            onChange={setDraftCode}
            onTryBrokenUi={() => setOpenRequest((request) => request + 1)}
            onApply={applyChanges}
            onRunChecks={runChecks}
            onReset={resetCode}
            onToggleDiff={() => setShowDiff((visible) => !visible)}
            headingRef={codeLabHeadingRef}
          />

          <section className="panel verification-panel" aria-labelledby="verification-heading">
            <div className="section-heading-row"><div><h2 id="verification-heading">{copy.console.heading}</h2><p>{copy.console.deterministic}</p></div><span className="attempt-label">#{state.attempt}</span></div>
            <ul className="event-feed">{state.feed.length === 0 ? <li>{copy.console.empty}</li> : state.feed.map((code, index) => <li key={`${code}-${index}`}>{copy.feed[code]}</li>)}</ul>
            {state.results.length > 0 && <div className="results-summary"><h3>{copy.results.heading}</h3><ObjectiveList copy={copy} results={state.results} detailed /></div>}
            <div className="history-section">
              <h3>{copy.history.heading}</h3>
              <AttemptHistory history={state.history} copy={copy.history} selectedAttempt={selectedAttempt} onSelectAttempt={(attempt) => {
                setSelectedAttempt(attempt);
                setCoach(null);
                setCoachError(false);
                setCoachedAttempt(null);
                coachRequestRef.current += 1;
                setCoachLoading(false);
              }} />
              <VisualCoach
                copy={copy.coach}
                insight={coach}
                loading={coachLoading}
                error={coachError}
                canAsk={Boolean(selectedVerification?.objectives.some((result) => result.status === "failed"))}
                hintAlreadyRevealed={coachedAttempt === selectedVerification?.attempt.number}
                onAsk={askCoach}
                onReturnToCodeLab={() => {
                  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  codeLabHeadingRef.current?.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
                  codeLabHeadingRef.current?.focus();
                }}
              />
            </div>
            {state.phase === "victory" && state.rank && (
              <section className="victory-summary" aria-labelledby="victory-heading">
                <p className="victory-kicker">{copy.progression.victory}</p>
                <h2 id="victory-heading" ref={victoryHeadingRef} tabIndex={-1}>{copy.progression.bossDefeated}</h2>
                <div className="victory-badges">
                  <span>{copy.progression.rank(state.rank)}</span>
                  <span>{copy.progression.xpEarned(state.xpEarned)}</span>
                  <span>{copy.progression.attempts(state.history.length)}</span>
                  {state.perfectRepair && <strong>{copy.progression.perfectRepair}</strong>}
                </div>
                <h3>{copy.progression.restoredHeading}</h3>
                <ul>{keyboardTrapObjectives.map((objective) => <li key={objective.id}>✓ {copy.objectives[objective.id].title}</li>)}</ul>
                <div className="victory-debrief">
                  <h3>{copy.debrief.heading}</h3>
                  <p><strong>{copy.debrief.semanticsHeading}:</strong> {copy.debrief.semantics}</p>
                  <p><strong>{copy.debrief.behaviorHeading}:</strong> {copy.debrief.behavior}</p>
                </div>
                <div className="action-row">
                  <button className="primary-action" type="button" onClick={replayMission}>{copy.actions.replay}</button>
                  <button className="secondary-action" type="button" onClick={() => dispatch({ type: "SHOW_DEBRIEF" })}>{copy.actions.seeDebrief}</button>
                </div>
                <aside className="future-mission" aria-label={copy.progression.teaserLabel}>
                  <p className="eyebrow">{copy.progression.teaserLabel}</p>
                  <h3>{copy.progression.teaserTitle}</h3>
                  <p>{copy.progression.teaserBody}</p>
                  <span aria-disabled="true">{copy.progression.unavailable}</span>
                </aside>
              </section>
            )}
          </section>
        </>
      )}

      {state.phase === "debrief" && (
        <section className="debrief panel" aria-labelledby="debrief-heading">
          <p className="eyebrow">{copy.debrief.eyebrow}</p><h1 id="debrief-heading" ref={phaseHeadingRef} tabIndex={-1}>{copy.debrief.heading}</h1>
          <div className="debrief-grid"><div><h2>{copy.debrief.semanticsHeading}</h2><p>{copy.debrief.semantics}</p></div><div><h2>{copy.debrief.behaviorHeading}</h2><p>{copy.debrief.behavior}</p></div></div>
          <div className="debrief-score"><span>{copy.mission.hp(state.hp)}</span><span>{copy.mission.objectivesProgress(passedCount)}</span></div>
          <button className="primary-action" type="button" onClick={replayMission}>{copy.actions.replay}</button>
          <aside className="future-mission" aria-label={copy.progression.teaserLabel}>
            <p className="eyebrow">{copy.progression.teaserLabel}</p><h2>{copy.progression.teaserTitle}</h2><p>{copy.progression.teaserBody}</p><span aria-disabled="true">{copy.progression.unavailable}</span>
          </aside>
        </section>
      )}
    </main>
  );
}
