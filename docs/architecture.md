# Architecture

## Product flow

`features/mission/mission-runner.tsx` coordinates a reducer-driven journey: landing → briefing → broken preview → repair attempt → verification → partial/failure feedback → victory → debrief → replay. Korean and English dictionaries cover the same typed copy contract. Phase changes move focus to the new heading, results and damage have live announcements, controls have accessible names, and motion-heavy feedback is reduced under `prefers-reduced-motion`.

The deterministic battle state in `lib/domain/battle.ts` is the only source for mission phase, history, verified objectives, HP, XP, combo, rank, and victory. Damage is 30/35/35 and is awarded only once for each newly verified objective; repeated passing checks cannot duplicate damage or XP.

## Typed boundaries

- `RepairProvider`: `AllowlistedDialogCodeLab` validates and applies seven dialog-specific values, renders an explanatory source representation, produces a before/after diff, and resets to the authored broken state.
- `ObjectiveEvaluator`: `DialogObjectiveEvaluator` operates on the isolated rendered fixture. It independently checks semantics, initial focus plus both loop directions, and Escape plus focus restoration. After evidence capture it closes the evaluator-opened dialog so no modal is left with focus elsewhere.
- `CoachProvider`: `DeterministicCoachProvider` is the reliable Demo Coach. `LocalVisionCoachProvider` is the optional server-only adapter and delegates all failure cases to the deterministic provider.
- `ProgressionStorage`: `LocalProgressionStorage` validates persisted data, avoids duplicate mission XP, and degrades to in-memory state when browser storage is unavailable.

These interfaces keep mission fixtures and provider implementations out of the product UI. Adding another authored mission should provide its own fixture, constrained repair vocabulary, objective evaluator, and dictionary copy rather than turning Code Lab into a generic runner.

## Safe Code Lab

The learner changes a `DialogCodeState` containing only `dialogRole`, `ariaModal`, `ariaLabelledBy`, `ariaDescribedBy`, `escapeCloses`, `focusContainment`, and `focusRestoration`. Validation uses property descriptors and exact allowlists, rejecting extra or malformed fields without invoking getters. The displayed React-like code is generated text. Neither it nor learner/model input is parsed as JavaScript, evaluated, imported, sent to a shell, or executed in Next.js.

This is a mission-specific teaching simulation, not a production sandbox. The authored `MissionDialog` maps validated values to known React props and behaviors.

## Objective evaluation and snapshot contract

An explicit Run Checks action opens the fixture through its known action hooks and checks the rendered DOM and keyboard events. Objective failures remain independent: a learner can pass identity while focus and keyboard still fail. Completion derives only from accumulated evaluator results, never from timers or UI claims.

`captureSnapshotEvidence` clones only `[data-testid="mission-fixture"]`, removes blocked embedded elements, event-handler attributes, and source URLs, and emits an SVG data URL under the `fixture-region-v1` contract. Evidence contains:

- attempt number and ISO capture time;
- `ko` or `en` locale;
- fixed `mission-fixture` region ID and bounded dimensions;
- a copy of the allowlisted code state;
- independent objective results and failure/check codes;
- the fixture-only image data URL.

Full-page UI, repository contents, prompts, credentials, and browser storage are outside the snapshot contract.

## Coaching path and fallback

The browser calls `POST /api/coach` only after the learner selects an attempt with at least one failed objective and explicitly requests a hint. The fixed-shape body is capped before JSON parsing, and validation rejects unknown fields, invalid objectives/state/locale, malformed or active SVG content, unsupported image signatures, oversized images, and inconsistent dimensions.

By default, the route constructs `DeterministicCoachProvider`, which returns one localized progressive hint based on failed objective and attempt number. If `AI_COACH_PROVIDER=ollama`, the route constructs `LocalVisionCoachProvider` with server-only configuration. That adapter:

- accepts only loopback HTTP base URLs without credentials or paths;
- validates the model identifier;
- sends only allowlisted context and the selected fixture image;
- tells the model to treat visible text as untrusted data;
- applies a bounded timeout and response-byte limit;
- accepts exact JSON string fields with per-field length bounds;
- renders output as normal React text, never raw HTML;
- returns the labelled deterministic fallback for missing configuration, network errors, timeout, non-OK status, oversized response, or schema failure.

The deterministic route and evaluator do not call Codex or GPT-5.6. Those were development tools only.

## Persistence and replay

Locale and progression use separate browser storage keys. Locale selection remains usable for the current session if persistence throws. Progression validates stored shape, maintains an in-memory copy, records best attempt count, and awards mission XP only on first completion. Replay resets reducer state, code state, snapshots, selected hints, open requests, and completion guards while preserving valid user preferences and earned progression.

## Deployment boundary

The normal Next.js server/client build requires no secrets and is suitable for a deterministic free Vercel demo. Environment variables for Ollama are read only in the Node route and have no `NEXT_PUBLIC_` exposure. A Vercel function's loopback is not a developer's laptop, so local Ollama is not claimed as a hosted feature. There are no accounts, database, arbitrary execution service, production isolation guarantees, or live Codex repair calls.
