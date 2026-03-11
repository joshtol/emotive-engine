---
title:
    '8 GLSL Shader Systems in 6 Months: Building Elemental Effects for a
    Character Animation Engine'
published: false
description:
    'How I wrote fire, water, ice, electricity, earth, nature, light, and void
    shaders from scratch for Emotive Engine v3.4.1. Architecture, GLSL snippets,
    and what went wrong.'
tags: webgl, threejs, showdev, javascript
cover_image: https://raw.githubusercontent.com/joshtol/emotive-engine/main/assets/previews/elemental-gestures.gif
---

## What this is

[Emotive Engine](https://github.com/joshtol/emotive-engine) is an open-source
(MIT) character animation engine. It renders animated mascots in Canvas 2D or
WebGL 3D. You feed it emotions and gestures; it figures out the animation.

For v3.4.1, I wrote 8 elemental shader systems from scratch: fire, water, ice,
electricity, earth, nature, light, void. 161 gestures across all 8 elements.
Each element has its own GLSL fragment shader, GPU-instanced models, overlay
shader, bloom control, and atmospheric effects.

The point was to prove the architecture repeats. Every element follows the same
5-piece template. Once you have one working, the next one is plumbing.

![All 8 elemental shaders on the crystal mascot](https://raw.githubusercontent.com/joshtol/emotive-engine/main/assets/previews/elemental-gestures-2.gif)

[Live demo (all 161 gestures)](https://joshtol.github.io/emotive-engine/examples/3d/elemental-gestures.html)

---

## The 5-Piece Template

Every element type in the system consists of exactly 5 components:

1. **Factory** (`fireEffectFactory.js`) - Takes a config object, returns a
   gesture with a `3d.evaluate()` function that drives transforms per frame.
2. **Instanced Material** (`InstancedFireMaterial.js`) - A
   `THREE.ShaderMaterial` with custom GLSL. GPU-instanced so all elements of one
   type render in a single draw call.
3. **Overlay Shader** (`FireMaterial.js`) - Paints directly onto the mascot
   mesh. Same visual language as the instanced material but mapped to the
   character's geometry.
4. **Gesture Configs** (one file per gesture) - Declarative objects: duration,
   spawn mode, model list, cutout pattern, grain, atmospheric preset.
5. **Registration** (`ElementRegistrations.js`) - Wires everything into the
   `ElementTypeRegistry`: models, materials, update hooks, bloom thresholds.

Here is how fire registers itself:

```javascript
ElementTypeRegistry.register('fire', {
    basePath: 'models/Elements/Fire/',
    models: [
        'flame-wisp.glb',
        'flame-tongue.glb',
        'ember-cluster.glb',
        'fire-burst.glb',
        'flame-ring.glb',
    ],
    createMaterial: createInstancedFireMaterial,
    updateMaterial: updateInstancedFireMaterial,
    setShaderAnimation: setInstancedFireArcAnimation,
    resetShaderAnimation: resetFireAnimation,
    setGestureGlow: setInstancedFireGestureGlow,
    setCutout: setInstancedFireCutout,
    resetCutout: resetFireCutout,
    setGrain: setFireGrain,
    resetGrain: resetFireGrain,
    // ... more hooks
});
```

Every element has this exact same shape. The `ElementInstancedSpawner` never
knows what element it is working with. It calls `registry.createMaterial()`,
`registry.updateMaterial()`, and the element-specific GLSL handles the rest.

---

## Shader Highlights

### Fire: Decoupled Color from Alpha

The naive approach to additive fire: color = noise, alpha = noise. Problem: when
many fire elements overlap (additive blending), everything washes out to white
because dark pixels still contribute.

The fix is to decouple color from alpha:

```glsl
// Color ramp always in warm-to-hot range (0.5-1.0).
// Noise shifts hue (orange to yellow-white) but color is NEVER dark/brown.
// Visibility is controlled by alpha alone.
float colorIntensity = 0.5 + localIntensity * 0.5;
vec3 color = fireColor(colorIntensity, uTemperature, edgeFactor);

// Alpha drives visibility with a wide smoothstep
float alpha = smoothstep(0.1, 0.85, localIntensity) * uOpacity;

// No floor color needed. Low-noise areas are invisible via alpha,
// not dark via color.
if (alpha < 0.08) discard;
```

The noise field controls which pixels are visible (alpha), while color stays in
the warm half of the palette. Individual elements run at `uOpacity = 0.45`.
Gradual stacking from orange through yellow to white, without the muddy brown
you get when dark noise values participate in additive blending.

I learned this from [ykob's approach](https://github.com/ykob): color is always
bright (HSV value=1), noise drives only opacity.

### Ice: Refraction with Voronoi Fractures

Ice was the hardest element. Solid geometry, normal blending (not additive), and
it needs to look like glass with internal fracture planes.

The refraction pipeline uses view-space Snell's law. The camera-to-surface
vector in view space maps directly to screen UV offsets, so `refract().xy` gives
screen-aligned distortion without camera rotation artifacts:

```glsl
vec3 I_vs = normalize(vViewPosition);
vec3 N_vs = faceforward(normalize(vNormal), I_vs, normalize(vNormal));

float distortion = 0.04 + (thickness * 0.15);
vec3 refDir = refract(I_vs, N_vs, 0.75);

// TIR fallback: use incident direction (minimal distortion)
if (length(refDir) < 0.1) refDir = I_vs;

vec2 uvBase = clamp(screenUV + refDir.xy * distortion, 0.0, 1.0);
vec3 refractedBg = texture2D(uBackgroundTexture, uvBase).rgb;
```

Internal fracture planes use Voronoi cells with Chebyshev distance
(`max(abs(diff.x), abs(diff.y))`) instead of Euclidean. This gives angular cell
boundaries that read as crystalline cleaves, not organic bubbles.

A break-the-web mask (low-frequency noise at 0.4x scale,
`smoothstep(0.55, 0.78)`) erases about 75% of cracks. The result: 80% of the
surface is clear glass, 20% has dramatic fracture clusters.

What does not work for ice: pure additive blending (ONE+ONE). Solid torus
geometry means all pixels contribute, and the whole thing blows past the bloom
threshold. Water gets away with additive because it is sparse sparkles. Ice
needs `NormalBlending` with `depthWrite: true`.

### Electricity: 3-Scale 3D Voronoi Edge-Distance

Lightning bolts are Voronoi edge-distance fields at three scales. The key is 3D
Voronoi, not 2D. 2D on world XZ gives thin wire lines that look nothing like
branching lightning.

```glsl
float lineWidth = 0.015;

// Primary bolts (scale 3)
float edge1 = voronoiEdge3D(vWorldPosition * 3.0, effectiveTime * 0.8, 0.85);
float bolt1 = 1.0 - smoothstep(0.0, lineWidth * 1.2, edge1);
bolt1 = pow(bolt1, 2.0);

// Secondary crackling (scale 6)
float edge2 = voronoiEdge3D(vWorldPosition * 6.0, effectiveTime * 1.2, 0.8);
float bolt2 = 1.0 - smoothstep(0.0, lineWidth * 0.8, edge2);
bolt2 = pow(bolt2, 2.5) * 0.6;

// Tertiary detail (scale 10)
float edge3 = voronoiEdge3D(vWorldPosition * 10.0, effectiveTime * 1.5, 0.75);
float bolt3 = 1.0 - smoothstep(0.0, lineWidth * 0.5, edge3);
bolt3 = pow(bolt3, 3.0) * 0.35;
```

The `pow()` sharpening on each scale is critical. Without it, the bolts are soft
gradients. With it, you get bright cores that bloom properly. The overlay shader
on the mascot mesh uses the exact same parameters (3.0, 6.0, 10.0 scales, same
line width, same pow exponents) so the instanced elements and the character
surface look like one coherent electrical field.

Alpha is driven purely by bolt brightness: `alpha = brightness * uOpacity`. No
base glow. Adding a base glow (even 0.15 + fresnel \* 0.35) reveals the model
geometry silhouette, which breaks the illusion that these are floating bolts.

---

## Rendering Pipeline

The compositor runs 5 post-processing passes:

1. **Render Pass** - Scene to framebuffer. Depth stored as
   `DepthStencilFormat + UnsignedInt248Type` and reused by later passes (zero
   extra scene renders for AO).
2. **Bloom (main)** - Custom `UnrealBloomPassAlpha` with alpha preservation. 5
   mip levels, kernel sizes [3, 5, 7, 9, 11], input at half canvas resolution.
   Internal resolution multiplier is 0.75, not 1.0. Full resolution buys nothing
   (bloom is inherently blurry) but costs 78% more fill at mip 0. This was a
   20fps regression before I caught it.
3. **Bloom (particles)** - Second bloom pass for particle layer, same
   architecture. Two passes times 14 fullscreen quads each = 28 bloom operations
   per frame.
4. **Ambient Occlusion** - Multi-scale SSAO: 16 fine samples (radius=120,
   bias=0.05) + 16 coarse (radius=280, bias=0.30), blended 75/25. Uses
   `CustomBlending` with `ZeroFactor + SrcColorFactor` so the AO multiplies the
   scene buffer directly. Only applied to elements with `depthWrite: true`
   (earth, ice). Fire, electricity, water, void are excluded.
5. **Distortion** - Per-element heat haze, ice refraction shimmer. One lesson
   learned the hard way: never `vec4(r, g, b, 1.0)` in post-processing. The
   canvas uses `alpha + premultipliedAlpha`, so forcing alpha to 1.0 gives you
   an opaque black background. Always read the full vec4, modify `.rgb`, output
   the original alpha.

Per-element bloom thresholds let different elements bloom differently. Crystal
(ice) at 0.35, moon (water) at 0.85. The ice shader uses a soft clamp
(`threshold + 0.40`) so the glass body stays bounded while cracks and specular
highlights exceed the threshold and bloom naturally.

---

## GPU Instancing

Every element type renders in a single draw call. The `ElementInstancePool`
manages a pool of instanced attributes:

- Per-instance time offset (each element animates independently)
- Model selection index (merged geometry with all variants baked in via
  `MergedGeometryBuilder`)
- Spawn/exit fade
- Velocity vector for motion blur
- Trail copies (main + 3 trails per logical element, all as instance slots)

No material cloning. The original architecture created a new `ShaderMaterial`
per spawned element, which leaked GPU memory. The instanced approach: one
material, one geometry, one draw call, N instances.

Shader compile stutter is hidden by freezing animations during prewarm. On first
use of an element type, the engine triggers a GPU compile with a single
invisible instance, waits for the shader to link, then proceeds. The user sees a
brief animation freeze instead of a visible stutter.

---

## The feel() API

The public API has a single-string interface for driving the mascot:

```javascript
const mascot = new EmotiveMascotPublic();
await mascot.init(canvas);

mascot.feel('happy');
mascot.feel('curious, leaning in');
mascot.feel('excited but nervous, bouncing');
mascot.feel('very angry, shaking');
mascot.feel('yes'); // nods
mascot.feel('no'); // shakes head
```

The `IntentParser` breaks the string into emotion, intensity, undertone,
gestures, and shape morph. Rate-limited to 10 calls per second. Returns a result
object with the parsed intent and any errors so the caller can inspect what the
engine understood.

This is designed for LLM integration. An AI agent can call `feel()` with natural
language and the engine translates it to animation state. The `feelVocabulary()`
method returns the full set of available emotions, gestures, shapes, and
undertones so the LLM knows what it can express.

---

## Numbers

- 8 element types, each with the same 5-piece architecture
- 161 total gestures (fire: 19, water: 21, ice: 16, electricity: 22, void: 17,
  light: 23, earth: 22, nature: 21)
- 8 custom GLSL fragment shaders (instanced) + 8 overlay shaders
- 57 GLB models across all elements
- 28 fullscreen bloom quads per frame
- 1 draw call per element type regardless of instance count

---

## Try Each Element

Each shader system has a standalone CodePen demo — click to play:

{% codepen https://codepen.io/joshtol/pen/preview/LERbbgK %} _Ice Crown —
Chromatic refraction, Voronoi crack lines, view-dependent sparkle_

{% codepen https://codepen.io/joshtol/pen/preview/LERbxpE %} _Fire Meditation —
Additive stacking with decoupled color/alpha_

{% codepen https://codepen.io/joshtol/pen/preview/zxKoNvX %} _Electric Surge —
3D Voronoi edge-distance bolts_

{% codepen https://codepen.io/joshtol/pen/preview/QwKGdym %} _Water Vortex —
Spray particles and splash ring geometry_

{% codepen https://codepen.io/joshtol/pen/preview/raMWjxP %} _Void Singularity —
Dark energy distortion_

{% codepen https://codepen.io/joshtol/pen/preview/YPGpNqq %} _Light Ascend —
Ethereal glow and volumetric rays_

{% codepen https://codepen.io/joshtol/pen/preview/jEMVyqx %} _Earth Impact —
Crystal morphing with orbit spawning_

{% codepen https://codepen.io/joshtol/pen/preview/jEMVyrK %} _Nature Cleanse —
Organic growth patterns_

[Full collection on CodePen](https://codepen.io/collection/YyWKxK)

---

## Links

- **Live demo**:
  [elemental-gestures.html](https://joshtol.github.io/emotive-engine/examples/3d/elemental-gestures.html)
- **GitHub**:
  [joshtol/emotive-engine](https://github.com/joshtol/emotive-engine)
- **npm**: `npm install @joshtol/emotive-engine`
- **CodePen collection**:
  [Emotive Engine — Elemental Shaders](https://codepen.io/collection/YyWKxK)

MIT licensed. PRs welcome.
