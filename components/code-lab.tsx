"use client";

import type { DialogCodeState } from "@/lib/domain/mission";
import type { CodeDiffLine } from "@/lib/mission/code-lab";
import type { MissionDictionary } from "@/lib/i18n/dictionaries";
import type { RefObject } from "react";

type CodeLabPanelProps = {
  copy: MissionDictionary["codeLab"];
  draft: DialogCodeState;
  source: string;
  diff: readonly CodeDiffLine[];
  showDiff: boolean;
  validationErrors: readonly string[];
  checking: boolean;
  onChange: (state: DialogCodeState) => void;
  onTryBrokenUi: () => void;
  onApply: () => void;
  onRunChecks: () => void;
  onReset: () => void;
  onToggleDiff: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

export function CodeLabPanel({
  copy,
  draft,
  source,
  diff,
  showDiff,
  validationErrors,
  checking,
  onChange,
  onTryBrokenUi,
  onApply,
  onRunChecks,
  onReset,
  onToggleDiff,
  headingRef,
}: CodeLabPanelProps) {
  const setBoolean = (field: "ariaModal" | "escapeCloses" | "focusContainment" | "focusRestoration", value: boolean) => {
    onChange({ ...draft, [field]: value });
  };

  return (
    <section className="panel code-lab" aria-labelledby="code-lab-heading">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="code-lab-heading" ref={headingRef} tabIndex={-1}>{copy.heading}</h2>
          <p>{copy.description}</p>
        </div>
        <span className="safe-badge">{copy.safeBadge}</span>
      </div>

      <fieldset className="code-controls">
        <legend>{copy.controlsLegend}</legend>
        <label>
          <span>{copy.fields.dialogRole}</span>
          <select
            value={draft.dialogRole}
            onChange={(event) => onChange({ ...draft, dialogRole: event.target.value === "dialog" ? "dialog" : "none" })}
          >
            <option value="none">{copy.values.none}</option>
            <option value="dialog">dialog</option>
          </select>
        </label>
        <label>
          <span>{copy.fields.labelledBy}</span>
          <select
            value={draft.ariaLabelledBy}
            onChange={(event) => onChange({ ...draft, ariaLabelledBy: event.target.value === "dialog-title" ? "dialog-title" : "none" })}
          >
            <option value="none">{copy.values.none}</option>
            <option value="dialog-title">dialog-title</option>
          </select>
        </label>
        <label>
          <span>{copy.fields.describedBy}</span>
          <select
            value={draft.ariaDescribedBy}
            onChange={(event) => onChange({ ...draft, ariaDescribedBy: event.target.value === "dialog-description" ? "dialog-description" : "none" })}
          >
            <option value="none">{copy.values.none}</option>
            <option value="dialog-description">dialog-description</option>
          </select>
        </label>
        <label className="toggle-control">
          <input type="checkbox" checked={draft.ariaModal} onChange={(event) => setBoolean("ariaModal", event.target.checked)} />
          <span>{copy.fields.ariaModal}</span>
        </label>
        <label className="toggle-control">
          <input type="checkbox" checked={draft.escapeCloses} onChange={(event) => setBoolean("escapeCloses", event.target.checked)} />
          <span>{copy.fields.escapeCloses}</span>
        </label>
        <label className="toggle-control">
          <input type="checkbox" checked={draft.focusContainment} onChange={(event) => setBoolean("focusContainment", event.target.checked)} />
          <span>{copy.fields.focusContainment}</span>
        </label>
        <label className="toggle-control">
          <input type="checkbox" checked={draft.focusRestoration} onChange={(event) => setBoolean("focusRestoration", event.target.checked)} />
          <span>{copy.fields.focusRestoration}</span>
        </label>
      </fieldset>

      {validationErrors.length > 0 && (
        <div className="validation-errors" role="alert">
          <strong>{copy.validationHeading}</strong>
          <ul>{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}

      <div className="code-view" aria-label={showDiff ? copy.diffLabel : copy.sourceLabel}>
        {showDiff ? (
          <pre>{diff.map((line, index) => <code className={`diff-${line.kind}`} key={`${line.kind}-${index}`}>{line.kind === "added" ? "+ " : line.kind === "removed" ? "- " : "  "}{line.text}{"\n"}</code>)}</pre>
        ) : (
          <pre><code>{source}</code></pre>
        )}
      </div>

      <div className="action-row code-actions">
        <button className="secondary-action" type="button" onClick={onTryBrokenUi}>{copy.actions.tryUi}</button>
        <button className="primary-action" type="button" onClick={onApply}>{copy.actions.apply}</button>
        <button className="primary-action" type="button" onClick={onRunChecks} disabled={checking}>{copy.actions.check}</button>
        <button className="text-action" type="button" onClick={onReset}>{copy.actions.reset}</button>
        <button className="text-action" type="button" aria-expanded={showDiff} onClick={onToggleDiff}>{copy.actions.diff}</button>
      </div>
    </section>
  );
}
