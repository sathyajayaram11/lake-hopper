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
