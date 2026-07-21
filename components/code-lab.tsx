"use client";

import type { DialogCodeState } from "@/lib/domain/mission";
import type { CodeDiffLine, DialogPresetId, DialogRepairField } from "@/lib/mission/code-lab";
import type { MissionDictionary } from "@/lib/i18n/dictionaries";
import type { RefObject } from "react";
import { AiHintIcon } from "@/components/ai-hint-icon";

type CodeLabPanelProps = {
  copy: MissionDictionary["codeLab"];
  value: DialogCodeState;
  presetId: DialogPresetId;
  source: string;
  diff: readonly CodeDiffLine[];
  showDiff: boolean;
  validationErrors: readonly string[];
  checking: boolean;
  highlightedFields: readonly DialogRepairField[];
  aiHint: string | null;
  onChange: (state: DialogCodeState) => void;
  onNewSetup: () => void;
  onRunChecks: () => void;
  onReset: () => void;
  onToggleDiff: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

type AiFieldTipProps = {
  visible: boolean;
  hint: string | null;
  label: string;
};

function AiFieldTip({ visible, hint, label }: AiFieldTipProps) {
  if (!visible || !hint) return null;

  return (
    <button className="ai-field-tip" type="button" data-tooltip={hint} aria-label={`${label}: ${hint}`}>
      <AiHintIcon className="ai-hint-icon" />
    </button>
  );
}

export function CodeLabPanel({
  copy,
  value,
  presetId,
  source,
  diff,
  showDiff,
  validationErrors,
  checking,
  highlightedFields,
  aiHint,
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

  const isHighlighted = (field: DialogRepairField): boolean => highlightedFields.some((candidate) => candidate === field);
  const tipFor = (field: DialogRepairField) => (
    <AiFieldTip visible={isHighlighted(field)} hint={aiHint} label={copy.aiTooltipLabel} />
  );

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

      <div className="preset-card">
        <span>{copy.presetLabel}</span>
        <strong>{copy.presetName[presetId]}</strong>
        <p>{copy.presetBehavior[presetId]}</p>
        <p className="sr-only" aria-live="polite" aria-atomic="true">{copy.presetName[presetId]}. {copy.presetBehavior[presetId]}</p>
        <button className="secondary-action" type="button" onClick={onNewSetup}>{copy.actions.newSetup}</button>
      </div>

      <fieldset className="code-controls">
        <legend>{copy.controlsLegend}</legend>
        <div className={`repair-control ${isHighlighted("dialogRole") ? "ai-highlight" : ""}`}>
          <label htmlFor="dialog-role">{copy.fields.dialogRole}</label>{tipFor("dialogRole")}
          <select id="dialog-role" value={value.dialogRole} onChange={(event) => onChange({ ...value, dialogRole: event.target.value === "dialog" ? "dialog" : "none" })}>
            <option value="none">{copy.values.none}</option><option value="dialog">dialog</option>
          </select>
        </div>
        <div className={`repair-control ${isHighlighted("ariaLabelledBy") ? "ai-highlight" : ""}`}>
          <label htmlFor="dialog-labelledby">{copy.fields.labelledBy}</label>{tipFor("ariaLabelledBy")}
          <select id="dialog-labelledby" value={value.ariaLabelledBy} onChange={(event) => onChange({ ...value, ariaLabelledBy: event.target.value === "dialog-title" ? "dialog-title" : "none" })}>
            <option value="none">{copy.values.none}</option><option value="dialog-title">dialog-title</option>
          </select>
        </div>
        <div className={`repair-control ${isHighlighted("ariaDescribedBy") ? "ai-highlight" : ""}`}>
          <label htmlFor="dialog-describedby">{copy.fields.describedBy}</label>{tipFor("ariaDescribedBy")}
          <select id="dialog-describedby" value={value.ariaDescribedBy} onChange={(event) => onChange({ ...value, ariaDescribedBy: event.target.value === "dialog-description" ? "dialog-description" : "none" })}>
            <option value="none">{copy.values.none}</option><option value="dialog-description">dialog-description</option>
          </select>
        </div>
        <div className={`repair-control repair-toggle ${isHighlighted("ariaModal") ? "ai-highlight" : ""}`}><label className="toggle-control"><input type="checkbox" checked={value.ariaModal} onChange={(event) => setBoolean("ariaModal", event.target.checked)} /><span>{copy.fields.ariaModal}</span></label>{tipFor("ariaModal")}</div>
        <div className={`repair-control repair-toggle ${isHighlighted("escapeCloses") ? "ai-highlight" : ""}`}><label className="toggle-control"><input type="checkbox" checked={value.escapeCloses} onChange={(event) => setBoolean("escapeCloses", event.target.checked)} /><span>{copy.fields.escapeCloses}</span></label>{tipFor("escapeCloses")}</div>
        <div className={`repair-control repair-toggle ${isHighlighted("focusContainment") ? "ai-highlight" : ""}`}><label className="toggle-control"><input type="checkbox" checked={value.focusContainment} onChange={(event) => setBoolean("focusContainment", event.target.checked)} /><span>{copy.fields.focusContainment}</span></label>{tipFor("focusContainment")}</div>
        <div className={`repair-control repair-toggle ${isHighlighted("focusRestoration") ? "ai-highlight" : ""}`}><label className="toggle-control"><input type="checkbox" checked={value.focusRestoration} onChange={(event) => setBoolean("focusRestoration", event.target.checked)} /><span>{copy.fields.focusRestoration}</span></label>{tipFor("focusRestoration")}</div>
        <div className={`repair-control ${isHighlighted("actionLayout") ? "ai-highlight" : ""}`}>
          <label htmlFor="action-layout">{copy.fields.actionLayout}</label>{tipFor("actionLayout")}
          <select id="action-layout" value={value.actionLayout} onChange={(event) => onChange({ ...value, actionLayout: event.target.value === "flex-row" ? "flex-row" : "overlap" })}>
            <option value="overlap">{copy.values.overlap}</option><option value="flex-row">{copy.values.flexRow}</option>
          </select>
        </div>
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
