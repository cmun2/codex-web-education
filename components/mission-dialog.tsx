"use client";

import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import type { DialogCodeState } from "@/lib/domain/mission";
import type { MissionDictionary } from "@/lib/i18n/dictionaries";
import { isActionLayoutRepaired } from "@/lib/mission/code-lab";

type MissionDialogProps = {
  codeState: DialogCodeState;
  copy: MissionDictionary["fixture"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrimary: () => void;
};

export function MissionDialog({ codeState, copy, open, onOpenChange, onPrimary }: MissionDialogProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

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

  const identityReady = codeState.dialogRole === "dialog" &&
    codeState.ariaModal &&
    codeState.ariaLabelledBy === "dialog-title" &&
    codeState.ariaDescribedBy === "dialog-description";
  const focusReady = codeState.focusContainment;
  const keyboardReady = codeState.escapeCloses && codeState.focusRestoration;
  const layoutReady = isActionLayoutRepaired(codeState);
  const signalStates = [
    { id: "identity", ready: identityReady },
    { id: "focus", ready: focusReady },
    { id: "keyboard", ready: keyboardReady },
    { id: "layout", ready: layoutReady },
  ] as const;
  const status = identityReady && focusReady && keyboardReady && layoutReady
      ? "repaired"
      : codeState.dialogRole === "none" &&
          !codeState.ariaModal &&
          codeState.ariaLabelledBy === "none" &&
          codeState.ariaDescribedBy === "none" &&
          !codeState.escapeCloses &&
          !codeState.focusContainment &&
          !codeState.focusRestoration &&
          codeState.actionDisplay === "grid" &&
          codeState.actionDirection === "column" &&
          codeState.actionAlign === "stretch" &&
          codeState.actionJustify === "flex-start" &&
          codeState.actionGap === 0
        ? "broken"
        : "modified";

  return (
    <section className="preview" aria-label={copy.regionLabel} data-testid="mission-fixture">
      <p className={`fixture-badge is-${status}`}>
        {status === "repaired" ? copy.repairedLabel : status === "modified" ? copy.modifiedLabel : copy.brokenLabel}
      </p>
      <h2>{copy.heading}</h2>
      <p>{copy.introduction}</p>
      <div className="defect-map" aria-label={copy.defectMapLabel}>
        <p>{copy.defectMapHeading}</p>
        <ul>
          {signalStates.map((signal) => (
            <li key={signal.id} className={signal.ready ? "signal-ready" : "signal-broken"}>
              <span aria-hidden="true">{signal.ready ? "✓" : "×"}</span>
              <strong>{copy.signals[signal.id]}</strong>
              <small>{signal.ready ? copy.signalReady : copy.signalBroken}</small>
            </li>
          ))}
        </ul>
      </div>
      <dl className="behavior-contract">
        <div>
          <dt>{copy.expectedLabel}</dt>
          <dd>{copy.expected}</dd>
        </div>
        {status !== "repaired" && (
          <div className="failure-copy">
            <dt>{copy.failureLabel}</dt>
            <dd>{status === "broken" ? copy.failure : copy.modifiedFailure}</dd>
          </div>
        )}
      </dl>
      <button ref={triggerRef} data-action="trigger" className="trigger" type="button" onClick={() => onOpenChange(true)}>
        {copy.open}
      </button>
      {open && (
        <div className="scrim">
          <div
            ref={dialogRef}
            data-testid="mission-dialog"
            role={codeState.dialogRole === "dialog" ? "dialog" : undefined}
            aria-modal={codeState.ariaModal}
            aria-labelledby={codeState.ariaLabelledBy === "dialog-title" ? "dialog-title" : undefined}
            aria-describedby={codeState.ariaDescribedBy === "dialog-description" ? "dialog-description" : undefined}
            className={`dialog ${identityReady ? "" : "has-identity-defect"} ${layoutReady ? "" : "has-layout-defect"}`}
            onKeyDown={handleKeyDown}
          >
            <div className="dialog-debug-strip" aria-hidden="true">
              {!identityReady && <span>role / name ?</span>}
              {!keyboardReady && <span>Esc ×</span>}
              {!layoutReady && <span>flex ×</span>}
            </div>
            <h3 id="dialog-title">{copy.dialogTitle}</h3>
            <p id="dialog-description">{copy.dialogDescription}</p>
            <div
              className={`dialog-actions ${layoutReady ? "is-flex-row" : "has-layout-defect"} ${codeState.actionDisplay === "grid" ? "is-grid-defect" : ""}`}
              data-dialog-actions
              style={{
                display: codeState.actionDisplay,
                flexDirection: codeState.actionDirection,
                alignItems: codeState.actionAlign,
                justifyContent: codeState.actionJustify,
                gap: `${codeState.actionGap}px`,
              }}
            >
              <button ref={closeRef} data-action="close" type="button" onClick={closeDialog}>
                {copy.close}
              </button>
              <button
                ref={primaryRef}
                data-action="primary"
                type="button"
                onClick={() => {
                  onPrimary();
                  closeDialog();
                }}
              >
                {copy.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
