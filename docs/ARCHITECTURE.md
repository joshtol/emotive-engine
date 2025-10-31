# Emotive Engine Architecture

Complete architectural documentation for the Emotive Engine real-time animation system.

## Table of Contents

- [System Overview](#system-overview)
- [Directory Structure](#directory-structure)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Initialization Sequence](#initialization-sequence)
- [GestureAnimator Architecture](#gestureanimator-architecture)
- [Extension Points](#extension-points)
- [Performance Considerations](#performance-considerations)
- [Event System](#event-system)
- [API Reference](#api-reference)

---

## System Overview

Emotive Engine is a **real-time animation system** that converts emotional states into visual expressions through particle-based animations. Think of it as a translation layer: **emotions** → **visual parameters** → **animated particles** → **canvas rendering**.

```
┌─────────────┐
│   Your App  │  Sets emotions, gestures, shapes
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         EmotiveMascot (Public API)      │  Main orchestration class
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      State Management Layer             │
│  ┌─────────────────────────────────┐   │
│  │   StateCoordinator              │   │  Validates & coordinates state
│  │   EmotiveStateMachine           │   │  Manages state transitions
│  │   ConfigurationManager          │   │  Manages settings
│  └─────────────────────────────────┘   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      Gesture & Animation Layer          │
│  ┌─────────────────────────────────┐   │
│  │   GestureController             │   │  Selects & executes gestures
│  │   VisualizationRunner           │   │  Runs visual effects
│  │   AnimationLoopManager          │   │  Manages animation timing
│  └─────────────────────────────────┘   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      Particle System Layer              │
│  ┌─────────────────────────────────┐   │
│  │   ParticleSystem                │   │  Creates & updates particles
│  │   ParticleBehaviors             │   │  Defines particle movement
│  │   EffectsManager                │   │  Applies visual effects
│  └─────────────────────────────────┘   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      Rendering Layer                    │
│  ┌─────────────────────────────────┐   │
│  │   EmotiveRenderer               │   │  Draws to canvas
│  │   GradientCache                 │   │  Caches expensive calculations
│  │   CanvasPositioning             │   │  Handles layout
│  └─────────────────────────────────┘   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Canvas    │  User sees animated mascot
└─────────────┘
```

---

## Directory Structure

The codebase is organized into logical subdirectories following domain-driven design principles:

```
src/
├── core/                           # Core engine systems
│   ├── audio/                      # Audio & rhythm (10 files)
│   │   ├── AudioAnalyzer.js        # Audio input analysis
│   │   ├── AudioLevelProcessor.js  # Level processing
│   │   ├── SoundSystem.js          # Sound effects
│   │   ├── GestureSoundLibrary.js  # Gesture sound configurations
│   │   ├── rhythm.js               # Rhythm engine
│   │   ├── rhythmIntegration.js    # Rhythm sync
│   │   ├── MusicTheory.js          # Musical concepts
│   │   ├── MusicalDuration.js      # Duration calculations
│   │   ├── GrooveTemplates.js      # Rhythm patterns
│   │   └── HarmonicSystem.js       # Harmonic analysis
│   │
│   ├── state/                      # State management (3 files)
│   │   ├── EmotiveStateMachine.js  # Core state machine
│   │   ├── StateStore.js           # State persistence
│   │   └── ContextManager.js       # Execution context
│   │
│   ├── events/                     # Event handling (5 files)
│   │   ├── EventManager.js         # Event coordination
│   │   ├── ErrorBoundary.js        # Error handling
│   │   ├── ErrorLogger.js          # Error logging
│   │   ├── ErrorResponse.js        # Error responses
│   │   └── ErrorTracker.js         # Error tracking
│   │
│   ├── canvas/                     # Canvas management (1 file)
│   │   └── CanvasManager.js        # Canvas lifecycle
│   │
│   ├── system/                     # System management (6 files)
│   │   ├── PerformanceMonitor.js   # FPS tracking
│   │   ├── DegradationManager.js   # Auto quality reduction
│   │   ├── HealthCheck.js          # System health
│   │   ├── SimpleFPSCounter.js     # FPS counter
│   │   ├── FeatureFlags.js         # Feature toggles
│   │   └── SecurityManager.js      # Security policies
│   │
│   ├── morpher/                    # Shape morphing (1 file)
│   │   └── ShadowEffectManager.js  # Shadow transition effects
│   │
│   ├── optimization/               # Performance optimization (3 files)
│   │   ├── MobileOptimization.js   # Mobile-specific
│   │   ├── AccessibilityManager.js # Accessibility
│   │   └── LazyLoader.js           # Lazy loading
│   │
│   ├── plugins/                    # Plugin system (3 files)
│   │   ├── PluginSystem.js         # Plugin manager
│   │   ├── PerformanceSystem.js    # Performance plugins
│   │   └── SequenceExecutor.js     # Sequence execution
│   │
│   ├── behavior/                   # Behavioral systems (2 files)
│   │   ├── IdleBehavior.js         # Idle animations
│   │   └── GazeTracker.js          # Gaze tracking
│   │
│   ├── integration/                # External integrations (2 files)
│   │   ├── LLMResponseHandler.js   # AI integration
│   │   └── llm-templates.js        # LLM prompts
│   │
│   ├── emotions/                   # Emotion system
│   │   ├── base/                   # Base definitions
│   │   ├── states/                 # Individual emotions
│   │   ├── rhythm/                 # Rhythm modulation
│   │   └── EmotionModifier.js      # Blending & transitions
│   │
│   ├── gestures/                   # Gesture system
│   │   ├── definitions/            # Gesture definitions
│   │   ├── GestureCompositor.js    # Gesture composition
│   │   └── GestureScheduler.js     # Scheduling
│   │
│   ├── particles/                  # Particle system
│   │   ├── behaviors/              # Movement patterns
│   │   ├── ParticleSystem.js       # Particle manager
│   │   ├── ParticlePool.js         # Object pooling
│   │   └── ParticleEmitter.js      # Spawning
│   │
│   ├── renderer/                   # Rendering system
│   │   ├── EmotiveRenderer.js      # Main renderer
│   │   ├── GradientCache.js        # Performance cache
│   │   ├── CanvasPositioning.js    # Layout
│   │   └── gesture-animators/      # Specialized animators
│   │       ├── PhysicalGestureAnimator.js
│   │       ├── VisualEffectAnimator.js
│   │       ├── BreathGestureAnimator.js
│   │       ├── MovementGestureAnimator.js
│   │       ├── ShapeTransformAnimator.js
│   │       ├── ExpressionGestureAnimator.js
│   │       ├── DirectionalGestureAnimator.js
│   │       └── ComplexAnimationAnimator.js
│   │
│   ├── shapes/                     # Shape morphing
│   │   ├── definitions/            # Shape definitions
│   │   └── ShapeMorpher.js         # Morphing logic
│   │
│   ├── effects/                    # Visual effects
│   │   ├── EffectsManager.js       # Effect coordination
│   │   ├── TrailEffect.js          # Particle trails
│   │   └── GlowEffect.js           # Glow effects
│   │
│   ├── performances/               # Semantic performances
│   │   └── PerformanceChoreographer.js
│   │
│   ├── AnimationController.js      # Animation loop
│   ├── AnimationLoopManager.js     # Loop management
│   ├── ParticleSystem.js           # Core particle system
│   ├── EmotiveRenderer.js          # Core renderer
│   ├── ShapeMorpher.js             # Shape morphing
│   ├── GestureScheduler.js         # Gesture scheduling
│   ├── GestureCompositor.js        # Gesture composition
│   ├── GestureCompatibility.js     # Compatibility layer
│   └── Particle.js                 # Particle class
│
├── mascot/                         # High-level orchestration
│   ├── rendering/                  # Rendering managers (6 files)
│   │   ├── RenderStateBuilder.js   # State building
│   │   ├── RenderLayerOrchestrator.js
│   │   ├── DebugInfoRenderer.js    # Debug overlays
│   │   ├── ThreatLevelCalculator.js
│   │   ├── ParticleConfigCalculator.js
│   │   └── GestureMotionProvider.js
│   │
│   ├── animation/                  # Animation managers (3 files)
│   │   ├── BreathingAnimationController.js
│   │   ├── BreathingPatternManager.js
│   │   └── OrbScaleAnimator.js
│   │
│   ├── audio/                      # Audio managers (3 files)
│   │   ├── AudioHandler.js         # Audio processing
│   │   ├── SpeechManager.js        # Speech synthesis
│   │   └── AudioLevelCallbackManager.js
│   │
│   ├── state/                      # State managers (3 files)
│   │   ├── StateCoordinator.js     # State coordination
│   │   ├── RecordingStateManager.js
│   │   └── SleepWakeManager.js
│   │
│   ├── system/                     # System managers (4 files)
│   │   ├── InitializationManager.js
│   │   ├── ConfigurationManager.js
│   │   ├── DestructionManager.js
│   │   └── SystemStatusReporter.js
│   │
│   ├── performance/                # Performance managers (1 file)
│   │   └── DegradationEventHandler.js  # Performance degradation events
│   │
│   └── control/                    # Control managers (2 files)
│       ├── GestureController.js    # Gesture control
│       └── VisualizationRunner.js  # Visual effects
│
├── config/                         # Configuration
│   ├── emotionMap.js               # Emotion definitions
│   ├── gestureLibrary.js           # Gesture library
│   └── defaultConfig.js            # Default settings
│
├── utils/                          # Shared utilities
│   ├── colorUtils.js               # Color manipulation
│   ├── mathUtils.js                # Math helpers
│   ├── easing.js                   # Easing functions
│   ├── PositionController.js       # Position management
│   ├── browserCompatibility.js     # Browser detection
│   ├── debugger.js                 # Debug utilities
│   └── sentry.js                   # Error reporting
│
├── EmotiveMascot.js                # Internal orchestrator
├── EmotiveMascotPublic.js          # Public API wrapper
├── index.js                        # Main entry point
├── minimal.js                      # Minimal bundle
├── lean.js                         # Lean bundle
└── audio.js                        # Audio bundle
```

### Organization Principles

1. **Domain-Driven Design**: Files grouped by domain (audio, state, events, etc.)
2. **Single Responsibility**: Each directory has one clear purpose
3. **Discoverability**: Related files are co-located
4. **Scalability**: Easy to add new files in appropriate subdirectories

### Key Metrics

- **83% reduction** in root-level files (61 → 10)
- **15 logical subdirectories** with clear responsibilities
- **34 files moved** to domain-specific locations
- **100% backward compatible** - all imports updated

---

## Core Components

### 1. EmotiveMascot (Public API)
- **File**: [src/EmotiveMascotPublic.js](../src/EmotiveMascotPublic.js)
- **Purpose**: Main entry point for users
- **Key Methods**: `init()`, `start()`, `setEmotion()`, `express()`, `morphTo()`
- **Complexity**: ⭐⭐ Intermediate

### 2. EmotiveMascot (Internal Orchestrator)
- **File**: [src/EmotiveMascot.js](../src/EmotiveMascot.js)
- **Purpose**: Coordinates all internal systems
- **Size**: Previously 3,096 lines, now modularized
- **Complexity**: ⭐⭐⭐⭐ Advanced

### 3. StateCoordinator
- **File**: [src/mascot/state/StateCoordinator.js](../src/mascot/state/StateCoordinator.js)
- **Purpose**: Validates and coordinates state changes
- **Complexity**: ⭐⭐⭐ Intermediate-Advanced

### 4. GestureController
- **File**: [src/mascot/control/GestureController.js](../src/mascot/control/GestureController.js)
- **Purpose**: Selects and executes gestures
- **Complexity**: ⭐⭐⭐ Intermediate-Advanced

### 5. ParticleSystem
- **File**: [src/core/ParticleSystem.js](../src/core/ParticleSystem.js)
- **Purpose**: Creates, updates, and manages particles
- **Complexity**: ⭐⭐⭐⭐ Advanced

### 6. EmotiveRenderer
- **File**: [src/core/EmotiveRenderer.js](../src/core/EmotiveRenderer.js)
- **Purpose**: Handles all canvas drawing operations
- **Complexity**: ⭐⭐⭐⭐ Advanced

### 7. VisualizationRunner
- **File**: [src/mascot/control/VisualizationRunner.js](../src/mascot/control/VisualizationRunner.js)
- **Purpose**: Runs visual effects and animations
- **Complexity**: ⭐⭐⭐ Intermediate-Advanced

### 8. AudioHandler
- **File**: [src/mascot/audio/AudioHandler.js](../src/mascot/audio/AudioHandler.js)
- **Purpose**: Processes audio input and syncs to BPM
- **Complexity**: ⭐⭐⭐⭐ Advanced

---

## Data Flow

### Emotion Change Flow

```
User calls: mascot.setEmotion('joy')
       │
       ▼
[EmotiveMascotPublic] Validates input
       │
       ▼
[StateCoordinator] Checks if transition is valid
       │
       ▼
[EmotiveStateMachine] Updates internal state
       │
       ▼
[GestureController] Selects appropriate gesture
       │
       ▼
[GestureCompositor] Builds gesture sequence
       │
       ▼
[ParticleSystem] Generates particles with emotion parameters
       │
       ▼
[EmotiveRenderer] Draws particles to canvas
       │
       ▼
[Canvas] User sees joyful animation
```

### Gesture Execution Flow

```
GestureController.executeGesture('wave')
       │
       ▼
[GestureScheduler] Schedules in queue
       │
       ▼
[SequenceExecutor] Breaks into phases
       │
       ▼
[ParticleSystem] Spawns particles for each phase
       │
       ▼
[ParticleBehaviors] Applies movement patterns
       │
       ▼
[EmotiveRenderer] Renders animated gesture
       │
       ▼
[EventEmitter] Fires 'gesture' event
```

### Render Loop Flow

```
[AnimationLoopManager] requestAnimationFrame()
       │
       ▼
[PerformanceMonitor] Checks FPS
       │
       ▼
[ParticleSystem] Updates all particles
       │
       ▼
[EffectsManager] Apply visual effects
       │
       ▼
[EmotiveRenderer] Clear → Draw → Post-process
       │
       ▼
[Canvas] Frame rendered (60 FPS target)
       │
       └─── Loop continues ───┐
                               │
                               ▼
                    requestAnimationFrame() again
```

---

## Initialization Sequence

When you call `mascot.init()`:

```
1. EmotiveMascotPublic.init()
       │
       ▼
2. ConfigurationManager.loadConfig()
   - Merges user config with defaults
   - Validates settings
       │
       ▼
3. EmotiveRenderer.init()
   - Gets canvas element
   - Sets up 2D context
   - Initializes gradient cache
       │
       ▼
4. ParticleSystem.init()
   - Creates particle pool
   - Loads particle behaviors
       │
       ▼
5. GestureController.loadGestures()
   - Loads gesture definitions
   - Builds gesture index
       │
       ▼
6. StateCoordinator.init()
   - Sets initial state
   - Initializes state machine
       │
       ▼
7. AudioHandler.init() [if audio enabled]
   - Sets up Web Audio API
   - Creates analyzer nodes
       │
       ▼
8. Plugin System loads plugins
       │
       ▼
9. Ready! User can call start()
```

---

## GestureAnimator Architecture

The GestureAnimator system was refactored from a 1,472-line god object into 8 specialized animator classes following the Single Responsibility Principle.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       EmotiveRenderer                           │
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
│Phy│   │Vis│   │Bre│   │Mov│   │Sha│   │Exp│   │Dir│   │Com│
│sic│   │ual│   │ath│   │eme│   │peT│   │ress│   │ect│   │plex│
│al │   │Eff│   │   │   │nt │   │rans│   │ion│   │iona│   │   │
└───┘   └───┘   └───┘   └───┘   └───┘   └───┘   └───┘   └───┘
```

### Specialized Animators

#### 1. PhysicalGestureAnimator (179 lines)
Handles physical motion with mass and momentum:
- `applyBounce()` - Bouncing motion with gravity
- `applyShake()` - Oscillating shake with decay
- `applyJump()` - Jump with squash/stretch
- `applyVibrate()` - High-frequency vibration
- `applyWiggle()` - Hip-hop style wiggle

#### 2. VisualEffectAnimator (145 lines)
Visual effects and lighting:
- `applyFlash()` - Quick flash with glow
- `applyGlow()` - Pulsing glow effect
- `applyFlicker()` - Flickering light
- `applySparkle()` - Sparkling particles
- `applyShimmer()` - Subtle shimmer

#### 3. BreathGestureAnimator (113 lines)
Breathing and meditation:
- `applyBreathe()` - Full breath cycle
- `applyBreathIn()` - Inhale only
- `applyBreathOut()` - Exhale only
- `applyBreathHold()` - Hold at full
- `applyBreathHoldEmpty()` - Hold at empty

#### 4. MovementGestureAnimator (213 lines)
Complex movement patterns:
- `applySpin()` - Rotation with pulse
- `applyDrift()` - Smooth drifting
- `applyWave()` - Infinity symbol wave
- `applySway()` - Side-to-side swaying
- `applyFloat()` - Floating motion
- `applyHula()` - Figure-8 motion
- `applyOrbit()` - Circular orbital path

#### 5. ShapeTransformAnimator (94 lines)
Shape and size transformations:
- `applyPulse()` - Rhythmic pulsation
- `applyExpand()` - Smooth expansion
- `applyContract()` - Smooth contraction
- `applyStretch()` - Oscillating stretch
- `applyMorph()` - Fluid morphing

#### 6. ExpressionGestureAnimator (156 lines)
Expressive gestures:
- `applyNod()` - Vertical nodding
- `applyTilt()` - Head tilt with rotation
- `applySlowBlink()` - Eye blink simulation
- `applyLook()` - Directional gaze
- `applySettle()` - Damped settling

#### 7. DirectionalGestureAnimator (137 lines)
Directional pointing:
- `applyPoint()` - Directional pointing
- `applyLean()` - Side lean
- `applyReach()` - Reaching motion

#### 8. ComplexAnimationAnimator (187 lines)
Complex multi-component animations:
- `applyFlashWave()` - Emanating wave
- `applyRain()` - Falling particles
- `applyGroove()` - Dance movement
- `applyHeadBob()` - Rhythmic bobbing
- `applyRunningMan()` - Running dance
- `applyCharleston()` - Charleston dance

### Animation Method Pattern

All animation methods follow this signature:

```javascript
applyMethodName(anim, progress)
```

**Parameters:**
- `anim` (Object): Animation state object with `params`
- `progress` (number): Animation progress from 0 to 1

**Returns:**
```javascript
{
  offsetX?: number,    // Horizontal offset
  offsetY?: number,    // Vertical offset
  scale?: number,      // Uniform scale
  scaleX?: number,     // Horizontal scale
  scaleY?: number,     // Vertical scale
  rotation?: number,   // Rotation in degrees
  glow?: number,       // Glow intensity multiplier
  // Additional effect properties
}
```

### Testing

Each animator has comprehensive test coverage:

```
test/unit/core/renderer/
├── PhysicalGestureAnimator.test.js      (23 tests)
├── VisualEffectAnimator.test.js         (21 tests)
├── BreathGestureAnimator.test.js        (18 tests)
├── MovementGestureAnimator.test.js      (21 tests)
├── ShapeTransformAnimator.test.js       (22 tests)
├── ExpressionGestureAnimator.test.js    (26 tests)
├── DirectionalGestureAnimator.test.js   (25 tests)
└── ComplexAnimationAnimator.test.js     (31 tests)
```

**Total**: 187 tests, 100% passing

### Benefits

1. **43% size reduction** in GestureAnimator (1,472 → 832 lines)
2. **100% test coverage** with 187 new unit tests
3. **Single Responsibility** - each animator has one purpose
4. **Extensibility** - easy to add new gesture types
5. **Maintainability** - smaller, focused files

---

## Extension Points

### Custom Emotions

```javascript
// Define in src/core/emotions/states/myEmotion.js
export const energized = {
    name: 'energized',
    color: '#FF6B6B',
    particleSpeed: 5,
    particleCount: 100
};
```

### Custom Gestures

```javascript
// Define in src/core/gestures/definitions/myGesture.js
export const spiral = {
    name: 'spiral',
    duration: 2000,
    phases: [
        { type: 'spawn', pattern: 'circular', count: 50 },
        { type: 'animate', behavior: 'spiral-out' },
        { type: 'fadeout', duration: 500 }
    ]
};
```

### Custom Particle Behaviors

```javascript
// Define in src/core/particles/behaviors/myBehavior.js
export function spiralBehavior(particle, deltaTime) {
    const angle = particle.age * 0.1;
    const radius = particle.age * 0.5;
    particle.x += Math.cos(angle) * radius * deltaTime;
    particle.y += Math.sin(angle) * radius * deltaTime;
}
```

### Custom Shapes

```javascript
// Define in src/core/shapes/definitions/myShape.js
export const starShape = {
    name: 'star',
    points: 5,
    innerRadius: 0.4,
    outerRadius: 1.0
};
```

### Plugins

```javascript
// Create plugin in src/plugins/myPlugin.js
export class MyPlugin {
    constructor(mascot) {
        this.mascot = mascot;
    }

    init() {
        this.mascot.on('gesture', this.handleGesture);
    }

    handleGesture(data) {
        console.log('Gesture:', data.name);
    }
}
```

---

## Performance Considerations

### Performance Systems

1. **Particle Pooling** - Reuses particle objects
2. **Gradient Caching** - Caches expensive calculations
3. **Performance Monitor** - Tracks FPS
4. **Degradation Manager** - Auto-reduces quality on slow devices
5. **Spatial Indexing** - Optimizes collision detection
6. **Mobile Optimization** - Reduces effects on mobile

### Performance Flow

```
[PerformanceMonitor] Tracks FPS every frame
       │
       ▼
FPS < 30 for 60 frames?
       │
       ├─ Yes ──▶ [DegradationManager] Reduce particle count
       │                                Disable expensive effects
       │
       └─ No ───▶ Continue normal operation
```

---

## Event System

The mascot emits events you can listen to:

```javascript
mascot.on('gesture', (data) => {
    console.log('Gesture:', data.name);
});

mascot.on('shapeMorphStarted', (data) => {
    console.log('Morphing:', data.from, '→', data.to);
});

mascot.on('resize', (data) => {
    console.log('Resized:', data.width, 'x', data.height);
});

mascot.on('paused', () => {
    console.log('Animation paused');
});

mascot.on('resumed', () => {
    console.log('Animation resumed');
});
```

---

## API Reference

### Common Tasks & File Locations

| Task | Files to Look At |
|------|------------------|
| **Add a new emotion** | [src/core/emotions/states/](../src/core/emotions/states/) |
| **Create a custom gesture** | [src/core/gestures/definitions/](../src/core/gestures/definitions/) |
| **Change particle behavior** | [src/core/particles/behaviors/](../src/core/particles/behaviors/) |
| **Add a new shape** | [src/core/shapes/definitions/](../src/core/shapes/definitions/) |
| **Modify rendering** | [src/core/EmotiveRenderer.js](../src/core/EmotiveRenderer.js) |
| **Add performance optimization** | [src/core/system/PerformanceMonitor.js](../src/core/system/PerformanceMonitor.js) |
| **Extend LLM integration** | [src/core/integration/LLMResponseHandler.js](../src/core/integration/LLMResponseHandler.js) |
| **Add a plugin** | [src/plugins/](../src/plugins/) |
| **Add new gesture animation** | [src/core/renderer/gesture-animators/](../src/core/renderer/gesture-animators/) |

### Key Files & Complexity

| File | Purpose | When to Edit | Complexity |
|------|---------|--------------|------------|
| [EmotiveMascotPublic.js](../src/EmotiveMascotPublic.js) | Public API | Adding public methods | ⭐⭐ |
| [EmotiveMascot.js](../src/EmotiveMascot.js) | Core orchestrator | System-wide changes | ⭐⭐⭐⭐ |
| [StateCoordinator.js](../src/mascot/state/StateCoordinator.js) | State management | State logic changes | ⭐⭐⭐ |
| [GestureController.js](../src/mascot/control/GestureController.js) | Gesture execution | Gesture features | ⭐⭐⭐ |
| [EmotiveRenderer.js](../src/core/EmotiveRenderer.js) | Canvas rendering | Visual output | ⭐⭐⭐⭐ |
| [ParticleSystem.js](../src/core/ParticleSystem.js) | Particle management | Particle behavior | ⭐⭐⭐⭐ |
| [VisualizationRunner.js](../src/mascot/control/VisualizationRunner.js) | Effect orchestration | New effects | ⭐⭐⭐ |
| [AudioHandler.js](../src/mascot/audio/AudioHandler.js) | Audio processing | Audio sync | ⭐⭐⭐⭐ |

---

## Further Reading

- [INNOVATIONS.md](INNOVATIONS.md) - Technical innovations and patents
- [BUSINESS_POTENTIAL.md](BUSINESS_POTENTIAL.md) - Business applications
- [README.md](README.md) - Main documentation
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guide
- [CHANGELOG.md](../CHANGELOG.md) - Version history

---

## Getting Help

- **For users**: See examples in [/examples](../examples/)
- **For contributors**: See [CONTRIBUTING.md](../CONTRIBUTING.md)
- **For bugs**: Open an issue on GitHub
- **For questions**: Check existing issues or open a discussion

---

*Last updated: 2025-10-30*
*Version: 3.0.0*
