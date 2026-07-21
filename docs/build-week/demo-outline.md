# Demo outline and capture plan

This is a recording guide and factual shot list, not a scripted Devpost description.

## Under-three-minute recording

- **0:00–0:18 — Concept:** Show the English or Korean landing. State the learning loop visible on screen: experience the bug, repair it, prove it; every passing browser check damages the boss.
- **0:18–0:38 — Broken behavior:** Start Keyboard Trap Boss, enter the preview, open the modal with the keyboard, and demonstrate that focus/Escape behavior is broken. Do not imply that intentionally broken behavior is the product's accessible end state.
- **0:38–1:05 — Safe repair:** Show the allowlisted implementation controls and explanatory code/diff. State that source is never executed and that this is not a production sandbox.
- **1:05–1:32 — Independent verification:** Apply a partial repair and run checks. Show independent pass/fail results, a fixture-only snapshot, one damage event, XP, and combo. Emphasize that the evaluator—not UI state or AI—determines success.
- **1:32–1:52 — Coach:** Select the failed attempt and request one hint. Label the response accurately as deterministic Demo Coach, or as Local Vision Coach only when a real server-local Ollama response is shown. If fallback appears, show its fallback label rather than editing around it.
- **1:52–2:20 — Victory:** Complete the remaining controls, run checks, show boss defeat, rank, restored behaviors, and the learning debrief. Replay and show the clean mission start without duplicate stored XP.
- **2:20–2:42 — Architecture/security:** Briefly show the typed `RepairProvider`, objective evaluator, snapshot contract, `CoachProvider`, request bounds, and deterministic fallback. State that Codex/GPT-5.6 were development tools only.
- **2:42–3:00 — Scope:** Show Korean/English switching and a narrow layout. Close with the current limitation: one authored mission, with future missions requiring authored fixtures/evaluators rather than arbitrary code execution.

## Recording states to prepare

1. Fresh English landing with zero mission XP.
2. Korean landing at a narrow mobile width with long copy visible and no horizontal page overflow.
3. Broken dialog open before any check.
4. Attempt 1 with four independent failures and fixture-only snapshot evidence.
5. Partial repair with identity passed, focus/keyboard failed, boss HP reduced once, and Demo Coach available.
6. Coach response showing provider label, progressive hint level, and Return to Code Lab action.
7. Fully repaired keyboard behavior with focus loop and Escape restoration.
8. Victory with 0 HP, 4/4 objectives, XP/combo/rank, restored-behavior list, and debrief.
9. Replay at the clean landing with preserved preference/progression and no duplicate XP.
10. Optional fallback capture with Ollama unavailable and the visible Demo Coach fallback note.

## Screenshots to capture

- Landing hero plus three-step mission loop, once per locale.
- Broken preview with expected/current behavior and boss status.
- Code Lab allowlisted controls plus explanatory source or diff.
- Independent browser results beside attempt selector and snapshot evidence.
- Demo Coach or real Local Vision Coach response with its provider label.
- Boss Defeated summary and learning debrief.
- Narrow Korean layout at approximately 390 px wide.
- Architecture diagram or code excerpt showing interfaces and security boundary, if the submission form benefits from a technical image.

Before capture, clear unrelated tabs, notifications, local paths, environment variables, terminal history, browser profiles, and personal data. Never show secrets, `.env` content, private model names, or reviewer credentials.
