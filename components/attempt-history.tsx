"use client";

import Image from "next/image";
import type { VerificationResult } from "@/lib/domain/mission";
import type { MissionDictionary } from "@/lib/i18n/dictionaries";

export function AttemptHistory({
  history,
  copy,
  selectedAttempt,
  onSelectAttempt,
}: {
  history: readonly VerificationResult[];
  copy: MissionDictionary["history"];
  selectedAttempt: number | null;
  onSelectAttempt: (attempt: number) => void;
}) {

  if (history.length === 0) return <p className="history-empty">{copy.empty}</p>;
  const selected = history.find((entry) => entry.attempt.number === selectedAttempt) ?? history[history.length - 1];
  const passed = selected.objectives.filter((objective) => objective.status === "passed").length;

  return (
    <div className="attempt-history">
      <aside className="snapshot-purpose">
        <strong>{copy.purposeHeading}</strong>
        <p>{copy.purpose}</p>
      </aside>
      <div className="attempt-tabs" role="group" aria-label={copy.selectLabel}>
        {history.map((entry) => (
          <button
            type="button"
            aria-pressed={entry.attempt.number === selected.attempt.number}
            key={entry.attempt.number}
            onClick={() => onSelectAttempt(entry.attempt.number)}
          >
            {copy.attempt(entry.attempt.number)} · {entry.objectives.filter((objective) => objective.status === "passed").length}/{entry.objectives.length}
          </button>
        ))}
      </div>
      <figure className="snapshot-card">
        <Image
          unoptimized
          src={selected.snapshot.imageDataUrl}
          width={selected.snapshot.dimensions.width}
          height={selected.snapshot.dimensions.height}
          alt={copy.snapshotAlt(selected.attempt.number)}
        />
        <figcaption>
          <strong>{copy.snapshotHeading}</strong>
          <span>{copy.metadata(selected.attempt.number, selected.snapshot.locale, passed, selected.objectives.length, selected.snapshot.capturedAt)}</span>
          <span>{copy.region}: {selected.snapshot.regionTestId}</span>
        </figcaption>
      </figure>
    </div>
  );
}
