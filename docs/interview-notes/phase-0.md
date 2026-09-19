# Phase 0 interview notes

What I can now explain, in my own words, after Phase 0.

- **The game and the UI never talk to each other directly — they pass notes through one shared board.** Every meaningful thing that happens (a login, a run starting) gets announced as an "event" on a single event bus, and anything that cares subscribes to it. Nothing reaches into another part of the code and calls it directly. This is why adding a feature later (like a new hazard type) won't require touching five different files just to wire it up.

- **The simulation runs on its own clock, separate from how fast the phone can draw frames.** Game logic (movement, lane changes) advances in fixed, identical-sized steps 60 times a second, no matter whether the phone is rendering at 60fps or struggling at 40fps. What you actually see on screen is smoothed between those steps. This is why the game plays the same on a fast phone and a slow one, even if it looks slightly less smooth on the slow one.

- **Nothing gets created or destroyed while the game is running — it's all reused.** The track segments the player runs over are built once, upfront, and get silently repositioned and reused forever instead of being thrown away and rebuilt. This is called "pooling," and it's the main reason a phone doesn't grind to a halt after a few minutes of hazards spawning.

- **Every tunable number lives in one obvious place, not buried in logic.** Lane width, camera follow speed, pool sizes — all named constants in dedicated config files, not magic numbers scattered through the code. If we want the camera to feel snappier later, that's a one-line change, not a hunt.

- **Anonymous login works, but "logged in" only protects what it should because of database-level rules (Row-Level Security), and we actually got this wrong once.** A player can start playing with just a name, no password — but I had genuinely forgotten to grant basic table permissions in the first migration, so login silently failed with a permissions error until I caught it running the app for real and fixed it with a follow-up migration. The lesson: RLS policies decide *which rows* a role can touch, but a role still needs baseline permission to touch the table at all — two separate settings, easy to do one and forget the other.

- **Automated tests didn't catch three real bugs — actually running the app in a browser did.** Every unit test passed the whole time, but only opening the deployed app for real surfaced: a debug overlay silently blocking clicks on the Start button, login text rendering invisible (black text on a black background), and PostHog batching events instead of sending them live, which could have quietly lost data. This is the argument for why "the tests pass" and "the feature works" are two different claims.

- **The visual bareness right now is deliberate scope, not a shortcut.** Phase 0's only job was proving the skeleton — login, one moving shape, one scrolling track segment. Lighting, real assets, and any actual art direction are scoped into Phase 1 and later on purpose, so we didn't spend time polishing something that might have needed to change shape anyway.
