# Frontend Debugging Arena — Working Title

Frontend Debugging Arena is a bilingual learning prototype where a learner experiences a real frontend accessibility failure, repairs a constrained implementation, and proves the behavior with independent browser checks. Every newly verified objective damages the boss. The first mission, **Keyboard Trap Boss**, covers dialog identity, focus containment, Escape dismissal, and focus restoration in Korean and English.

This repository uses a descriptive working title; final naming and submission prose remain human decisions.

## What the demo includes

- A Korean/English landing, briefing, mission, victory, debrief, history, error, and accessibility-announcement experience.
- A deliberately broken, isolated dialog fixture that can be explored with a keyboard.
- A deterministic `RepairProvider` that accepts seven typed, allowlisted values. The React-like snippet is explanatory text and is never executed or evaluated.
- A rendered-DOM objective evaluator for dialog semantics, both focus-loop directions, Escape dismissal, and focus return.
- A `fixture-region-v1` evidence snapshot for every attempt, with locale, timestamp, dimensions, allowlisted code state, and objective results.
- Deterministic HP, XP, combo, rank, replay, sound preference, and local progression. Storage failure falls back to in-memory play.
- A deterministic Demo Coach that needs no model, key, account, or network service, plus an optional server-local Ollama vision provider with deterministic fallback.

## Local setup

Use Node.js 22 and npm only. Node 23 is outside the supported engine range.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The deterministic demo needs no environment file, account, database, API key, or AI server.

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

The deterministic experience can run on a free Vercel deployment using the normal Next.js build with no environment variables. The optional Ollama provider is intended for local/server-local use: a hosted Vercel function cannot reach Ollama on a developer laptop through its own loopback address, so hosted demos should use the deterministic default unless they have a separately reviewed private deployment design.

## Development-time AI contribution

Codex and GPT-5.6 were development tools used for accessibility analysis, architecture, implementation, tests, debugging, and documentation. They are not runtime repair providers, are not called by the deployed deterministic experience, and do not imply a live Codex repair service. See [docs/build-week/gpt-5.6-contribution.md](docs/build-week/gpt-5.6-contribution.md) for the factual contribution record.

## Current limitations

- One authored mission and one dialog-specific repair vocabulary are included.
- Objective checks demonstrate the mission contract; they are not a general accessibility audit.
- Evidence snapshots capture only the authored fixture region and are not full-page screenshots.
- Progress is local to the browser and intentionally has no cross-device sync.
- Sound is optional feedback; no learning result depends on audio.
- The final product name, public demo, deployment URL, screenshots, and submission copy still require human review.
