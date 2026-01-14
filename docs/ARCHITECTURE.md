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

The test suite focuses on essential functionality with comprehensive coverage of the DI-based manager architecture:

```
test/unit/mascot/
├── GestureController.test.js       (43 tests)  # Gesture management
├── AudioHandler.test.js            (40 tests)  # Audio connectivity
├── StateCoordinator.test.js        (30 tests)  # Emotion state
├── VisualizationRunner.test.js     (23 tests)  # Animation loop
└── ConfigurationManager.test.js    (26 tests)  # Settings
```

**Total**: 413 tests, 100% passing

### Benefits

1. **Clean DI architecture** - managers receive dependencies via constructor
2. **Testable in isolation** - no coupling to monolithic mascot object
3. **Single Responsibility** - each manager has one purpose
4. **Extensibility** - easy to add new managers
5. **Maintainability** - smaller, focused modules

---

## 3D Rendering System

The Emotive Engine includes an experimental 3D rendering mode using Three.js for WebGL-accelerated geometry rendering.

### Architecture Overview

The 3D system is a parallel implementation that maintains API compatibility with the 2D engine while using Three.js for core geometry rendering:

```
┌─────────────────────────────────────────┐
│      EmotiveMascot3D (Public API)       │  Same API as 2D version
└──────┬──────────────────────────────────┘
       │
       ├──▶ Core3DManager ────▶ Three.js Renderer (WebGL)
       │         │
       │         ├──▶ Geometry (sphere, crystal, diamond, etc.)
       │         ├──▶ Animation Systems
       │         │     ├── ProceduralAnimator (gestures)
       │         │     ├── BreathingAnimator (breathing)
       │         │     ├── GestureBlender (gesture composition)
       │         │     ├── BlinkAnimator (blinking)
       │         │     └── GeometryMorpher (shape transitions)
       │         │
       │         ├──▶ Behavior Systems
       │         │     ├── RotationBehavior (emotion-aware rotation)
       │         │     └── RightingBehavior (self-stabilization)
       │         │
       │         └──▶ Lighting & Effects
       │               ├── Three-point lighting
       │               ├── Fresnel glow shader
       │               └── Post-processing (bloom, etc.)
       │
       └──▶ ParticleSystem ────▶ Canvas2D Overlay (reused from 2D)
```

### BlinkAnimator System

The **BlinkAnimator** provides emotion-aware, geometry-specific blinking behavior for 3D mascots.

#### Core Concepts

1. **Geometry-Specific Blink Behaviors**: Each geometry (sphere, crystal, diamond, etc.) has its own unique blink style and duration defined in its configuration.

2. **Emotion Modulation**: Emotions modify blink timing through two multipliers:
   - `blinkRate`: Controls blink frequency (higher = more frequent)
   - `blinkSpeed`: Controls animation speed (higher = faster blinks)

3. **Automatic Timing**: BlinkAnimator handles randomized intervals (3-7 seconds) automatically.

#### Configuration

**Geometry Blink Configs** (in [ThreeGeometries.js](../src/3d/geometries/ThreeGeometries.js)):

```javascript
sphere: {
    geometry: createSphere(64, 64),
    blink: {
        type: 'vertical-squish',
        duration: 150,              // Base duration in ms
        scaleAxis: [1.0, 0.3, 1.0], // Squish to 30% on Y-axis
        curve: 'sine',
        playful: {
            anticipation: 0.03,
            overshoot: 0.05
        }
    }
}
```

**Emotion Blink Timing** (in emotion files like [neutral.js](../src/core/emotions/base/neutral.js)):

```javascript
visual: {
    // ... other visual properties
    blinkRate: 1.0,   // Baseline blink frequency
    blinkSpeed: 1.0,  // Baseline blink animation speed
}
```

#### Blink Duration Calculation

The final blink duration is calculated as:

```javascript
finalDuration = geometry.blink.duration / emotion.blinkSpeed
```

**Examples:**
- Crystal (120ms) + Excited (1.2×) = **100ms** (very snappy!)
- Sphere (150ms) + Resting (0.7×) = **214ms** (slow, drowsy)
- Diamond (100ms) + Anger (1.3×) = **77ms** (lightning fast!)

#### Emotion Blink Timing Values

| Emotion | blinkRate | blinkSpeed | Character |
|---------|-----------|------------|-----------|
| **neutral** | 1.0 | 1.0 | Baseline |
| **excited** | 1.5 | 1.2 | Frequent, snappy |
| **joy** | 1.3 | 1.1 | Happy |
| **calm** | 0.8 | 1.0 | Relaxed |
| **resting** | 0.4 | 0.7 | Sleepy, drowsy |
| **sadness** | 0.6 | 0.8 | Withdrawn |
| **focused** | 0.7 | 1.0 | Concentrating |
| **anger** | 1.6 | 1.3 | Agitated |
| **fear** | 1.7 | 1.4 | Anxious, nervous |
| **love** | 1.2 | 1.0 | Affectionate |
| **surprise** | 1.4 | 1.2 | Shocked, startled |
| **suspicion** | 1.1 | 1.0 | Watchful |
| **euphoria** | 1.4 | 1.1 | Euphoric |
| **disgust** | 0.9 | 0.9 | Discomfort |
| **glitch** | 1.3 | 1.2 | Erratic |

#### Integration with Core3DManager

The BlinkAnimator is integrated into the render loop:

1. **Initialization**: BlinkAnimator created with geometry config
2. **Emotion Updates**: `setEmotion()` updates blink timing multipliers
3. **Morph Handling**: Blinks pause during geometry morphs, resume after
4. **Render Loop**:
   - Update blink animation each frame
   - Apply blink scale AFTER gestures
   - Combine with gesture → morph → breathing → blink

```javascript
// In Core3DManager.render()
const blinkState = this.blinkAnimator.update(deltaTime);

if (blinkState.isBlinking) {
    // Apply scale (vertical squish, etc.)
    finalScale *= blinkState.scale[1];

    // Apply optional rotation
    if (blinkState.rotation) {
        this.rotation[0] += blinkState.rotation[0];
        this.rotation[1] += blinkState.rotation[1];
        this.rotation[2] += blinkState.rotation[2];
    }

    // Apply optional glow boost
    if (blinkState.glowBoost) {
        this.glowIntensity += blinkState.glowBoost;
    }
}
```

#### Public API

```javascript
// Enable/disable blinking
mascot.enableBlinking();
mascot.disableBlinking();

// Check if blinking is enabled
if (mascot.blinkingEnabled) {
    console.log('Blinking is active');
}
```

#### Geometry Blink Styles

All 11 geometries have unique blink behaviors:

| Geometry | Blink Type | Duration | Style |
|----------|------------|----------|-------|
| **sphere** | vertical-squish | 150ms | Classic squish |
| **crystal** | facet-flash | 120ms | Snappier, faceted |
| **diamond** | sparkle-blink | 100ms | Very fast sparkle |
| **cube** | face-blink | 140ms | Face flash |
| **pyramid** | apex-pulse | 130ms | Tip pulse |
| **octahedron** | dual-apex-pulse | 135ms | Both tips |
| **torus** | ring-squeeze | 160ms | Ring compression |
| **cone** | tip-flash | 125ms | Cone tip flash |
| **cylinder** | barrel-squeeze | 155ms | Barrel compression |
| **capsule** | capsule-squeeze | 145ms | Capsule squish |
| **tetrahedron** | vertex-flash | 110ms | Vertex flash |

### Rhythm3DAdapter & Groove System

The **Rhythm3DAdapter** bridges the RhythmEngine with 3D animation for audio-reactive groove animations.

#### Core Concepts

1. **Frame-Rate Independence**: Groove uses absolute `beatProgress`/`barProgress` from RhythmEngine (performance.now() based), NOT accumulated frame deltas.

2. **Groove Presets**: Three distinct groove personalities:
   - `groove1`: Subtle, elegant - gentle bounce and sway (default)
   - `groove2`: Energetic, bouncy - pronounced vertical motion
   - `groove3`: Smooth, flowing - emphasis on rotation and sway

3. **Seamless Morphing**: Transition between presets over specified bars or duration.

#### Groove Preset Parameters

| Preset | Bounce | Sway | Pulse | Rotation | Character |
|--------|--------|------|-------|----------|-----------|
| **groove1** | 0.015 | 0.012 | 0.02 | 0.015 | Subtle, elegant |
| **groove2** | 0.035 | 0.02 | 0.045 | 0.025 | Energetic, bouncy |
| **groove3** | 0.01 | 0.03 | 0.015 | 0.04 | Smooth, flowing |

#### Public API

```javascript
// Set groove preset (immediate)
mascot.setGroove('groove2');

// Morph to preset over 2 bars
mascot.setGroove('groove3', { bars: 2 });

// Morph over specific duration
mascot.setGroove('groove1', { duration: 3 });

// Query presets
mascot.getGroovePresets();  // ['groove1', 'groove2', 'groove3']
mascot.getCurrentGroove();  // 'groove1'

// Enable/disable
mascot.enableGroove();
mascot.disableGroove();
```

### 3D File Structure

```
src/3d/
├── index.js                    # EmotiveMascot3D main class
├── Core3DManager.js            # Three.js orchestration
├── ThreeRenderer.js            # WebGL renderer setup
├── animation/
│   ├── ProceduralAnimator.js  # Gesture animations
│   ├── BreathingAnimator.js   # Breathing effect
│   ├── GestureBlender.js      # Multi-gesture composition
│   ├── BlinkAnimator.js       # Blinking system ⭐
│   ├── Rhythm3DAdapter.js     # Groove & rhythm sync ⭐
│   └── GeometryMorpher.js     # Shape transitions
├── behaviors/
│   ├── RotationBehavior.js    # Emotion-aware rotation
│   └── RightingBehavior.js    # Self-stabilization
├── geometries/
│   └── ThreeGeometries.js     # Geometry definitions + blink configs ⭐
└── utils/
    └── ColorUtilities.js      # Color conversion helpers
```

### Key Features

1. **API Compatibility**: Same API as 2D engine (`setEmotion()`, `express()`, `morphTo()`)
2. **Hybrid Rendering**: WebGL for 3D core + Canvas2D for particles
3. **Emotion-Aware Lighting**: Dynamic lighting based on emotion colors
4. **Post-Processing**: Optional bloom, glow, and shadow effects
5. **Performance**: Hardware-accelerated WebGL rendering
6. **Geometry Library**: 11 unique 3D shapes with smooth morphing
7. **Self-Stabilization**: Righting behavior keeps mascots upright
8. **Emotion-Aware Blinking**: Unique blink timing for each emotion

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
