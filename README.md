# Frontend Debugging Arena — Working Title

This is a descriptive working title only. The education prototype turns frontend accessibility failures into playable debugging missions: **fix real frontend bugs, and every passing browser check damages the boss.** The first Korean/English mission is Keyboard Trap Boss.

## Run locally

Use Node 22 and npm. Run `npm run dev`, then verify changes with `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`.

The mission flow is landing → briefing → broken preview → edit → apply → verify → select a failed snapshot → request one progressive visual hint → iterate → victory → debrief. The learner changes only a typed, allowlisted dialog DSL; the React-like source is explanatory and is never evaluated. Browser checks exercise the rendered dialog with focus, Tab/Shift+Tab, and Escape behavior, while fixture-only snapshots preserve each attempt and boss damage is awarded once per newly verified objective.

The reliable Demo Coach is the default and needs no account, key, model, or AI server. An optional Local Vision Coach can be enabled server-side with `AI_COACH_PROVIDER=ollama` and `OLLAMA_VISION_MODEL`; `OLLAMA_BASE_URL` defaults to `http://127.0.0.1:11434`. Requests contain only a validated mission ID, failed objective IDs, allowlisted code state, selected fixture snapshot, attempt number, and locale. Local requests are size-limited and time-bounded, model output is schema-validated, and every local failure returns the deterministic fallback. The app provides no arbitrary prompts, code execution, client secrets, cloud model, bundled model, raw authentication data, or production sandbox.

## Built with Codex and GPT-5.6

Codex was used for accessibility analysis, architecture, implementation, test design, debugging, and documentation in this build thread. Runtime configuration and verification are deterministic and separate from optional local AI coaching; GPT-5.6 does not run in the deployed application. Important decisions remain with the human developer.
