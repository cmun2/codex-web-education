# GPT-5.6 and Codex contribution record

This is factual source material for a human-authored Build Week submission, not final Devpost copy.

## Problem framing

The development session analyzed a modal missing dialog identity, accessible naming and description, focus entry/containment/restoration, Escape handling, and a visibly collapsed action layout. That issue became Keyboard Trap Boss: four independently evaluated browser-objective groups that deal boss damage only after verified behavior.

## Development contributions

Codex, in a GPT-5.6 model family session, assisted with:

- translating the accessibility failure into explicit learner objectives and damage rules;
- separating mission state, authored fixture, constrained repair, objective evaluation, coaching, and persistence;
- designing the allowlisted dialog state instead of executing learner source;
- implementing Korean/English UI copy and accessible interaction behavior;
- defining fixture-only snapshot evidence and the coach request/output boundary;
- implementing the deterministic Demo Coach and optional local Ollama adapter with fallback;
- creating unit and Playwright coverage for behavior, security boundaries, persistence, reduced motion, replay, and progression;
- debugging release-integration issues and documenting setup, architecture, limitations, and demo QA.

## Human ownership

The human developer retains product direction, final naming, final accessibility judgment, deployment choices, recording, screenshots, and submission language. This repository does not claim an accept/modify/reject metric that was not recorded, and it makes no productivity or quality percentage claims.

## Runtime honesty

Codex and GPT-5.6 were development tools only. The deployed deterministic experience does not call either tool, does not expose a live Codex repair feature, and does not execute AI-generated code. Runtime repair is the typed deterministic `RepairProvider`; runtime checks come from the objective evaluator; coaching defaults to authored deterministic responses. A user may opt into a server-local Ollama vision model, but every local-provider failure falls back to the deterministic Demo Coach.

## Evidence a reviewer can inspect

- Typed provider and state boundaries under `lib/domain`, `lib/mission`, and `lib/server`.
- Browser journey coverage in `e2e/mission.spec.ts`.
- Provider, request validation, output rendering, and timeout/fallback coverage in `tests/coach.test.tsx` and `tests/coach-route.test.ts`.
- Objective, snapshot, battle, and allowlist coverage in `tests/domain.test.ts`.
- The commit history and Build Week documents for the implementation sequence.
