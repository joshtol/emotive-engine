# Gesture Animators API Reference

Complete API documentation for all specialized gesture animator classes.

## Table of Contents

- [Common Patterns](#common-patterns)
- [PhysicalGestureAnimator](#physicalgestureanimator)
- [VisualEffectAnimator](#visualeffectanimator)
- [BreathGestureAnimator](#breathgestureanimator)
- [MovementGestureAnimator](#movementgestureanimator)
- [ShapeTransformAnimator](#shapetransformanimator)
- [ExpressionGestureAnimator](#expressiongestureanimator)
- [DirectionalGestureAnimator](#directionalgestureanimator)
- [ComplexAnimationAnimator](#complexanimationanimator)

---

## Common Patterns

### Constructor Pattern

All animator classes follow the same constructor pattern:

```javascript
constructor(renderer)
```

**Parameters:**
- `renderer` (EmotiveRenderer): The main renderer instance
  - Provides `scaleFactor` for responsive animations
  - May provide access to `particleSystem` for particle effects

**Example:**
```javascript
const animator = new PhysicalGestureAnimator(renderer);
```

### Method Pattern

All animation methods follow this signature:

```javascript
applyMethodName(anim, progress)
```

**Parameters:**
- `anim` (Object): Animation state object
  - `params` (Object): Animation parameters
  - May contain state properties (e.g., `randomAngle`, `targetX`)
- `progress` (number): Animation progress from 0 to 1

**Returns:**
- `Object`: Transform object containing one or more of:
  - `offsetX` (number): Horizontal offset in pixels
  - `offsetY` (number): Vertical offset in pixels
  - `scale` (number): Uniform scale multiplier
  - `scaleX` (number): Horizontal scale multiplier
  - `scaleY` (number): Vertical scale multiplier
  - `rotation` (number): Rotation in degrees
  - `glow` (number): Glow intensity multiplier
  - Additional effect properties (varies by method)

---

## PhysicalGestureAnimator

Handles physical motion gestures with mass and momentum.

**File**: `src/core/renderer/PhysicalGestureAnimator.js`

### applyBounce

Creates a bouncing motion with optional gravity effect.

```javascript
applyBounce(anim, progress)
```

**Parameters:**
- `anim.params.frequency` (number): Bounce frequency (default: varies)
- `anim.params.amplitude` (number): Bounce height multiplier (default: varies)
- `anim.params.effects` (Array<string>): Optional effects array
  - `'gravity'`: Applies 0.6x damping for realistic bounce

**Returns:**
```javascript
{
  offsetY: number  // Vertical bounce offset (negative = up)
}
```

**Example:**
```javascript
const anim = {
  params: {
    frequency: 4,
    amplitude: 30,
    effects: ['gravity']
  }
};
const transform = animator.applyBounce(anim, 0.5);
// { offsetY: -18 } (example value)
```

---

### applyShake

Creates oscillating shake motion with optional decay.

```javascript
applyShake(anim, progress)
```

**Parameters:**
- `anim.params.frequency` (number): Shake frequency
- `anim.params.amplitude` (number): Shake intensity
- `anim.params.decay` (boolean): Enable amplitude decay over time
- `anim.randomAngle` (number): Auto-initialized random direction

**Returns:**
```javascript
{
  offsetX: number,  // Horizontal shake component
  offsetY: number   // Vertical shake component
}
```

**Example:**
```javascript
const anim = {
  params: {
    frequency: 8,
    amplitude: 15,
    decay: true
  }
};
const transform = animator.applyShake(anim, 0.3);
// { offsetX: 8.5, offsetY: 6.2 } (example values)
```

---

### applyJump

Simulates a jump with squash, stretch, and landing phases.

```javascript
applyJump(anim, progress)
```

**Phases:**
- 0-20%: Squash phase (preparing to jump)
- 20-70%: Jump phase (airborne with stretch)
- 70-100%: Landing phase (return to normal)

**Parameters:**
- `anim.params.jumpHeight` (number): Maximum jump height
- `anim.params.squashAmount` (number): Squash scale (< 1.0)
- `anim.params.stretchAmount` (number): Stretch scale (> 1.0)
- `anim.params.effects` (Array<string>): Optional effects
  - `'gravity'`: Adds horizontal squash during jump

**Returns:**
```javascript
{
  offsetY: number,   // Vertical position
  scale: number,     // Uniform scale
  scaleX?: number,   // Horizontal scale (with gravity)
  scaleY?: number    // Vertical scale (with gravity)
}
```

**Example:**
```javascript
const anim = {
  params: {
    jumpHeight: 80,
    squashAmount: 0.7,
    stretchAmount: 1.3,
    effects: ['gravity']
  }
};
const transform = animator.applyJump(anim, 0.45);
// { offsetY: -60, scale: 1.25, scaleX: 1.15, scaleY: 0.92 }
```

---

### applyVibrate

High-frequency vibration in a random direction.

```javascript
applyVibrate(anim, progress)
```

**Parameters:**
- `anim.params.amplitude` (number): Vibration intensity (default: 5)
- `anim.params.frequency` (number): Vibration speed (default: 20)
- `anim.vibrateAngles` (Object): Auto-initialized direction vector

**Returns:**
```javascript
{
  offsetX: number,  // Horizontal vibration
  offsetY: number   // Vertical vibration
}
```

**Example:**
```javascript
const anim = {
  params: {
    amplitude: 8,
    frequency: 25
  }
};
const transform = animator.applyVibrate(anim, 0.5);
// { offsetX: 4.2, offsetY: -6.8 } (example values)
```

---

### applyWiggle

Hip-hop style wiggle with 4-phase motion.

```javascript
applyWiggle(anim, progress)
```

**Phases:**
- 0-25%: Center → Side
- 25-50%: Side → Opposite side
- 50-75%: Opposite → Side
- 75-100%: Side → Center

**Parameters:**
- `anim.params.amplitude` (number): Wiggle distance (default: 15)
- `anim.wiggleDirection` (number): Auto-initialized direction (±1)

**Returns:**
```javascript
{
  offsetX: number,   // Horizontal wiggle
  offsetY: number,   // Vertical bounce
  rotation: number   // Tilt angle
}
```

**Example:**
```javascript
const anim = {
  params: {
    amplitude: 20
  }
};
const transform = animator.applyWiggle(anim, 0.375);
// { offsetX: -20, offsetY: -3, rotation: -3 }
```

---

## VisualEffectAnimator

Manages visual effects and lighting animations.

**File**: `src/core/renderer/VisualEffectAnimator.js`

### applyFlash

Quick flash with glow and scale.

```javascript
applyFlash(anim, progress)
```

**Parameters:**
- `anim.params.glowPeak` (number): Maximum glow multiplier (default: 2.0)
- `anim.params.scalePeak` (number): Maximum scale (default: 1.1)

**Returns:**
```javascript
{
  glow: number,   // Glow intensity (peaks at midpoint)
  scale: number   // Scale (peaks at midpoint)
}
```

**Behavior:**
- Uses `sin(progress * π)` for smooth peak at 50%
- Both glow and scale return to baseline at 0% and 100%

**Example:**
```javascript
const anim = {
  params: {
    glowPeak: 2.5,
    scalePeak: 1.15
  }
};
const transform = animator.applyFlash(anim, 0.5);
// { glow: 2.5, scale: 1.15 }
```

---

### applyGlow

Pulsing glow and scale effect.

```javascript
applyGlow(anim, progress)
```

**Parameters:**
- `anim.params.frequency` (number): Pulse frequency
- `anim.params.scaleAmount` (number): Scale variation (default: 0.1)
- `anim.params.glowAmount` (number): Glow variation (default: 0.8)

**Returns:**
```javascript
{
  scale: number,  // Oscillating scale
  glow: number    // Oscillating glow
}
```

**Example:**
```javascript
const anim = {
  params: {
    frequency: 3,
    scaleAmount: 0.15,
    glowAmount: 1.0
  }
};
const transform = animator.applyGlow(anim, 0.25);
// { scale: 1.15, glow: 1.8 }
```

---

### applyFlicker

Flickering light effect with particle shimmer.

```javascript
applyFlicker(anim, progress)
```

**Parameters:**
- `anim.params.intensity` (number): Flicker intensity (default: 2.0)
- `anim.params.speed` (number): Flicker speed (default: 3)

**Returns:**
```javascript
{
  offsetX: number,           // Wave motion
  glow: number,             // Core glow
  particleGlow: number,     // Particle brightness
  flickerTime: number,      // Current time for particles
  flickerEffect: boolean    // Flag for particle system
}
```

**Example:**
```javascript
const anim = {
  params: {
    intensity: 2.5,
    speed: 4
  }
};
const transform = animator.applyFlicker(anim, 0.3);
// { offsetX: 3.2, glow: 1.6, particleGlow: 1.8, ... }
```

---

### applySparkle

Sparkling particle effect.

```javascript
applySparkle(anim, progress)
```

**Parameters:**
- `anim.params.intensity` (number): Sparkle intensity (default: 2.0)

**Returns:**
```javascript
{
  particleGlow: number,    // Particle brightness
  glow: number,           // Core glow with pulse
  fireflyTime: number,    // Current time
  fireflyEffect: boolean  // Flag for particle system
}
```

---

### applyShimmer

Subtle shimmer effect with gentle wave.

```javascript
applyShimmer(anim, progress)
```

**Parameters:**
- `anim.params.intensity` (number): Shimmer intensity (default: 0.3)

**Returns:**
```javascript
{
  offsetX: number,          // Always 0
  offsetY: number,          // Always 0
  glow: number,            // Wave-based glow
  scale: number,           // Subtle scale variation
  particleGlow: number,    // Particle brightness
  shimmerTime: number,     // Current time
  shimmerWave: number,     // Wave value
  shimmerEffect: boolean   // Flag for particle system
}
```

---

## BreathGestureAnimator

Simulates breathing and meditative animations.

**File**: `src/core/renderer/BreathGestureAnimator.js`

### applyBreathe

Full breathing cycle with inhale, hold, and exhale phases.

```javascript
applyBreathe(anim, progress)
```

**Phases:**
- 0-40%: Inhale (smooth expansion)
- 40-(40+hold)%: Hold at full
- (40+hold)-90%: Exhale (smooth contraction)
- 90-100%: Hold at empty

**Parameters:**
- `anim.params.scaleAmount` (number): Maximum expansion (default: 0.25)
- `anim.params.glowAmount` (number): Glow increase (default: 0.4)
- `anim.params.particleMotion.holdPercent` (number): Hold duration (default: 0.1)

**Returns:**
```javascript
{
  scale: number,        // Size variation (1.0 to 1+scaleAmount)
  glow: number,        // Glow variation (1.0 to 1+glowAmount)
  breathPhase: number  // Current phase value (0-1)
}
```

**Example:**
```javascript
const anim = {
  params: {
    scaleAmount: 0.3,
    glowAmount: 0.5,
    particleMotion: { holdPercent: 0.15 }
  }
};
const transform = animator.applyBreathe(anim, 0.2);
// { scale: 1.15, glow: 1.25, breathPhase: 0.5 }
```

---

### applyBreathIn

Inhale phase only.

```javascript
applyBreathIn(anim, progress)
```

**Parameters:**
- `anim.params.scaleAmount` (number): Target scale

**Returns:**
```javascript
{
  scale: number  // Smooth ease-in to target
}
```

---

### applyBreathOut

Exhale phase only.

```javascript
applyBreathOut(anim, progress)
```

**Parameters:**
- `anim.params.scaleAmount` (number): Target scale (< 1.0)

**Returns:**
```javascript
{
  scale: number  // Smooth ease-in to target
}
```

---

### applyBreathHold

Hold at full capacity.

```javascript
applyBreathHold(anim, progress)
```

**Parameters:**
- `anim.params.scaleAmount` (number): Hold scale

**Returns:**
```javascript
{
  scale: number  // Constant scale
}
```

---

### applyBreathHoldEmpty

Hold at empty.

```javascript
applyBreathHoldEmpty(anim, progress)
```

**Parameters:**
- `anim.params.scaleAmount` (number): Hold scale

**Returns:**
```javascript
{
  scale: number  // Constant scale
}
```

---

## MovementGestureAnimator

Handles complex movement patterns and trajectories.

**File**: `src/core/renderer/MovementGestureAnimator.js`

### applySpin

Rotation with scale pulse.

```javascript
applySpin(anim, progress)
```

**Parameters:**
- `anim.params.rotations` (number): Number of full rotations
- `anim.params.scaleAmount` (number): Scale variation amount

**Returns:**
```javascript
{
  rotation: number,  // Total rotation (degrees)
  scale: number      // Pulsing scale
}
```

---

### applyDrift

Smooth drifting motion in random direction.

```javascript
applyDrift(anim, progress)
```

**Parameters:**
- `anim.params.distance` (number): Drift distance
- `anim.currentDriftAngle` (number): Auto-initialized angle

**Returns:**
```javascript
{
  offsetX: number,  // Horizontal drift
  offsetY: number   // Vertical drift
}
```

**Behavior:**
- Angle initialized on first call (progress ≤ 0.01)
- Follows smooth sine curve (peaks at 50%)
- Angle cleared on completion (progress ≥ 0.99)

---

### applyWave

Infinity symbol wave pattern with lift.

```javascript
applyWave(anim, progress)
```

**Parameters:**
- `anim.params.amplitude` (number): Wave size (default: 40)

**Returns:**
```javascript
{
  offsetX: number,   // Horizontal infinity pattern
  offsetY: number,   // Vertical component with lift
  rotation: number,  // Tilt during movement
  scale: number,     // Subtle pulse
  glow: number       // Glow pulse
}
```

**Pattern:**
- Follows infinity symbol (lemniscate) path
- Uses parametric equations: `x = sin(t)`, `y = sin(2t)`

---

### applySway

Side-to-side swaying with bob.

```javascript
applySway(anim, progress)
```

**Parameters:**
- `anim.params.amplitude` (number): Sway distance (default: 30)
- `anim.params.frequency` (number): Sway speed (default: 1)

**Returns:**
```javascript
{
  offsetX: number,   // Horizontal sway
  offsetY: number,   // Vertical bob
  rotation: number   // Tilt angle
}
```

---

### applyFloat

Floating motion with drift and pulse.

```javascript
applyFloat(anim, progress)
```

**Parameters:**
- `anim.params.amplitude` (number): Float range (default: 20)
- `anim.params.speed` (number): Float speed (default: 1)

**Returns:**
```javascript
{
  offsetX: number,  // Horizontal drift
  offsetY: number,  // Vertical float
  scale: number     // Subtle pulse
}
```

---

### applyOrbital

Orbital motion placeholder.

```javascript
applyOrbital(anim, progress)
```

**Returns:**
```javascript
{
  offsetX: 0,
  offsetY: 0
}
```

---

### applyHula

Figure-8 hip motion.

```javascript
applyHula(anim, progress)
```

**Parameters:**
- `anim.params.amplitude` (number): Motion size (default: 40)

**Returns:**
```javascript
{
  offsetX: number,  // Horizontal figure-8
  offsetY: number   // Vertical component
}
```

---

### applyOrbit

Circular orbital path.

```javascript
applyOrbit(anim, progress)
```

**Parameters:**
- `anim.params.radius` (number): Orbit radius (default: 30)
- `anim.params.speed` (number): Orbit speed (default: 1)

**Returns:**
```javascript
{
  offsetX: number,  // X position on circle
  offsetY: number   // Y position on circle
}
```

---

## ShapeTransformAnimator

Manages shape and size transformations.

**File**: `src/core/renderer/ShapeTransformAnimator.js`

### applyPulse

Rhythmic scale and glow pulsation.

```javascript
applyPulse(anim, progress)
```

**Parameters:**
- `anim.params.frequency` (number): Pulse frequency
- `anim.params.scaleAmount` (number): Scale variation
- `anim.params.glowAmount` (number): Glow variation

**Returns:**
```javascript
{
  scale: number,  // Oscillating scale
  glow: number    // Oscillating glow
}
```

---

### applyExpand

Smooth expansion with glow increase.

```javascript
applyExpand(anim, progress)
```

**Parameters:**
- `anim.params.scaleAmount` or `scaleTarget` (number): Target scale (≥ 1.0)
- `anim.params.glowAmount` (number): Glow increase (default: 0.2)

**Returns:**
```javascript
{
  scale: number,  // Eased expansion (1.0 to target)
  glow: number    // Eased glow increase
}
```

**Easing:** Uses `sin(progress * π/2)` for smooth ease-out

---

### applyContract

Smooth contraction with glow decrease.

```javascript
applyContract(anim, progress)
```

**Parameters:**
- `anim.params.scaleAmount` or `scaleTarget` (number): Target scale (default: 0.7)
- `anim.params.glowAmount` (number): Glow change (default: -0.2)

**Returns:**
```javascript
{
  scale: number,  // Eased contraction (1.0 to target)
  glow: number    // Eased glow decrease
}
```

---

### applyStretch

Oscillating stretch effect.

```javascript
applyStretch(anim, progress)
```

**Parameters:**
- `anim.params.frequency` (number): Oscillation frequency
- `anim.params.scaleX` (number): Horizontal scale target
- `anim.params.scaleY` (number): Vertical scale target

**Returns:**
```javascript
{
  scale: number  // Averaged scale oscillation
}
```

**Note:** Currently averages scaleX and scaleY. Future versions may support separate axis scaling.

---

### applyMorph

Fluid morphing effect with scale and rotation.

```javascript
applyMorph(anim, progress)
```

**Returns:**
```javascript
{
  scale: number,     // ±0.1 variation
  rotation: number   // ±10 degree variation
}
```

**Pattern:** Uses `sin(progress * 2π)` for full cycle

---

## ExpressionGestureAnimator

Simulates expressive gestures and emotions.

**File**: `src/core/renderer/ExpressionGestureAnimator.js`

### applyNod

Vertical nodding motion.

```javascript
applyNod(anim, progress)
```

**Parameters:**
- `anim.params.frequency` (number): Nod frequency
- `anim.params.amplitude` (number): Nod distance

**Returns:**
```javascript
{
  offsetY: number  // Vertical oscillation
}
```

---

### applyTilt

Head tilt with rotation and skew.

```javascript
applyTilt(anim, progress)
```

**Parameters:**
- `anim.params.frequency` (number): Tilt frequency (default: 2)
- `anim.params.angle` (number): Tilt angle in degrees (default: 15)
- `anim.tiltDirection` (number): Auto-initialized direction (±1)

**Returns:**
```javascript
{
  rotation: number,  // Tilt angle
  scaleX: number,    // Horizontal skew
  scaleY: number,    // Vertical compression
  offsetX: number,   // Horizontal shift
  offsetY: number    // Vertical lift
}
```

---

### applySlowBlink

Eye blink simulation using glow.

```javascript
applySlowBlink(anim, progress)
```

**Phases:**
- 0-30%: Closing (glow 1→0)
- 30-50%: Closed (glow = 0)
- 50-80%: Opening (glow 0→1)
- 80-100%: Open (glow = 1)

**Returns:**
```javascript
{
  glow: number  // 0 (closed) to 1 (open)
}
```

---

### applyLook

Directional gaze with hold.

```javascript
applyLook(anim, progress)
```

**Parameters:**
- `anim.params.lookDirection` (string): 'left', 'right', 'up', 'down', 'random'
- `anim.params.lookDistance` (number): Distance multiplier
- `anim.targetX`, `anim.targetY` (number): Auto-initialized target

**Phases:**
- 0-30%: Move to target
- 30-70%: Hold at target
- 70-100%: Return to center

**Returns:**
```javascript
{
  offsetX: number,  // Horizontal gaze offset
  offsetY: number   // Vertical gaze offset
}
```

---

### applySettle

Damped oscillation settling.

```javascript
applySettle(anim, progress)
```

**Parameters:**
- `anim.params.wobbleFreq` (number): Wobble frequency

**Returns:**
```javascript
{
  offsetY: number,  // Exponentially decaying wobble
  scale: number     // Subtle scale variation
}
```

**Damping:** Uses `exp(-progress * 3)` for decay

---

## DirectionalGestureAnimator

Handles directional pointing and reaching gestures.

**File**: `src/core/renderer/DirectionalGestureAnimator.js`

### applyPoint

Directional pointing with three-phase motion.

```javascript
applyPoint(anim, progress)
```

**Parameters:**
- `anim.params.direction` (number): Direction (±1 for left/right)
- `anim.params.distance` (number): Point distance (default: 40)
- `anim.pointDirection` (number): Auto-initialized if not specified

**Phases:**
- 0-40%: Move to point (cubic ease-out)
- 40-60%: Hold at point
- 60-100%: Return to center (cubic ease-in)

**Returns:**
```javascript
{
  offsetX: number,   // Horizontal point
  offsetY: number,   // Slight upward lift
  scale: number,     // 15% stretch
  rotation: number   // 5° tilt in direction
}
```

---

### applyLean

Side lean with rotation.

```javascript
applyLean(anim, progress)
```

**Parameters:**
- `anim.params.angle` (number): Lean angle in degrees (default: 15)
- `anim.params.side` (number): Lean direction (1=right, -1=left, default: 1)

**Returns:**
```javascript
{
  offsetX: number,   // Horizontal offset
  rotation: number   // Lean angle
}
```

**Easing:** Uses `sin(progress * π)` for smooth in-out

---

### applyReach

Reaching motion in any direction.

```javascript
applyReach(anim, progress)
```

**Parameters:**
- `anim.params.direction` (number): Angle in radians (default: -π/2 = upward)
- `anim.params.distance` (number): Reach distance (default: 40)

**Phases:**
- 0-40%: Reaching
- 40-60%: Hold at reach
- 60-100%: Return

**Returns:**
```javascript
{
  offsetX: number,  // Horizontal reach (cos(direction) * distance)
  offsetY: number,  // Vertical reach (sin(direction) * distance)
  scale: number     // 15% stretch when reaching
}
```

**Easing:** Uses smoothstep `t²(3-2t)` for smooth motion

---

## ComplexAnimationAnimator

Manages complex multi-component animations.

**File**: `src/core/renderer/ComplexAnimationAnimator.js`

### applyFlashWave

Emanating wave effect.

```javascript
applyFlashWave(anim, progress)
```

**Parameters:**
- `anim.flashWave` (Object): Auto-initialized wave state
  - `maxRadius` (number): Wave travel distance (3.0)

**Returns:**
```javascript
{
  glow: number,      // Core glow (fades with progress)
  flashWave: Object  // Wave data for renderer
    - innerRadius: number
    - outerRadius: number
    - intensity: number (fades with progress)
}
```

---

### applyRain

Falling particle behavior with drift.

```javascript
applyRain(anim, progress)
```

**Parameters:**
- `anim.params.intensity` (number): Rain intensity (default: 1.0)

**Returns:**
```javascript
{
  offsetX: number,           // Wind sway
  offsetY: number,           // Downward drift
  particleEffect: 'falling'  // Signal to particle system
}
```

**Side Effect:** Enables falling behavior in particle system

---

### applyGroove

Smooth dance movement.

```javascript
applyGroove(anim, progress)
```

**Parameters:**
- `anim.params.amplitude` (number): Movement size (default: 25)

**Returns:**
```javascript
{
  offsetX: number,   // Multi-wave horizontal motion
  offsetY: number,   // Vertical bob
  scale: number,     // Subtle breathing
  rotation: number   // Gentle rotation
}
```

**Pattern:** Combines two sine waves for organic flow

---

### applyHeadBob

Rhythmic vertical bobbing.

```javascript
applyHeadBob(anim, progress)
```

**Parameters:**
- `anim.params.amplitude` (number): Bob height (default: 20)
- `anim.params.frequency` (number): Bob speed (default: 2)

**Phases:**
- 0-30%: Quick down
- 30-100%: Smooth up

**Returns:**
```javascript
{
  offsetY: number,   // Vertical bob
  rotation: number   // -3° tilt during down beat
}
```

---

### applyRunningMan

Running dance move shuffle.

```javascript
applyRunningMan(anim, progress)
```

**Returns:**
```javascript
{
  offsetX: number,  // Side-to-side slide
  offsetY: number,  // Stepping motion
  rotation: number, // Tilt with movement (0.3x slide)
  scaleY: number    // Vertical compression (up to 5%)
}
```

**Pattern:** High-frequency motion (4x horizontal, 8x vertical)

---

### applyCharleston

Charleston dance move.

```javascript
applyCharleston(anim, progress)
```

**Returns:**
```javascript
{
  offsetX: number,  // Crisscross kicks
  offsetY: number,  // Hopping motion
  rotation: number, // Pronounced tilt (0.6x kick)
  scaleY: number    // Vertical compression (up to 6%)
}
```

**Pattern:** Similar to runningMan but with larger amplitude and rotation

---

## Usage Examples

### Basic Usage

```javascript
// In EmotiveRenderer or GestureAnimator
const physicalAnimator = new PhysicalGestureAnimator(renderer);

const anim = {
  params: {
    frequency: 3,
    amplitude: 25,
    effects: ['gravity']
  }
};

const transform = physicalAnimator.applyBounce(anim, 0.5);
// Apply transform to renderer
```

### Custom Animation Sequence

```javascript
// Combine multiple transforms
const bounce = physicalAnimator.applyBounce(anim1, progress);
const glow = visualAnimator.applyGlow(anim2, progress);

const combined = {
  offsetX: bounce.offsetX || 0,
  offsetY: bounce.offsetY || 0,
  scale: bounce.scale * glow.scale,
  glow: Math.max(bounce.glow || 1, glow.glow || 1)
};
```

### Adding New Gesture

```javascript
// In appropriate animator class
applyNewGesture(anim, progress) {
  const { amplitude = 20, frequency = 2 } = anim.params;
  const motion = Math.sin(progress * Math.PI * frequency) * amplitude * this.scaleFactor;

  return {
    offsetX: motion,
    rotation: motion * 0.1
  };
}
```

---

## Type Definitions

```typescript
interface AnimationState {
  params: AnimationParams;
  progress: number;
  startTime: number;
  active: boolean;
  [key: string]: any;  // Method-specific state
}

interface AnimationParams {
  frequency?: number;
  amplitude?: number;
  distance?: number;
  intensity?: number;
  scaleAmount?: number;
  glowAmount?: number;
  effects?: string[];
  [key: string]: any;  // Method-specific params
}

interface Transform {
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  glow?: number;
  [key: string]: any;  // Effect-specific properties
}
```

---

## Best Practices

1. **Always scale with `scaleFactor`** for responsive animations
2. **Initialize state in animation object** (e.g., `randomAngle`, `targetX`)
3. **Use easing functions** for smooth motion (sin, smoothstep, cubic)
4. **Return to baseline** at progress 0 and 1 when appropriate
5. **Test with various progress values** including edge cases (0, 0.5, 1)
6. **Document parameters** with defaults and units
7. **Consider performance** - avoid expensive calculations in tight loops

---

*Last updated: October 29, 2025*
*API Version: 3.0.0*
