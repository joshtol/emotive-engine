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

## Related Documentation

- [Quick Reference](./QUICK_REFERENCE.md) - Condensed API reference
- [LLM Integration](./LLM_INTEGRATION.md) - Natural language processing
- [Architecture](./ARCHITECTURE.md) - Technical deep dive
- [Plugins](./PLUGINS.md) - Creating custom gestures
