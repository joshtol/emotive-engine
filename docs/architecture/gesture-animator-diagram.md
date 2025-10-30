# GestureAnimator Architecture Diagram

## Class Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       EmotiveRenderer                           │
│                                                                 │
│  - Manages rendering pipeline                                  │
│  - Coordinates particle system                                 │
│  - Applies transforms from GestureAnimator                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ creates and uses
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       GestureAnimator                           │
│                         (832 lines)                             │
│                                                                 │
│  Core Responsibilities:                                        │
│  • Animation lifecycle management                              │
│  • Gesture state tracking                                      │
│  • Easing function application                                 │
│  • Coordination between specialized animators                  │
│  • Transform aggregation                                       │
└─┬───────┬───────┬───────┬───────┬───────┬───────┬───────┬──────┘
  │       │       │       │       │       │       │       │
  │ delegates to specialized animators
  │       │       │       │       │       │       │       │
  ▼       ▼       ▼       ▼       ▼       ▼       ▼       ▼
┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐
│ P │   │ V │   │ B │   │ M │   │ S │   │ E │   │ D │   │ C │
│ h │   │ i │   │ r │   │ o │   │ h │   │ x │   │ i │   │ o │
│ y │   │ s │   │ e │   │ v │   │ a │   │ p │   │ r │   │ m │
│ s │   │ u │   │ a │   │ e │   │ p │   │ r │   │ e │   │ p │
│ i │   │ a │   │ t │   │ m │   │ e │   │ e │   │ c │   │ l │
│ c │   │ l │   │ h │   │ e │   │ T │   │ s │   │ t │   │ e │
│ a │   │ E │   │   │   │ n │   │ r │   │ s │   │ i │   │ x │
│ l │   │ f │   │   │   │ t │   │ a │   │ i │   │ o │   │   │
└───┘   └───┘   └───┘   └───┘   └───┘   └───┘   └───┘   └───┘
```

## Detailed Class Structure

### GestureAnimator (Coordinator)
```
┌────────────────────────────────────────────────────┐
│            GestureAnimator                         │
├────────────────────────────────────────────────────┤
│ Properties:                                        │
│  • renderer: EmotiveRenderer                       │
│  • activeGestures: Map<string, GestureState>       │
│  • scaleFactor: number                             │
│  • gestureAnimations: Object                       │
│  • isPaused: boolean                               │
│                                                    │
│  Specialized Animators:                            │
│  • physicalGestureAnimator                         │
│  • visualEffectAnimator                            │
│  • breathGestureAnimator                           │
│  • movementGestureAnimator                         │
│  • shapeTransformAnimator                          │
│  • expressionGestureAnimator                       │
│  • directionalGestureAnimator                      │
│  • complexAnimationAnimator                        │
├────────────────────────────────────────────────────┤
│ Methods:                                           │
│  • startGesture(name)                              │
│  • applyGestureAnimations()                        │
│  • applyEasing(progress, easing)                   │
│  • pauseCurrentAnimation()                         │
│  • resumeAnimation()                               │
│  • reset()                                         │
│                                                    │
│  Delegation Methods (42 total):                    │
│  • applyBounce(), applyShake(), ...               │
└────────────────────────────────────────────────────┘
```

### PhysicalGestureAnimator
```
┌────────────────────────────────────────────────────┐
│        PhysicalGestureAnimator                     │
│              (179 lines)                           │
├────────────────────────────────────────────────────┤
│ Focus: Physical motion with mass & momentum        │
├────────────────────────────────────────────────────┤
│ Methods:                                           │
│  • applyBounce(anim, progress)                     │
│    └─ Bouncing with gravity option                │
│  • applyShake(anim, progress)                      │
│    └─ Oscillating shake with decay                │
│  • applyJump(anim, progress)                       │
│    └─ Squash, jump, stretch, land phases          │
│  • applyVibrate(anim, progress)                    │
│    └─ High-frequency directional vibration        │
│  • applyWiggle(anim, progress)                     │
│    └─ Hip-hop wiggle with bounce                  │
└────────────────────────────────────────────────────┘
```

### VisualEffectAnimator
```
┌────────────────────────────────────────────────────┐
│         VisualEffectAnimator                       │
│              (145 lines)                           │
├────────────────────────────────────────────────────┤
│ Focus: Visual effects and lighting                 │
├────────────────────────────────────────────────────┤
│ Methods:                                           │
│  • applyFlash(anim, progress)                      │
│    └─ Quick flash with glow peak                  │
│  • applyGlow(anim, progress)                       │
│    └─ Pulsing glow and scale                      │
│  • applyFlicker(anim, progress)                    │
│    └─ Flickering with particle shimmer            │
│  • applySparkle(anim, progress)                    │
│    └─ Sparkling particle effect                   │
│  • applyShimmer(anim, progress)                    │
│    └─ Subtle wave-based shimmer                   │
└────────────────────────────────────────────────────┘
```

### BreathGestureAnimator
```
┌────────────────────────────────────────────────────┐
│        BreathGestureAnimator                       │
│              (113 lines)                           │
├────────────────────────────────────────────────────┤
│ Focus: Breathing and meditation                    │
├────────────────────────────────────────────────────┤
│ Methods:                                           │
│  • applyBreathe(anim, progress)                    │
│    └─ Full cycle: inhale → hold → exhale          │
│  • applyBreathIn(anim, progress)                   │
│    └─ Inhale phase only                           │
│  • applyBreathOut(anim, progress)                  │
│    └─ Exhale phase only                           │
│  • applyBreathHold(anim, progress)                 │
│    └─ Hold at full capacity                       │
│  • applyBreathHoldEmpty(anim, progress)            │
│    └─ Hold at empty                               │
└────────────────────────────────────────────────────┘
```

### MovementGestureAnimator
```
┌────────────────────────────────────────────────────┐
│       MovementGestureAnimator                      │
│              (213 lines)                           │
├────────────────────────────────────────────────────┤
│ Focus: Complex movement patterns                   │
├────────────────────────────────────────────────────┤
│ Methods:                                           │
│  • applySpin(anim, progress)                       │
│    └─ Rotation with scale pulse                   │
│  • applyDrift(anim, progress)                      │
│    └─ Smooth drifting motion                      │
│  • applyWave(anim, progress)                       │
│    └─ Infinity symbol wave pattern                │
│  • applySway(anim, progress)                       │
│    └─ Side-to-side swaying with bob               │
│  • applyFloat(anim, progress)                      │
│    └─ Floating with drift and pulse               │
│  • applyOrbital(anim, progress)                    │
│  • applyHula(anim, progress)                       │
│    └─ Figure-8 hip motion                         │
│  • applyOrbit(anim, progress)                      │
│    └─ Circular orbital path                       │
└────────────────────────────────────────────────────┘
```

### ShapeTransformAnimator
```
┌────────────────────────────────────────────────────┐
│       ShapeTransformAnimator                       │
│               (94 lines)                           │
├────────────────────────────────────────────────────┤
│ Focus: Shape and size transformations              │
├────────────────────────────────────────────────────┤
│ Methods:                                           │
│  • applyPulse(anim, progress)                      │
│    └─ Rhythmic scale and glow pulse               │
│  • applyExpand(anim, progress)                     │
│    └─ Smooth expansion with glow                  │
│  • applyContract(anim, progress)                   │
│    └─ Smooth contraction                          │
│  • applyStretch(anim, progress)                    │
│    └─ Oscillating stretch                         │
│  • applyMorph(anim, progress)                      │
│    └─ Fluid morphing with rotation                │
└────────────────────────────────────────────────────┘
```

### ExpressionGestureAnimator
```
┌────────────────────────────────────────────────────┐
│      ExpressionGestureAnimator                     │
│              (156 lines)                           │
├────────────────────────────────────────────────────┤
│ Focus: Expressive gestures and emotions            │
├────────────────────────────────────────────────────┤
│ Methods:                                           │
│  • applyNod(anim, progress)                        │
│    └─ Vertical nodding motion                     │
│  • applyTilt(anim, progress)                       │
│    └─ Head tilt with rotation and skew            │
│  • applySlowBlink(anim, progress)                  │
│    └─ Eye blink simulation via glow               │
│  • applyLook(anim, progress)                       │
│    └─ Directional gaze with hold                  │
│  • applySettle(anim, progress)                     │
│    └─ Damped oscillation settling                 │
└────────────────────────────────────────────────────┘
```

### DirectionalGestureAnimator
```
┌────────────────────────────────────────────────────┐
│     DirectionalGestureAnimator                     │
│              (137 lines)                           │
├────────────────────────────────────────────────────┤
│ Focus: Directional pointing and reaching           │
├────────────────────────────────────────────────────┤
│ Methods:                                           │
│  • applyPoint(anim, progress)                      │
│    └─ Three-phase: move → hold → return           │
│  • applyLean(anim, progress)                       │
│    └─ Side lean with rotation                     │
│  • applyReach(anim, progress)                      │
│    └─ Reaching in any direction                   │
└────────────────────────────────────────────────────┘
```

### ComplexAnimationAnimator
```
┌────────────────────────────────────────────────────┐
│      ComplexAnimationAnimator                      │
│              (187 lines)                           │
├────────────────────────────────────────────────────┤
│ Focus: Complex multi-component animations          │
├────────────────────────────────────────────────────┤
│ Methods:                                           │
│  • applyFlashWave(anim, progress)                  │
│    └─ Emanating wave effect                       │
│  • applyRain(anim, progress)                       │
│    └─ Falling particle behavior                   │
│  • applyGroove(anim, progress)                     │
│    └─ Smooth dance movement                       │
│  • applyHeadBob(anim, progress)                    │
│    └─ Rhythmic vertical bobbing                   │
│  • applyRunningMan(anim, progress)                 │
│    └─ Running dance move                          │
│  • applyCharleston(anim, progress)                 │
│    └─ Charleston dance move                       │
└────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│   Client    │
│   Code      │
└──────┬──────┘
       │ startGesture('bounce')
       ▼
┌─────────────────────────────────┐
│     GestureAnimator             │
│                                 │
│  1. startGesture(name)          │
│     • Initialize state          │
│     • Set start time            │
└──────┬──────────────────────────┘
       │ (on render frame)
       ▼
┌─────────────────────────────────┐
│  applyGestureAnimations()       │
│                                 │
│  2. Calculate progress          │
│     • Elapsed time              │
│     • Duration                  │
│  3. Apply easing                │
│     • Ease in/out/inout         │
└──────┬──────────────────────────┘
       │ applyBounce(anim, progress)
       ▼
┌─────────────────────────────────┐
│  PhysicalGestureAnimator        │
│                                 │
│  4. Calculate transform         │
│     • offsetX, offsetY          │
│     • scale, rotation           │
│     • Additional properties     │
└──────┬──────────────────────────┘
       │ return transform
       ▼
┌─────────────────────────────────┐
│  GestureAnimator                │
│                                 │
│  5. Aggregate transforms        │
│     • Combine offsetX/Y         │
│     • Multiply scales           │
│     • Add rotations             │
│     • Max glow values           │
└──────┬──────────────────────────┘
       │ return combined transform
       ▼
┌─────────────────────────────────┐
│   EmotiveRenderer               │
│                                 │
│  6. Apply to renderer           │
│     • Update position           │
│     • Update scale              │
│     • Update rotation           │
│     • Update effects            │
└─────────────────────────────────┘
```

## Gesture Categories

```
                    ┌─────────────────────┐
                    │  All Gestures (42)  │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
    ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
    │  Physical   │    │   Visual    │    │  Breathing  │
    │  Motion (5) │    │ Effects (5) │    │  Anims (5)  │
    └─────────────┘    └─────────────┘    └─────────────┘
           │                   │                   │
           │                   │                   │
    ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
    │  Movement   │    │    Shape    │    │ Expression  │
    │Patterns (8) │    │Transform(5) │    │ Gestures(5) │
    └─────────────┘    └─────────────┘    └─────────────┘
           │                   │
           │                   │
    ┌──────▼──────┐    ┌──────▼──────┐
    │Directional  │    │  Complex    │
    │ Gesture (3) │    │  Anims (6)  │
    └─────────────┘    └─────────────┘
```

## Testing Architecture

```
┌────────────────────────────────────────────────────┐
│            Test Suite Structure                     │
└────────────────────────────────────────────────────┘

Each Animator has corresponding test file:

src/core/renderer/              test/unit/core/renderer/
├── PhysicalGestureAnimator.js  ──►  PhysicalGestureAnimator.test.js (23 tests)
├── VisualEffectAnimator.js     ──►  VisualEffectAnimator.test.js (21 tests)
├── BreathGestureAnimator.js    ──►  BreathGestureAnimator.test.js (18 tests)
├── MovementGestureAnimator.js  ──►  MovementGestureAnimator.test.js (21 tests)
├── ShapeTransformAnimator.js   ──►  ShapeTransformAnimator.test.js (22 tests)
├── ExpressionGestureAnimator.js──►  ExpressionGestureAnimator.test.js (26 tests)
├── DirectionalGestureAnimator.js─► DirectionalGestureAnimator.test.js (25 tests)
└── ComplexAnimationAnimator.js ──►  ComplexAnimationAnimator.test.js (31 tests)

Total: 187 tests, all passing ✅
```

## Interaction Sequence

```
User Code:
  mascot.startGesture('bounce')
     │
     ▼
GestureAnimator:
  startGesture('bounce')
  ├─ Check gesture exists
  ├─ Initialize state
  ├─ Set startTime
  └─ Mark as active
     │
     │ (render loop)
     ▼
GestureAnimator:
  applyGestureAnimations()
  ├─ Calculate progress
  ├─ Apply easing
  └─ Call applyBounce(anim, progress)
     │
     ▼
PhysicalGestureAnimator:
  applyBounce(anim, progress)
  ├─ Calculate bounce height
  ├─ Apply gravity if enabled
  └─ Return { offsetY: bounce }
     │
     ▼
GestureAnimator:
  Combine transforms
  ├─ Add offsetX/Y
  ├─ Multiply scales
  ├─ Add rotations
  └─ Return combined transform
     │
     ▼
EmotiveRenderer:
  Apply transform to canvas
  ├─ Translate by offset
  ├─ Rotate by rotation
  ├─ Scale by scale
  └─ Apply glow effects
```

---

*This diagram represents the refactored architecture as of commit `145a5f65`*
