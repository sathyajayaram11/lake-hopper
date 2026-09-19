# Phase 1 brief — The core run

## What

The full pose state machine (Running/Jumping/Sliding/Stumbling/Caught/SafeZone), collision with both hazard effects (`'stumble'` and `'slow'`), pooled hazards and pickups, the chaser with recovery, the difficulty curve (including the per-day speed multiplier), stages 1–5 sourced entirely from `content/*.json`, the countdown mechanic (The Door, and Submission in Phase 2), IST lighting and weather, and the full three-layer audio system. No checkpoints — that system was cut in the 2026-09-18 scope change (`DECISIONS.md`); its two real jobs (cost the player something, gate a moment behind a beatable window) are now inline hazard effects and the countdown, not a parallel stop-and-choose system.

## The real decisions

**1. Content schemas and the loader land before any system code, not after.**

*Alternative considered:* build systems in the order they'll run at runtime (state machine → collision → stage progression → …) and write schemas whenever the first system that needs them comes up, same as Phase 0's ordering.

*Why rejected:* stages 1–5's content, plus stages 6–14, `pickups.json`, and `audio.json`, can all be authored in parallel with engineering — but only once the schemas exist to write against and `docs/content-guide.md` shows the shape. Phase 0 had nothing for a non-engineer to author yet; Phase 1 does, starting immediately, so the ordering that made sense in Phase 0 doesn't here.

*Tradeoff:* the first few Phase 1 commits will be schemas and validation with no visible gameplay change — slower to a demoable moment, in exchange for content authoring starting on day one instead of waiting for collision/chaser/stage code to exist first.

**2. `collision.ts` and the audio system are pre-split into their final file boundaries before either is written, not split after the fact if they grow past 150 lines.**

*Alternative considered:* write `collision.ts` and a single `audio.ts` as one file each, and split only if/when the line cap is actually hit.

*Why rejected:* line-estimating both in the Step B plan already puts `collision.ts` right at the 150-line cap once the `'stumble'`/`'slow'` branch and shield resolution are all accounted for, and audio's three layers plus the voice pool comfortably exceed it as one file. Splitting *after* a file is under active development risks a rushed seam and incidental changes creeping in during a mechanical split; deciding the boundary before writing either half is cheaper and keeps each half single-responsibility (Section 3.2) from its first commit.

*Tradeoff:* committing to a seam before the logic exists risks guessing wrong (e.g. discovering the height-band math actually wants to live on the other side of the split) — accepted, since the 150-line cap is a hard rule in `CLAUDE.md`, not a soft target.

## Acceptance criteria

- A complete 5-stage run, playable end to end, sourced entirely from `content/stages.json`/`obstacles.json`/`pickups.json`/`audio.json`.
- Adding a new hazard to `obstacles.json` (with its `effect` field set) and referencing it from a stage's `hazardWeights` requires zero code changes.
- The Door's countdown is visible on the HUD; letting it expire ends the run the same way a hazard catch does.
- A `'slow'` hazard visibly costs the player speed without ever triggering a stumble or catch.
- Ambience (including the hour-of-day bird loop), ducked music, and stage-entry stingers are all audible on the reference phone after the first-touch unlock — placeholder tones are fine, real assets aren't required yet.
- The perf overlay shows the run holding the 45fps floor on the reference Android device across all five stages.
- A production build fails loudly if a placeholder `audio.json` entry (`licence: "placeholder"`) is still present.
- **Day rollover is proven in this phase, not deferred to Phase 2.** Completing stage 5 increments `run.dayNumber`, applies that day's speed multiplier, reshuffles the stage order, and the run continues without interruption — using end-of-stage-5 as a temporary day boundary until the real terrace lands in Phase 2 and takes over that role.
- `run_ended`'s payload carries `dayNumber`, confirmed live in PostHog (not just present in the type).

## Standing flags (checked before this phase is called done, not just at the end)

- **No real people, no dogs:** stage 2's cat and every stage's ambient fauna stay cats/snakes/birds; pursuers (security, the CB queue) stay role titles, never names.
- **Analytics ships with every feature:** `stage_entered`, `player_stumbled`, `player_caught`, `pickup_collected`, `pool_exhausted`, and `audio_unlocked` each need to be confirmed live-firing in PostHog before this phase closes — same discipline Phase 0 held to, not relaxed now that there are more events to track.
