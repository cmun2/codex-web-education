"use client";

import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { MissionDialog } from "@/components/mission-dialog";
import { battleReducer, initialBattleState, type MissionPhase } from "@/lib/domain/battle";
import { keyboardTrapObjectives, type ObjectiveResult, type ObjectiveStatus } from "@/lib/domain/mission";
import { DeterministicCoachProvider, DeterministicCodeLab, type CoachInsight } from "@/lib/domain/providers";
import { dictionaries, statusLabel, type Locale, type MissionDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleSnapshot, getServerLocaleSnapshot, selectLocale, subscribeToLocale } from "@/lib/i18n/locale";
import { DialogObjectiveEvaluator } from "@/lib/mission/evaluator";

type ActiveMissionPhase = Exclude<MissionPhase, "landing" | "briefing" | "debrief">;
const activeMissionPhases: readonly ActiveMissionPhase[] = ["broken-preview", "attempting", "verifying", "partial-success", "failure", "victory"];
const isActivePhase = (phase: MissionPhase): phase is ActiveMissionPhase => activeMissionPhases.some((activePhase) => activePhase === phase);

function LanguageSwitcher({ locale, copy, onChange }: { locale: Locale; copy: MissionDictionary; onChange: (locale: Locale) => void }) {
  return (
    <div className="language-switcher" role="group" aria-label={copy.language.label}>
      <button type="button" aria-pressed={locale === "ko"} onClick={() => onChange("ko")}>
        {copy.language.korean}
      </button>
      <button type="button" aria-pressed={locale === "en"} onClick={() => onChange("en")}>
        {copy.language.english}
      </button>
    </div>
  );
}

function MissionLoop({ copy }: { copy: MissionDictionary }) {
  return (
    <section className="mission-loop" aria-labelledby="loop-heading">
      <h2 id="loop-heading" className="sr-only">{copy.product.loopLabel}</h2>
      <ol>
        {copy.product.loop.map((step, index) => (
          <li key={step}><span aria-hidden="true">{index + 1}</span>{step}</li>
        ))}
      </ol>
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
              {detailed && <p>{copy.objectives[objective.id].description}</p>}
              {result && (
                <p className="result-detail">
                  {result.status === "passed"
                    ? `${copy.results.checks}: ${copy.checkLabels[objective.id]}`
                    : `${copy.results.errors}: ${result.failureCodes.map((code) => copy.failureCodes[code]).join(" ")}`}
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
  const rootRef = useRef<HTMLElement>(null);
  const phaseHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousPhaseRef = useRef(state.phase);
  const copy = dictionaries[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (previousPhaseRef.current !== state.phase) phaseHeadingRef.current?.focus();
    previousPhaseRef.current = state.phase;
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "verifying" || !rootRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      if (!rootRef.current) return;
      const result = new DialogObjectiveEvaluator().evaluate(rootRef.current, { number: state.attempt, repairApplied: state.fixture === "repaired" });
      dispatch({ type: "RESULTS", result });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [state.attempt, state.fixture, state.phase]);

  const changeLocale = (nextLocale: Locale) => {
    selectLocale(nextLocale);
  };

  const applyRepair = async () => {
    dispatch({ type: "BEGIN_REPAIR" });
    await new DeterministicCodeLab().applyGuidedRepair(() => undefined);
    dispatch({ type: "REPAIR_APPLIED" });
  };

  const askCoach = async () => {
    setCoachError(false);
    try {
      setCoach(await new DeterministicCoachProvider().coach({ objectiveStatuses: state.results.map((result) => result.status), attempt: state.attempt }));
    } catch {
      setCoachError(true);
    }
  };

  const passedCount = state.results.filter((result) => result.status === "passed").length;
  return (
    <main ref={rootRef} className="arena">
      <div className="topbar">
        <p className="working-title">{copy.product.workingTitle}</p>
        <LanguageSwitcher locale={locale} copy={copy} onChange={changeLocale} />
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{copy.announcements[state.phase]}</p>

      {state.phase === "landing" && (
        <div className="landing-shell">
          <header className="hero">
            <p className="eyebrow">{copy.product.mission}</p>
            <h1 ref={phaseHeadingRef} tabIndex={-1}>{copy.landing.heading}</h1>
            <p className="proposition">{copy.product.proposition}</p>
            <p className="lead">{copy.landing.body}</p>
            <div className="fresh-status" aria-label={copy.mission.status}>
              <span>{copy.mission.hp(state.hp)}</span>
              <span>{copy.mission.objectivesProgress(0)}</span>
              <span>{copy.mission.fixtureStatus(state.fixture)}</span>
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
            <div>
              <p className="eyebrow">{copy.product.mission}</p>
              <h1 ref={phaseHeadingRef} tabIndex={-1}>{copy.briefing.heading}</h1>
            </div>
            <p className="compact-proposition">{copy.product.proposition}</p>
          </header>

          <div className="status-strip" aria-label={copy.mission.status}>
            <span>{copy.mission.hp(state.hp)}</span>
            <span>{copy.mission.objectivesProgress(passedCount)}</span>
            <span>{copy.mission.fixtureStatus(state.fixture)}</span>
          </div>

          <div className="mission-grid">
            <section className="panel objectives-panel" aria-labelledby="objectives-heading">
              <h2 id="objectives-heading">{copy.briefing.objectivesHeading}</h2>
              <ObjectiveList copy={copy} results={state.results} />
              <button className="secondary-action" type="button" onClick={askCoach}>{copy.actions.askCoach}</button>
              {coach && (
                <aside className="coach" aria-live="polite" aria-label={copy.coach.label}>
                  <strong>{copy.coach.source}</strong>
                  <p>{copy.coach.hint}</p>
                  <p><b>{copy.coach.whyLabel}:</b> {copy.coach.why}</p>
                  <p><b>{copy.coach.inspectLabel}:</b> {copy.coach.inspect}</p>
                  <i>{copy.coach.taunt}</i>
                </aside>
              )}
              {coachError && <p className="error-message" role="alert">{copy.coach.error}</p>}
            </section>

            <MissionDialog key={`${state.attempt}-${state.fixture}-${state.phase}`} repaired={state.fixture === "repaired"} copy={copy.fixture} onPrimary={() => undefined} />

            <section className="panel battle" aria-labelledby="battle-heading">
              <h2 id="battle-heading" className="sr-only">{copy.mission.heading}</h2>
              <div className="boss" role="img" aria-label={copy.mission.bossLabel}>
                <span aria-hidden="true">⌘</span><div className="eye left" /><div className="eye right" />
                <p>{copy.mission.bossLabel}</p>
              </div>
              <div className="health" aria-hidden="true"><div style={{ width: `${state.hp}%` }} /></div>
              <p className="hp-copy" aria-label={copy.mission.hp(state.hp)}><strong data-testid="boss-hp">{state.hp}</strong> / 100</p>
              <p className="phase" aria-live="polite">{copy.mission.phase[state.phase]}</p>
            </section>
          </div>

          <section className="panel verification-panel" aria-labelledby="verification-heading">
            <div className="section-heading-row">
              <div><h2 id="verification-heading">{copy.console.heading}</h2><p>{copy.console.deterministic}</p></div>
              <span className="attempt-label">#{state.attempt}</span>
            </div>
            <ul className="event-feed">
              {state.feed.length === 0 ? <li>{copy.console.empty}</li> : state.feed.map((code, index) => <li key={`${code}-${index}`}>{copy.feed[code]}</li>)}
            </ul>
            {state.results.length > 0 && (
              <div className="results-summary">
                <h3>{copy.results.heading}</h3>
                <ObjectiveList copy={copy} results={state.results} detailed />
              </div>
            )}
            <div className="action-row">
              {state.fixture === "broken" && state.phase !== "verifying" && <button className="primary-action" type="button" onClick={applyRepair}>{copy.actions.applyRepair}</button>}
              {state.fixture === "repaired" && state.phase !== "victory" && <button className="primary-action" type="button" onClick={() => dispatch({ type: "BEGIN_VERIFICATION" })} disabled={state.phase === "verifying"}>{copy.actions.runChecks}</button>}
              {state.fixture === "broken" && state.phase !== "verifying" && <button className="secondary-action" type="button" onClick={() => dispatch({ type: "BEGIN_VERIFICATION" })}>{copy.actions.runChecks}</button>}
              {state.phase === "victory" && <button className="primary-action" type="button" onClick={() => dispatch({ type: "SHOW_DEBRIEF" })}>{copy.actions.seeDebrief}</button>}
              <button className="text-action" type="button" onClick={() => { dispatch({ type: "RESET_ATTEMPT" }); setCoach(null); setCoachError(false); }}>{copy.actions.resetAttempt}</button>
            </div>
          </section>
        </>
      )}

      {state.phase === "debrief" && (
        <section className="debrief panel" aria-labelledby="debrief-heading">
          <p className="eyebrow">{copy.debrief.eyebrow}</p>
          <h1 id="debrief-heading" ref={phaseHeadingRef} tabIndex={-1}>{copy.debrief.heading}</h1>
          <div className="debrief-grid">
            <div><h2>{copy.debrief.semanticsHeading}</h2><p>{copy.debrief.semantics}</p></div>
            <div><h2>{copy.debrief.behaviorHeading}</h2><p>{copy.debrief.behavior}</p></div>
          </div>
          <div className="debrief-score"><span>{copy.mission.hp(state.hp)}</span><span>{copy.mission.objectivesProgress(passedCount)}</span></div>
          <button className="primary-action" type="button" onClick={() => { dispatch({ type: "REPLAY" }); setCoach(null); setCoachError(false); }}>{copy.actions.replay}</button>
        </section>
      )}
    </main>
  );
}
