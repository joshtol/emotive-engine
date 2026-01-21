# Gesture Reference

This document provides a complete reference for all gestures available in Emotive Engine.

## Overview

Gestures are animations that the mascot can perform. They are organized into **6 semantic categories** based on their purpose and behavior:

| Category | Purpose | Examples |
|----------|---------|----------|
| **Idle** | Continuous background behaviors | breathe, sway, float |
| **Dance** | Rhythmic, music-synced movements | bounce, stepLeft, pop |
| **Actions** | Deliberate character movements | jump, spin, bow |
| **Reactions** | Responses to events/impacts | oofLeft, recoil, wobble |
| **Destruction** | Breaking apart effects | shatter, dissolve, morph |
| **Atmosphere** | Environmental/particle effects | rain, glow, fade |

## Basic Usage

```javascript
// Single gesture
mascot.express('bounce');

// With options
mascot.express('jump', { strength: 1.5 });

// Natural language (LLM integration)
mascot.feel('happy and bouncing');
```

---

## Category: Idle

Continuous, subtle behaviors for when the mascot is at rest.

### Breathing
| Gesture | Description |
|---------|-------------|
| `breathe` | Gentle rhythmic expansion/contraction |
| `expand` | Confident outward growth |
| `contract` | Modest inward shrink |
| `pulse` | Rhythmic intensity throb |

### Swaying
| Gesture | Description |
|---------|-------------|
| `sway` | Gentle side-to-side motion |
| `float` | Dreamy floating motion |
| `floatUp` | Ethereal upward drift |
| `floatDown` | Gentle downward sink |
| `floatLeft` | Drift to the left |
| `floatRight` | Drift to the right |
| `bob` | Subtle vertical bob |
| `lean` | Gentle lateral lean |
| `leanLeft` | Lean to the left |
| `leanRight` | Lean to the right |

### Fidgeting
| Gesture | Description |
|---------|-------------|
| `jitter` | Quick nervous twitches |
| `twitch` | Sudden brief movements |
| `vibrate` | High-frequency trembling |
| `shake` | Side-to-side shake ("no") |
| `wiggle` | Playful side-to-side motion |

---

## Category: Dance

Rhythmic movements designed to sync with music.

### Steps (Beat-Synced)
| Gesture | Duration | Description |
|---------|----------|-------------|
| `stepLeft` | 1 beat | Quick weight shift left |
| `stepRight` | 1 beat | Quick weight shift right |
| `stepUp` | 1 beat | Quick weight shift up |
| `stepDown` | 1 beat | Quick weight shift down |
| `slideLeft` | 2 beats | Smooth glide left |
| `slideRight` | 2 beats | Smooth glide right |

### Moves
| Gesture | Description |
|---------|-------------|
| `runningman` | Classic running man dance |
| `charleston` | 1920s charleston kick |
| `hula` | Hip-swaying hula motion |
| `twist` | Rotational twist |

### Accents
| Gesture | Duration | Description |
|---------|----------|-------------|
| `pop` | ~200ms | Quick scale burst |
| `flare` | ~300ms | Energetic burst |
| `swell` | ~500ms | Gradual expansion |
| `swagger` | ~600ms | Confident movement |
| `dip` | ~400ms | Quick dip motion |
| `bounce` | 4 beats | Playful up-down |

### Orbits
| Gesture | Description |
|---------|-------------|
| `orbit` | Circular orbital motion |
| `orbitLeft` | Counter-clockwise orbit |
| `orbitRight` | Clockwise orbit |
| `orbitUp` | Upward arc orbit |
| `orbitDown` | Downward arc orbit |

### Extras
| Gesture | Description |
|---------|-------------|
| `sparkle` | Twinkling light bursts |
| `shimmer` | Wave-like sparkle effect |
| `groove` | Rhythmic groove motion |

---

## Category: Actions

Deliberate movements the character performs intentionally.

### Locomotion
| Gesture | Duration | Description |
|---------|----------|-------------|
| `jump` | ~400ms | Vertical leap (always up) |
| `jumpDown` | ~400ms | Downward plunge |
| `jumpLeft` | ~400ms | Leap to the left |
| `jumpRight` | ~400ms | Leap to the right |

**Lunge** - Forward thrust with emphasis:
| Gesture | Description |
|---------|-------------|
| `lunge` | Default forward lunge |
| `lungeForward` | Thrust toward camera |
| `lungeBack` | Thrust away from camera |
| `lungeLeft` | Thrust left (top leads) |
| `lungeRight` | Thrust right (top leads) |
| `lungeUp` | Upward reaching thrust |
| `lungeDown` | Downward stomping thrust |

**Rush** - Quick directional dashes:
| Gesture | Description |
|---------|-------------|
| `rushForward` | Dash toward camera |
| `rushBack` | Dash away from camera |
| `rushLeft` | Dash left |
| `rushRight` | Dash right |
| `rushUp` | Dash upward |
| `rushDown` | Dash downward |

### Acrobatics
| Gesture | Duration | Description |
|---------|----------|-------------|
| `spin` | ~600ms | Full rotation |
| `spinLeft` | ~600ms | Counter-clockwise spin |
| `spinRight` | ~600ms | Clockwise spin |
| `flip` | ~800ms | Forward flip |
| `backflip` | ~800ms | Backward flip |

### Gesturing
| Gesture | Duration | Description |
|---------|----------|-------------|
| `point` | ~500ms | Point forward |
| `pointUp` | ~500ms | Point upward |
| `pointDown` | ~500ms | Point downward |
| `pointLeft` | ~500ms | Point left |
| `pointRight` | ~500ms | Point right |
| `kickLeft` | 1 beat | Quick kick left |
| `kickRight` | 1 beat | Quick kick right |
| `bow` | ~1200ms | Graceful forward bow |
| `nod` | ~350ms | Vertical acknowledgment |
| `reach` | ~600ms | Reaching motion |
| `headBob` | ~400ms | Head bob accent |

### Poses
| Gesture | Description |
|---------|-------------|
| `crouch` | Lowered stance |
| `tilt` | Angular tilt |
| `tiltUp` | Tilt upward |
| `tiltDown` | Tilt downward |
| `tiltLeft` | Tilt left |
| `tiltRight` | Tilt right |

---

## Category: Reactions

Responses to external events, impacts, or emotional states.

### Impacts (3D Only - Mesh Deformation)
| Gesture | Duration | Description |
|---------|----------|-------------|
| `oofLeft` | 1 beat | Hit from the left |
| `oofRight` | 1 beat | Hit from the right |
| `oofFront` | 1 beat | Hit from front (gut punch) |
| `oofBack` | 1 beat | Hit from behind |
| `oofUp` | 1 beat | Hit from below (uppercut) |
| `oofDown` | 1 beat | Hit from above (hammer) |

> **Note:** Oof gestures create localized dents on the mesh surface with impact glow. The deformation is "tidally locked" to the camera - the dent always appears on the camera-facing side regardless of mesh rotation.

**Recoil** - Bounce back from impacts:
| Gesture | Description |
|---------|-------------|
| `recoil` | Default backward recoil |
| `recoilBack` | Recoil away from camera |
| `recoilForward` | Recoil toward camera |
| `recoilLeft` | Recoil to the left |
| `recoilRight` | Recoil to the right |
| `recoilUp` | Recoil upward |
| `recoilDown` | Recoil downward |

**Other Impacts:**
| Gesture | Description |
|---------|-------------|
| `knockdown` | Knocked to the ground |
| `knockout` | Dramatic knockout |
| `inflate` | Puff up larger |
| `deflate` | Shrink down smaller |
| `squash` | Flattened vertically |
| `stretch` | Elongated vertically |
| `pancake` | Extreme squash (flat) |

### Emotions
| Gesture | Description |
|---------|-------------|
| `rage` | Intense anger display |
| `fury` | Maximum intensity anger |
| `battlecry` | Aggressive charge-up |
| `charge` | Building energy |

### Oscillations
| Gesture | Description |
|---------|-------------|
| `wobble` | Unstable side-to-side wobble |
| `teeter` | Teetering on edge |
| `rock` | Back-and-forth rocking |
| `pendulum` | Pendulum-like swing |

---

## Category: Destruction

Effects that break the mesh apart (3D only).

### Shatter (Mesh Fragmentation)
| Gesture | Description |
|---------|-------------|
| `shatter` | Basic radial explosion |
| `shatterMesh` | Clean mesh fragmentation |
| `shatterExplosive` | Violent outward explosion |
| `shatterCrumble` | Gravity-heavy collapse |
| `shatterReform` | Explode then reassemble |

**Directional Shatter:**
| Gesture | Description |
|---------|-------------|
| `shatterPunchLeft` | Shatter from left impact |
| `shatterPunchRight` | Shatter from right impact |
| `shatterPunchFront` | Shatter from front impact |

**State-Based Shatter:**
| Gesture | Description |
|---------|-------------|
| `shatterSuspend` | Shatter and freeze in air |
| `shatterFreeze` | Frozen suspended shards |
| `shatterImplode` | Inward collapse |
| `shatterGravity` | Heavy gravitational fall |
| `shatterOrbit` | Shards orbit center |

### Dissolve (Gentle Dispersal)
| Gesture | Description |
|---------|-------------|
| `dissolveUp` | Shards drift upward like ash |
| `dissolveDown` | Shards sink downward |
| `dissolveLeft` | Shards blow to the left |
| `dissolveRight` | Shards blow to the right |
| `dissolveAway` | Shards drift away from camera |
| `dissolveToward` | Shards drift toward camera |

### Reform
| Gesture | Description |
|---------|-------------|
| `morph` | Shape transformation |

---

## Category: Atmosphere

Environmental and particle effects.

### Weather
| Gesture | Description |
|---------|-------------|
| `rain` | Falling particle rain |
| `vortex` | Swirling vortex effect |

**Drift:**
| Gesture | Description |
|---------|-------------|
| `drift` | Gentle drifting motion |
| `driftUp` | Drift upward |
| `driftDown` | Drift downward |
| `driftLeft` | Drift left |
| `driftRight` | Drift right |

**Cascade:**
| Gesture | Description |
|---------|-------------|
| `cascadeUp` | Waterfall effect upward |
| `cascadeDown` | Waterfall effect downward |
| `cascadeLeft` | Waterfall effect left |
| `cascadeRight` | Waterfall effect right |

### Particles
| Gesture | Description |
|---------|-------------|
| `confetti` | Celebratory confetti burst |
| `fizz` | Bubbly fizzing particles |

**Swarm:**
| Gesture | Description |
|---------|-------------|
| `swarmUp` | Particle swarm upward |
| `swarmDown` | Particle swarm downward |
| `swarmLeft` | Particle swarm left |
| `swarmRight` | Particle swarm right |

**Burst:**
| Gesture | Description |
|---------|-------------|
| `burst` | Radial particle burst |
| `burstUp` | Burst upward |
| `burstDown` | Burst downward |
| `burstLeft` | Burst left |
| `burstRight` | Burst right |

**Other:**
| Gesture | Description |
|---------|-------------|
| `ripple` | Rippling wave effect |
| `wave` | Wave motion |

### Glow
| Gesture | Description |
|---------|-------------|
| `flash` | Brief brightness burst |
| `glow` | Sustained luminance |
| `bloom` | Soft glowing bloom |
| `flicker` | Rapid on/off flicker |
| `shiver` | Cold shiver effect |
| `heartbeat` | Pulsing heartbeat glow |
| `snap` | Quick snap effect |
| `elasticBounce` | Bouncy elastic effect |

### Control
| Gesture | Description |
|---------|-------------|
| `hold` | Pause/freeze in place |
| `fade` | Fade out then back in |
| `settle` | Settle to rest |
| `peek` | Peek/reveal motion |
| `directional` | Directional emphasis |

**Magnetic:**
| Gesture | Description |
|---------|-------------|
| `magneticForward` | Pull toward camera |
| `magneticBack` | Push away from camera |
| `magneticLeft` | Pull left |
| `magneticRight` | Pull right |
| `magneticUp` | Pull upward |
| `magneticDown` | Pull downward |
| `magneticAttract` | Attract particles |
| `magneticRepel` | Repel particles |

---

## Gesture Types (Technical)

Behind the scenes, gestures have one of three technical types that determine how they combine:

| Type | Behavior | Examples |
|------|----------|----------|
| `blending` | Layer with other gestures | breathe, sway, float |
| `override` | Take full control | jump, shatter, oofLeft |
| `effect` | Particle/glow overlay | rain, glow, ripple |

```javascript
// Check gesture type
const gestures = mascot.getAvailableGestures();
const jumpInfo = gestures.find(g => g.name === 'jump');
console.log(jumpInfo.type); // 'override'
```

---

## API Reference

### Get Available Gestures

```javascript
const gestures = mascot.getAvailableGestures();
// Returns: [{ name, emoji, type, category, description }, ...]
```

### Get Gesture Categories

```javascript
const categories = mascot.getGestureCategories();
// Returns: { idle: [...], dance: [...], actions: [...], ... }
```

### Express Gesture

```javascript
// Basic
mascot.express('bounce');

// With options
mascot.express('jump', {
    strength: 1.5,
    duration: 500
});

// Multiple (layered)
mascot.express(['sway', 'shimmer']);
```

### Chain Gestures

```javascript
// Sequential gestures
mascot.chain(['jump', 'spin', 'bow']);
```

### Natural Language

```javascript
// Let the LLM parser figure it out
mascot.feel('happy and bouncing');
mascot.feel('nervous, shaking slightly');
mascot.feel('dramatic entrance with a spin');
```

---

## Tips

1. **Idle gestures** are great for background ambiance - they blend smoothly
2. **Dance gestures** work best with audio sync enabled via `enableRhythmSync()`
3. **Destruction gestures** are 3D only and require mesh shatter support
4. **Layer compatible gestures**: `breathe` + `shimmer` works well together
5. **Use `chain()` for sequences**: Great for character introductions or celebrations

---

## Timing & Music Integration

All gestures are designed to work with the musical timing system. Durations map to standard musical units for natural synchronization.

### Musical Duration System

At 120 BPM (default):

| Musical Unit | Beats | Duration |
|--------------|-------|----------|
| Eighth note | 0.5 | 250ms |
| Quarter note | 1 | 500ms |
| Half note | 2 | 1000ms |
| Whole note (1 bar) | 4 | 2000ms |
| 2 bars | 8 | 4000ms |

**BPM Scaling:** Gestures scale proportionally with tempo. At 60 BPM, durations double. At 180 BPM, durations are 0.67x.

### Gesture Durations by Category

| Category | Typical Duration | Musical Time | Examples |
|----------|------------------|--------------|----------|
| **Accents** | 200-400ms | ⅛-½ beat | pop, flare, dip |
| **Steps** | 500ms | 1 beat | stepLeft, stepRight |
| **Actions** | 500-900ms | 1-2 beats | jump, spin, flip |
| **Moves** | 1500-2000ms | 3-4 beats | hula, twist, charleston |
| **Reactions** | 500-2000ms | 1-4 beats | oof*, wobble, rage |
| **Destruction** | 1500-8000ms | 4-16 beats | shatter, shatterCrumble |
| **Idle** | Continuous | Multi-bar | breathe, sway, float |

### Rhythm Sync Modes

Gestures can synchronize to music using different modes:

| Mode | Behavior | Use Case |
|------|----------|----------|
| `beat` | Trigger on any beat | Quick accents (pop, flare) |
| `bar` | Wait for bar boundary | Full movements (hula, rage) |
| `phrase` | Wait for phrase start | Long sequences (shatterCrumble) |
| `subdivision` | Sub-beat precision | Nervous energy (jitter, twitch) |
| `immediate` | No waiting | Reactions (oof, recoil) |

```javascript
// Enable rhythm sync
mascot.enableRhythmSync({ bpm: 120 });

// Gestures auto-sync to beat
mascot.express('pop');  // Waits for next beat
```

### Timing Properties

Some gestures have special timing phases:

| Property | Description | Example Gestures |
|----------|-------------|------------------|
| `anticipation` | Pre-action squash | jump (0.2 = 20% of duration) |
| `hangTime` | Peak pause | jump (0.1 = 10% of duration) |
| `holdTime` | Hold at end | bow (0.4 = 40% of duration) |
| `triggerTime` | Impact moment | crack* (0.05 = first 5%) |

### Type Behaviors

| Type | Interruptible | Can Stack | Behavior |
|------|---------------|-----------|----------|
| `blending` | Yes | Yes | Continuous, layerable |
| `override` | After 80% | No | Exclusive, one-shot |
| `accent` | Yes | Yes | Multiplicative boost |
| `effect` | Yes | Sometimes | Visual overlay |

**Interruption:** Override gestures protect their animation until 80% complete, ensuring dramatic moments aren't cut short.

---

## Storytelling Patterns

Gestures can be combined to create emotional arcs. Here are proven patterns:

### Positive Energy Arc
```javascript
// Calm → Groove → Climax → Celebration
mascot.chain([
    'breathe',      // 1 bar - establish calm
    'bounce',       // 4 beats - build energy
    'pop',          // accent - punctuate
    'jump',         // 2 beats - climax
    'flare'         // accent - celebrate
]);
```

### Conflict Arc
```javascript
// Calm → Anger → Damage → Recovery
mascot.chain([
    'sway',         // ambient - peace
    'rage',         // 1 bar - anger builds
    'crackFront',   // 1 bar - impact damage
    'wobble',       // 4 beats - destabilized
    'crackHeal'     // 3 beats - recovery
]);
```

### Destruction Arc
```javascript
// Instability → Break → Pause → Reassemble
mascot.chain([
    'teeter',           // instability
    'shatterExplosive', // dramatic break
    'shatterSuspend',   // frozen moment
    'shatterReform'     // reassembly
]);
```

### Entrance Sequence
```javascript
// Dramatic character introduction
mascot.chain([
    'rushForward',  // burst in
    'spin',         // flourish
    'pop',          // accent landing
    'bow'           // acknowledge audience
]);
```

### Complementary Gesture Pairs

These gestures work well together (similar durations, compatible motions):

| Pair | Why It Works |
|------|--------------|
| `pop` + `bounce` | Accent on groove (sub-beat + 4 beats) |
| `jump` + `spin` | Sequential acrobatics (both ~600-800ms) |
| `rage` + `crackFront` | Anger leads to damage (both 1 bar) |
| `wobble` + `teeter` | Stacking instability (similar oscillation) |
| `shatter` + `shatterReform` | Break and rebuild narrative |
| `breathe` + `shimmer` | Calm ambient combo (both continuous) |

---

## Crack Gestures

Surface crack effects for damage visualization. Cracks persist until explicitly healed.

### Directional Impacts
| Gesture | Impact Point | Spread Direction |
|---------|--------------|------------------|
| `crackFront` | Center | Radial |
| `crackBack` | Center | Radial |
| `crackLeft` | Left edge | Rightward |
| `crackRight` | Right edge | Leftward |
| `crackUp` | Top | Downward |
| `crackDown` | Bottom | Upward |

### Healing
| Gesture | Description |
|---------|-------------|
| `crackHeal` | Fade and heal all cracks (1.5s) |

### Crack Mechanics

- **Max impacts:** 3 simultaneous (FIFO replacement)
- **Persistence:** Cracks stay until `crackHeal` or `shatter`
- **Object-space:** Cracks rotate with the mesh
- **Glow:** Configurable edge emission color

```javascript
// Multiple impacts accumulate
mascot.express('crackLeft');
mascot.express('crackRight');  // Now 2 cracks visible
mascot.express('crackUp');     // Now 3 cracks visible
mascot.express('crackDown');   // Oldest crack replaced (FIFO)

// Heal all
mascot.express('crackHeal');
```

---

## Related Documentation

- [Quick Reference](./QUICK_REFERENCE.md) - Condensed API reference
- [LLM Integration](./LLM_INTEGRATION.md) - Natural language processing
- [Architecture](./ARCHITECTURE.md) - Technical deep dive
- [Plugins](./PLUGINS.md) - Creating custom gestures
