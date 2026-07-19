# Frontend Debugging Arena — Working Title

This is a descriptive working title only. The education prototype turns frontend accessibility failures into playable debugging missions: **fix real frontend bugs, and every passing browser check damages the boss.** The first Korean/English mission is Keyboard Trap Boss.

## Run locally

Use Node 22 and npm. Run `npm run dev`, then verify changes with `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`.

The mission flow is landing → briefing → broken preview → attempt → verification → result → victory → debrief. The runtime evaluator checks the rendered dialog contract only after the learner explicitly runs browser checks; Playwright independently verifies the same behavior. `DeterministicCodeLab` applies a labelled guided demo repair and `DeterministicCoachProvider` is an explicit Demo Coach fallback. Neither action invokes live Codex or changes a deployed app.

The app provides no arbitrary code execution, client secrets, raw authentication data, or production sandbox. A future local Codex SDK coach must remain server-only, feature-flagged, allowlisted, read-only, time-bounded, and validated.

## Built with Codex and GPT-5.6

Codex was used for accessibility analysis, architecture, implementation, test design, debugging, and documentation in this build thread. Runtime repair is deterministic and separate from optional local AI coaching; GPT-5.6 does not run in the deployed application. Important decisions remain with the human developer.
