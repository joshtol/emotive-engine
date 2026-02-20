# UP-RESONANCE-2: Engine Improvements for Rhythm + Emotion

Identified from GDD analysis. All features are universally useful (storytelling, music, games) — not game-specific.

---

## Feature 1 — Emotion Event Hooks (Small)

**Problem:** The event bus only fires `emotionChanged` on explicit `setEmotion`/`pushEmotion`/`clearEmotions`. No events fire for implicit state changes (dominant shift, decay-to-zero, intensity peak).

**API:**
```js
mascot.on('dominantChanged', ({ previous, current, intensity }) => { ... });
mascot.on('emotionDecayed',  ({ emotion, intensity, removed }) => { ... });
mascot.on('emotionPeaked',   ({ emotion, intensity }) => { ... });
mascot.on('slotChanged',     ({ slot, emotion, intensity, action }) => { ... });
```

**Implementation:**
- `EmotiveStateMachine`: emit `dominantChanged` when `getDominant()` result differs after any mutation.
- `EmotionDynamics.update()`: emit `emotionDecayed` when a slot's intensity drops below floor or is pruned. Emit `slotChanged` with `action: 'decay'`.
- `nudgeEmotion()`: emit `emotionPeaked` when intensity hits cap. Emit `slotChanged` with `action: 'nudge'`.
- All events bubble through `StateCoordinator._emit` to the main mascot event bus.

**Files:** `EmotiveStateMachine.js`, `EmotionDynamics.js`, `StateCoordinator.js`

---

## Feature 2 — Rhythm Grade → Emotion Feedback Loop (Small)

**Problem:** `RhythmInputEvaluator` grades timing but has zero connection to emotions. Every consumer must manually wire `evaluator.onEvaluate` → `mascot.nudgeEmotion`. This is the single most important feedback loop in any rhythm app.

**API:**
```js
const evaluator = mascot.getInputEvaluator();
evaluator.setEmotionFeedback({
  perfect: { emotion: 'joy',   delta: 0.10 },
  great:   { emotion: 'calm',  delta: 0.05 },
  good:    null,  // no emotional effect
  miss:    { emotion: 'anger', delta: 0.15 }
});
```

**Implementation:**
- `RhythmInputEvaluator`: add `_emotionFeedback` config + `_emotionTarget` (reference to stateMachine or nudge function).
- In `evaluate()`, after grading, if feedback config exists for the grade, call `this._emotionTarget.nudgeEmotion(emotion, delta)`.
- `setEmotionFeedback(config)` stores config, `setEmotionTarget(nudgeFn)` stores the function.
- Wire in `AudioManager.getInputEvaluator()`: auto-set target to `stateCoordinator.nudgeEmotion`.

**Files:** `RhythmInputEvaluator.js`, `AudioManager.js`

---

## Feature 3 — State Serialization (Medium)

**Problem:** No way to save/restore engine emotional state. Any persistent application (game saves, cross-session stories, long music sessions) cannot preserve progress.

**API:**
```js
const snapshot = mascot.getSnapshot();
// snapshot = { slots, dynamicsConfig, morphStance, bpm, dampening, modifiers, timestamp }
localStorage.setItem('mascotState', JSON.stringify(snapshot));

// Later:
mascot.loadSnapshot(JSON.parse(localStorage.getItem('mascotState')));
```

**Implementation:**
- `EmotiveStateMachine.serialize()` → `{ emotion, undertone, intensity, slots: [...], transitions }`
- `EmotiveStateMachine.deserialize(data)` → restore slots, dominant, transitions.
- `EmotionDynamics.serialize()` / `deserialize()` → config (decayRate, enabled, etc).
- `EmotiveMascotPublic.getSnapshot()` aggregates all subsystem snapshots.
- `EmotiveMascotPublic.loadSnapshot(data)` restores all, fires `emotionChanged` events.
- Version field in snapshot for forward compatibility.

**Files:** `EmotiveStateMachine.js`, `EmotionDynamics.js`, `StateCoordinator.js`, `EmotiveMascotPublic.js`

---

## Feature 4 — Emotion Dampening (Small)

**Problem:** `nudgeEmotion` applies delta raw. No way to model "emotional resilience" — a modifier that reduces the impact of negative emotion spikes. The GDD's Resilience stat (Section 3) directly maps to this.

**API:**
```js
mascot.setEmotionDampening(0.3);  // 30% reduction on negative spikes
// Internally: effectiveDelta = delta * (1 - dampening) for negative emotions
```

**Implementation:**
- `EmotiveStateMachine`: add `_emotionDampening = 0` field.
- `setEmotionDampening(factor)` sets it (clamped 0-1).
- `getEmotionDampening()` returns it.
- In `nudgeEmotion()`: if delta > 0 and emotion is in a configurable "negative" set (anger, fear, sadness, disgust, suspicion), apply `delta *= (1 - this._emotionDampening)`.
- Expose via `StateCoordinator` and `EmotiveMascotPublic`.

**Files:** `EmotiveStateMachine.js`, `StateCoordinator.js`, `EmotiveMascotPublic.js`

---

## Feature 5 — Difficulty / Accessibility Presets (Medium)

**Problem:** `RhythmInputEvaluator` has `setWindows()` for raw timing configuration, but no preset system. No auto-rhythm mode. No effective BPM that accounts for slow-mode. Accessibility is universally required.

**API:**
```js
mascot.setDifficulty('easy');    // widens timing windows, simplifies
mascot.setDifficulty('normal');  // standard
mascot.setDifficulty('hard');    // narrows windows

mascot.setAssist({
  autoRhythm: true,       // all inputs auto-succeed at 'good'
  slowMode: true,          // -25% BPM globally
  visualMetronome: true    // pulse guide active
});

mascot.getEffectiveBPM();  // base BPM + emotion tempoShift + slowMode
```

**Implementation:**
- New `DifficultyManager` class (or add to existing config system).
- Presets: easy = windows × 1.5, normal = × 1.0, hard = × 0.7.
- `slowMode` stores a BPM multiplier (0.75).
- `autoRhythm` flag checked in `RhythmInputEvaluator.evaluate()` — returns 'good' immediately.
- `getEffectiveBPM()` on rhythmIntegration: `baseBPM * emotionTempoShift * slowModeMult`.
- Expose presets and assist toggles through `EmotiveMascotPublic`.

**Files:** New `DifficultyManager.js`, `RhythmInputEvaluator.js`, `rhythmIntegration.js`, `EmotiveMascotPublic.js`

---

## Feature 6 — Timed Modifier System (Medium)

**Problem:** No way to apply temporary, auto-expiring modifiers to the rhythm/visual pipeline. The GDD's status effects (Burn, Freeze, Shock) and consumables (Tempo Tincture, Clarity Drop) all need timed modifiers.

**API:**
```js
mascot.applyModifier('freeze', {
  duration: 5000,         // ms, or null for permanent until removed
  rhythmWindowMult: 0.8,  // narrows timing windows by 20%
  visualNoise: 0.3,       // visual jitter
  inputDelay: 20,         // ms delay on inputs
  tempoShift: -0.1,       // slow tempo 10%
  onTick: (remaining) => { ... },
  onExpire: () => { ... }
});

mascot.removeModifier('freeze');
mascot.getActiveModifiers();  // [{ name, remaining, config }]
```

**Implementation:**
- New `ModifierManager` class with `_activeModifiers` map.
- `update(deltaMs)` ticks all modifiers, removes expired ones, fires callbacks.
- `getCompositeModifiers()` aggregates all active modifiers (multiplicative for window/tempo, additive for noise/delay).
- `RhythmInputEvaluator` queries composite modifiers when evaluating.
- `EmotionDynamics.update()` calls `modifierManager.update()`.
- Events: `modifierApplied`, `modifierExpired` on the main bus.

**Files:** New `ModifierManager.js`, `RhythmInputEvaluator.js`, `EmotiveMascotPublic.js`, `StateCoordinator.js`

---

## Feature 7 — Morph Stance Registry (Medium)

**Problem:** `morphTo()` only accepts shape names (circle, star, heart). The GDD defines named stances (Sun, Tide, Bastion, Storm) as configuration bundles with visual params and metadata. No way to register custom stances or query the active one.

**API:**
```js
mascot.registerStance('sun', {
  shape: 'sun',
  elements: ['fire', 'light'],
  visualConfig: { tint: '#FF6600', glowIntensity: 1.5 },
  modifiers: { attackMult: 1.2, defenseMult: 0.9 },
  description: 'Radiant crystalline form'
});

mascot.morphTo('sun');          // activates stance by name
mascot.getActiveStance();       // { name: 'sun', config: { ... } }
mascot.getAvailableStances();   // ['sun', 'tide', 'bastion', 'storm']
mascot.dismissStance();         // return to default form
```

**Implementation:**
- New `StanceRegistry` (Map-based, like ElementTypeRegistry pattern).
- `morphTo()` in `EmotiveMascotPublic`: check stance registry first, fall back to raw shape.
- Store `_activeStance` on the public API. Fire `stanceChanged` event.
- Stance config is consumer-defined — engine stores it, applies visual config, consumer reads modifiers.

**Files:** New `StanceRegistry.js`, `EmotiveMascotPublic.js`

---

## Feature 8 — Effective BPM Query (Small)

**Problem:** BPM is modified by emotion `tempoShift`, difficulty slow-mode, and future modifiers. No single API returns the composite value. Consumers must calculate it themselves.

**API:**
```js
const bpm = mascot.getEffectiveBPM();
// = baseBPM * (1 + emotionTempoShift) * slowModeMult * modifierTempoShift
```

**Implementation:**
- `rhythmIntegration.getEffectiveBPM()`: reads base BPM from rhythm adapter, applies emotion modifiers from `stateMachine.getCurrentRhythmModifiers()`, applies any active modifier tempoShifts.
- Expose through `EmotiveMascotPublic.getEffectiveBPM()`.

**Files:** `rhythmIntegration.js`, `EmotiveMascotPublic.js`

---

## Feature 9 — Scene Transition Helper (Small)

**Problem:** Multi-scene apps need orchestrated fade-out → dispose → reinit → fade-in. Currently consumers must manually chain `fadeOut`, `destroy`, `new EmotiveMascotPublic`, `init`, `fadeIn`.

**API:**
```js
await mascot.transitionTo(async (newMascot) => {
  // Configure the new mascot during the black screen
  newMascot.setEmotion('calm');
  newMascot.morphTo('bastion');
}, { fadeOutMs: 500, fadeInMs: 500 });
```

**Implementation:**
- `EmotiveMascotPublic.transitionTo(setupFn, opts)`:
  1. `fadeOut(opts.fadeOutMs)` + await completion
  2. Call `setupFn(this)` for state changes during black
  3. `fadeIn(opts.fadeInMs)`
- For full scene swap (new canvas), a static helper: `EmotiveMascotPublic.transition(oldMascot, newCanvas, setupFn, opts)`.

**Files:** `EmotiveMascotPublic.js`

---

## Feature 10 — Ambient Mood (Small)

**Problem:** No way to set ambient atmosphere (time of day, scene mood). The GDD has day/night cycles with distinct palettes per biome.

**API:**
```js
mascot.setAmbientMood({
  tint: '#001133',           // color overlay
  particleDensity: 0.5,     // multiplier on particle spawn rate
  glowIntensity: 1.3,       // multiplier on glow effects
  breathSpeed: 0.8          // multiplier on breathing animation
});

// Or preset-based:
mascot.setAmbientMood('night');  // applies a registered preset
mascot.registerAmbientPreset('night', { tint: '#001133', ... });
```

**Implementation:**
- `AmbientMoodManager` stores current mood config + named presets.
- `particleDensity` multiplier applied in `ParticleSystem.update()` spawn rate.
- `glowIntensity` and `tint` applied in renderer (3D: post-processing tint, 2D: canvas filter).
- `breathSpeed` multiplier passed to breathing animation controller.

**Files:** New `AmbientMoodManager.js`, `EmotiveMascotPublic.js`, renderer integration

---

## Implementation Order

**Phase 1 — Small foundations (1 session):**
1 → 2 → 4 → 8

**Phase 2 — Medium features (1-2 sessions each):**
3 → 5 → 6

**Phase 3 — Extensions:**
7 → 9 → 10
