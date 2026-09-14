# CLAUDE.md — Great Lakes Run (working title)

This file governs every action Claude Code takes in this repository. Read it fully before generating any file. When a rule here conflicts with a request in chat, flag the conflict and ask; do not silently override either.

## 0. What this project is

A 3D low-poly endless runner set on the Great Lakes Institute of Management campus, Chennai. One run is one campus day, 06:00 to midnight. The pressure chasing the player changes as the day advances (security, the café queue, the attendance sheet, a deadline clock). The day is won by submitting before midnight and reaching the hostel terrace overlooking the amphitheatre. Score is distance plus days survived. Distribution is a single link shared on WhatsApp.

The person you work with is a product manager, not an engineer, with 1–2 hours per day. This repo exists to ship something a 400-person batch keeps using, and to teach that PM how software is built. Both goals are graded. Neither is optional.

## 1. Non-negotiables

1. **Zero cost.** Free tiers only. Any step that could incur a bill stops and asks.
2. **Mobile web first.** Primary target: WhatsApp in-app browser on a mid-range Android (2022-era, 4 GB RAM) at 360×740. Desktop is secondary.
3. **No real people.** Security, professors, staff, students are fictional archetypes with titles, not names, and no recognisable likeness. Situations can be recognisable; people cannot.
4. **Campus fauna is cats, snakes, and birds.** No dogs anywhere in the game. The campus is dog-free.
5. **Analytics ship with every feature.** A feature without its events instrumented is not done.
6. **Nothing synchronous multiplayer.** Leaderboards are async. Ghost runs are v2.
7. **No deployed fake data.** Seed and mock data are local only and labelled.

## 2. Stack (decided)

- **Rendering/game:** Three.js + TypeScript, bundled with Vite. No physics engine; collisions are lane-space AABB checks (Section 5).
- **UI shell:** React, thin. Menus, HUD, leaderboards, day-won screen, share card.
- **Backend:** Supabase — anonymous auth, Postgres (`players`, `runs`, `scores`), row-level security on from the first migration.
- **Analytics:** PostHog free tier.
- **Weather/time:** real IST clock for lighting; Open-Meteo (no key) for Chennai conditions, cached 30 min, fails silently to clear.
- **Deploy:** Vercel, auto-deploy from `main`.
- **Assets:** CC0/CC-BY low-poly packs (Kenney first). Every asset recorded in `CREDITS.md` with source and licence before it is committed.

## 3. Architecture rules

### 3.1 Event-driven, always
- One typed `EventBus` in `src/core/events/`. Every event name and payload type is declared in `src/core/events/catalog.ts`. No string literals for event names anywhere else.
- Systems communicate only through events or through read-only access to `GameState`. A system never imports another system to call it. If you find yourself writing `spawner.doThing()` from inside `player.ts`, stop and emit an event.
- Events are past tense facts (`PlayerStumbled`, `StageEntered`, `CheckpointResolved`), not commands. Commands are user inputs and flow through `InputSystem` only.
- The event catalog is the single source of truth for the analytics layer: `AnalyticsSystem` subscribes to the bus and forwards a whitelisted subset to PostHog. Game code never calls PostHog directly.

### 3.2 Modularity
- **Hard cap: 150 lines per file**, comments included. If a file approaches it, split by responsibility before adding to it.
- One responsibility per file. One exported class, function, or config object per file unless they are trivially coupled types.
- Folder layout is fixed (Section 4). New folders require a `DECISIONS.md` entry.
- Pure logic (scoring, stage progression, difficulty curve, pool bookkeeping, checkpoint resolution) lives in `src/logic/` with **no Three.js or React imports**, so it is unit-testable in isolation.

### 3.3 Object pooling (mandatory for anything spawned during a run)
- Pool: track segments, hazards, pickups, NPC runners/cats/birds, particles, floating text.
- Pools are pre-warmed at load to their configured capacity. **No `new Mesh`, `new Group`, `clone()`, or geometry/material creation inside the game loop.** If a pool is exhausted, the spawner skips the spawn and emits `PoolExhausted` (which analytics records) rather than allocating.
- Pooled objects implement `Poolable { reset(cfg): void; deactivate(): void; active: boolean }`.
- Materials and geometries are shared singletons in `src/render/assets/`. Never per-instance.

### 3.4 Config-driven serialization (the web equivalent of "clean Inspector serialization")
- **Zero magic numbers in system code.** Every tunable (lane width, lane-switch duration, jump arc, base speed, speed ramp, stumble window, camera lerp factors, pool sizes, spawn weights) lives in `src/config/*.ts` as typed, frozen objects with a comment stating unit and sane range.
- **All content is data.** Stages, obstacles, pickups, checkpoints, characters, and questions live in `content/*.json`, validated at load with Zod schemas in `src/content/schemas/`. A validation failure is a hard error with a readable message naming the file and field. The PM must be able to add a stage or a question by editing JSON only.
- Config is imported, never mutated at runtime. Runtime-varying values live in `GameState`.

### 3.5 State-decoupled UI
- `GameState` is a single store (`src/core/state/`) with typed selectors. Three.js code writes to it via reducers triggered by events; React reads it via a subscription hook and **never** imports anything from `src/render/`, `src/systems/`, or Three.js.
- React never mutates game state directly. UI intent (start run, choose character, resolve checkpoint) is emitted as an input event onto the bus.
- The game must run headless (no React mounted) for tests; the UI must render with a stubbed state for design work. If either breaks, the coupling rule has been violated.
- HUD updates are throttled to display-relevant changes (score every 100 m, not every frame).

### 3.6 Game loop and timing
- Fixed-timestep simulation (`1/60 s`) with render interpolation. Simulation never reads `Date.now()` except through `ClockSystem`, which also owns real IST time for lighting.
- Input is sampled once per frame into an intent struct; systems read the struct, never the raw DOM events.

## 4. Folder layout

```
/CLAUDE.md /DECISIONS.md /METRICS.md /CREDITS.md /PLAYBOOK.md
/docs/briefs/          PM brief per phase (before code)
/docs/interview-notes/ what the PM can now explain (after phase)
/content/              stages.json obstacles.json pickups.json characters.json questions.json
/src/config/           typed tunables, one domain per file
/src/content/schemas/  Zod schemas + loader
/src/core/events/      bus.ts catalog.ts
/src/core/state/       store.ts reducers/ selectors.ts
/src/core/loop/        clock.ts loop.ts
/src/logic/            pure, testable: scoring, stages, difficulty, checkpoints, pools
/src/systems/          input, spawner, collision, chaser, camera, audio, analytics, weather
/src/render/           scene setup, assets (shared geo/mat), pooled meshes, lighting
/src/ui/               React shell: screens/, hud/, share/
/tests/                vitest for src/logic and src/core
/supabase/             migrations, RLS policies
```

## 5. Technical decisions already made (do not reopen without a DECISIONS.md entry)

- **Lanes:** three discrete lanes. Lane change is a tweened lateral move over a configured duration with ease-out; input during a tween queues one further change. Jump and slide are a small state machine (`Running | Jumping | Sliding | Stumbling | Caught | SafeZone`), fixed durations, no physics.
- **Collision:** each hazard declares a lane-space box (lane index, z-range, height band: low/mid/high). Player box is a function of state (Jumping clears low, Sliding clears high). Resolution is a pure function in `src/logic/collision.ts`.
- **Stumble rule:** first hit stumbles (speed dips, chaser closes by a configured distance). Second hit while chaser is within the catch radius ends the run. A shield absorbs one hit. Stumble grace is configurable.
- **Camera:** third-person follow. Position lerps toward a target offset behind and above the player with a base factor; lateral lane offset uses a separate, slower lerp so lane changes feel weighty. FOV widens with speed within a configured range. Short shake on stumble, longer on catch. On terrace ending, the camera hands off to a scripted dolly.
- **Track:** straight pooled segments in local space with an optional bank/curve shader illusion; no true splines in v1.
- **Difficulty:** speed and spawn density are functions of distance and stage, defined in `src/config/difficulty.ts` and evaluated in `src/logic/difficulty.ts`.

## 6. Performance budget (hard)

- 60 fps target, 45 fps floor on the reference Android device.
- Under 150 draw calls per frame; instanced meshes for repeated props.
- Bundle under 5 MB gzipped including assets; textures 512 px max, atlas where possible.
- Time to interactive under 3 s on 4G. Lazy-load everything past the first stage.
- Measure with the in-repo `perf` overlay before and after any rendering change; record numbers in the PR description.

## 7. Working protocol with the PM

1. **Phases are gated.** Before each phase: write `docs/briefs/phase-N.md` (what, the one or two real architectural decisions, the alternative considered, the tradeoff, acceptance criteria). Wait for approval.
2. **Steps are atomic.** Within a phase, work in single-file steps. For each: name the file, its responsibility, its public interface, what it depends on, how it will be verified. Wait for explicit "go" before writing it.
3. **After each phase:** write `docs/interview-notes/phase-N.md`, 5–8 bullets a non-engineer can rehearse for a PM interview.
4. **`DECISIONS.md`:** dated entry for every scope cut, tech choice, or reversal: decision, reason, what would reopen it.
5. **`METRICS.md`:** every event name, when it fires, the question it answers, and each feature's pre-registered kill criterion.
6. **Define terms once, inline, in one sentence** the first time they appear (lerp, pool, RLS, fixed timestep, draw call). Never lecture.
7. **Plain-English commit messages.** One step per commit.
8. **Real product forks go to the PM** with a recommendation and reason. Pure engineering choices are decided and logged.
9. **Verify on mobile viewport yourself** before calling any step done, and report what you actually observed.

## 8. Definition of done (per step)

- File under 150 lines, single responsibility, no magic numbers.
- Any spawned object is pooled.
- Any new event is in the catalog with a typed payload.
- Pure logic has a vitest test; rendering has a manual check recorded in the commit.
- No React import in game code, no Three import in UI code.
- `CREDITS.md` updated if an asset was added.

## 9. Do not

- Add a physics engine, a state-management library beyond the in-repo store, or a UI kit.
- Reproduce any copyrighted character, logo, or trademarked asset.
- Use real names or likenesses.
- Build multiplayer, chat, monetisation, native wrappers, or off-campus areas in v1.
- Ship a feature without analytics and a kill criterion.
