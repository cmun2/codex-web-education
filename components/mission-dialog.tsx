"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import type { DialogCodeState, MissionObjective, MissionObjectiveId, MissionScenarioId } from "@/lib/domain/mission";
import type { MissionDictionary } from "@/lib/i18n/dictionaries";
import { isActionLayoutRepaired } from "@/lib/mission/code-lab";

type MissionDialogProps = {
  codeState: DialogCodeState;
  copy: MissionDictionary["fixture"];
  objectives: readonly MissionObjective[];
  scenarioId: MissionScenarioId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrimary: () => void;
};

export function MissionDialog({ codeState, copy, objectives, scenarioId, open, onOpenChange, onPrimary }: MissionDialogProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const [streamRan, setStreamRan] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [storeCount, setStoreCount] = useState(0);

  useLayoutEffect(() => {
    if (!open || !codeState.focusContainment) return;
    closeRef.current?.focus();
  }, [codeState.focusContainment, open]);

  const closeDialog = () => {
    onOpenChange(false);
    if (codeState.focusRestoration) triggerRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && codeState.escapeCloses) {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== "Tab" || !codeState.focusContainment) return;
    if (!event.shiftKey && document.activeElement === primaryRef.current) {
      event.preventDefault();
      closeRef.current?.focus();
    } else if (event.shiftKey && document.activeElement === closeRef.current) {
      event.preventDefault();
      primaryRef.current?.focus();
    }
  };

  const identityReady = codeState.dialogRole === "dialog" && codeState.ariaModal && codeState.ariaLabelledBy === "dialog-title" && codeState.ariaDescribedBy === "dialog-description";
  const readiness: Record<MissionObjectiveId, boolean> = {
    identity: identityReady,
    focus: codeState.focusContainment,
    keyboard: codeState.escapeCloses && codeState.focusRestoration,
    layout: isActionLayoutRepaired(codeState),
    "motion-timing": codeState.motionDuration === 1200 && codeState.motionDistance === 12,
    "motion-safety": codeState.reducedMotionSafe,
    "stream-protocol": codeState.streamProtocol === "event-stream" && codeState.streamParsing === "event-lines",
    "stream-recovery": codeState.streamReconnect === "bounded",
    "state-update": codeState.stateUpdate === "immutable" && codeState.stateSource === "single",
    "state-reset": codeState.stateReset === "reset" && codeState.stateSource === "single",
  };
  const signalStates = objectives.map((objective) => ({ id: objective.id, ready: readiness[objective.id] }));
  const readyCount = signalStates.filter((signal) => signal.ready).length;
  const status = readyCount === signalStates.length ? "repaired" : readyCount === 0 ? "broken" : "modified";

  const incrementState = () => {
    if (codeState.stateUpdate === "immutable" && codeState.stateSource === "single") {
      setViewCount((count) => count + 1);
      setStoreCount((count) => count + 1);
    } else if (codeState.stateUpdate === "mutate") {
      setStoreCount((count) => count + 1);
    } else {
      setViewCount((count) => count + 1);
    }
  };
  const resetState = () => {
    setViewCount(0);
    if (codeState.stateReset === "reset" && codeState.stateSource === "single") setStoreCount(0);
  };

  return (
    <section className="preview" aria-label={copy.regionLabel} data-testid="mission-fixture">
      <p className={`fixture-badge is-${status}`}>{status === "repaired" ? copy.repairedLabel : status === "modified" ? copy.modifiedLabel : copy.brokenLabel}</p>
      <h2>{copy.heading}</h2>
      <p>{copy.introduction}</p>
      <div className="defect-map" aria-label={copy.defectMapLabel}>
        <p>{copy.defectMapHeading}</p>
        <ul>{signalStates.map((signal) => <li key={signal.id} className={signal.ready ? "signal-ready" : "signal-broken"}><span aria-hidden="true">{signal.ready ? "✓" : "×"}</span><strong>{copy.signals[signal.id] ?? signal.id}</strong><small>{signal.ready ? copy.signalReady : copy.signalBroken}</small></li>)}</ul>
      </div>
      <dl className="behavior-contract">
        <div><dt>{copy.expectedLabel}</dt><dd>{copy.expected}</dd></div>
        {status !== "repaired" && <div className="failure-copy"><dt>{copy.failureLabel}</dt><dd>{status === "broken" ? copy.failure : copy.modifiedFailure}</dd></div>}
      </dl>

      {(scenarioId === "delete-dialog" || scenarioId === "checkout-sheet") && (
        <>
          <button ref={triggerRef} data-action="trigger" className="trigger" type="button" onClick={() => onOpenChange(true)}>{copy.open}</button>
          {open && <div className="scrim"><div data-testid="mission-dialog" role={codeState.dialogRole === "dialog" ? "dialog" : undefined} aria-modal={codeState.ariaModal} aria-labelledby={codeState.ariaLabelledBy === "dialog-title" ? "dialog-title" : undefined} aria-describedby={codeState.ariaDescribedBy === "dialog-description" ? "dialog-description" : undefined} className={`dialog ${identityReady ? "" : "has-identity-defect"} ${readiness.layout ? "" : "has-layout-defect"}`} onKeyDown={handleKeyDown}>
            <div className="dialog-debug-strip" aria-hidden="true">{!identityReady && scenarioId === "delete-dialog" && <span>role / name ?</span>}{!readiness.keyboard && scenarioId === "delete-dialog" && <span>Esc ×</span>}{!readiness.layout && scenarioId === "checkout-sheet" && <span>flex ×</span>}</div>
            <h3 id="dialog-title">{copy.dialogTitle}</h3><p id="dialog-description">{copy.dialogDescription}</p>
            <div className={`dialog-actions ${readiness.layout ? "is-flex-row" : "has-layout-defect"} ${codeState.actionDisplay === "grid" ? "is-grid-defect" : ""}`} data-dialog-actions style={{ display: codeState.actionDisplay, flexDirection: codeState.actionDirection, alignItems: codeState.actionAlign, justifyContent: codeState.actionJustify, gap: `${codeState.actionGap}px` }}>
              <button ref={closeRef} data-action="close" type="button" onClick={closeDialog}>{copy.close}</button>
              <button ref={primaryRef} data-action="primary" type="button" onClick={() => { onPrimary(); closeDialog(); }}>{copy.save}</button>
            </div>
          </div></div>}
        </>
      )}

      {scenarioId === "motion-card" && (
        <div className="motion-stage" data-motion-safe={codeState.reducedMotionSafe ? "true" : "false"}>
          <button data-motion-demo type="button" style={{ transitionDuration: `${codeState.motionDuration}ms`, transform: `translateX(${codeState.motionDistance}px)` }} onClick={onPrimary}>{copy.open}</button>
          <p><strong>{copy.dialogTitle}</strong><span>{copy.dialogDescription}</span></p>
        </div>
      )}

      {scenarioId === "ai-stream" && (
        <div className="stream-demo" data-stream-protocol={codeState.streamProtocol} data-stream-parsing={codeState.streamParsing} data-stream-reconnect={codeState.streamReconnect}>
          <button data-action="run-stream" className="trigger" type="button" onClick={() => { setStreamRan(true); onPrimary(); }}>{copy.open}</button>
          <div className={streamRan ? "stream-output has-output" : "stream-output"} data-stream-output aria-live="polite">
            <strong>{copy.dialogTitle}</strong><p>{streamRan ? (readiness["stream-protocol"] ? copy.dialogDescription : copy.failure) : copy.modifiedFailure}</p>
            {streamRan && <small>{readiness["stream-recovery"] ? copy.save : copy.close}</small>}
          </div>
        </div>
      )}

      {scenarioId === "state-counter" && (
        <div className="state-demo" data-state-update={codeState.stateUpdate} data-state-reset={codeState.stateReset} data-state-source={codeState.stateSource}>
          <div><span>{copy.dialogTitle}</span><strong data-state-view>{viewCount}</strong></div>
          <div><span>{copy.dialogDescription}</span><strong data-state-store>{storeCount}</strong></div>
          <div className="state-actions"><button data-action="increment-state" className="trigger" type="button" onClick={incrementState}>{copy.open}</button><button data-action="reset-state" type="button" onClick={resetState}>{copy.close}</button></div>
        </div>
      )}
    </section>
  );
}
