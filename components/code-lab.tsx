"use client";

import { useId, useState, type KeyboardEvent, type RefObject } from "react";
import { AiHintIcon } from "@/components/ai-hint-icon";
import type { DialogCodeState } from "@/lib/domain/mission";
import type { MissionDictionary } from "@/lib/i18n/dictionaries";
import {
  accessibilityRepairFields,
  cssRepairFields,
  type CodeDiffLine,
  type DialogPresetId,
  type DialogRepairField,
  type RepairTabId,
} from "@/lib/mission/code-lab";

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
  verifiedCount: number;
  verifiedXp: number;
  onChange: (state: DialogCodeState) => void;
  onNewSetup: () => void;
  onRunChecks: () => void;
  onReset: () => void;
  onToggleDiff: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

function AiFieldTip({ visible, hint, label }: { visible: boolean; hint: string | null; label: string }) {
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
  verifiedCount,
  verifiedXp,
  onChange,
  onNewSetup,
  onRunChecks,
  onReset,
  onToggleDiff,
  headingRef,
}: CodeLabPanelProps) {
  const [activeTab, setActiveTab] = useState<RepairTabId>("accessibility");
  const tabId = useId();
  const setBoolean = (field: "ariaModal" | "escapeCloses" | "focusContainment" | "focusRestoration", checked: boolean) => {
    onChange({ ...value, [field]: checked });
  };
  const isHighlighted = (field: DialogRepairField): boolean => highlightedFields.some((candidate) => candidate === field);
  const highlightedIn = (fields: readonly DialogRepairField[]): number => fields.filter(isHighlighted).length;
  const tipFor = (field: DialogRepairField) => <AiFieldTip visible={isHighlighted(field)} hint={aiHint} label={copy.aiTooltipLabel} />;
  const moveTabFocus = (event: KeyboardEvent<HTMLButtonElement>, id: RepairTabId) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next: RepairTabId = event.key === "Home" ? "accessibility" : event.key === "End" ? "css" : id === "accessibility" ? "css" : "accessibility";
    setActiveTab(next);
    event.currentTarget.ownerDocument.getElementById(`${tabId}-${next}-tab`)?.focus();
  };
  const tab = (id: RepairTabId, label: string, count: number) => (
    <button
      id={`${tabId}-${id}-tab`}
      className={count > 0 ? "ai-tab-highlight" : ""}
      type="button"
      role="tab"
      tabIndex={activeTab === id ? 0 : -1}
      aria-selected={activeTab === id}
      aria-controls={`${tabId}-${id}-panel`}
      onClick={() => setActiveTab(id)}
      onKeyDown={(event) => moveTabFocus(event, id)}
    >
      {label}{count > 0 && <span className="tab-hint-count" aria-label={copy.tabs.hintCount(count)}>{count}</span>}
    </button>
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

      <div className="repair-context-bar">
        <div><span>{copy.presetLabel}</span><strong>{copy.presetName[presetId]}</strong><p>{copy.presetBehavior[presetId]}</p></div>
        <button className="secondary-action" type="button" onClick={onNewSetup}>{copy.actions.newSetup}</button>
        <p className="sr-only" aria-live="polite" aria-atomic="true">{copy.presetName[presetId]}. {copy.presetBehavior[presetId]}</p>
      </div>

      <div className="verified-xp-console" aria-label={copy.verifiedProgressLabel(verifiedCount, verifiedXp)}>
        <div><span>{copy.verifiedXp}</span><strong data-testid="verified-xp">{verifiedXp} / 300 XP</strong></div>
        <ol aria-hidden="true">{[0, 1, 2, 3].map((index) => <li className={index < verifiedCount ? "is-verified" : ""} key={index}>✓</li>)}</ol>
        <small>{copy.verifiedProgressHelp}</small>
      </div>

      <div className="repair-tabs" role="tablist" aria-label={copy.tabs.label}>
        {tab("accessibility", copy.tabs.accessibility, highlightedIn(accessibilityRepairFields))}
        {tab("css", copy.tabs.css, highlightedIn(cssRepairFields))}
      </div>

      <fieldset
        id={`${tabId}-accessibility-panel`}
        className="code-controls"
        role="tabpanel"
        aria-labelledby={`${tabId}-accessibility-tab`}
        hidden={activeTab !== "accessibility"}
      >
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
      </fieldset>

      <fieldset
        id={`${tabId}-css-panel`}
        className="code-controls css-controls"
        role="tabpanel"
        aria-labelledby={`${tabId}-css-tab`}
        hidden={activeTab !== "css"}
      >
        <legend>{copy.cssControlsLegend}</legend>
        <div className={`repair-control ${isHighlighted("actionDisplay") ? "ai-highlight" : ""}`}><label htmlFor="action-display">{copy.fields.actionDisplay}</label>{tipFor("actionDisplay")}<select id="action-display" value={value.actionDisplay} onChange={(event) => onChange({ ...value, actionDisplay: event.target.value === "flex" ? "flex" : "grid" })}><option value="grid">grid</option><option value="flex">flex</option></select></div>
        <div className={`repair-control ${isHighlighted("actionDirection") ? "ai-highlight" : ""}`}><label htmlFor="action-direction">{copy.fields.actionDirection}</label>{tipFor("actionDirection")}<select id="action-direction" value={value.actionDirection} onChange={(event) => onChange({ ...value, actionDirection: event.target.value === "row" ? "row" : "column" })}><option value="column">column</option><option value="row">row</option></select></div>
        <div className={`repair-control ${isHighlighted("actionAlign") ? "ai-highlight" : ""}`}><label htmlFor="action-align">{copy.fields.actionAlign}</label>{tipFor("actionAlign")}<select id="action-align" value={value.actionAlign} onChange={(event) => onChange({ ...value, actionAlign: event.target.value === "center" ? "center" : "stretch" })}><option value="stretch">stretch</option><option value="center">center</option></select></div>
        <div className={`repair-control ${isHighlighted("actionJustify") ? "ai-highlight" : ""}`}><label htmlFor="action-justify">{copy.fields.actionJustify}</label>{tipFor("actionJustify")}<select id="action-justify" value={value.actionJustify} onChange={(event) => onChange({ ...value, actionJustify: event.target.value === "flex-end" ? "flex-end" : event.target.value === "space-between" ? "space-between" : "flex-start" })}><option value="flex-start">flex-start</option><option value="flex-end">flex-end</option><option value="space-between">space-between</option></select></div>
        <div className={`repair-control ${isHighlighted("actionGap") ? "ai-highlight" : ""}`}><label htmlFor="action-gap">{copy.fields.actionGap}</label>{tipFor("actionGap")}<select id="action-gap" value={value.actionGap} onChange={(event) => onChange({ ...value, actionGap: event.target.value === "16" ? 16 : event.target.value === "8" ? 8 : 0 })}><option value={0}>0px</option><option value={8}>8px</option><option value={16}>16px</option></select></div>
      </fieldset>

      {validationErrors.length > 0 && <div className="validation-errors" role="alert"><strong>{copy.validationHeading}</strong><ul>{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
      <div className="direct-actions"><button className="primary-action check-attack" type="button" onClick={onRunChecks} disabled={checking}>{checking ? copy.actions.checking : copy.actions.check}</button><button className="text-action" type="button" onClick={onReset}>{copy.actions.reset}</button></div>
      <details className="technical-details" open={showDiff} onToggle={(event) => { if (event.currentTarget.open !== showDiff) onToggleDiff(); }}>
        <summary>{copy.actions.diff}</summary>
        <div className="code-view" aria-label={copy.diffLabel}>{showDiff ? <pre>{diff.map((line, index) => <code className={`diff-${line.kind}`} key={`${line.kind}-${index}`}>{line.kind === "added" ? "+ " : line.kind === "removed" ? "- " : "  "}{line.text}{"\n"}</code>)}</pre> : <pre><code>{source}</code></pre>}</div>
      </details>
      <div className="code-view current-source" aria-label={copy.sourceLabel}><pre><code>{source}</code></pre></div>
    </section>
  );
}
