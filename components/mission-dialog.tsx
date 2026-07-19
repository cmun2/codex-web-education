"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { DialogCodeState } from "@/lib/domain/mission";
import type { MissionDictionary } from "@/lib/i18n/dictionaries";

type MissionDialogProps = {
  codeState: DialogCodeState;
  copy: MissionDictionary["fixture"];
  openRequest: number;
  onPrimary: () => void;
};

export function MissionDialog({ codeState, copy, openRequest, onPrimary }: MissionDialogProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const hasReceivedOpenRequest = useRef(false);

  useEffect(() => {
    if (!hasReceivedOpenRequest.current) {
      hasReceivedOpenRequest.current = true;
      return;
    }
    setOpen(true);
  }, [openRequest]);

  useEffect(() => {
    if (!open || !codeState.focusContainment) return;
    closeRef.current?.focus();
  }, [codeState.focusContainment, open]);

  const closeDialog = () => {
    setOpen(false);
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

  const status =
    codeState.dialogRole === "dialog" &&
    codeState.ariaModal &&
    codeState.ariaLabelledBy === "dialog-title" &&
    codeState.ariaDescribedBy === "dialog-description" &&
    codeState.escapeCloses &&
    codeState.focusContainment &&
    codeState.focusRestoration
      ? "repaired"
      : codeState.dialogRole === "none" &&
          !codeState.ariaModal &&
          codeState.ariaLabelledBy === "none" &&
          codeState.ariaDescribedBy === "none" &&
          !codeState.escapeCloses &&
          !codeState.focusContainment &&
          !codeState.focusRestoration
        ? "broken"
        : "modified";

  return (
    <section className="preview" aria-label={copy.regionLabel} data-testid="mission-fixture">
      <p className={`fixture-badge is-${status}`}>
        {status === "repaired" ? copy.repairedLabel : status === "modified" ? copy.modifiedLabel : copy.brokenLabel}
      </p>
      <h2>{copy.heading}</h2>
      <p>{copy.introduction}</p>
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
      <button ref={triggerRef} data-action="trigger" className="trigger" type="button" onClick={() => setOpen(true)}>
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
            className="dialog"
            onKeyDown={handleKeyDown}
          >
            <h3 id="dialog-title">{copy.dialogTitle}</h3>
            <p id="dialog-description">{copy.dialogDescription}</p>
            <div className="dialog-actions">
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
