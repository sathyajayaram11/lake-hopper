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
