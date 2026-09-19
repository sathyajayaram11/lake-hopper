# Content guide

How to write `content/*.json`. Each file is a JSON array of objects; every object below is a real, valid entry you can copy and adapt. If a field is wrong (wrong type, missing, an unrecognized value), the game refuses to start and tells you which file and field — that's on purpose, so a typo in content never becomes a silent, confusing bug in the running game.

## `stages.json`

```json
{
  "id": "gate",
  "index": 0,
  "label": "06:00 The Gate",
  "pursuer": "Gate Security",
  "lengthM": 300,
  "hazardWeights": { "barrier-arm": 3, "delivery-bike": 2, "visitor-log-stand": 1 },
  "pickupWeights": { "chai": 1 },
  "chaserStartingGapM": 20,
  "visualEffect": null,
  "audio": {
    "ambience": ["mess-clatter"],
    "music": "stage-1-theme",
    "stinger": "security-laugh"
  },
  "countdown": null
}
```

- `pursuer` — a **fictional role**, never a real name (Section 1.3 of `CLAUDE.md`) — "Gate Security," not anyone's actual name or title.
- `hazardWeights` / `pickupWeights` — keys are `id`s from `obstacles.json`/`pickups.json`; higher numbers spawn more often within this stage. A hazard or pickup not listed here never appears in this stage.
- `visualEffect` — `null` for every stage except stage 11 (Hostel Wi-Fi), which uses `{ "name": "lag", "intensityKey": "stage11Lag" }` — a purely visual render-degradation effect, never affects hitboxes or input.
- `countdown` — `null` unless the stage has a beatable time-pressure moment (The Door, Submission). When present: `{ "seconds": 10, "failEffect": "caught" }` — the player must cross into the next stage before the countdown hits zero, or the run ends the same way a hazard catch does.
- `audio.stinger` — a one-shot sound that plays once, right when the stage starts (a laugh, a groan, a pant) — the id must exist in `audio.json`.

## `obstacles.json`

```json
{
  "id": "barrier-arm",
  "lane": 1,
  "heightBand": "mid",
  "widthM": 1.5,
  "effect": "stumble",
  "telegraph": { "audio": "snake-hiss", "leadTimeMs": 800 }
}
```

- `lane` — `0`, `1`, `2` (left/middle/right) or `"any"` if the spawner should pick a random lane each time it spawns this hazard.
- `heightBand` — `"low"` is cleared by **jumping**, `"high"` is cleared by **sliding**, `"mid"` can't be jumped or slid past — the player has to be in a different lane.
- `effect` — `"stumble"` triggers the normal stumble/catch rule (first hit stumbles, second hit while the pursuer is close ends the run). `"slow"` costs the player speed for a few seconds and never triggers a stumble or a catch — use this for queue crowds and spills, not real obstacles.
- `telegraph` — optional. Only set this for a hazard that should warn the player just before it appears (the spec calls for exactly one: the snake, hissing and rustling). `leadTimeMs` is how far in advance the sound plays before the hazard reaches the player. Leave this field out entirely for hazards that shouldn't be telegraphed.

## `pickups.json`

```json
{
  "id": "chai",
  "type": "chai",
  "effect": { "kind": "speedBurst", "magnitude": 1.4, "durationMs": 3000 }
}
```

- `type` is one of the four fixed pickups: `"chai"` (speed), `"samosa"` (magnet), `"maggi"` (slow-mo), `"proxy"` (shield).
- `effect.kind` matches the type's actual gameplay effect: `"speedBurst"`, `"magnet"`, `"slowMo"`, or `"shield"`.
- `durationMs` is optional — a shield doesn't need one (it's consumed on the next hit, not time-limited), but a speed burst or slow-mo does.

## `audio.json`

```json
{
  "id": "stinger-security-laugh",
  "kind": "stinger",
  "src": "/audio/stinger/security-laugh.mp3",
  "licence": "CC0",
  "source": "https://kenney.nl/assets/interface-sounds"
}
```

- `kind` — `"ambience"` (looping background sound), `"music"` (looping stage theme), `"stinger"` (one-shot on stage entry), or `"telegraph"` (one-shot hazard warning).
- `licence` and `source` are **required** — every asset needs its licence and where it came from recorded here (and in `CREDITS.md`) before it can be referenced by a stage or hazard. `licence: "placeholder"` is allowed during development (for the synthesized tones standing in for real audio) but the game refuses to build for production while any placeholder entry remains.
- `id` is what `stages.json`'s `audio.ambience`/`audio.music`/`audio.stinger` and `obstacles.json`'s `telegraph.audio` reference — it must match exactly.

## What's not here

`checkpoint`, `questions.json`, and anything attendance/network-stat related were removed in the 2026-09-18 scope change (see `DECISIONS.md`) — the run no longer stops to ask the player a question or show a prompt. Don't add those fields back without checking with me first; the schemas will reject them anyway.
