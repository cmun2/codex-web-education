# Build Week submission checklist

This checklist separates repository-verifiable facts from human submission tasks. Do not treat it as ready-to-paste Devpost prose.

## Repository and release QA

- [ ] Use Node 22 and run `npm ci` from a fresh checkout.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run test:e2e`.
- [ ] Run `npm run build`.
- [ ] Confirm `git status` contains no `.env.local`, secrets, `node_modules`, `.next`, test reports, Playwright artifacts, browser profiles, or sessions.
- [ ] Confirm the deterministic journey works without accounts, database, AI key, Ollama, or network model access.
- [ ] Confirm optional Ollama unavailability produces the labelled Demo Coach fallback.

## Manual journey QA

- [ ] In English, understand the product proposition and mission action within five seconds.
- [ ] In Korean, verify long landing, objective, error, history, victory, and debrief copy at desktop and narrow mobile widths.
- [ ] Use keyboard only: start, enter preview, open the broken dialog, observe missing containment/Escape, reach Code Lab, repair, run checks, review history, request a hint, finish, debrief, and replay.
- [ ] Confirm focus moves to each phase heading, repaired dialog focus loops, Escape restores the opener, coach return focuses Code Lab, victory/debrief focus is restored, and verification leaves no stale modal open.
- [ ] Confirm live announcements cover phases, result damage/XP/combo, storage fallback, coach loading/success/error, and victory.
- [ ] Confirm `prefers-reduced-motion` removes meaningful animation/transition duration and sound is never required.
- [ ] Confirm storage-unavailable mode remains playable and replay starts with clean mission state without duplicate XP.
- [ ] Confirm browser console and page error logs stay clear in the production build.

## Security review

- [ ] No learner or model JavaScript, JSX, TypeScript, source text, shell command, or arbitrary prompt is executed.
- [ ] No client component receives server secrets or Ollama configuration.
- [ ] Coach request body/image and local response sizes are bounded; timeout and exact schemas remain enforced.
- [ ] Local-provider base URL remains loopback-only and every local failure has deterministic fallback.
- [ ] Coach output renders as text; no raw model HTML path exists.
- [ ] UI/docs do not claim a production sandbox, accounts/database, or deployed live Codex repair.

## Demo and submission tasks owned by a human

- [ ] Choose the final project name and replace the descriptive working title if desired.
- [ ] Create a public YouTube demo under three minutes with audible narration.
- [ ] Manually use `/feedback` in the primary Build Week thread, then record the resulting Thread ID, worktree name (`release-integration`), branch (`feat/release-integration`), and a concise contribution summary in the human handoff.
- [ ] Rewrite factual source material in the human submitter's own voice; do not paste generated final submission prose.
- [ ] Add the final deployment URL and verify it from a signed-out browser.
- [ ] Share private repository access with the event-provided reviewer accounts if required.
- [ ] Verify team-member invitations, eligibility, category, and deadline details against the current event page.
- [ ] Capture the screenshots listed in `demo-outline.md` and review them for secrets or unrelated browser chrome.
