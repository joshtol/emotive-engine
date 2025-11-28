# Dark Particle Halo Fix Attempts

## Problem

Particles have dark halos/rings around them, especially visible against the
background and crystal.

## Root Cause Analysis

- Particles are rendered with semi-transparent edges
- When alpha blending, dark edge colors (e.g., `vColor * 0.7`) blend with
  background
- The bloom pass Gaussian blur mixes particle colors with black clear color in
  transparent areas
- WebGL renderer uses `premultipliedAlpha: false`, `alpha: true`, clear color
  `(0,0,0,0)`

---

## Attempts

### 1. Premultiplied Alpha in Particle Shader Only

**What**: Changed shader output from `vec4(color, alpha)` to
`vec4(color * alpha, alpha)` **Blend mode**: Kept `THREE.NormalBlending`
**Result**: Still dark halos - NormalBlending multiplies by alpha again,
double-applying it

### 2. Premultiplied Alpha + Custom Blend Mode

**What**: Shader outputs `vec4(color * alpha, alpha)` **Blend mode**:
`CustomBlending` with `blendSrc: OneFactor`, `blendDst: OneMinusSrcAlphaFactor`
**Result**: Still dark halos - the dark edge colors still contribute darkness
even when premultiplied

### 3. Remove Edge Darkening from Particle Shader

**What**: Removed `edgeColor = vColor * 0.7`, removed cell-shaded borders,
removed `*= 0.85` brightness reduction **Result**: Particles looked wrong/washed
out, still had some dark areas

### 4. Alpha-Weighted Blur in Bloom Pass

**What**: Modified `UnrealBloomPassAlpha.js` blur shader to weight RGB samples
by their alpha:

```glsl
diffuseSum += sample.rgb * sample.a * weight;  // Instead of sample.rgb * weight
```

**Result**: Helped reduce halos but didn't eliminate them - problem is before
bloom

### 5. Alpha-Weighted Blur + Remove Edge Darkening

**What**: Combined attempts 3 and 4 **Result**: Particles looked washed out,
still had dark halos

### 6. Pure Additive Blending (First Attempt)

**What**: `THREE.AdditiveBlending` with shader output
`vec4(color * alpha * 0.7, 1.0)` **Result**: All particles were BLACK -
something wrong with color pipeline

### 7. Additive Blending (Second Attempt)

**What**: `THREE.AdditiveBlending` with shader output
`vec4(color * alpha, alpha)` **Result**: Particles visible but WAY too
bright/blown out, glowy, not solid looking. Still some dark visible on edges of
some particles.

---

## Current State

- Reverted particle shader to original (with edge darkening, cell-shaded
  borders, `*= 0.85`)
- Alpha-weighted blur in bloom pass is still in place
- Using `THREE.AdditiveBlending` (too bright/wrong look)

## Files Modified

- `src/3d/particles/Particle3DRenderer.js` - particle shader and blend mode
- `src/3d/UnrealBloomPassAlpha.js` - blur shader alpha weighting

### 8. Change WebGL Renderer to premultipliedAlpha: true

**What**: Changed `ThreeRenderer.js` WebGLRenderer option from
`premultipliedAlpha: false` to `premultipliedAlpha: true` **Result**: Did not
fix dark halos, reverted

### 9. Render Particles AFTER Bloom Pass (SUCCESS for no halos, but no bloom)

**What**: Put particles on layer 1, render main scene (layer 0) through bloom,
then render particles directly after **Result**: ✅ NO DARK HALOS! But particles
have no bloom/glow effect since they bypass the blur entirely

### 10. Color Dilation Pass Before Blur

**What**: Added a pre-blur pass that spreads colors from opaque pixels into
transparent neighbors, so blur samples real colors instead of black **Result**:
Didn't work - black halos returned. Reverted.

---

## Ideas Not Yet Tried

1. Render particles to separate render target with non-black clear color
2. Disable depth test for particles (`depthTest: false`)
3. Use a different blur algorithm (Kawase, bilateral)

## Working Solution (Current)

Render particles on layer 1 AFTER bloom pass completes. No dark halos, but
particles don't have bloom glow.
