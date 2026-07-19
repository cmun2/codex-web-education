"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { MissionDictionary } from "@/lib/i18n/dictionaries";

type MissionDialogProps = {
  repaired: boolean;
  copy: MissionDictionary["fixture"];
  onPrimary: () => void;
};

export function MissionDialog({ repaired, copy, onPrimary }: MissionDialogProps) {
  const [open, setOpen] = useState(repaired);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !repaired) return;
    closeRef.current?.focus();
    if (dialogRef.current?.contains(document.activeElement)) dialogRef.current.dataset.initialFocus = "true";
  }, [open, repaired]);

  const closeDialog = () => {
    setOpen(false);
    if (repaired) triggerRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!repaired) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== "Tab") return;
    if (!event.shiftKey && document.activeElement === primaryRef.current) {
      event.preventDefault();
      closeRef.current?.focus();
    } else if (event.shiftKey && document.activeElement === closeRef.current) {
      event.preventDefault();
      primaryRef.current?.focus();
    }
  };

  return (
    <section className="preview" aria-label={copy.regionLabel}>
      <p className={`fixture-badge ${repaired ? "is-repaired" : "is-broken"}`}>{repaired ? copy.repairedLabel : copy.brokenLabel}</p>
      <h2>{copy.heading}</h2>
      <p>{copy.introduction}</p>
      <dl className="behavior-contract">
        <div>
          <dt>{copy.expectedLabel}</dt>
          <dd>{copy.expected}</dd>
        </div>
        {!repaired && (
          <div className="failure-copy">
            <dt>{copy.failureLabel}</dt>
            <dd>{copy.failure}</dd>
          </div>
        )}
      </dl>
      <button ref={triggerRef} className="trigger" type="button" onClick={() => setOpen(true)}>
        {copy.open}
      </button>
      {open && (
        <div className="scrim">
          <div
            ref={dialogRef}
            data-testid="mission-dialog"
            data-focus-loop={repaired ? "true" : undefined}
            data-keyboard-contract={repaired ? "true" : undefined}
            data-focus-return={repaired ? "true" : undefined}
            role={repaired ? "dialog" : undefined}
            aria-modal={repaired ? "true" : undefined}
            aria-labelledby={repaired ? "dialog-title" : undefined}
            aria-describedby={repaired ? "dialog-description" : undefined}
            className="dialog"
            onKeyDown={handleKeyDown}
          >
            <h3 id={repaired ? "dialog-title" : undefined}>{copy.dialogTitle}</h3>
            <p id={repaired ? "dialog-description" : undefined}>{copy.dialogDescription}</p>
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
