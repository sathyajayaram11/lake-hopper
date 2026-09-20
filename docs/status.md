# Status

**Where we are:** Phase 1 (core run) is deep in progress — all pure logic, every reducer, the input system, and the full player pose state machine (jump/slide/stumble/catch/shield/slow) are built and tested (180 tests passing, all pushed); nothing is wired into a playable, JSON-driven run yet.

**What's next:** `stage.ts` (distance progression, the countdown mechanic, and the day-rollover loop — the biggest remaining single file), then `run.ts`/`collision.ts`(pickups)/`chaser.ts`, the render/audio/weather/lighting systems, and finally real `content/*.json` for stages 1–5 to make it playable end to end.
