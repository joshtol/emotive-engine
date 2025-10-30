# Codebase Reorganization Plan

## Goals

- Reduce flat directory structures
- Group related files by concern
- Improve discoverability
- Maintain all tests passing

---

## Part 1: Reorganize `src/core/` (40 → 10 root files)

### Create New Subdirectories

#### `src/core/audio/`

Move audio-related files:

- AudioAnalyzer.js
- AudioLevelProcessor.js
- SoundSystem.js
- rhythm.js
- rhythmIntegration.js
- MusicTheory.js
- MusicalDuration.js
- GrooveTemplates.js
- HarmonicSystem.js

#### `src/core/state/`

Move state management:

- EmotiveStateMachine.js
- StateStore.js
- ContextManager.js

#### `src/core/events/`

Move event/error handling:

- EventManager.js
- ErrorBoundary.js
- ErrorLogger.js
- ErrorResponse.js
- ErrorTracker.js

#### `src/core/canvas/`

Move canvas management:

- CanvasManager.js

#### `src/core/system/`

Move system/performance:

- PerformanceMonitor.js
- DegradationManager.js
- HealthCheck.js
- SimpleFPSCounter.js
- FeatureFlags.js
- SecurityManager.js

#### `src/core/optimization/`

Move optimization:

- MobileOptimization.js
- AccessibilityManager.js
- LazyLoader.js

#### `src/core/plugins/`

Move plugins/extensions:

- PluginSystem.js
- PerformanceSystem.js
- SequenceExecutor.js

#### `src/core/behavior/`

Move behavior:

- IdleBehavior.js
- GazeTracker.js

#### `src/core/integration/`

Move integrations:

- LLMResponseHandler.js
- llm-templates.js

### Keep at Root

Main controllers/systems:

- AnimationController.js
- AnimationLoopManager.js
- ParticleSystem.js
- EmotiveRenderer.js
- ShapeMorpher.js
- GestureScheduler.js
- GestureCompositor.js
- GestureCompatibility.js
- Particle.js

---

## Part 2: Reorganize `src/mascot/` (21 → organized by concern)

### Create New Subdirectories

#### `src/mascot/rendering/`

Move render-related managers:

- RenderStateBuilder.js
- RenderLayerOrchestrator.js
- DebugInfoRenderer.js
- ThreatLevelCalculator.js
- ParticleConfigCalculator.js
- GestureMotionProvider.js

#### `src/mascot/animation/`

Move animation managers:

- BreathingAnimationController.js
- BreathingPatternManager.js
- OrbScaleAnimator.js

#### `src/mascot/audio/`

Move audio managers:

- AudioHandler.js
- SpeechManager.js
- AudioLevelCallbackManager.js

#### `src/mascot/state/`

Move state managers:

- StateCoordinator.js
- RecordingStateManager.js
- SleepWakeManager.js

#### `src/mascot/system/`

Move system managers:

- InitializationManager.js
- ConfigurationManager.js
- DestructionManager.js
- SystemStatusReporter.js

#### `src/mascot/control/`

Move control managers:

- GestureController.js
- VisualizationRunner.js

---

## Implementation Plan

### Phase 1: Create Directory Structure

```bash
mkdir -p src/core/{audio,state,events,canvas,system,optimization,plugins,behavior,integration}
mkdir -p src/mascot/{rendering,animation,audio,state,system,control}
```

### Phase 2: Move Files (use git mv for history preservation)

- Move each file to new location
- Files will be moved in batches by category

### Phase 3: Update Imports

- Scan all .js files for imports
- Update import paths to new locations
- Files to check:
    - src/EmotiveMascot.js
    - src/EmotiveMascotPublic.js
    - All files in src/core/
    - All files in src/mascot/
    - Test files

### Phase 4: Verification

- Run `npm test` - all 2,827 tests must pass
- Run `npm run build` - all bundles must build
- Run `npm run lint` - no errors

### Phase 5: Commit

Single atomic commit with message: "refactor: reorganize src/core and src/mascot
directory structure"

---

## Estimated Impact

### Before

- src/core/: ~40 files at root
- src/mascot/: 21 files at root
- **Total: 61 files to navigate**

### After

- src/core/: ~10 files at root + 9 organized subdirs
- src/mascot/: 0 files at root + 6 organized subdirs
- **Total: 10 files + 15 logical groupings**

### Benefits

- ✅ 83% reduction in root-level files
- ✅ Clear separation of concerns
- ✅ Easier to find related files
- ✅ Better mental model of architecture
- ✅ Easier onboarding for new developers

---

## Risk Mitigation

- Use `git mv` to preserve file history
- Update imports programmatically where possible
- Run full test suite after each phase
- Keep bundle size limits
- Single atomic commit (easy to revert if needed)
