# METRICS.md

Every event name, when it fires, the question it answers, and each feature's pre-registered kill criterion — per `CLAUDE.md` Section 7.5. This file grows with each phase as events and features land; it is not written once and left alone.

## North star and guardrails (from `CLAUDE.md` Section F)

- **North star:** D7 return rate, target 25% of first-day players.
- **Guardrails:** D1 return, runs per active user per day, median run length, day-won rate, share-card tap rate.
- **Diagnostics:** catch location heatmap by stage and hazard; character usage.
- **Pre-registered kill criteria:**
  - Any hazard responsible for over 35% of catches in its stage → retune.
  - If runs per active user per day is under 2 after two weeks, the core loop is not sticky and we stop adding content until it is.

## Difficulty target for launch (2026-09-18)

- **Target:** median run length 60–90 seconds; the terrace is reached in roughly 10% of runs in week one.
- **Why these numbers:** the run no longer stops at the terrace (days now roll into each other — see `DECISIONS.md`, 2026-09-18), so "how often anyone sees the terrace at all" is now the signal for whether Day 1 is tuned as an early, hard-won moment rather than either a formality or something nobody reaches.
- **How we'll tune:** against the catch-location heatmap (already a guardrail diagnostic above) — if the terrace is reached far more or less often than ~10% in week one, or median runs sit well outside 60–90s, adjust `src/config/difficulty.ts`'s breakpoint table before touching content or hazard placement.

## Events (updated as each lands — current as of Phase 0)

| Event | Fires when | Question it answers |
|---|---|---|
| `app_opened` | App mounts | Are people opening the link at all? |
| `login_completed` | Anonymous Supabase sign-in + player row succeed | Does the name/section entry step lose anyone? |
| `run_started` | Player taps Start | Runs per active user per day (guardrail) |

Further events (`stage_entered`, `player_stumbled`, `player_caught`, `pickup_collected`, `pool_exhausted`, `audio_unlocked`, `run_ended`, `day_won`, `night_owl_entered`, `share_card_tapped`, `character_unlocked`) are specified in the Phase 1/2 plan and get added to this table as each is actually wired and confirmed live in PostHog — not before, per Section 8's "a wired event that never fires isn't done."
