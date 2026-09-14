# Phase 0 brief — Skeleton

## What

Vite + Three.js + React + TypeScript scaffold. Anonymous Supabase auth (name + section, no password). PostHog wired and firing live. Deployed to Vercel. One pooled track segment scrolling under a capsule player, three-lane switching, third-person camera follow.

No stages, no hazards, no pickups, no audio yet — those are Phase 1. Phase 0 exists to prove the skeleton holds weight: that a run can start, the player can move, and the deployed link actually works on the PM's phone inside WhatsApp.

## The real decisions

**1. Even this minimal flow goes through the typed `EventBus` and `GameState` store from the first commit — not direct React state wired straight to the Three.js scene.**

*Alternative considered:* build the fastest possible path to "lane switching works" — a React state variable for lane index, read directly by the render loop — and retrofit the event bus and store once more features arrive.

*Why rejected:* Sections 3.1 and 3.5 of `CLAUDE.md` are non-negotiable, and "retrofit the architecture later" is precisely the failure mode a time-pressured PM-led project falls into — the shortcut ships, works, and then every subsequent stage's code is written against the shortcut instead of the rule. Paying the small scaffolding cost now (bus + store + one reducer) means Phase 1's collision, chaser, and checkpoint systems plug into something that already exists, instead of needing stage/system code rewritten around a store that didn't exist yet.

*Tradeoff:* Phase 0 takes slightly longer to reach its first visible, movable capsule — there's a bus, a store, and two reducers before there's anything on screen — in exchange for never having to touch this plumbing again.

**2. External service clients (Supabase, PostHog, later Open-Meteo) live in a new folder, `src/core/net/`, not inside `src/systems/`.**

Logged in `DECISIONS.md` (2026-09-14) since it's a deviation from Section 4's fixed layout. The short version: a system reads/writes `GameState` and the event bus; a Supabase client is infrastructure underneath that, and blurring the two would make every system file after it ambiguous about what a "system" is allowed to import.

## Acceptance criteria

- The deployed Vercel link opens inside WhatsApp's in-app browser on the PM's phone.
- A name and section can be entered and reach Supabase as an anonymous-auth player row.
- Tapping Start emits `run_started`, visible live in the PostHog dashboard, and the track visibly scrolls under the capsule.
- Lane switching holds 60fps on that phone at 360×740.

## Standing flags (checked before this phase is called done, not just at the end)

- **No real people, no dogs:** Phase 0 has no fauna or NPCs, so the check here is narrower — the login screen's placeholder copy and the capsule/track geometry must not reference or resemble a real person, and no default asset from a starter pack (Kenney or otherwise) gets pulled in without a look — a bundled example scene can include a dog mesh nobody asked for.
- **Analytics ships with every feature:** `app_opened`, `login_completed`, and `run_started` must be confirmed arriving in the PostHog dashboard live during a real run-through, not just present in `catalog.ts` — a wired event that never fires isn't done.
