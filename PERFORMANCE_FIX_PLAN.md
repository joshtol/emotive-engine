# Performance Fix Plan: 20fps Idle → 60fps Target

## Executive Summary

The engine runs at 20fps idle on desktop due to expensive per-frame operations
that should be conditional or removed. This plan addresses each issue in
priority order.

---

## Fix 1: Remove Debug Scene Validation (CRITICAL)

**File:** `src/3d/ThreeRenderer.js` lines 1335-1356

**Current Problem:**

```javascript
const validateObject = (obj, path) => {
    // Recursively traverses ENTIRE scene graph every frame
    for (let i = 0; i < obj.children.length; i++) {
        validateObject(child, `${path}.children[${i}]`);
    }
};
validateObject(this.scene, 'scene'); // EVERY FRAME
```

**Solution:** Remove entirely or gate behind debug flag.

```javascript
// Option A: Remove completely (recommended for production)
// DELETE lines 1335-1356

// Option B: Gate behind debug flag
if (this._debugValidateScene) {
    validateObject(this.scene, 'scene');
}
```

**Breaking Changes:** None - this is debug code that shouldn't affect behavior.

**Expected Impact:** ~15-25ms savings per frame

---

## Fix 2: Conditional Post-Processing Passes (HIGH)

**File:** `src/3d/ThreeRenderer.js` lines 1548-1638

**Current Problem:** Always runs 3-5 render passes even when features are
unused.

**Solution:** Add early-exit conditions for each pass.

```javascript
// Soul pass - already has hasSoul check, but can skip entire block
if (this.soulRenderTarget && hasSoul && this._hasSoulMesh) {
    // ... soul render pass
}

// Particle pass - skip if no particles exist
const hasActiveParticles = hasParticles && this._particleCount > 0;
if (hasActiveParticles && this.particleRenderTarget) {
    // ... particle render passes
}
```

**Breaking Changes:** None - same visual output, just skipped when not needed.

**Expected Impact:** ~5-15ms savings when features unused

---

## Fix 3: Reuse GestureBlender Accumulated Object (MEDIUM)

**File:** `src/3d/animation/GestureBlender.js` lines 60-114

**Current Problem:** Creates new `accumulated` object with 30+ properties every
frame.

**Solution:** Pre-allocate and reset instead of recreating.

```javascript
constructor() {
    // ... existing code ...

    // Pre-allocated accumulator (reset each frame instead of recreating)
    this._accumulated = {
        position: [0, 0, 0],
        cameraRelativePosition: [0, 0, 0],
        cameraRelativeRotation: [0, 0, 0],
        positionBoost: [0, 0, 0],
        rotationBoost: [0, 0, 0],
        nonUniformScale: [1.0, 1.0, 1.0],
        // ... all other properties with defaults
    };
}

blend(animations, currentTime, baseEuler, baseScale, baseGlowIntensity) {
    const accumulated = this._accumulated;

    // Reset to defaults (faster than object creation)
    accumulated.position[0] = 0;
    accumulated.position[1] = 0;
    accumulated.position[2] = 0;
    accumulated.scale = 1.0;
    accumulated.glowIntensity = 1.0;
    // ... reset all fields

    this.accumulatedRotationQuat.identity();
    accumulated.rotationQuat = this.accumulatedRotationQuat;

    // ... rest of blend logic
}
```

**Breaking Changes:** None - same API and behavior.

**Expected Impact:** ~2-5ms savings, reduced GC pressure

---

## Fix 4: Dispose Empty Element Pools (MEDIUM)

**File:** `src/3d/effects/ElementInstancedSpawner.js`

**Current Problem:** Pools persist indefinitely after gestures complete.

**Solution:** Add pool cleanup after timeout of inactivity.

```javascript
constructor(options = {}) {
    // ... existing code ...
    this._poolLastUsed = new Map();  // Track when each pool was last used
    this._poolCleanupInterval = 30000;  // 30 seconds of inactivity
}

update(deltaTime, gestureProgress = null) {
    // Existing early-exit
    if (this.activeElements.size === 0 && this.pools.size === 0) {
        return;
    }

    // NEW: Skip pool iteration if no active elements (just update time)
    if (this.activeElements.size === 0) {
        this.time += deltaTime;
        this._checkPoolCleanup();
        return;  // Skip expensive container sync and pool iteration
    }

    // ... existing update logic for active elements
}

_checkPoolCleanup() {
    const now = performance.now();
    for (const [type, pool] of this.pools) {
        const lastUsed = this._poolLastUsed.get(type) || 0;
        if (now - lastUsed > this._poolCleanupInterval) {
            pool.dispose();
            this.pools.delete(type);
            this._poolLastUsed.delete(type);
            this.materials.get(type)?.dispose();
            this.materials.delete(type);
        }
    }
}

// Update lastUsed when spawning
spawn(type, options) {
    this._poolLastUsed.set(type, performance.now());
    // ... existing spawn logic
}
```

**Breaking Changes:**

- Pools are now disposed after 30s of inactivity
- First gesture after cleanup will have slight delay for pool recreation
- Can be mitigated with `preloadElements` option

**Expected Impact:** ~1-3ms savings when idle after gestures

---

## Fix 5: Conditional Animator Updates (LOW)

**File:** `src/3d/Core3DManager.js` render() method

**Current Problem:** All animators update every frame regardless of state.

**Solution:** Add dirty flags or state checks.

```javascript
// BreathingAnimator - only update if breathing enabled
if (this.breathingEnabled) {
    this.breathingAnimator.update(
        deltaTime,
        this.emotion,
        getUndertoneModifier(this.undertone)
    );
}

// Rhythm3DAdapter - only update if playing or has pending state
if (
    this.rhythm3DAdapter?.isPlaying() ||
    this.rhythm3DAdapter?.hasPendingUpdates()
) {
    this.rhythm3DAdapter.update(deltaTime);
}

// ShatterSystem - only update if shattering
if (this.shatterSystem?.isShattering()) {
    this.shatterSystem.update(deltaTime);
}

// GeometryMorpher - only update if morphing
if (this.geometryMorpher.isMorphing()) {
    const morphState = this.geometryMorpher.update(deltaTime);
    // ... morph handling
} else {
    // Use cached morph state
    morphState = this._idleMorphState;
}
```

**Breaking Changes:** None if implemented correctly.

**Expected Impact:** ~1-2ms savings when idle

---

## Fix 6: Material Lerp Threshold (LOW)

**File:** `src/3d/ThreeRenderer.js` lines 1444-1471

**Current Problem:** Material uniforms lerped every frame even when values
haven't changed.

**Solution:** Add threshold check.

```javascript
// Only lerp if difference is significant
const colorDiff =
    Math.abs(this._tempColor.r - currentColor.r) +
    Math.abs(this._tempColor.g - currentColor.g) +
    Math.abs(this._tempColor.b - currentColor.b);

if (colorDiff > 0.001) {
    this.coreMesh.material.uniforms.glowColor.value.lerp(this._tempColor, 0.15);
}

// Same for intensity
const intensityDiff = Math.abs(targetIntensity - currentIntensity);
if (intensityDiff > 0.001) {
    this.coreMesh.material.uniforms.glowIntensity.value +=
        (targetIntensity - currentIntensity) * lerpSpeed;
}
```

**Breaking Changes:** None - visual output identical.

**Expected Impact:** <1ms savings

---

## Implementation Order

| Priority | Fix                          | Risk     | Time Est. |
| -------- | ---------------------------- | -------- | --------- |
| 1        | Remove validateObject        | Very Low | 5 min     |
| 2        | Conditional render passes    | Low      | 30 min    |
| 3        | Reuse GestureBlender object  | Low      | 45 min    |
| 4        | Pool cleanup / idle skip     | Medium   | 1 hr      |
| 5        | Conditional animator updates | Low      | 30 min    |
| 6        | Material lerp threshold      | Very Low | 15 min    |

---

## Testing Checklist

- [ ] Verify 60fps achieved on desktop idle
- [ ] Run all elemental gestures (fire, ice, water, etc.)
- [ ] Test gesture → idle → gesture cycle (pool recreation)
- [ ] Verify no visual differences in any gesture
- [ ] Test morph transitions (sphere ↔ crystal ↔ moon)
- [ ] Verify particle system still renders correctly
- [ ] Test soul refraction on crystal geometry
- [ ] Memory profile to confirm no new leaks

---

## Rollback Plan

Each fix is independent. If issues arise:

1. Revert specific fix via git
2. Add feature flag to disable problematic optimization
3. File issue with reproduction steps

---

## Metrics to Track

Before/After for each fix:

- Idle FPS (no gestures)
- FPS during fire gesture
- FPS during particle-heavy emotion (joy)
- Memory usage over 5 minutes
- Time to first frame after gesture ends
