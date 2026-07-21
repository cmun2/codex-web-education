"use client";

import type { DialogCodeState } from "@/lib/domain/mission";
import type { CodeDiffLine, DialogPresetId } from "@/lib/mission/code-lab";
import type { MissionDictionary } from "@/lib/i18n/dictionaries";
import type { RefObject } from "react";

type CodeLabPanelProps = {
  copy: MissionDictionary["codeLab"];
  value: DialogCodeState;
  presetId: DialogPresetId;
  source: string;
  diff: readonly CodeDiffLine[];
  showDiff: boolean;
  validationErrors: readonly string[];
  checking: boolean;
  onChange: (state: DialogCodeState) => void;
  onNewSetup: () => void;
  onRunChecks: () => void;
  onReset: () => void;
  onToggleDiff: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

export function CodeLabPanel({
  copy,
  value,
  presetId,
  source,
  diff,
  showDiff,
  validationErrors,
  checking,
  onChange,
  onNewSetup,
  onRunChecks,
  onReset,
  onToggleDiff,
  headingRef,
}: CodeLabPanelProps) {
  const setBoolean = (field: "ariaModal" | "escapeCloses" | "focusContainment" | "focusRestoration", checked: boolean) => {
    onChange({ ...value, [field]: checked });
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

      <div className="preset-card" role="status">
        <span>{copy.presetLabel}</span>
        <strong>{copy.presetName[presetId]}</strong>
        <p>{copy.presetBehavior[presetId]}</p>
        <button className="secondary-action" type="button" onClick={onNewSetup}>{copy.actions.newSetup}</button>
      </div>

      <fieldset className="code-controls">
        <legend>{copy.controlsLegend}</legend>
        <label>
          <span>{copy.fields.dialogRole}</span>
          <select value={value.dialogRole} onChange={(event) => onChange({ ...value, dialogRole: event.target.value === "dialog" ? "dialog" : "none" })}>
            <option value="none">{copy.values.none}</option><option value="dialog">dialog</option>
          </select>
        </label>
        <label>
          <span>{copy.fields.labelledBy}</span>
          <select value={value.ariaLabelledBy} onChange={(event) => onChange({ ...value, ariaLabelledBy: event.target.value === "dialog-title" ? "dialog-title" : "none" })}>
            <option value="none">{copy.values.none}</option><option value="dialog-title">dialog-title</option>
          </select>
        </label>
        <label>
          <span>{copy.fields.describedBy}</span>
          <select value={value.ariaDescribedBy} onChange={(event) => onChange({ ...value, ariaDescribedBy: event.target.value === "dialog-description" ? "dialog-description" : "none" })}>
            <option value="none">{copy.values.none}</option><option value="dialog-description">dialog-description</option>
          </select>
        </label>
        <label className="toggle-control"><input type="checkbox" checked={value.ariaModal} onChange={(event) => setBoolean("ariaModal", event.target.checked)} /><span>{copy.fields.ariaModal}</span></label>
        <label className="toggle-control"><input type="checkbox" checked={value.escapeCloses} onChange={(event) => setBoolean("escapeCloses", event.target.checked)} /><span>{copy.fields.escapeCloses}</span></label>
        <label className="toggle-control"><input type="checkbox" checked={value.focusContainment} onChange={(event) => setBoolean("focusContainment", event.target.checked)} /><span>{copy.fields.focusContainment}</span></label>
        <label className="toggle-control"><input type="checkbox" checked={value.focusRestoration} onChange={(event) => setBoolean("focusRestoration", event.target.checked)} /><span>{copy.fields.focusRestoration}</span></label>
      </fieldset>

      {validationErrors.length > 0 && <div className="validation-errors" role="alert"><strong>{copy.validationHeading}</strong><ul>{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul></div>}

      <div className="direct-actions">
        <button className="primary-action check-attack" type="button" onClick={onRunChecks} disabled={checking}>{checking ? copy.actions.checking : copy.actions.check}</button>
        <button className="text-action" type="button" onClick={onReset}>{copy.actions.reset}</button>
      </div>

      <details className="technical-details" open={showDiff} onToggle={(event) => {
        const details = event.currentTarget;
        if (details.open !== showDiff) onToggleDiff();
      }}>
        <summary>{copy.actions.diff}</summary>
        <div className="code-view" aria-label={copy.diffLabel}>
          {showDiff ? <pre>{diff.map((line, index) => <code className={`diff-${line.kind}`} key={`${line.kind}-${index}`}>{line.kind === "added" ? "+ " : line.kind === "removed" ? "- " : "  "}{line.text}{"\n"}</code>)}</pre> : <pre><code>{source}</code></pre>}
        </div>
      </details>
      <div className="code-view current-source" aria-label={copy.sourceLabel}><pre><code>{source}</code></pre></div>
    </section>
  );
}
