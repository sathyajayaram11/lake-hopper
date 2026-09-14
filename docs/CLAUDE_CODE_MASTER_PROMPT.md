# Initial Claude Code prompt — paste as your first message after `claude` in the empty repo (with CLAUDE.md already placed at root)

---

Before doing anything else, read `CLAUDE.md` in full. Then write back, in under 200 words, your understanding of: the product, the person you're working with and why, the three architectural rules you consider most likely to be violated under time pressure, and the performance budget. Do not create any files yet. Wait for me to confirm your understanding.

Once I confirm, proceed in exactly this order.

## Step A — Technical selection (no code)

Present, in a short table, your chosen approach for each of the following, with one alternative and the reason you rejected it. Where `CLAUDE.md` Section 5 already fixes a decision, confirm you'll follow it and add only the details it leaves open.

1. **Lane physics:** lane-change tween duration and easing, input buffering rule, jump arc height/duration, slide duration, the state machine transitions and which transitions are interruptible.
2. **Collision:** lane-space box definitions, height-band semantics, the exact stumble and catch resolution, shield handling.
3. **Camera:** follow offset, position lerp factor, lateral lerp factor, FOV-versus-speed curve, shake parameters, and how the terrace dolly is scripted and handed off.
4. **Track and spawning:** segment length, pool sizes for segments/hazards/pickups/NPCs, spawn weighting by stage, safe-zone handling around checkpoints.
5. **Difficulty curve:** speed and density as functions of distance and stage, and how Day 2+ scales.
6. **Chaser system:** how a pursuer is represented (distance behind player as a scalar, rendered mesh interpolated), how handoffs between stage pursuers are animated, and catch radius.
7. **Time and weather:** how IST lighting bands and Open-Meteo conditions map to scene lighting without affecting gameplay.
8. **Analytics and Supabase:** event whitelist, run persistence, anonymous identity, RLS policy shape.

Every number you propose must be labelled as a config value with its intended file. Wait for my approval.

## Step B — Plan Mode

Enter Plan Mode. Produce:

1. **File hierarchy**, following `CLAUDE.md` Section 4, listing every file for Phase 0 and Phase 1 with its one-line responsibility and its estimated line count (flag anything that might exceed 150).
2. **Event architecture:** the full event catalog for v1 as a table (event name, emitter, payload type, subscribers, analytics-forwarded yes/no).
3. **Component interfaces:** TypeScript interfaces for `Poolable`, `System`, `GameState`, `StageDefinition`, `HazardDefinition`, `PickupDefinition`, `CheckpointDefinition`, `CharacterDefinition`, `QuestionDefinition`, and the `EventBus` API.
4. **Content schema plan:** the shape of each `content/*.json` file so I can start writing content in parallel.
5. **Phase plan** (Section D below) with acceptance criteria restated in your own words and any risks you see.

Exit Plan Mode and wait for approval. Do not write any file until I approve the plan.

## Step C — Atomic execution

After plan approval, work one file at a time. Before each file, post:

- **File:** path
- **Responsibility:** one sentence
- **Public interface:** signatures
- **Depends on:** files that must already exist
- **Verified by:** test name or manual check
- **Teaches:** one line on what I'll learn from this file (skip if nothing new)

Then stop and wait for "go". After writing, run the test or check, report the actual result, commit with a plain-English message, and propose the next file. If a file would exceed 150 lines, split it and propose both.

Follow the phase gating, briefs, interview notes, `DECISIONS.md`, and `METRICS.md` rules in `CLAUDE.md` Section 7 without being reminded.

## D — Product specification

### The day (one run)

The player didn't sign the gate register. Title card: **"You didn't sign."** The run is one campus day, 06:00 to midnight. Real IST time lights the scene, but the in-run day clock is driven by distance, not by wall time. Each stage defines a pressure (what chases), an obstacle set, and an optional checkpoint (a 5–8 second safe-zone activity, always skippable, with a reward for doing it and a cost for skipping). Stages live in `content/stages.json` and are added by editing JSON only.

**Stumble rule:** first hit stumbles and the pursuer closes in; second hit within the catch radius ends the run. Shield absorbs one hit.

**v1 stages, in order:**

1. **06:00 The Gate** — Pursuer: Gate Security (a role, not a person). Obstacles: barrier arms, delivery bikes, the visitor log stand. No checkpoint; tutorial stage. Ambient: birds loud.
2. **07:30 Chennai Beverages** — You take the last puff; the queue pursues. Obstacles: chai cups, wet-floor signs, a cat asleep in the path (vault or lane-change), stacked crates. Checkpoint: one-tap order timing → **Chai** (speed burst).
3. **08:55 The Door** — Pursuer: the attendance sheet; on-screen 10-second door countdown. Obstacles: late students, bags in corridor. Checkpoint: attend (one quick question from `questions.json`; attendance stat up, brownie points) or skip (faster exit, attendance stat down). Attendance below 75% for the day raises cutoff heights in stage 10.
4. **10:30 Cold Call** — Pursuer: the fictional professor who teleports ahead and points; duck under the finger. Checkpoint: answer the cold-call question. Correct → shield. Wrong → next stage starts at a higher speed.
5. **12:45 Lunch Rush** — Pursuer: the stampede toward the canteens. Obstacles: trays, mess staff crossing with hot vessels, spilled sambar patches (slow), queue barriers. **Bottleneck mechanic:** the veg and non-veg lines are two lanes that periodically stall (the real campus bottleneck); the middle lane is open but has more hazards. Checkpoint: pick a queue, one is randomly shorter → **Samosa** (pickup magnet) or **Maggi** (3-second slow-mo).
6. **14:00 Post-Lunch Slump** — No pursuer. Screen edges darken, speed decays; collect chai pickups to stay awake. Breather stage. Rare obstacle: a snake crossing the path (must jump, telegraphed by a hiss and a rustle).
7. **15:30 Group Project** — Pursuer: your group with the half-finished deck. Obstacles: chargers, cables, a ring light, bean bags. Checkpoint: "make the slide" (three rapid taps) or dodge and the group stays on you into the next stage.
8. **16:30 Guest Lecture** — Pursuer: a giant "attendance mandatory" envelope. Checkpoint: attend (Network stat up, unlocks a character at threshold) or dodge.
9. **17:30 The Courts** — Pursuer: none, but hazard density spikes. Obstacles: cricket balls (low, fast), footballs (bounce, mid), a full pickleball court to vault, cones, a stray cat on the net post (cosmetic). Checkpoint: three-tap pickleball rally → speed burst.
10. **19:30 Placement Ticker** — Pursuer: a company-count ticker that keeps dropping. Obstacles: CGPA cutoff signs at heights set by the day's attendance stat.
11. **21:00 Hostel Wi-Fi** — Pursuer: the buffering wheel. Obstacles: laundry lines (slide), cricket bats in corridors, people on calls. Checkpoint: tap the one window with signal.
12. **22:30 Submission** — Fastest stage. Pursuer: the "DUE 23:59" clock. Checkpoint: hit submit inside the window. Miss → caught. Success → stage 13.
13. **23:30 The Terrace** — No pursuer, no obstacles. Speed drops to a walk up the hostel stairs; the camera hands off to a scripted dolly that pulls back over the campus and the amphitheatre, birds silent, campus lit. Title card: **"Day won."** Day score is shown and the share card is offered. This is the emotional end of the run and must look better than anything else in the game.
14. **00:30 Night Owl (optional)** — After the terrace, the player may continue into an endless stage in the academic block: no checkpoints, speed ramps until caught by "tomorrow's 8 AM". Only Night Owl distance separates top leaderboard positions.

After Night Owl or a catch, the run ends. Day 2 is not in v1; log it in `DECISIONS.md` as the first content drop (faster, lightly shuffled stages).

### Pickups and currency
Chai (speed), Samosa (magnet), Maggi (slow-mo), Proxy (shield, "a friend marked you present"). Currency: **brownie points**, collected on the track and awarded at checkpoints, spent on characters.

### Characters (fictional, unlockable with brownie points or thresholds)
- **The Topper** — checkpoint questions show one fewer wrong option.
- **The Backbencher** — starts with a shield.
- **The Sports Captain** — slightly higher base speed.
- **The Night Owl** — bonus score on runs started between 23:00 and 03:00 real time.
- **The Placement Warrior** — double score in stage 10 and Night Owl.
Perks are config values, small, and must never make a character required.

### Fauna and ambience
Cats (asleep, sitting, walking across; some are obstacles, some cosmetic). Snakes (rare, telegraphed, stage 6 and 9 only). Birds as a layered ambient loop that varies by IST hour and goes silent on the terrace. **No dogs.**

### Leaderboards
All-time, this week (resets Monday 00:00 IST), and by section. Score = distance + stage bonuses + Night Owl distance. Async only.

### Share card
On "Day won" and on catch: a PNG with the title card, day reached, score, character, and one auto-generated line ("Caught by the lunch stampede at 12:52"). One tap to the WhatsApp share sheet.

## E — Phases

**Phase 0 — Skeleton.** Vite + Three.js + React + TS; Supabase anonymous auth (name + section); PostHog; Vercel deploy; a single pooled track segment scrolling under a capsule player with lane switching and camera follow. Events: `app_opened`, `login_completed`, `run_started`. *Acceptance:* the Vercel link opens in WhatsApp on my phone, I enter a name, I can switch lanes at 60 fps.

**Phase 1 — The core run.** State machine (jump/slide/stumble/catch), collision, pooled hazards and pickups, chaser system with handoffs, difficulty curve, stages 1–5 fully playable from JSON, IST lighting and weather, HUD. Events: `stage_entered`, `player_stumbled`, `player_caught` (with stage, distance, hazard), `checkpoint_shown/resolved` (with choice), `pickup_collected`. *Acceptance:* a full 5-stage run from JSON; adding a hazard to JSON works without a code change; perf overlay within budget on my phone.

**Phase 2 — The whole day.** Stages 6–14 including the terrace dolly and Night Owl; characters and brownie points; share card; run persistence. Events: `day_won`, `night_owl_entered`, `share_card_tapped`, `character_unlocked`. *Acceptance:* I can win a day in about 4 minutes, and the share card lands in a WhatsApp group looking good.

**Phase 3 — Leaderboards and launch.** Supabase leaderboards (three views), Open Graph link preview, load-time work to hit the budget, `PLAYBOOK.md` (how I add a stage, hazard, question, character; how I read the dashboards), PostHog dashboards. *Acceptance:* two phones' scores appear on the same board within seconds; TTI under 3 s on 4G.

## F — Metrics (write into METRICS.md in Phase 0)

- **North star:** D7 return rate, target 25% of first-day players.
- **Guardrails:** D1 return, runs per active user per day, median run length, day-won rate, share-card tap rate.
- **Diagnostics:** catch location heatmap by stage and hazard (this tells us which obstacles are unfair versus which are hard); checkpoint skip rate per checkpoint; character usage.
- **Pre-registered kill criteria:** any checkpoint skipped by over 70% of players → redesign; any hazard responsible for over 35% of catches in its stage → retune; if runs per active user per day is under 2 after two weeks, the core loop is not sticky and we stop adding content until it is.

## G — Out of scope for v1 (suggest, don't build)
Day 2+, ghost runs, Saturday Night / Sunday Morning / Sports Fest variants, chat, multiplayer, monetisation, native wrappers, off-campus areas, AI-generated questions.

## Start
Do Step A now. Remember: no files until the plan is approved, one file at a time after that, and stop for "go" every time.
