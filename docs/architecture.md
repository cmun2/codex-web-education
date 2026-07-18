# Architecture

`lib/domain` owns objectives, HP calculation, completion, battle reducer, and provider interfaces. `components` renders isolated fixtures, while `features/mission` coordinates UI. The runtime evaluator reads the rendered dialog and returns structured outcomes. HP derives only from passed objective damage (30/35/35), never animation state.

Mock repair changes fixture state then evaluates it. Playwright independently tests the browser contract. The deterministic coach is the fallback. Future local Codex integration must be server-only, feature-flagged, allowlisted, read-only, time-bounded, and validated. This app executes no arbitrary code or shell commands and exposes no secrets; it is not a production sandbox.
