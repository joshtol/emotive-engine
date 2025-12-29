# 3D Architecture Refactoring Plan

## Overview

Refactoring the 3D implementation to reduce god objects and improve separation of concerns.

**Current State:**
- Core3DManager.js: 2,335 lines (~125 methods)
- ThreeRenderer.js: 1,783 lines (~100 methods)
- index.js: 1,760 lines (~193 methods)

**Target State:**
- Core3DManager.js: ~1,000 lines
- ThreeRenderer.js: ~1,000 lines
- New focused manager classes: 6-10 files

---

## Phase 1: Critical Extractions (Core3DManager)

### 1.1 Extract AnimationManager ✅ COMPLETE
- [x] Create `src/3d/managers/AnimationManager.js`
- [x] Move gesture playback logic (`playGesture()`)
- [x] Move gesture cleanup and timeout management
- [x] Move virtual particle pool management
- [x] Move active animation tracking (MAX_ACTIVE_ANIMATIONS)
- [x] Move `updateGestures()` logic from render loop
- [x] Update Core3DManager to use AnimationManager
- [x] Test gesture playback still works (build passes)
- [x] Test gesture chaining still works (2,846 tests pass)

**Interface:**
```javascript
class AnimationManager {
    constructor(renderer, gestureBlender)
    playGesture(gestureName, gesture2D, duration)
    updateGestures(deltaTime, currentTime)
    hasActiveAnimations()
    getActiveGestureCount()
    cleanup()
    dispose()
}
```

### 1.2 Extract EffectManager (In Progress)
- [x] Create `src/3d/managers/EffectManager.js`
- [x] Add EffectManager import and initialization to Core3DManager
- [x] Add EffectManager dispose in destroy()
- [ ] Migrate SolarEclipse lifecycle management (currently parallel)
- [ ] Migrate LunarEclipse lifecycle management (currently parallel)
- [ ] Migrate CrystalSoul lifecycle management (currently parallel)
- [ ] Move effect initialization based on geometry type
- [ ] Move effect cleanup during morphs
- [ ] Move Bailey's Beads coordination
- [ ] Move caustics/blend layer management
- [ ] Update Core3DManager to use EffectManager
- [ ] Test solar eclipse transitions
- [ ] Test lunar eclipse (blood moon)
- [ ] Test crystal soul effects

**Interface:**
```javascript
class EffectManager {
    constructor(renderer)
    initializeForGeometry(geometryType, geometry, customMaterial)
    setSolarEclipse(eclipseType, options)
    setLunarEclipse(eclipseType, options)
    setBloodMoonBlend(params)
    setCrystalSoulEffects(params)
    update(deltaTime)
    disposeEffects()
    dispose()
}
```

### 1.3 Extract MorphingStateMachine
- [ ] Create `src/3d/managers/MorphingStateMachine.js`
- [ ] Move morph state tracking (idle, morphing, waiting)
- [ ] Move geometry morphing animation logic
- [ ] Move material swapping during morph
- [ ] Move async geometry loading coordination
- [ ] Move morph timing and duration management
- [ ] Move `getMorphState()` and `isMorphing()` queries
- [ ] Update Core3DManager to use MorphingStateMachine
- [ ] Test shape morphing (circle -> star -> heart)
- [ ] Test material variant morphing
- [ ] Test morph cancellation/interruption

**Interface:**
```javascript
class MorphingStateMachine {
    constructor(renderer, geometryMorpher, effectManager)
    morphToShape(targetShape, duration, materialVariant)
    update(deltaTime)
    getState() // 'idle' | 'morphing' | 'completing'
    isMorphing()
    getMorphProgress()
    cancelMorph()
    dispose()
}
```

---

## Phase 2: High Priority Extractions

### 2.1 Extract BehaviorController
- [ ] Create `src/3d/managers/BehaviorController.js`
- [ ] Move RotationBehavior creation and updates
- [ ] Move RightingBehavior application
- [ ] Move FacingBehavior (moon tidal lock) management
- [ ] Move wobble state management
- [ ] Move behavior-specific quaternion math
- [ ] Move emotion-based behavior configuration
- [ ] Update Core3DManager to use BehaviorController
- [ ] Test rotation behavior per geometry type
- [ ] Test righting behavior (self-stabilization)
- [ ] Test moon tidal lock facing

**Interface:**
```javascript
class BehaviorController {
    constructor(rhythmEngine)
    setRotationBehavior(config, geometryType)
    updateRotation(deltaTime, emotionData, undertone)
    applyRighting(deltaTime)
    applyFacing(deltaTime, moonGeometry)
    setWobbleEnabled(enabled)
    getQuaternionDelta()
    dispose()
}
```

### 2.2 Extract BreathingPhaseManager
- [ ] Create `src/3d/managers/BreathingPhaseManager.js`
- [ ] Move breathing phase state tracking
- [ ] Move phase animation (inhale/hold/exhale)
- [ ] Move scale interpolation logic
- [ ] Move duration management
- [ ] Move `breathePhase()` API
- [ ] Update Core3DManager to use BreathingPhaseManager
- [ ] Test breathing phase transitions
- [ ] Test meditation mode breathing

**Interface:**
```javascript
class BreathingPhaseManager {
    constructor()
    startPhase(phase, durationSec) // phase: 'inhale' | 'hold' | 'exhale'
    stopPhase()
    isActive()
    update(deltaTime)
    getScaleMultiplier()
    dispose()
}
```

### 2.3 Extract RenderingPipeline (from ThreeRenderer)
- [ ] Create `src/3d/rendering/RenderingPipeline.js`
- [ ] Move EffectComposer setup
- [ ] Move bloom pass configuration
- [ ] Move layer-based rendering logic
- [ ] Move glow layer management
- [ ] Move clear/render sequencing
- [ ] Move tone mapping configuration
- [ ] Update ThreeRenderer to use RenderingPipeline
- [ ] Test bloom effects
- [ ] Test glow layer separation
- [ ] Test post-processing chain

**Interface:**
```javascript
class RenderingPipeline {
    constructor(renderer, scene, camera)
    setupPostProcessing(options)
    setBloomIntensity(intensity)
    setBloomThreshold(threshold)
    setBloomRadius(radius)
    render()
    resize(width, height)
    dispose()
}
```

---

## Phase 3: Medium Priority Extractions

### 3.1 Extract ShaderUniformManager
- [ ] Create `src/3d/managers/ShaderUniformManager.js`
- [ ] Move centralized uniform value setting
- [ ] Add type validation for uniforms
- [ ] Add range clamping
- [ ] Add batch uniform updates
- [ ] Add per-geometry uniform defaults
- [ ] Update Core3DManager to use ShaderUniformManager
- [ ] Update ThreeRenderer to use ShaderUniformManager
- [ ] Test uniform updates don't break shaders

**Interface:**
```javascript
class ShaderUniformManager {
    constructor()
    setUniform(material, name, value, options)
    setUniforms(material, uniforms)
    getUniform(material, name)
    validateUniform(name, value, type)
    clampUniform(name, value, min, max)
}
```

### 3.2 Extract ParticleEffectCoordinator
- [ ] Create `src/3d/managers/ParticleEffectCoordinator.js`
- [ ] Move emotion-to-particle-config mapping
- [ ] Move gesture-based particle effects
- [ ] Move particle system visibility control
- [ ] Move particle pool management
- [ ] Update Core3DManager to use ParticleEffectCoordinator
- [ ] Test particle effects per emotion
- [ ] Test gesture particle bursts

**Interface:**
```javascript
class ParticleEffectCoordinator {
    constructor(particleOrchestrator)
    setEmotionConfig(emotion, undertone)
    triggerGestureEffect(gestureName, intensity)
    setVisibility(visible)
    update(deltaTime)
    dispose()
}
```

### 3.3 Extract CameraPresetManager (from ThreeRenderer)
- [ ] Create `src/3d/rendering/CameraPresetManager.js`
- [ ] Move preset definitions (front, back, side, etc.)
- [ ] Move camera animation logic
- [ ] Move easing functions for camera
- [ ] Move control state management during presets
- [ ] Update ThreeRenderer to use CameraPresetManager
- [ ] Test camera preset transitions
- [ ] Test auto-rotate with presets

**Interface:**
```javascript
class CameraPresetManager {
    constructor(camera, controls)
    setPreset(presetName, duration, easing)
    getAvailablePresets()
    isAnimating()
    cancelAnimation()
    dispose()
}
```

### 3.4 Extract MaterialVariantManager (from ThreeRenderer)
- [ ] Create `src/3d/rendering/MaterialVariantManager.js`
- [ ] Move material mode switching (glow <-> glass)
- [ ] Move variant application logic
- [ ] Move custom material integration
- [ ] Move material creation delegation
- [ ] Update ThreeRenderer to use MaterialVariantManager
- [ ] Test glass material mode
- [ ] Test glow material mode
- [ ] Test material switching during morph

**Interface:**
```javascript
class MaterialVariantManager {
    constructor(materialFactory)
    setMode(mode) // 'glow' | 'glass'
    getMode()
    applyVariant(mesh, variant)
    createMaterial(type, options)
    dispose()
}
```

---

## Phase 4: Secondary Refactoring

### 4.1 Refactor Particle3DTranslator
- [ ] Extract behavior translators to separate module
- [ ] Create `src/3d/particles/translators/` directory
- [ ] Move OrbitingTranslator
- [ ] Move BouncingTranslator
- [ ] Move FloatingTranslator
- [ ] Move ShockwaveTranslator
- [ ] Create ParticleTranslatorFactory
- [ ] Update Particle3DTranslator to use factory
- [ ] Test all particle behaviors still work

### 4.2 Refactor SolarEclipse
- [ ] Create `src/3d/effects/eclipse/ShadowDiskRenderer.js`
- [ ] Create `src/3d/effects/eclipse/CoronaRenderer.js`
- [ ] Move shadow disk creation/management
- [ ] Move corona disk creation (2 versions)
- [ ] Integrate BaileysBeads better
- [ ] Update SolarEclipse as orchestrator only
- [ ] Test full solar eclipse sequence

---

## Testing Checklist

After each phase, verify:

- [ ] All 2,846 existing tests pass
- [ ] 3D demo page loads without errors
- [ ] Emotion transitions work
- [ ] Gesture playback works
- [ ] Shape morphing works
- [ ] Eclipse effects work
- [ ] Particle effects work
- [ ] Camera controls work
- [ ] No console errors

---

## Progress Tracking

| Phase | Status | Lines Removed | New Files |
|-------|--------|---------------|-----------|
| 1.1 AnimationManager | ✅ Complete | ~200 | 1 |
| 1.2 EffectManager | 🔄 In Progress | ~250 | 1 |
| 1.3 MorphingStateMachine | Not Started | ~200 | 1 |
| 2.1 BehaviorController | 🔄 In Progress | ~150 | 1 |
| 2.2 BreathingPhaseManager | 🔄 In Progress | ~100 | 1 |
| 2.3 RenderingPipeline | Not Started | ~300 | 1 |
| 3.1 ShaderUniformManager | Not Started | ~150 | 1 |
| 3.2 ParticleEffectCoordinator | Not Started | ~100 | 1 |
| 3.3 CameraPresetManager | 🔄 In Progress | ~80 | 1 |
| 3.4 MaterialVariantManager | Not Started | ~100 | 1 |
| 4.1 Particle3DTranslator | Not Started | ~400 | 5 |
| 4.2 SolarEclipse | Not Started | ~400 | 2 |
| **Total** | | **~2,430** | **17** |

---

## Notes

- Each extraction should be a separate commit
- Run tests after each extraction
- Update imports in all affected files
- Maintain backward compatibility of public API
- Document any API changes in the manager classes
