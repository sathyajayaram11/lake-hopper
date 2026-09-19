# DECISIONS.md

Dated log of scope cuts, tech choices, and reversals. Every entry: what was decided, why, and what would reopen it. Section 7.4 of `CLAUDE.md` requires an entry here for every scope cut, tech choice, or reversal — including, per Section 3.2, any deviation from the fixed folder/file layout in Section 4.

---

## 2026-09-14 — New folder: `src/core/net/`

**Decision:** Add a folder not listed in Section 4's fixed layout to hold thin client wrappers for external services: `supabase.ts`, `posthog.ts`, `open-meteo.ts`.

**Reason:** Section 4 has no home for cross-cutting external-service adapters. `src/systems/` is for gameplay systems that read/write `GameState` and the event bus; a Supabase or Open-Meteo client is infrastructure, not a system, and forcing it into `src/systems/` would blur that line for every system file that comes after it.

**Reopens if:** a later pass finds these wrappers fit more naturally inside an existing folder (e.g. if `src/systems/analytics.ts` ends up being the only real consumer of `posthog.ts`, that file could move there directly).

---

## 2026-09-14 — Sixth content file: `content/audio.json`

**Decision:** Add `audio.json` to `content/`, alongside the five files Section 4 names explicitly (`stages/obstacles/pickups/characters/questions.json`).

**Reason:** Audio needs to be data-driven the same way everything else is (Section 3.4), and every asset needs a `licence` field recorded before it can be referenced by a stage or hazard, mirroring the `CREDITS.md` discipline in Section 2. That doesn't fit into any of the five existing files without overloading their shape.

**Reopens if:** audio content turns out to be small enough to fold into an existing file instead (unlikely once real CC0/CC-BY assets are sourced across ambience/music/stingers/telegraphs).

---

## 2026-09-14 — New top-level folder: `scripts/`

**Decision:** Add a `scripts/` folder holding `generate-placeholder-audio.mjs`, a one-time Node script that synthesizes short sine-tone WAV files for every placeholder entry in `audio.json`.

**Reason:** The game needs playable audio before real CC0/CC-BY assets are sourced, and hand-authoring placeholder WAVs is more effort than generating them. This is dev tooling — it runs once, its output is committed to `public/audio/placeholder/`, and no game code ever imports from `scripts/`.

**Reopens if:** this script grows into a real build step (e.g. a content-validation or asset-optimization pipeline), at which point it should move under a more permanent home and get its own entry.

---

## 2026-09-14 — Placeholder-content policy

**Decision:** Ship synthesized placeholder audio (`licence: "placeholder"` in `audio.json`) and three stub questions (`placeholder: true` in `questions.json`) from the start of Phase 1, so engineering never blocks on real content arriving. `src/content/schemas/loader.ts` accepts these markers in development but hard-fails a production build if either is still present anywhere in the loaded content.

**Reason:** The PM writes content in parallel with engineering (Section 7's working protocol), and audio assets in particular depend on sourcing real CC0/CC-BY licensed clips, which takes longer than writing a JSON schema. Blocking Phase 1 on that would stall collision, chaser, and checkpoint work for no reason. A hard production gate means a placeholder can never accidentally ship to the batch.

**Reopens if:** v2 needs a staged/partial content rollout (e.g. shipping with some stages still on placeholder audio deliberately) rather than the current all-or-nothing production gate.

---

## 2026-09-14 — Analytics client: `posthog-js-lite` instead of `posthog-js`

**Decision:** `src/core/net/posthog.ts` wraps `posthog-js-lite`, not the full `posthog-js` SDK.

**Reason:** Measured both with a real esbuild+minify+gzip pass covering our actual usage (init + capture): `posthog-js` costs ~98.6KB gzipped; `posthog-js-lite` costs ~23.4KB gzipped — a ~76% reduction. `posthog-js-lite`'s own README describes it as PostHog's intentionally reduced package for teams "conscious about package sizes," covering analytics events and feature flags but dropping autocapture and session replay. We only ever forward a whitelisted set of our own events through `AnalyticsSystem` (Section 3.1) — never autocaptured clicks or pageviews — so the dropped features cost us nothing. Against the 5MB bundle budget (Section 6), saving 75KB on a service wrapper that ships in every build is a clear, no-downside win.

**Reopens if:** a later phase needs a `posthog-js`-only feature — session replay or autocapture — that `posthog-js-lite` doesn't cover.

---

## 2026-09-18 — Remove the checkpoint system; days roll into each other instead of ending the run

**Decision:** Cut the checkpoint system entirely: `logic/checkpoints.ts`, `checkpoint.schema.ts`, `checkpointReducer.ts`, `systems/checkpoint.ts`, `CheckpointPrompt.tsx`, `questions.json` and its schema, the `checkpoint_shown`/`checkpoint_resolved` events, the `CheckpointChoiceMade` intent, `StageDefinition.checkpoint`, and the attendance/network stats. Replace with two inline, data-driven mechanics: `HazardDefinition.effect: 'stumble' | 'slow'` (a `'slow'` hazard costs speed for a configured duration without touching the stumble/catch state — for queue crowds and spills), and an optional per-stage `countdown: { seconds, failEffect: 'caught' }` shown on the HUD, which the player must beat by crossing the stage boundary in time (The Door, Submission).

Structurally, reaching the terrace no longer ends the run: `day_won` fires, a brief non-blocking card shows while play continues, and the run rolls into the next day with a per-day speed multiplier and a lightly shuffled stage order. `run.dayNumber` is added to `GameState`, and `run_ended`'s payload carries the day number the run ended on. Night Owl becomes the fixed last stage of each day rather than an optional exit after Day 1. Characters now unlock by brownie points only — the `'threshold'` unlock path (tied to the now-removed attendance/network stats) is gone.

**Reason:** Checkpoints (stop, show a prompt, wait for a choice, resolve it) interrupt the endless-runner feel the whole core loop is built around, and their machinery — an embedded schema, a dedicated reducer, a dedicated system, a UI prompt component, a full question bank, and two separate stat tracks — was disproportionate to the two things they actually did: cost the player something, or gate a moment behind a beatable window. Both of those now live inside the systems that already exist (collision's hazard resolution, stage progression) instead of a parallel one. Letting days roll into each other turns "the day" from a stopping point into a loop the player can keep extending, which is a better fit for a leaderboard-driven, repeatedly-played WhatsApp game — and Night Owl becomes what that loop naturally ends in, rather than an optional bonus round bolted onto the end.

**Reopens if:** a future design wants a genuine stop-and-decide moment with real branching consequence (not just a dodgeable or beatable in-line hazard) — at that point checkpoints, or something shaped like them, would need to come back.

---

## 2026-09-18 — Seventh content file: `content/missions.json`

**Decision:** Add `missions.json` to `content/`, for Phase 3's daily mission system (three rotating missions per day, brownie-point rewards).

**Reason:** Missions are data the same way stages/hazards/pickups are (Section 3.4) — a non-engineer should be able to add or edit a mission by editing JSON, not code. None of the existing six files (five from Section 4, plus the already-logged `audio.json`) has a natural home for mission definitions without overloading their shape.

**Reopens if:** the mission system turns out simple enough (e.g. always the same three missions, never rotated) to fold into an existing file instead.

---

## 2026-09-18 — Player stays fixed at world Z=0; the track scrolls, not the player; forward is -Z

**Decision:** The player capsule never moves in world-space Z. Distance traveled is tracked as a `GameState` number (`run.distanceM`), and the track (segments, hazards, pickups) translates toward/past the stationary player to create the illusion of forward motion. Forward (the direction the player is running) is world **-Z**; track segments spawn far down the -Z axis and their Z position increases toward and past the player as distance accrues, recycling once they pass behind. The camera sits behind the player on the **+Z** side (`CAMERA_OFFSET.z = +4.5`, corrected from an initial `-4.5` written before this convention was pinned down).

**Reason:** This is the standard endless-runner pattern, and it was forced into the open twice: first by `src/systems/camera.ts` (what does "behind and above the player" mean in world space?), then by `src/systems/spawner.ts` (which way do segments move, and which end do they spawn from?). Choosing -Z as forward matches Three.js's default camera orientation (looks down -Z with no extra rotation needed in `scene.ts`). Keeping the player fixed avoids floating-point precision drift over a long run (a multi-day run — now that days roll into each other — could otherwise push world-space coordinates arbitrarily large) and keeps every position calculation (camera, spawner placement, collision boxes) working in small, stable numbers near the origin.

**Reopens if:** a future feature needs the player to genuinely occupy a large, persistent world position (unlikely for this game's design).

---

## 2026-09-19 — Drop `'SafeZone'` from `PlayerState.pose`

**Decision:** `pose` is now `'Running' | 'Jumping' | 'Sliding' | 'Stumbling' | 'Caught'` — `'SafeZone'` removed.

**Reason:** A direct follow-through of the 2026-09-18 checkpoint removal that got missed at the time. `'SafeZone'` only ever existed to represent the player during a checkpoint's safe-zone activity; with checkpoints gone entirely, nothing produces or consumes that pose. Found while designing `src/logic/state-machine.ts` — a state with no transition in and no transition out is dead code, worse than not having it typed at all.

**Reopens if:** a future mechanic needs a genuine "player is temporarily out of harm's way" pose again.

---

## 2026-09-19 — `player.ts` becomes the sole owner of pose; `collision.ts` reassigned to pickup collection only

**Decision:** Hazard-hit resolution (detecting a hit, calling `logic/collision.ts`, feeding the result into `transitionPose`, dispatching, emitting `player_stumbled`/`player_caught`) all lives in `src/systems/player.ts`. `src/systems/collision.ts` — originally planned to own this — is reassigned to pickup collection only.

**Reason:** `InputSystem.consumeIntent()` can only be called once per tick (it's stateful, reset-on-read), and `player.ts` already had to be that sole caller for lane handling. `transitionPose` also needs exactly one authoritative caller per tick, since it needs a single, consistent `elapsedMs` clock — splitting hazard-detection into a separate `collision.ts` system that also called `transitionPose` would have meant two systems independently tracking pose timing, which can drift out of sync. Since `player.ts` already reads input each tick, it was the natural single owner; `collision.ts`'s pickup-only remaining job doesn't touch pose at all, so it stays a separate, independent system with no such conflict.

**Reopens if:** pose ownership needs to be split for a reason not yet foreseen (e.g. performance, or a genuinely independent pose-affecting system).
