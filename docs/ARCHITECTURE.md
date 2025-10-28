# Architecture Overview

This document provides a high-level overview of the Emotive Engine architecture, helping you understand how the system works and where to find things.

## Table of Contents

- [System Overview](#system-overview)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Initialization Sequence](#initialization-sequence)
- [Key Files Map](#key-files-map)
- [Directory Structure](#directory-structure)
- [Extension Points](#extension-points)

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

## Core Components

### 1. **EmotiveMascot** (Public API)
- **File**: [src/EmotiveMascotPublic.js](../src/EmotiveMascotPublic.js)
- **Purpose**: Main entry point for users
- **Key Methods**: `init()`, `start()`, `setEmotion()`, `express()`, `morphTo()`
- **Complexity**: ⭐⭐ Intermediate (wraps internal orchestrator)

### 2. **EmotiveMascot** (Internal Orchestrator)
- **File**: [src/EmotiveMascot.js](../src/EmotiveMascot.js)
- **Purpose**: Coordinates all internal systems
- **Size**: 3,096 lines (largest file in codebase)
- **Complexity**: ⭐⭐⭐⭐ Advanced (core orchestration logic)
- **Note**: Most contributors won't need to modify this file

### 3. **StateCoordinator**
- **File**: [src/mascot/StateCoordinator.js](../src/mascot/StateCoordinator.js)
- **Purpose**: Validates and coordinates state changes
- **Complexity**: ⭐⭐⭐ Intermediate-Advanced

### 4. **GestureController**
- **File**: [src/mascot/GestureController.js](../src/mascot/GestureController.js)
- **Purpose**: Selects and executes gestures based on emotional state
- **Complexity**: ⭐⭐⭐ Intermediate-Advanced

### 5. **ParticleSystem**
- **Directory**: [src/core/particles/](../src/core/particles/)
- **Purpose**: Creates, updates, and manages particles
- **Key Files**:
  - [ParticleSystem.js](../src/core/particles/ParticleSystem.js) - Main system
  - [ParticleBehaviors.js](../src/core/particles/behaviors/ParticleBehaviors.js) - Movement patterns
  - [ParticlePool.js](../src/core/particles/ParticlePool.js) - Object pooling for performance
- **Complexity**: ⭐⭐⭐⭐ Advanced

### 6. **EmotiveRenderer**
- **File**: [src/core/renderer/EmotiveRenderer.js](../src/core/renderer/EmotiveRenderer.js)
- **Purpose**: Handles all canvas drawing operations
- **Size**: >150KB (very large)
- **Complexity**: ⭐⭐⭐⭐ Advanced (heavy canvas/WebGL logic)

### 7. **VisualizationRunner**
- **File**: [src/mascot/VisualizationRunner.js](../src/mascot/VisualizationRunner.js)
- **Purpose**: Runs visual effects and animations
- **Complexity**: ⭐⭐⭐ Intermediate-Advanced

### 8. **AudioHandler**
- **File**: [src/mascot/AudioHandler.js](../src/mascot/AudioHandler.js)
- **Purpose**: Processes audio input and syncs to BPM
- **Complexity**: ⭐⭐⭐⭐ Advanced (Web Audio API)

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
[GestureController] Selects appropriate gesture for 'joy'
       │
       ▼
[GestureCompositor] Builds gesture sequence
       │
       ▼
[ParticleSystem] Generates particles with emotion-specific parameters
       │                 (color, speed, patterns, etc.)
       ▼
[EmotiveRenderer] Draws particles to canvas
       │
       ▼
[Canvas] User sees joyful animation (bright colors, upward movement)
```

### Gesture Execution Flow

```
GestureController.executeGesture('wave')
       │
       ▼
[GestureScheduler] Schedules gesture in queue
       │
       ▼
[SequenceExecutor] Breaks gesture into phases
       │                 (intro → main → outro)
       ▼
[ParticleSystem] Spawns particles for each phase
       │
       ▼
[ParticleBehaviors] Applies movement patterns
       │                 (wave pattern, gravity, attraction)
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
[PerformanceMonitor] Checks FPS, adjusts quality if needed
       │
       ▼
[ParticleSystem] Updates all active particles
       │                 - Apply forces
       │                 - Update positions
       │                 - Remove dead particles
       ▼
[EffectsManager] Apply visual effects (trails, glows, etc.)
       │
       ▼
[EmotiveRenderer] Clear canvas → Draw particles → Apply post-processing
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

When you call `mascot.init()`, here's what happens:

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
   - Sets up spatial indexing
       │
       ▼
5. GestureController.loadGestures()
   - Loads gesture definitions
   - Builds gesture index
       │
       ▼
6. StateCoordinator.init()
   - Sets initial state (usually 'neutral')
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

## Key Files Map

Understanding what each major file does:

| File | Purpose | When You'd Edit It | Complexity |
|------|---------|-------------------|------------|
| [EmotiveMascotPublic.js](../src/EmotiveMascotPublic.js) | Public API wrapper | Adding new public methods | ⭐⭐ |
| [EmotiveMascot.js](../src/EmotiveMascot.js) | Core orchestrator | Rarely (system-wide changes) | ⭐⭐⭐⭐ |
| [StateCoordinator.js](../src/mascot/StateCoordinator.js) | State management | Changing state logic | ⭐⭐⭐ |
| [GestureController.js](../src/mascot/GestureController.js) | Gesture execution | Adding gesture features | ⭐⭐⭐ |
| [EmotiveRenderer.js](../src/core/renderer/EmotiveRenderer.js) | Canvas rendering | Changing visual output | ⭐⭐⭐⭐ |
| [ParticleSystem.js](../src/core/particles/ParticleSystem.js) | Particle management | Particle behavior changes | ⭐⭐⭐⭐ |
| [VisualizationRunner.js](../src/mascot/VisualizationRunner.js) | Effect orchestration | Adding new effects | ⭐⭐⭐ |
| [AudioHandler.js](../src/mascot/AudioHandler.js) | Audio processing | Audio sync features | ⭐⭐⭐⭐ |
| [ConfigurationManager.js](../src/mascot/ConfigurationManager.js) | Config handling | Adding config options | ⭐⭐ |
| [LLMResponseHandler.js](../src/sdk/LLMResponseHandler.js) | AI integration | LLM response parsing | ⭐⭐ |

### Common Tasks & File Locations

| Task | Files to Look At |
|------|------------------|
| **Add a new emotion** | [src/core/emotions/states/](../src/core/emotions/states/), [src/config/emotionMap.js](../src/config/emotionMap.js) |
| **Create a custom gesture** | [src/core/gestures/definitions/](../src/core/gestures/definitions/) |
| **Change particle behavior** | [src/core/particles/behaviors/](../src/core/particles/behaviors/) |
| **Add a new shape** | [src/core/shapes/definitions/](../src/core/shapes/definitions/) |
| **Modify rendering** | [src/core/renderer/EmotiveRenderer.js](../src/core/renderer/EmotiveRenderer.js) |
| **Add performance optimization** | [src/core/utils/PerformanceMonitor.js](../src/core/utils/PerformanceMonitor.js), [src/core/utils/DegradationManager.js](../src/core/utils/DegradationManager.js) |
| **Extend LLM integration** | [src/sdk/LLMResponseHandler.js](../src/sdk/LLMResponseHandler.js) |
| **Add a plugin** | [src/plugins/](../src/plugins/) |

---

## Directory Structure

```
src/
├── core/                           # Core engine systems (223 files)
│   ├── animation/                  # Animation timing & interpolation
│   │   ├── AnimationLoopManager.js # Main animation loop
│   │   ├── BeatSynchronizer.js     # Musical time sync
│   │   └── easing/                 # Easing functions
│   │
│   ├── emotions/                   # Emotion system
│   │   ├── base/                   # Base emotion definitions
│   │   ├── states/                 # Individual emotion states (joy, calm, etc.)
│   │   ├── rhythm/                 # Rhythm modulation
│   │   └── EmotionModifier.js      # Emotion blending & transitions
│   │
│   ├── gestures/                   # Gesture system
│   │   ├── definitions/            # Individual gesture definitions
│   │   ├── GestureCompositor.js    # Combines gestures
│   │   ├── GestureScheduler.js     # Schedules gesture execution
│   │   └── SequenceExecutor.js     # Executes gesture sequences
│   │
│   ├── particles/                  # Particle system
│   │   ├── behaviors/              # Particle movement patterns
│   │   ├── ParticleSystem.js       # Main particle manager
│   │   ├── ParticlePool.js         # Object pooling
│   │   └── ParticleEmitter.js      # Particle spawning
│   │
│   ├── renderer/                   # Rendering system
│   │   ├── EmotiveRenderer.js      # Main renderer (large file!)
│   │   ├── GradientCache.js        # Performance optimization
│   │   └── CanvasPositioning.js    # Layout management
│   │
│   ├── shapes/                     # Shape morphing system
│   │   ├── definitions/            # Shape definitions (circle, heart, etc.)
│   │   └── ShapeMorpher.js         # Smooth shape transitions
│   │
│   ├── effects/                    # Visual effects
│   │   ├── EffectsManager.js       # Effect orchestration
│   │   ├── TrailEffect.js          # Particle trails
│   │   └── GlowEffect.js           # Glow effects
│   │
│   ├── performances/               # Semantic performance system (NEW in v2.5)
│   │   └── PerformanceChoreographer.js
│   │
│   └── utils/                      # Core utilities
│       ├── PerformanceMonitor.js   # FPS tracking
│       ├── DegradationManager.js   # Auto quality reduction
│       ├── ErrorBoundary.js        # Error handling
│       └── MobileOptimization.js   # Mobile-specific optimizations
│
├── mascot/                         # High-level orchestration
│   ├── StateCoordinator.js         # State management
│   ├── GestureController.js        # Gesture control
│   ├── VisualizationRunner.js      # Visual effect runner
│   ├── AudioHandler.js             # Audio processing
│   └── ConfigurationManager.js     # Configuration
│
├── sdk/                            # SDK helpers
│   └── LLMResponseHandler.js       # AI integration
│
├── plugins/                        # Plugin system
│   └── PluginManager.js            # Plugin orchestration
│
├── config/                         # Configuration files
│   ├── emotionMap.js               # Emotion definitions
│   ├── gestureLibrary.js           # Gesture library
│   └── defaultConfig.js            # Default settings
│
├── utils/                          # General utilities
│   ├── colorUtils.js               # Color manipulation
│   ├── mathUtils.js                # Math helpers
│   └── easing.js                   # Easing functions
│
├── EmotiveMascot.js                # Internal orchestrator (3,096 lines)
├── EmotiveMascotPublic.js          # Public API wrapper
└── index.js                        # Entry point
```

---

## Extension Points

The system is designed to be extensible. Here's how to add your own customizations:

### 1. Custom Emotions

```javascript
// Define in src/core/emotions/states/myEmotion.js
export const myEmotion = {
    name: 'energized', // Use a custom name (not an existing emotion)
    color: '#FF6B6B',
    particleSpeed: 5,
    particleCount: 100,
    // ... more parameters
};
```

### 2. Custom Gestures

```javascript
// Define in src/core/gestures/definitions/myGesture.js
export const myGesture = {
    name: 'spiral',
    duration: 2000,
    phases: [
        { type: 'spawn', pattern: 'circular', count: 50 },
        { type: 'animate', behavior: 'spiral-out' },
        { type: 'fadeout', duration: 500 }
    ]
};
```

### 3. Custom Particle Behaviors

```javascript
// Define in src/core/particles/behaviors/myBehavior.js
export function spiralBehavior(particle, deltaTime) {
    const angle = particle.age * 0.1;
    const radius = particle.age * 0.5;
    particle.x += Math.cos(angle) * radius * deltaTime;
    particle.y += Math.sin(angle) * radius * deltaTime;
}
```

### 4. Custom Shapes

```javascript
// Define in src/core/shapes/definitions/myShape.js
export const starShape = {
    name: 'star',
    points: 5,
    innerRadius: 0.4,
    outerRadius: 1.0,
    // ... path generation logic
};
```

### 5. Plugins

```javascript
// Create plugin in src/plugins/myPlugin.js
export class MyPlugin {
    constructor(mascot) {
        this.mascot = mascot;
    }

    init() {
        // Plugin initialization
        this.mascot.on('gesture', this.handleGesture);
    }

    handleGesture(data) {
        console.log('Gesture triggered:', data.name);
    }
}
```

---

## Performance Considerations

The engine includes several performance systems:

1. **Particle Pooling** - Reuses particle objects instead of creating new ones
2. **Gradient Caching** - Caches expensive gradient calculations
3. **Performance Monitor** - Tracks FPS and triggers degradation if needed
4. **Degradation Manager** - Automatically reduces particle count on slow devices
5. **Spatial Indexing** - Optimizes particle collision detection
6. **Mobile Optimization** - Reduces effects on mobile devices

### Performance Flow

```
[PerformanceMonitor] Tracks FPS every frame
       │
       ▼
FPS < 30 for 60 frames?
       │
       ├─ Yes ──▶ [DegradationManager] Reduce particle count by 20%
       │                                Disable expensive effects
       │
       └─ No ───▶ Continue normal operation
```

---

## Event System

The mascot emits events you can listen to (from [examples/event-handling.html](../examples/event-handling.html)):

```javascript
// Real events from working examples
mascot.on('gesture', (data) => {
    console.log('Gesture triggered:', data.name);
});

mascot.on('shapeMorphStarted', (data) => {
    console.log('Shape morphing:', data.from, '→', data.to);
});

mascot.on('resize', (data) => {
    console.log('Canvas resized:', data.width, 'x', data.height);
});

mascot.on('paused', () => {
    console.log('Animation paused');
});

mascot.on('resumed', () => {
    console.log('Animation resumed');
});
```

---

## Further Reading

- [CONTRIBUTING.md](../CONTRIBUTING.md) - How to contribute code
- [INNOVATIONS.md](INNOVATIONS.md) - Technical innovations and patents
- [CHANGELOG.md](../CHANGELOG.md) - Version history and API changes
- [examples/llm-integration/README.md](../examples/llm-integration/README.md) - LLM integration guide
- [README.md](../README.md) - Main project README

---

## Getting Help

- **For users**: See examples in [/examples](../examples/)
- **For contributors**: See [CONTRIBUTING.md](../CONTRIBUTING.md)
- **For bugs**: Open an issue on GitHub
- **For questions**: Check existing issues or open a discussion

---

*Last updated: 2025-10-27*
