# GPU Crash Investigation - ElementSpawner System

## Problem
GPU crashes and browser-level compositor failures when triggering multiple elemental gestures with 3D models. The crashes occur even with the shatter system completely disabled.

## Symptoms
- Browser compositor crashes
- GPU memory exhaustion
- Occurs during rapid elemental gesture triggering
- Affects Chrome/Chromium browsers

---

## Root Cause Analysis

### What IS Cached (Correctly)
1. **Geometries**: Loaded once per model, shared across all instances ✓
2. **Base Materials**: Created once in `initialize()` (`this.fireMaterial`, `this.iceMaterial`, etc.) ✓
3. **Shader Programs**: Three.js caches compiled GLSL programs ✓

### What's Causing the Leak

#### Issue 1: Materials Cloned for EVERY Element
```javascript
// ElementSpawner.js:2247-2255
// ALWAYS clone material for each element
useMaterial = cloneShaderMaterialDeep(material);
```
Every spawned element gets its own material clone because each needs independent uniforms:
- `uTime` - animation timing
- `uFadeProgress` - fade in/out
- `opacity` - transparency

**Math**: 10 elements × 1 material clone = 10 materials per gesture

#### Issue 2: Trail System Multiplies Materials 3x
```javascript
// Trail.js - Each trail creates 3 cloned meshes with cloned materials
this.count = config.count ?? 3;  // Default 3 trail copies
// Each copy gets: cloneTrailMaterial(mesh.material)
```

**Math**: 10 elements × (1 + 3 trail copies) × 1 material = **40 materials per gesture**

#### Issue 3: No Cross-Type Cleanup
```javascript
// ElementSpawner.js:2191-2192
// Clear existing elements of this type
this.despawn(elementType, false);  // Only clears SAME type
```
When you trigger different gestures:
- Fire gesture → clears fire, spawns fire (40 materials)
- Ice gesture → clears ice, spawns ice (fire still there: 80 materials)
- Water gesture → clears water, spawns water (fire + ice still there: 120 materials)

Elements pile up across types until hitting emergency limits.

#### Issue 4: Cleanup is Reactive, Not Proactive
```javascript
// ElementSpawner.js:2111
if (_debugStats.activeMaterials > MAX_ACTIVE_MATERIALS) {
    this.despawnAll();  // Only triggers AFTER limit exceeded
}
```

---

## Attempted Fixes

### 1. Disable Shatter System Entirely
**Date:** 2026-01-30
**Result:** STILL CRASHING - Confirms issue is NOT in ShatterSystem

### 2. Filter Out Shatter-Based Gestures
**Date:** 2026-01-30
**Result:** STILL CRASHING - Confirms issue is in ElementSpawner

---

## Solution: New Instanced Architecture

### Architecture Overview

The fix replaces the per-element material cloning with GPU-instanced rendering:

| Component | Old Approach | New Approach |
|-----------|--------------|--------------|
| Materials | Clone per element (40+ per gesture) | 1 per element type |
| Meshes | 1 Mesh per element | 1 InstancedMesh per type |
| Trails | 3 cloned meshes per element | Additional instance slots |
| Animation | Per-mesh uniform updates | Time-offset in shader |
| Cleanup | Reactive (after limit hit) | Pool-based (hard limit) |

### New Files Created

1. **`ElementInstancePool.js`** - Core pooling with per-instance attributes
   - Pre-allocated instance slots (16 elements × 4 slots = 64 instances per type)
   - Per-instance attributes: `aSpawnTime`, `aExitTime`, `aSelectedModel`, `aVelocity`
   - Trails as instance slots (1 main + 3 trail copies per element)

2. **`MergedGeometryBuilder.js`** - Geometry merging utility
   - Combines all model variants into single BufferGeometry
   - Adds `aModelIndex` vertex attribute for model selection
   - Shader-based model selection (no geometry switching)

3. **`InstancedShaderUtils.js`** - Shader injection utilities
   - Time-offset animation GLSL snippets
   - Model selection vertex shader code
   - Trail offset calculations
   - Fade in/out from spawn/exit times

4. **`InstancedFireMaterial.js`** - GPU-instanced fire shader
   - All animation uses local time (global time - spawn time)
   - Per-instance random seeds for variation
   - Trail fade built into shader
   - **CRITICAL**: Uses `instanceMatrix` for per-instance transforms

5. **`VelocityMotionBlurPass.js`** - DIY motion blur
   - Samples along velocity direction
   - Works with instanced velocity attribute
   - Simple and full-velocity versions

6. **`ElementInstancedSpawner.js`** - New spawner
   - Replaces old ElementSpawner
   - Uses pools for all element types
   - Zero material cloning

7. **`ElementSizing.js`** - **Shared sizing/orientation system**
   - Extracted from ElementSpawner for reuse across all spawners
   - Golden Ratio size classes (φ-based fractions of mascot radius)
   - Model size definitions with variance
   - Model orientation definitions (outward, flat, tangent, rising, falling)
   - `getModelSizeFraction()` - Get min/max size for a model
   - `getModelOrientation()` - Get orientation config for a model
   - `calculateMascotRadius()` - Calculate radius from mesh geometry
   - `calculateElementScale()` - Full scale calculation with multiplier

8. **`MascotSpatialRef.js`** - Mascot spatial reference
   - Calculates bounding box and named landmarks
   - Provides semantic positioning (head, top, center, bottom, feet)
   - Used by spawners for mascot-relative element placement

9. **`ElementPositioning.js`** - **NEW: Shared positioning system**
   - Extracted from ElementSpawner for reuse across all spawners
   - Reusable temp object pool (vectors, quaternions, matrices)
   - Pattern-aware surface sampling (crown, shell, scattered, spikes, ring)
   - Model-specific orientation calculation (outward, flat, tangent, rising, falling, velocity)
   - Embed depth calculation for surface attachment
   - Camera-facing blend for visibility optimization
   - Key exports:
     - `sampleSurfacePoints(geometry, count, mascotRadius, config, camera)` - Sample surface with patterns
     - `calculateOrientation(normal, modelName, cameraFacing, camera, position, velocity)` - Get quaternion
     - `calculateSurfacePosition(surfacePos, normal, scale, embedDepth)` - Apply embed depth
     - `normalizeSurfaceConfig(mode)` - Parse mode string/object to config

### Key Benefits

- **1 material per element type** instead of 40+ per gesture
- **No Trail mesh creation** - trails are just delayed instances
- **Hard pool limits** - impossible to exceed (fails gracefully)
- **GPU-efficient** - single draw call per element type
- **Time-offset animation** - each instance has unique timing without uniform updates
- **Shared sizing system** - consistent Golden Ratio scaling across all elements

---

## Shared Systems (Extracted from ElementSpawner)

### ElementSizing.js - Golden Ratio Sizing System

All element sizes are fractions of the mascot's bounding radius (R) using φ (1.618):

| Size Class | Fraction | % of R | Use Case |
|------------|----------|--------|----------|
| tiny       | φ⁻⁴      | 6.9%   | Embers, droplets, sparks |
| small      | φ⁻³      | 11.1%  | Wisps, crystals, leaves |
| medium     | φ⁻²      | 18.0%  | Flames, rocks, vines |
| large      | φ⁻¹      | 29.2%  | Bursts, clusters, waves |
| prominent  | φ⁻⁰·⁵    | 38.2%  | Halos, large effects |

**Usage in ElementInstancedSpawner:**
```javascript
import { calculateElementScale } from './ElementSizing.js';

// In spawn():
const scale = calculateElementScale(modelName, this.mascotRadius, scaleMultiplier);
```

**Usage in ElementSpawner (original):**
The original already uses this system internally. Future refactor should import from ElementSizing.js.

### Extracted: Positioning System (ElementPositioning.js)

The positioning system has been extracted from ElementSpawner:

- **Surface Sampling**: Pattern-aware surface point selection (crown, shell, scattered, spikes, ring)
- **Orientation**: Model-specific orientation modes (outward, flat, tangent, rising, falling, velocity)
- **Camera Facing**: Visibility-optimized orientation blending
- **Embed Depth**: Configurable surface attachment depth
- **Temp Pool**: Reusable vectors/quaternions to avoid allocations

**Usage in ElementInstancedSpawner:**
```javascript
import { sampleSurfacePoints, calculateOrientation, calculateSurfacePosition } from './ElementPositioning.js';

// In spawn():
const surfacePoints = sampleSurfacePoints(geometry, count, mascotRadius, surfaceConfig, camera);
const rotation = calculateOrientation(sample.normal, modelName, cameraFacing, camera, position);
const { position } = calculateSurfacePosition(sample.position, sample.normal, scale, embedDepth);
```

### Integrated: Animation System (AnimationState + AnimationConfig)

The animation system drives per-element lifecycle with rich hold animations:

**Lifecycle States:** `WAITING → ENTERING → HOLDING → EXITING → DEAD`

**Animation Features:**
- **Enter animations**: fade, flash, grow, pop
- **Exit animations**: fade, flash, shrink, pop
- **Hold animations**: pulse (scale), flicker (opacity), drift (position), rotate, emissive
- **Respawn**: Optional looping with configurable delay

**Integration in ElementInstancedSpawner:**
```javascript
import { AnimationState } from './animation/AnimationState.js';
import { AnimationConfig } from './animation/AnimationConfig.js';

// In spawn(): Create AnimationState per element
const animConfig = new AnimationConfig(animation, gestureDuration);
const animState = new AnimationState(animConfig, elementIndex);
animState.initialize(currentTime);

// Store in activeElements:
activeElements.set(elementId, { ...data, animState });

// In update(): Process per-element animation
for (const [elementId, data] of activeElements) {
    const alive = data.animState.update(time, deltaTime, gestureProgress);
    if (!alive) continue;

    // Apply drift offset to position
    position.add(animState.driftOffset);

    // Apply rotation offset
    rotation.multiply(quaternionFromEuler(animState.rotationOffset));

    // Apply animated scale (pulse)
    scale = baseScale * animState.scale;

    // Update instance in pool
    pool.updateInstanceTransform(elementId, position, rotation, scale);
    pool.updateInstanceOpacity(elementId, animState.opacity);
}
```

**Pool Methods for Animation:**
```javascript
// ElementInstancePool.js - New methods for animation updates:
updateInstanceTransform(elementId, position, rotation, scale)  // Updates instance matrix
updateInstanceOpacity(elementId, opacity)                      // Updates per-instance opacity
```

---

## Integration Status

### Completed
- [x] ElementInstancePool class
- [x] MergedGeometryBuilder utility
- [x] InstancedShaderUtils (GLSL snippets)
- [x] InstancedFireMaterial (with instanceMatrix fix)
- [x] VelocityMotionBlurPass
- [x] ElementInstancedSpawner
- [x] ElementSizing.js (extracted from ElementSpawner)
- [x] ElementPositioning.js (extracted from ElementSpawner)
- [x] MascotSpatialRef.js
- [x] Wire ElementInstancedSpawner into Core3DManager
- [x] Build passes
- [x] AnimationState/AnimationConfig integration in ElementInstancedSpawner
- [x] Pool animation methods (updateInstanceTransform, updateInstanceOpacity)

### Remaining
- [ ] Create instanced materials for other elements (ice, water, etc.)
- [ ] Test with elemental-gestures.html (verify sizing/positioning/surface mode)
- [ ] Update ElementSpawner to use shared ElementSizing.js and ElementPositioning.js
- [ ] Remove old ElementSpawner.js (fossil) once stable

---

## How to Complete Integration

### Step 1: Add More Instanced Materials

Create `InstancedIceMaterial.js`, `InstancedWaterMaterial.js`, etc. following the pattern in `InstancedFireMaterial.js`:

```javascript
// Copy the shader structure from InstancedFireMaterial.js
// Replace fire-specific code with element-specific code
// CRITICAL: Include instanceMatrix in vertex shader!
// Add to ELEMENT_CONFIGS in ElementInstancedSpawner.js
```

### Step 2: Add Element to ELEMENT_CONFIGS

```javascript
// In ElementInstancedSpawner.js:
const ELEMENT_CONFIGS = {
    fire: { ... },
    ice: {
        basePath: 'models/Elements/Ice/',
        models: ['crystal-small.glb', 'crystal-medium.glb', 'ice-spike.glb'],
        createMaterial: createInstancedIceMaterial,
        updateMaterial: updateInstancedIceMaterial,
        scaleMultiplier: 1.2  // Ice slightly smaller than fire
    },
    // etc.
};
```

### Step 3: Test and Remove Fossil

1. Test with `site/public/examples/3d/elemental-gestures.html`
2. Verify no GPU crashes with rapid gesture triggering
3. Verify sizing looks correct (elements ~10-30% of mascot size)
4. Delete `ElementSpawner.js` once stable

---

## Debug Commands
```javascript
// In browser console:
ELEMENT_SPAWNER_STATS.report()     // Show resource usage (old spawner)
ELEMENT_SPAWNER_EMERGENCY()         // Force cleanup (old spawner)
ELEMENT_SPAWNER_DUMP(renderer)      // Full diagnostic dump (old spawner)

// New spawner stats (once integrated):
mascot.core3DManager.elementSpawner.getStats()
```

## Key Files
- `src/3d/effects/ElementSpawner.js` - OLD (to be deleted)
- `src/3d/effects/ElementInstancedSpawner.js` - NEW replacement
- `src/3d/effects/ElementInstancePool.js` - Pool management
- `src/3d/effects/ElementSizing.js` - **Shared sizing system (Golden Ratio)**
- `src/3d/effects/ElementPositioning.js` - **Shared positioning system (surface/orientation)**
- `src/3d/effects/MascotSpatialRef.js` - Mascot bounds and landmarks
- `src/3d/effects/animation/AnimationState.js` - **Per-element animation state machine**
- `src/3d/effects/animation/AnimationConfig.js` - **Animation config parser**
- `src/3d/effects/animation/HoldAnimations.js` - Hold animation pure functions
- `src/3d/materials/InstancedFireMaterial.js` - Instanced fire shader
- `src/3d/materials/InstancedShaderUtils.js` - Shared GLSL

## Critical Shader Note

When creating instanced materials, the vertex shader MUST use `instanceMatrix`:

```glsl
// WRONG - ignores per-instance transforms
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

// CORRECT - applies per-instance position/rotation/scale
vec4 instancePosition = instanceMatrix * vec4(position, 1.0);
gl_Position = projectionMatrix * modelViewMatrix * instancePosition;
```
