# Codex Web Education

Codex Web Education is a bilingual direct-manipulation learning game where a learner sees a real frontend failure, repairs a constrained implementation, and proves the result with independent browser checks. Every newly verified objective damages the active boss; changing a setting or clicking a button never awards progress by itself.

## What the demo includes

- A Korean/English mission picker, direct repair workspace, victory, debrief, history, error, and accessibility-announcement experience.
- Five deliberately broken, isolated fixtures: **Keyboard Trap** for dialog accessibility, **Flex Tangle** for computed layout, **Motion Phantom** for animation and reduced motion, **Stream Gremlin** for a safe deterministic SSE simulation, and **State Doppelganger** for immutable shared state and reset behavior.
- A deterministic `RepairProvider` that accepts only typed, mission-specific allowlisted values. The React-like snippet is explanatory text and is never executed or evaluated.
- Rendered-DOM objective evaluators for dialog semantics and keyboard behavior, computed Flexbox layout, animation timing and reduced-motion fallback, simulated stream parsing and reconnect policy, and state update/reset behavior.
- A `fixture-region-v1` evidence snapshot for every attempt, with locale, timestamp, dimensions, allowlisted code state, and objective results.
- Deterministic HP, XP, combo, rank, replay, sound preference, and local progression. Storage failure falls back to in-memory play.
- A deterministic Demo Coach that appears only after a verified failure, highlights unresolved controls, and needs no model, key, account, or network service, plus an optional server-local Ollama vision provider with deterministic fallback.

## Local setup

Use Node.js 22 and npm only. Node 23 is outside the supported engine range.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The deterministic demo needs no environment file, account, database, API key, or AI server. Choose a mission, try the visibly broken fixture, change an adjacent safe setting, then use **Check & attack** to verify the actual browser outcome.

Before a verified checkpoint, run the complete suite:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Optional Local Vision Coach

The default coach is deterministic. To opt into a local Ollama vision model, configure server-side process variables before starting Next.js:

```bash
AI_COACH_PROVIDER=ollama \
OLLAMA_VISION_MODEL=your-installed-vision-model \
npm run dev
```

`OLLAMA_BASE_URL` is optional and defaults to `http://127.0.0.1:11434`. Only loopback HTTP hosts are accepted. The model must already be installed and served by Ollama; the app does not download or bundle it.

The browser sends only a validated mission ID, failed objective IDs, allowlisted code state, the selected fixture snapshot, attempt number, and locale. The route rejects unsupported fields, media types, malformed snapshots, and oversized bodies/images. Local requests are time-bounded, responses are size-limited and schema-validated, and unavailable or invalid local responses return a visibly labelled deterministic Demo Coach fallback. Ollama configuration stays server-side and is never returned to the client.

## Runtime and security boundary

The Code Lab is a mission-specific control surface, not a generic editor, arbitrary code runner, or production sandbox. The application does not execute learner JavaScript, JSX, TypeScript, shell commands, source text, or model-produced HTML. It accepts no arbitrary prompt, repository path, credential, or secret; coach output renders as React text. There is no authentication, account system, database, leaderboard, or paid runtime dependency.

Mission fixtures are isolated from product coordination. Repair, objective evaluation, coaching, and progression storage sit behind typed interfaces. Details are in [docs/architecture.md](docs/architecture.md).

## Deployment

The deterministic experience can run on Vercel's free Hobby plan. A human release owner can deploy a reviewed branch with these steps:

1. From a clean checkout of the review branch, confirm `node --version` reports Node 22, run `npm ci`, then run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`. Confirm `git status --short` contains no unexpected files.
2. Push the reviewed branch with `git push --set-upstream origin HEAD` and complete any required repository review before deployment.
3. In the Vercel dashboard, choose **Add New → Project**, import this Git repository, and select the reviewed branch for the deployment. Keep the detected **Next.js** framework preset, repository root (`.`), and default install, build, and output settings.
4. Add no environment variables for the deterministic demo. In particular, leave `AI_COACH_PROVIDER` unset so the runtime uses its `demo` default; do not configure the local Ollama variables for a hosted demo.
5. After Vercel reports a successful deployment, open the generated URL in a signed-out or private browser window. Verify the English and Korean mission journeys, deterministic Demo Coach and fallback behavior, replay, narrow layout, keyboard flow, and browser console before publishing that URL.

The optional Ollama provider is intended for local/server-local use: a hosted Vercel function cannot reach Ollama on a developer laptop through its own loopback address. These are human-run release instructions only; this repository does not claim an unverified deployment URL.

## Development-time AI contribution

Codex and GPT-5.6 were development tools used for accessibility analysis, architecture, implementation, tests, debugging, and documentation. They are not runtime repair providers, are not called by the deployed deterministic experience, and do not imply a live Codex repair service. See [docs/build-week/gpt-5.6-contribution.md](docs/build-week/gpt-5.6-contribution.md) for the factual contribution record.

## Current limitations

- The five authored missions use curated repair vocabularies; this is intentionally not a generic editor or code runner.
- Objective checks demonstrate each mission contract; they are not a general accessibility, CSS, networking, or state-management audit.
- Evidence snapshots capture only the authored fixture region and are not full-page screenshots.
- Progress is local to the browser and intentionally has no cross-device sync.
- Sound is optional feedback; no learning result depends on audio.
- A public deployment URL still requires a human-owned hosting account; local development and the deterministic test suite require no external service.
