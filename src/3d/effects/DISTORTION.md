# Distortion System

Post-processing UV-warp system that creates element-specific atmospheric
distortion (heat shimmer, cold air refraction, etc.) around instanced element
meshes.

## Architecture

```
ElementRegistrations.js          Per-element distortion config
        │                        (geometry, material, padding, strength)
        ▼
ElementInstancedSpawner.js       Registers config with DistortionManager
        │                        on first pool creation (once per element type)
        │
        │  each frame
        ▼
DistortionManager.js             Syncs AABB bounding plane from element pools,
        │                        renders distortion scene to half-res RT
        ▼
ThreeRenderer.js                 STEP 0.75: renders distortion map
        │                        STEP 1: composer applies DistortionPass
        ▼
DistortionPass.js                Fullscreen post-process: reads R/G as UV
                                 offset, warps scene before bloom
```

## Render Pipeline Position

```
STEP 0     Soul render (camera layer 2)
STEP 0.5   Ice refraction (if ice on screen)
STEP 0.75  Distortion map render ◄── DistortionManager.render()
STEP 1     EffectComposer: RenderPass → DistortionPass → BloomPass
STEP 2     Particle bloom composite
```

The distortion pass is inserted BEFORE bloom in the EffectComposer chain.
Bloom must always be the last enabled pass because its `render()` relies on
`renderToScreen=true` for correct two-phase compositing.

## Files

| File | Role |
|------|------|
| `src/3d/DistortionPass.js` | Post-process shader (reads distortion RT, warps scene UVs) |
| `src/3d/materials/DistortionMaterials.js` | Per-element distortion shaders (fire, ice, water, electric) |
| `src/3d/effects/DistortionManager.js` | Creates/syncs distortion InstancedMeshes, renders to RT |
| `src/3d/effects/ElementInstancedSpawner.js` | Registers distortion on pool init, syncs each frame |
| `src/3d/effects/ElementRegistrations.js` | Declares per-element distortion configs |
| `src/3d/ThreeRenderer.js` | Owns the distortion RT, wires pass into composer |
| `src/3d/Core3DManager.js` | Passes distortionManager from ThreeRenderer to spawner |

## Distortion Map Format

The distortion render target is a half-resolution RGBA HalfFloat texture:

```
R = dx  (signed UV offset, horizontal)
G = dy  (signed UV offset, vertical)
B = 0.0 (reserved for future use)
A = 1.0
```

Offsets are **pre-multiplied** by per-pixel falloff in the element shader.
The DistortionPass reads only R/G channels and applies them directly:

```glsl
vec2 offset = distSample.rg * uGlobalStrength;
offset = clamp(offset, vec2(-0.04), vec2(0.04));  // Safety rail
vec4 color = texture2D(tDiffuse, vUv + offset);
```

All element materials use `AdditiveBlending` so overlapping element types
accumulate naturally in the RT.

## Distortion Render Target

- **Resolution**: 0.5x canvas (half width, half height)
- **Format**: `RGBAFormat`, `HalfFloatType` (signed offsets need float)
- **Filter**: `LinearFilter` (smooth interpolation at half res)
- **Depth**: None (`depthBuffer: false`)
- **Clear**: `(0, 0, 0, 0)` — zero means no distortion

The half-res RT acts as a low-pass filter. Noise features smaller than 2 RT
pixels alias to zero. Shader frequencies must be sized for RT survival
(fire uses world-space frequencies 18/35, not 40+).

### GPU Resource Recovery

Browsers may reclaim RT memory when a tab is backgrounded. Two mechanisms
handle this:

1. **visibilitychange** — `_handleVisibilityChange()` recreates the RT when
   the tab becomes visible again
2. **focus** — `_handleFocusRecovery()` recreates only if `_wasHidden` flag
   was set (prevents churning on routine window focus events)

## Per-Element Distortion Shaders

Each element type has a physically-motivated distortion pattern in
`DistortionMaterials.js`. All shaders share a common vertex shader that
provides `vUv` (plane UV) and `vWorldPos` (world-space position).

### Fire — Rising Heat Column

- **Speed**: `uTime * 2.0` (fast turbulence)
- **Noise**: Two-octave world-space turbulence (frequencies 18, 35)
- **Direction**: Predominantly vertical (dy = 4x horizontal). Rising streaks
  with horizontal wobble
- **Height**: Strongest in middle band (`smoothstep` from 0.25 to 0.5)
- **Strength**: 0.005
- **Physics**: Hot air rises in turbulent columns, creating vertical streaking

### Ice — Cold Air Refraction

- **Speed**: `uTime * 0.3` (7x slower than fire — cold mist is languid)
- **Noise**: Two-layer rolling fog (world-space frequencies 3, 5)
- **Direction**: Equal horizontal drift and downward pull. Constant downward
  bias of `uStrength * 0.5`
- **Height**: Concentrated at bottom (`smoothstep(0.6, 0.1, uv.y)`) — cold
  air sinks and pools
- **Pulse**: Gentle oscillation `0.8 + 0.2 * sin(uTime * 0.5)`
- **Strength**: 0.003
- **Padding**: Asymmetric — `centerOffset (0, -0.15, 0)` shifts the plane
  downward so the distortion extends below the ice elements
- **Physics**: Cold dense air drifts downward and spreads horizontally

### Water — Expanding Ripples (not yet enabled)

- **Pattern**: Concentric rings expanding from UV center
- **Direction**: Radial push outward
- **Falloff**: Strong near center, zero at edge
- **Strength**: 0.003
- **Note**: UV-space ring pattern (rings scale with effect area)

### Electric — Static Jitter (not yet enabled)

- **Pattern**: Step noise (15 fps temporal quantization)
- **Sparsity**: Only ~30% of world-space cells active per frame
- **Flash**: `uFlashIntensity` uniform boosts distortion 4x during lightning
  flash events
- **Strength**: 0.003
- **Note**: `setElectricFlash()` on DistortionManager syncs flash intensity

## Bounding Box System (DistortionManager)

Rather than one distortion plane per element instance, the system uses a
**single billboarded plane per element type** fitted to the AABB of all
active instances:

```
┌──────────────────────────┐
│  Distortion plane        │  ← Single InstancedMesh, count=1
│  (billboards to camera)  │
│                          │
│    ● instance 1          │
│         ● instance 2     │  ← Element instance positions
│    ● instance 3          │
│                          │
└──────────────────────────┘
      ▲ padding ▲
```

Each frame:

1. Compute tight AABB from all active element instance positions
2. Add `padding` (world units) to all sides
3. Apply optional `centerOffset` (e.g. ice shifts down for sinking cold air)
4. Billboard the plane to face the camera
5. Set as instance 0 of the distortion InstancedMesh

This approach means:
- Only 1 draw call per element type (not per instance)
- No mesh management — the plane resizes automatically
- Smooth transition as elements appear/disappear
- Distortion covers the full element cluster with a single noise evaluation

## Registration Config

Element types declare distortion in `ElementRegistrations.js`:

```javascript
distortion: {
    geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
    material: createIceDistortionMaterial,  // Factory function
    transform: {
        padding: new THREE.Vector3(0.3, 0.5, 0.3),
        centerOffset: new THREE.Vector3(0, -0.15, 0),  // Optional
    },
    billboard: true,
    strength: 0.003,  // Sets uStrength uniform on the material
},
```

| Field | Type | Description |
|-------|------|-------------|
| `geometry` | `() => BufferGeometry` | Factory (lazy creation). 1x1 plane for billboard types |
| `material` | `() => ShaderMaterial` | Factory from DistortionMaterials.js |
| `transform.padding` | `Vector3` | World-unit padding beyond instance AABB |
| `transform.centerOffset` | `Vector3?` | Shifts plane center (ice: downward for sinking air) |
| `billboard` | `boolean` | Face camera (true for all current types) |
| `strength` | `number` | Default `uStrength` value on the material |

## Lifecycle

### Initialization

1. `ThreeRenderer` creates the distortion RT, ShaderPass, and DistortionManager
2. `Core3DManager` passes `distortionManager` to `ElementInstancedSpawner`
3. On first pool creation for an element type, spawner checks
   `hasElement()` and registers with `DistortionManager.registerElement()`
   (geometry + material created once, persists for app lifetime)

### Per-Frame Update

1. `DistortionManager.update(deltaTime)` — increments `uTime` on all
   registered distortion materials
2. `DistortionManager.hasActiveSources()` — checks if any element type has
   `mesh.count > 0`
3. If active: `camera.layers.set(0)` (fix camera layer leak from soul render),
   then `DistortionManager.render(target)`
4. `DistortionPass.enabled` toggled based on `hasActiveSources()`
5. EffectComposer runs: RenderPass → DistortionPass (if enabled) → BloomPass

### Cleanup

1. `ElementInstancedSpawner._checkPoolCleanup()` disposes idle pools but
   does NOT unregister distortion (registration persists to avoid
   geometry/material churn)
2. `DistortionManager.dispose()` disposes all geometry, materials, and meshes
3. `ThreeRenderer.dispose()` disposes RT, pass, and manager

## Debugging

### Quick Check: Is distortion active?

Add a temporary green diagnostic to `DistortionPass.js`:

```glsl
// After the color = texture2D(...) line:
float hasData = step(0.0001, abs(distSample.r) + abs(distSample.g));
float pattern = (abs(distSample.r) + abs(distSample.g)) * 120.0;
color.g += hasData * 0.08 + pattern;
```

This overlays green where distortion is non-zero, with brightness
proportional to offset magnitude. Remove after debugging.

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Distortion intermittent | Camera layer leak from STEP 0 (soul render) | `camera.layers.set(0)` before distortion render |
| Distortion invisible | Noise frequency too high for half-res RT | Keep frequencies <35 (features > 2 RT pixels) |
| "Liquify" effect | Strength too high, frequencies too low | Reduce `uStrength`, increase noise frequency |
| Hard rectangle edges | Offsets not pre-multiplied by falloff | Output `vec4(dx * falloff, dy * falloff, 0, 1)` |
| Pattern jumps on spawn/despawn | UV-space noise shifts with AABB resize | Use `vWorldPos.xy` for noise coordinates |
| Distortion stuck after gesture ends | Early-return path in spawner skips sync | Sync all pools to zero before early return |
| RT invalid after tab switch | Browser reclaimed GPU memory | `_handleVisibilityChange` + `_handleFocusRecovery` |

## Design Decisions

### Why half resolution?

Distortion offsets are inherently low-frequency — you're shifting pixels by a
few UV units, not drawing sharp features. Half-res saves 75% fill rate and
the `LinearFilter` interpolation produces smooth results. The tradeoff:
noise features smaller than 2 RT pixels alias away (hence the frequency
constraints).

### Why a single AABB plane instead of per-instance planes?

1. **1 draw call** vs N draw calls per element type
2. **No mesh management** — no spawn/despawn of distortion meshes
3. **Natural coverage** — noise evaluated once across the full cluster
4. **Additive accumulation** from multiple element types still works (separate
   planes per type, additive blending in the RT)

### Why pre-multiply offsets in the element shader?

The DistortionPass only reads R/G. If falloff were stored in a separate
channel, the pass would need `offset = distSample.rg * distSample.b`. With
pre-multiplication, the pass is trivially simple (`offset = distSample.rg`)
and additive blending in the RT correctly accumulates weighted offsets.

### Why AdditiveBlending on distortion materials?

Multiple element types (fire + ice) can be active simultaneously. Additive
blending in the RT means their UV offsets naturally sum. The hard clamp in
DistortionPass (`±0.04`) prevents runaway accumulation.

### Why not use the distortion system for visible fog/mist?

The distortion RT stores UV offsets, not color. Attempting to fake visible
volumetric effects (fog, mist) by tinting the scene from the B channel
produces flat rectangular overlays, not convincing volumetrics. Visible
atmospheric effects (ice mist, water spray, smoke) need a dedicated system
(particles, raymarching, or a separate fog RT).

## Status

| Element | Distortion | Status |
|---------|-----------|--------|
| Fire | Heat shimmer | Active, tuned |
| Ice | Cold air refraction | Active, tuned |
| Water | Expanding ripples | Shader written, not registered |
| Electric | Static jitter | Shader written, not registered |
