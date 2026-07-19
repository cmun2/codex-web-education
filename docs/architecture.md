# Architecture

`lib/domain` owns objectives, HP calculation, completion, explicit mission states, and extension contracts. `components` renders isolated fixtures, while `features/mission` coordinates product UI. Lightweight typed dictionaries under `lib/i18n` keep Korean and English copy together without a runtime dependency.

`CodeLab`, `SnapshotEvidence`, `MissionAttempt`, `VerificationResult`, and `CoachProvider` form typed boundaries for future work. `DeterministicCodeLab` changes only the isolated fixture; it does not evaluate it. An explicit Run browser checks action asks the evaluator to read the rendered dialog and return structured evidence. HP derives only from passed objective damage (30/35/35), never animation or repair state.

Playwright independently tests the browser contract. The deterministic coach is a labelled fallback. Future local Codex integration must be server-only, feature-flagged, allowlisted, read-only, time-bounded, and validated. This app executes no arbitrary code or shell commands and exposes no secrets; it is not a production sandbox.
