"use client";

import type { CoachInsight } from "@/lib/domain/providers";
import type { MissionDictionary } from "@/lib/i18n/dictionaries";

type VisualCoachProps = {
  copy: MissionDictionary["coach"];
  insight: CoachInsight | null;
  loading: boolean;
  error: boolean;
  canAsk: boolean;
  hintAlreadyRevealed: boolean;
  onAsk: () => void;
  onReturnToCodeLab: () => void;
};

export function VisualCoach({
  copy,
  insight,
  loading,
  error,
  canAsk,
  hintAlreadyRevealed,
  onAsk,
  onReturnToCodeLab,
}: VisualCoachProps) {
  return (
    <section className="visual-coach" aria-labelledby="visual-coach-heading">
      <div className="section-heading-row">
        <div>
          <h3 id="visual-coach-heading">{copy.heading}</h3>
          <p>{copy.description}</p>
        </div>
      </div>
      <button
        className="secondary-action"
        type="button"
        onClick={onAsk}
        disabled={!canAsk || loading || hintAlreadyRevealed}
      >
        {loading ? copy.loading : hintAlreadyRevealed ? copy.revealed : copy.ask}
      </button>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {loading ? copy.loading : insight ? copy.loaded : error ? copy.error : ""}
      </p>

      {insight && (
        <aside className="coach" aria-live="polite" aria-label={copy.label}>
          <h4>{copy.observationLabel}</h4>
          <p>{insight.observation}</p>
          <h4>{copy.hintLabel}</h4>
          <p>{insight.hint}</p>
          <details>
            <summary>{copy.advanced}</summary>
            <div className="coach-heading-row">
              <strong>{insight.provider === "local-vision" ? copy.localLabel : copy.demoLabel}</strong>
              <span>{copy.progress(insight.hintLevel)}</span>
            </div>
            {insight.usedFallback && <p className="fallback-note">{copy.fallback}</p>}
            <p><b>{copy.whyLabel}:</b> {insight.whyItMatters}</p>
            <p><b>{copy.inspectLabel}:</b> {insight.inspectNext}</p>
            <i>{insight.bossTaunt}</i>
          </details>
          <button className="text-action" type="button" onClick={onReturnToCodeLab}>{copy.returnToCodeLab}</button>
        </aside>
      )}
      {error && <p className="error-message" role="alert">{copy.error}</p>}
    </section>
  );
}
