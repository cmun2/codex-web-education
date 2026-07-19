# Architecture

`lib/domain` owns objectives, HP calculation, completion, explicit mission states, and extension contracts. `components` renders isolated fixtures, while `features/mission` coordinates product UI. Lightweight typed dictionaries under `lib/i18n` keep Korean and English copy together without a runtime dependency.

`CodeLab`, `SnapshotEvidence`, `MissionAttempt`, `VerificationResult`, and `CoachProvider` form typed boundaries for future work. `AllowlistedDialogCodeLab` validates seven constrained values and maps them into the isolated fixture; it never evaluates source text. An explicit Run Checks action drives the rendered dialog through identity, focus-loop, Escape, and focus-return behavior before capturing a sanitized SVG snapshot of only `[data-testid="mission-fixture"]`. Snapshot metadata includes attempt number, locale, allowlisted state, objective results, and timestamp. HP derives from the unique set of verified objective IDs (30/35/35), so repeated checks cannot duplicate damage.

Playwright independently tests the browser contract. The deterministic coach is a labelled fallback. Future local Codex integration must be server-only, feature-flagged, allowlisted, read-only, time-bounded, and validated. This app executes no arbitrary code or shell commands and exposes no secrets; it is not a production sandbox.
