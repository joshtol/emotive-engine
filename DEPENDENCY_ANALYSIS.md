# Manager Dependency Refactoring

## Overview

37 manager files with 652 `this.mascot.*` references. Goal: inject dependencies
instead of passing `mascot`.

## Progress

- [x] Phase 1: Create CoreContext and SharedState interfaces
- [x] Phase 2: Refactor clean managers (0-2 deps)
- [ ] Phase 3: Refactor by domain
- [ ] Phase 4: Expose managers via namespace getters
- [ ] Phase 5: Delete proxy methods from EmotiveMascot.js

## Dependency Categories

### Core Systems (should be injected)

- `renderer` - 105 refs - The main rendering engine
- `errorBoundary` - 50 refs - Error handling wrapper
- `stateMachine` - 30 refs - Emotion state machine
- `particleSystem` - 28 refs - Particle effects
- `canvasManager` - 24 refs - Canvas operations
- `animationController` - 24 refs - Animation loop
- `config` - 23 refs - Configuration object
- `eventManager` - 13 refs - Event emitter

### State Properties (should be on a shared state object)

- `speaking` - 16 refs
- `isRunning` - 13 refs
- `debugMode` - 12 refs
- `sleeping` - 6 refs
- `recording` - 2 refs
- `audioLevel` - 3 refs

### Sibling Managers (circular dependency smell)

- `soundSystem` - 19 refs
- `idleBehavior` - 16 refs
- `degradationManager` - 15 refs
- `audioLevelProcessor` - 15 refs
- `gazeTracker` - 13 refs
- `shapeMorpher` - 25 refs
- `positionController` - 18 refs

### Methods Called on Mascot (should be events or callbacks)

- `emit` - 29 refs
- `express` - 6 refs
- Various getters

---

## Per-Manager Dependencies

### Animation Domain

**BreathingAnimationController** (5 deps)

- `breathePattern` - state
- `breathingAnimationId` - state
- `emit` - event
- `isRunning` - state
- `renderer` - core

**BreathingPatternManager** (5 deps)

- `breathePattern` - state
- `breathingAnimationId` - state
- `errorBoundary` - core
- `renderer` - core
- `startBreathingAnimation` - method call (circular)

**OrbScaleAnimator** (4 deps)

- `currentOrbScale` - state
- `errorBoundary` - core
- `isRunning` - state
- `renderer` - core

### Audio Domain

**AudioHandler** (9 deps)

- `audioAnalyzer` - sibling
- `audioLevelProcessor` - sibling
- `config` - core
- `emit` - event
- `renderer` - core
- `shapeMorpher` - sibling
- `soundSystem` - sibling
- `speaking` - state
- `stateMachine` - core

**AudioLevelCallbackManager** (5 deps)

- `audioLevelProcessor` - sibling
- `emit` - event
- `express` - method (circular)
- `particleSystem` - core
- `renderer` - core

**SpeechManager** (8 deps)

- `audioHandler` - sibling
- `audioLevelProcessor` - sibling
- `config` - core
- `emit` - event
- `errorBoundary` - core
- `renderer` - core
- `setTTSSpeaking` - method (circular)
- `speaking` - state

**SpeechReactivityManager** (6 deps)

- `audioAnalyser` - sibling
- `audioLevel` - state
- `audioLevelProcessor` - sibling
- `emit` - event
- `errorBoundary` - core
- `speaking` - state

**TTSManager** (5 deps)

- `renderer` - core
- `speaking` - state
- `speechManager` - sibling
- `tts` - sibling
- `ttsSpeaking` - state

### Control Domain

**AnimationFrameController** (5 deps)

- `animationController` - core
- `config` - core
- `emit` - event
- `errorBoundary` - core
- `positionController` - sibling

**ExecutionLifecycleManager** (7 deps)

- `animationController` - core
- `emit` - event
- `errorBoundary` - core
- `isRunning` - state
- `soundSystem` - sibling
- `stateMachine` - core
- `visualizationRunner` - sibling

**GestureController** (7 deps)

- `config` - core
- `currentModularGesture` - state
- `errorBoundary` - core
- `performanceMonitor` - sibling
- `renderer` - core
- `soundSystem` - sibling
- `throttledWarn` - method

**VisualizationRunner** (17 deps) ⚠️ HIGH

- `animationController` - core
- `audioHandler` - sibling
- `audioLevelProcessor` - sibling
- `canvas` - core
- `canvasManager` - core
- `config` - core
- `degradationManager` - sibling
- `emit` - event
- `gazeTracker` - sibling
- `idleBehavior` - sibling
- `isRunning` - state
- `particleSystem` - core
- `pluginSystem` - sibling
- `renderer` - core
- `speaking` - state
- `stateMachine` - core

### Events Domain

**EventListenerManager** (2 deps) ✅ SIMPLE

- `errorBoundary` - core
- `eventManager` - core

### Integration Domain

**LLMIntegrationBridge** (2 deps) ✅ SIMPLE

- `errorBoundary` - core
- `llmHandler` - state

### Performance Domain

**DegradationEventHandler** (0 deps) ✅ CLEAN

- Uses constructor injection already!

**PerformanceBehaviorManager** (5 deps)

- `diagnosticsManager` - sibling
- `emotionalStateQueryManager` - sibling
- `errorBoundary` - core
- `frustrationContextManager` - sibling
- `performanceSystem` - sibling

**PerformanceMonitoringManager** (7 deps)

- `animationController` - core
- `animationFrameController` - sibling
- `config` - core
- `degradationManager` - sibling
- `diagnosticsManager` - sibling
- `healthCheckManager` - sibling
- `particleSystem` - core

### Rendering Domain

**CanvasResizeManager** (4 deps)

- `emit` - event
- `particleSystem` - core
- `renderer` - core
- `stateMachine` - core

**DebugInfoRenderer** (8 deps)

- `animationController` - core
- `audioLevel` - state
- `canvasManager` - core
- `config` - core
- `currentModularGesture` - state
- `particleSystem` - core
- `speaking` - state
- `stateMachine` - core

**GestureMotionProvider** (2 deps) ✅ SIMPLE

- `currentModularGesture` - state
- `renderer` - core

**OffsetPositionManager** (2 deps) ✅ SIMPLE

- `errorBoundary` - core
- `positionController` - sibling

**ParticleConfigCalculator** (4 deps)

- `canvasManager` - core
- `config` - core
- `renderer` - core
- `stateMachine` - core

**RenderLayerOrchestrator** (8 deps)

- `canvasManager` - core
- `config` - core
- `debugMode` - state
- `particleSystem` - core
- `pluginSystem` - sibling
- `renderDebugInfo` - method (circular)
- `renderer` - core
- `stateMachine` - core

**RenderStateBuilder** (7 deps)

- `animationController` - core
- `audioLevelProcessor` - sibling
- `debugMode` - state
- `gazeTracker` - sibling
- `particleSystem` - core
- `speaking` - state
- `stateMachine` - core

**ShapeTransformManager** (4 deps)

- `emit` - event
- `errorBoundary` - core
- `renderer` - core
- `shapeMorpher` - sibling

**ThreatLevelCalculator** (3 deps)

- `canvasManager` - core
- `config` - core
- `gazeTracker` - sibling

**VisualTransformationManager** (3 deps)

- `canvasResizeManager` - sibling
- `offsetPositionManager` - sibling
- `shapeTransformManager` - sibling

### State Domain

**EmotionalStateQueryManager** (4 deps)

- `contextManager` - sibling
- `errorBoundary` - core
- `performanceSystem` - sibling
- `stateMachine` - core

**FrustrationContextManager** (2 deps) ✅ SIMPLE

- `contextManager` - sibling
- `errorBoundary` - core

**RecordingStateManager** (4 deps)

- `emit` - event
- `errorBoundary` - core
- `recording` - state
- `renderer` - core

**SleepWakeManager** (6 deps)

- `emit` - event
- `errorBoundary` - core
- `express` - method (circular)
- `idleBehavior` - sibling
- `renderer` - core
- `sleeping` - state

**StateCoordinator** (7 deps)

- `canvasManager` - core
- `config` - core
- `emit` - event
- `particleSystem` - core
- `renderer` - core
- `soundSystem` - sibling
- `stateMachine` - core

### System Domain

**ConfigurationManager** (0 deps) ✅ CLEAN

**DestructionManager** (19 deps) ⚠️ HIGHEST

- Needs access to everything for cleanup

**DiagnosticsManager** (12 deps)

- Many getters for status reporting

**HealthCheckManager** (6 deps)

- `accessibilityManager` - sibling
- `config` - core
- `diagnosticsManager` - sibling
- `errorBoundary` - core
- `mobileOptimization` - sibling
- `systemStatusReporter` - sibling

**InitializationManager** (57 deps) ⚠️ EXPECTED

- Creates and wires everything - this is its job

**SystemStatusReporter** (10 deps)

- Reads from many systems for status

---

## Refactoring Strategy

### Phase 1: Create Shared Contexts

```javascript
// Core context - injected into all managers
const coreContext = {
    renderer,
    errorBoundary,
    stateMachine,
    particleSystem,
    canvasManager,
    animationController,
    config,
    eventManager,
};

// Shared state - observable/reactive
const sharedState = {
    speaking: false,
    isRunning: false,
    debugMode: false,
    sleeping: false,
    recording: false,
    audioLevel: 0,
    currentModularGesture: null,
};
```

### Phase 2: Convert emit() to EventEmitter injection

Instead of `this.mascot.emit('event', data)`:

```javascript
constructor(deps) {
    this.events = deps.eventEmitter;
}
// Then:
this.events.emit('event', data);
```

### Phase 3: Break Circular Method Calls

Methods like `express`, `startBreathingAnimation` should become:

- Events that the parent listens to, OR
- Callbacks passed in constructor

### Phase 4: Facade Managers for Sibling Access

Group related managers under domain facades:

```javascript
// Audio domain
const audio = {
    analyzer: audioAnalyzer,
    processor: audioLevelProcessor,
    sound: soundSystem
};

// Inject the domain, not individual siblings
constructor(deps) {
    this.audio = deps.audio;
}
```

---

## Phase 2: Clean Managers (0-2 deps)

- [ ] **DegradationEventHandler** - 0 deps (already clean!)
- [ ] **ConfigurationManager** - 0 deps
- [x] **EventListenerManager** - 2 deps (errorBoundary, eventManager) ✅
- [ ] **LLMIntegrationBridge** - 2 deps (errorBoundary, llmHandler)
- [ ] **GestureMotionProvider** - 2 deps (currentModularGesture, renderer)
- [ ] **OffsetPositionManager** - 2 deps (errorBoundary, positionController)
- [ ] **FrustrationContextManager** - 2 deps (contextManager, errorBoundary)

## Phase 3: By Domain

### Events Domain

- [x] **EventListenerManager** - 2 deps ✅ refactored

### State Domain

- [ ] **FrustrationContextManager** - 2 deps
- [ ] **EmotionalStateQueryManager** - 4 deps
- [ ] **RecordingStateManager** - 4 deps
- [ ] **SleepWakeManager** - 6 deps
- [ ] **StateCoordinator** - 7 deps

### Rendering Domain

- [ ] **GestureMotionProvider** - 2 deps
- [ ] **OffsetPositionManager** - 2 deps
- [ ] **ThreatLevelCalculator** - 3 deps
- [ ] **VisualTransformationManager** - 3 deps
- [ ] **CanvasResizeManager** - 4 deps
- [ ] **ParticleConfigCalculator** - 4 deps
- [ ] **ShapeTransformManager** - 4 deps
- [ ] **RenderStateBuilder** - 7 deps
- [ ] **DebugInfoRenderer** - 8 deps
- [ ] **RenderLayerOrchestrator** - 8 deps

### Animation Domain

- [ ] **OrbScaleAnimator** - 4 deps
- [ ] **BreathingAnimationController** - 5 deps
- [ ] **BreathingPatternManager** - 5 deps

### Audio Domain

- [ ] **TTSManager** - 5 deps
- [ ] **AudioLevelCallbackManager** - 5 deps
- [ ] **SpeechReactivityManager** - 6 deps
- [ ] **SpeechManager** - 8 deps
- [ ] **AudioHandler** - 9 deps

### Control Domain

- [ ] **AnimationFrameController** - 5 deps
- [ ] **GestureController** - 7 deps
- [ ] **ExecutionLifecycleManager** - 7 deps
- [ ] **VisualizationRunner** - 17 deps

### Performance Domain

- [ ] **DegradationEventHandler** - 0 deps ✅ already clean
- [ ] **PerformanceBehaviorManager** - 5 deps
- [ ] **PerformanceMonitoringManager** - 7 deps

### Integration Domain

- [ ] **LLMIntegrationBridge** - 2 deps

### Debug Domain

- [ ] **DebugProfilingManager** - 2 deps

### System Domain (last - these are special)

- [ ] **ConfigurationManager** - 0 deps ✅ already clean
- [ ] **HealthCheckManager** - 6 deps
- [ ] **SystemStatusReporter** - 10 deps
- [ ] **DiagnosticsManager** - 12 deps
- [ ] **DestructionManager** - 19 deps (keep as-is, needs everything)
- [ ] **InitializationManager** - 57 deps (becomes DI container)

---

## Phase 4: Expose via Namespace Getters

- [ ] Add `get events()` → EventListenerManager
- [ ] Add `get emotion()` → StateCoordinator
- [ ] Add `get gesture()` → GestureController
- [ ] Add `get visual()` → VisualTransformationManager
- [ ] Add `get audio()` → SpeechReactivityManager
- [ ] Add `get tts()` → TTSManager
- [ ] Add `get performance()` → PerformanceMonitoringManager
- [ ] Add `get debug()` → DebugProfilingManager
- [ ] Add `get llm()` → LLMIntegrationBridge
- [ ] Add `get lifecycle()` → ExecutionLifecycleManager
- [ ] Add `get context()` → FrustrationContextManager

## Phase 5: Delete Proxy Methods

- [ ] Remove ~85 proxy methods from EmotiveMascot.js
- [ ] Update site demos (~55 files, ~324 occurrences)
- [ ] Update tests (~6 files, ~278 occurrences)
- [ ] Verify build passes
- [ ] Verify all tests pass

---

## Notes

- **DestructionManager** stays as-is (cleanup needs access to everything)
- **InitializationManager** becomes the DI container (57 deps expected)
