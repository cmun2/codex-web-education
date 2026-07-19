# Frontend Debugging Arena — Working Title

This is a descriptive working title only. The education prototype turns frontend accessibility failures into playable debugging missions: **fix real frontend bugs, and every passing browser check damages the boss.** The first Korean/English mission is Keyboard Trap Boss.

## Run locally

Use Node 22 and npm. Run `npm run dev`, then verify changes with `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`.

The mission flow is landing → briefing → broken preview → edit → apply → verify → iterate → victory → debrief. The learner changes only a typed, allowlisted dialog DSL; the React-like source is explanatory and is never evaluated. Browser checks exercise the rendered dialog with focus, Tab/Shift+Tab, and Escape behavior, while fixture-only snapshots preserve each attempt and boss damage is awarded once per newly verified objective.

The app provides no arbitrary code execution, client secrets, raw authentication data, or production sandbox. A future local Codex SDK coach must remain server-only, feature-flagged, allowlisted, read-only, time-bounded, and validated.

## Built with Codex and GPT-5.6

Codex was used for accessibility analysis, architecture, implementation, test design, debugging, and documentation in this build thread. Runtime configuration and verification are deterministic and separate from optional local AI coaching; GPT-5.6 does not run in the deployed application. Important decisions remain with the human developer.
