# 🌙 TO THE MOON - 3D Moon Implementation Plan

**Project:** Emotive Engine 3D Moon Geometry **Approach:** Shader-based crescent
clipping with NASA texture maps **Accuracy:** Real lunar surface data from NASA
LRO mission **Status:** Ready for implementation

---

## 🎯 Mission Objectives

1. Create realistic 3D moon geometry with NASA surface textures
2. Implement shader-based crescent shadow (sphere-sphere clipping)
3. Integrate with existing 3D geometry system
4. Support emotion-based lighting and glow effects
5. Enable smooth morphing to/from other shapes

---

## 📦 Required Assets

### NASA Texture Downloads (Manual - User Action Required)

**Base URL:** `https://svs.gsfc.nasa.gov`

**Required Downloads:**

| File                     | URL                                                    | Size    | Purpose               |
| ------------------------ | ------------------------------------------------------ | ------- | --------------------- |
| **Color Map (4K)**       | `/vis/a000000/a004700/a004720/lroc_color_poles_4k.tif` | 12.5 MB | Lunar surface albedo  |
| **Color Map (2K)**       | `/vis/a000000/a004700/a004720/lroc_color_poles_2k.tif` | 3.2 MB  | Fallback/performance  |
| **Displacement (16ppd)** | `/vis/a000000/a004700/a004720/ldem_16.tif`             | 63.3 MB | Normal map generation |

**Storage Location:**

```
assets/textures/Moon/
├── lroc_color_poles_4k.tif   (source)
├── lroc_color_poles_2k.tif   (source)
├── moon-color-4k.jpg         (web-optimized)
├── moon-color-2k.jpg         (web-optimized)
├── moon-normal-4k.jpg        (generated from displacement)
└── moon-normal-2k.jpg        (generated from displacement)
```

**Conversion Steps:**

1. Download `.tif` files from NASA
2. Convert TIFF → JPG using ImageMagick or Photoshop
3. Generate normal map from displacement map using:
    - Photoshop: Filter → 3D → Generate Normal Map
    - GIMP: Filters → Generic → Normal Map
    - Online: https://cpetry.github.io/NormalMap-Online/

---

## 🏗️ Architecture Overview

```
src/3d/geometries/
├── Moon.js                    (NEW - moon geometry + material)
├── ThreeGeometries.js         (MODIFY - add moon to registry)
└── index.js                   (MODIFY - export createMoon)

src/3d/shaders/
├── moonCrescent.vert.glsl     (NEW - vertex shader)
├── moonCrescent.frag.glsl     (NEW - fragment shader with clipping)
└── index.js                   (NEW - shader loader/manager)

assets/textures/Moon/          (NEW - texture storage)
└── (NASA texture files)
```

---

## 🚀 Implementation Phases

### Phase 1: Basic Moon Geometry (No Textures) ✅ COMPLETE

**Goal:** Gray sphere moon that works with existing system

**Tasks:**

- [x] Create `src/3d/geometries/Moon.js`
    - [x] Implement `createMoon()` - SphereGeometry (64x64 segments)
    - [x] Implement `createMoonMaterial()` - MeshStandardMaterial with texture
          loading
    - [x] Implement `createMoonFallbackMaterial()` - gray fallback material
    - [x] Implement `updateMoonGlow()` - emotion glow updater
    - [x] Export all functions
- [x] Modify `src/3d/geometries/ThreeGeometries.js`
    - [x] Import `createMoon`
    - [x] Add `moon` entry to `THREE_GEOMETRIES` object
    - [x] Configure blink animation (gentle pulse, 180ms duration)
    - [x] Set `material: 'custom'` flag for texture loading
- [x] Modify `src/3d/geometries/index.js`
    - [x] Export `createMoon`, `createMoonMaterial`,
          `createMoonFallbackMaterial`, `updateMoonGlow`
- [x] Update `examples/3d-demo.html`
    - [x] Add 🌙 Moon button to Geometries section
- [x] Build and test
    - [x] Run `npm run build:dev` - SUCCESS ✅
    - [x] Open 3D demo in browser

**Validation:**

- Moon appears as gray sphere ✅ (ready for textures)
- Morphing to/from moon works smoothly ✅
- Blinking animation plays correctly ✅
- Emotion colors apply to moon ✅

**Completed:** 2025-01-07

---

### Phase 2: NASA Texture Integration ✅ COMPLETE

**Goal:** Realistic lunar surface with color + normal maps

**Tasks:**

- [x] **USER ACTION:** Download NASA textures ✅
- [x] **USER ACTION:** Convert TIFF → JPG (4K + 2K versions) ✅
- [x] **USER ACTION:** Generate normal maps from displacement ✅
- [x] Create directory `assets/textures/Moon/` ✅
- [x] Copy optimized JPG files to directory ✅
- [x] Modify `src/3d/geometries/Moon.js` ✅
    - [x] Update `createMoonMaterial()` to load textures
    - [x] Configure `TextureLoader` for async loading
    - [x] Set up color map (`material.map`)
    - [x] Set up normal map (`material.normalMap`)
    - [x] Configure material properties:
        - [x] `roughness: 0.9` (matte surface)
        - [x] `metalness: 0.0` (non-metallic)
        - [x] `normalScale: new THREE.Vector2(1.5, 1.5)`
    - [x] Add texture wrapping (RepeatWrapping)
    - [x] Enable anisotropic filtering (16x)
    - [x] Add error handling with console logging
- [x] Modify `src/3d/Core3DManager.js` ✅
    - [x] Import moon material functions
    - [x] Detect `material: 'custom'` flag in geometry config
    - [x] Create TextureLoader instance
    - [x] Detect device (mobile = 2K, desktop = 4K)
    - [x] Call `createMoonMaterial()` with resolution
    - [x] Pass custom material to `createCoreMesh()`
    - [x] Store reference for glow updates
    - [x] Update `setEmotion()` to call `updateMoonGlow()`
- [x] Modify `src/3d/ThreeRenderer.js` ✅
    - [x] Accept optional `customMaterial` parameter
    - [x] Use custom material if provided
    - [x] Add console logging for custom material usage
- [x] Build and test
    - [x] Run `npm run build:dev` - SUCCESS ✅
    - [x] Open 3D demo in browser
    - [x] Click moon button
    - [x] Verify textures load (check console logs)

**Validation:**

- Realistic lunar surface visible ✅
- Craters and maria clearly defined ✅
- Normal map creates depth illusion under lighting ✅
- No texture seams or distortion ✅
- Emotion colors update moon glow ✅
- 4K textures on desktop, 2K on mobile ✅
- Moon size matches crystal height (radius 0.9) ✅
- Brightness optimized (roughness 0.7, emissive 0.5) ✅

**Issues Fixed:**

- Initial implementation only loaded textures on direct moon creation, not on
  morph
- Added texture loading to `morphToShape()` geometry swap
- Updated `swapGeometry()` to accept and apply custom materials
- Increased moon radius from 0.5 to 0.9 to match crystal geometry
- Boosted emissive glow for better visibility

**Completed:** 2025-01-07

---

### Phase 3: Shader-Based Crescent Clipping

**Goal:** Dynamic crescent shadow using fragment shader

**Shader Strategy:**

```glsl
// Pseudo-code for fragment shader
vec3 sphereCenter = vec3(0.0, 0.0, 0.0);        // Moon center
vec3 shadowCenter = vec3(offsetX, offsetY, 0.0); // Shadow sphere center
float moonRadius = 0.5;
float shadowRadius = 0.5;

// Calculate distance from fragment to shadow sphere center
float distToShadow = distance(worldPos, shadowCenter);

// If inside shadow sphere, clip (discard fragment)
if (distToShadow < shadowRadius) {
    discard; // Creates crescent by removing geometry
}

// Add soft edge gradient near clipping boundary
float edgeDist = distToShadow - shadowRadius;
if (edgeDist < softEdge) {
    alpha *= smoothstep(0.0, softEdge, edgeDist);
}
```

**Tasks:**

- [ ] Create `src/3d/shaders/moonCrescent.vert.glsl`
    - [ ] Pass world position to fragment shader
    - [ ] Include Three.js built-in uniforms (modelMatrix, viewMatrix, etc.)
    - [ ] Transform normals for lighting
- [ ] Create `src/3d/shaders/moonCrescent.frag.glsl`
    - [ ] Implement sphere-sphere clipping logic
    - [ ] Add uniforms: `shadowOffset` (vec2), `shadowCoverage` (float)
    - [ ] Integrate with texture maps (color + normal)
    - [ ] Add soft edge gradient (anti-aliasing)
    - [ ] Support emissive glow (emotion-based)
- [ ] Create `src/3d/shaders/index.js`
    - [ ] Load vertex/fragment shader files
    - [ ] Export as shader module
- [ ] Modify `src/3d/geometries/Moon.js`
    - [ ] Replace `MeshStandardMaterial` with `ShaderMaterial`
    - [ ] Inject custom shaders
    - [ ] Define uniforms:
        ```javascript
        uniforms: {
            colorMap: { value: colorTexture },
            normalMap: { value: normalTexture },
            shadowOffset: { value: new THREE.Vector2(0.7, 0.0) },
            shadowCoverage: { value: 0.85 },
            glowColor: { value: new THREE.Color() },
            glowIntensity: { value: 1.0 }
        }
        ```
    - [ ] Add methods: `setCrescentAngle()`, `setCrescentCoverage()`
- [ ] Modify `src/3d/Core3DManager.js`
    - [ ] Detect moon geometry and update shader uniforms
    - [ ] Animate crescent based on emotion (optional)
    - [ ] Pass glow color/intensity to shader

**Validation:**

- Crescent shadow appears correctly
- Shadow boundary is smooth (no jagged edges)
- Shadow animates when crescent angle changes
- Lighting still affects visible moon surface
- Emissive glow works through shader

---

### Phase 4: Integration & Polish

**Goal:** Seamless integration with emotion system

**Tasks:**

- [ ] Add moon-specific emotion behaviors
    - [ ] Calm emotion → fuller moon (less coverage)
    - [ ] Mystery/night emotions → sharper crescent (more coverage)
- [ ] Configure morph transitions
    - [ ] Slide crescent shadow on morph-to-moon
    - [ ] Fade crescent shadow on morph-from-moon
- [ ] Optimize shader performance
    - [ ] Test on mobile devices
    - [ ] Add LOD (Level of Detail) for texture resolution
- [ ] Add camera presets for moon viewing
    - [ ] "Full Moon" preset (front view, no rotation)
    - [ ] "Crescent" preset (angled view)
- [ ] Update documentation
    - [ ] Add moon to geometry list in README
    - [ ] Document shader uniforms for customization
    - [ ] Add usage examples

**Validation:**

- Moon responds to all emotions correctly
- Morphing is smooth and visually appealing
- Performance is acceptable (60fps on desktop, 30fps mobile)
- All gestures work with moon geometry

---

## 🛠️ Technical Specifications

### Geometry Details

- **Type:** `THREE.SphereGeometry`
- **Radius:** `0.5` (matches other geometries)
- **Segments:** `64x64` (smooth normals for lighting)
- **UV Mapping:** Default equirectangular (0-1 range)

### Material Configuration

```javascript
// Phase 2: Textured material
const material = new THREE.MeshStandardMaterial({
    map: colorMap, // NASA color texture
    normalMap: normalMap, // NASA-derived normal map
    normalScale: new THREE.Vector2(1.5, 1.5), // Bump intensity
    roughness: 0.9, // Matte surface
    metalness: 0.0, // Non-metallic
    emissive: new THREE.Color(glowColor), // Emotion glow
    emissiveIntensity: glowIntensity, // Glow strength
});

// Phase 3: Shader material (replaces above)
const material = new THREE.ShaderMaterial({
    vertexShader: moonCrescentVert,
    fragmentShader: moonCrescentFrag,
    uniforms: {
        colorMap: { value: colorTexture },
        normalMap: { value: normalTexture },
        shadowOffset: { value: new THREE.Vector2(0.7, 0.0) },
        shadowCoverage: { value: 0.85 },
        glowColor: { value: new THREE.Color(0xffffff) },
        glowIntensity: { value: 1.0 },
    },
    transparent: true,
    side: THREE.FrontSide,
});
```

### Shader Uniforms Reference

| Uniform          | Type        | Default      | Description                       |
| ---------------- | ----------- | ------------ | --------------------------------- |
| `colorMap`       | `sampler2D` | -            | NASA lunar surface color texture  |
| `normalMap`      | `sampler2D` | -            | NASA-derived normal map           |
| `shadowOffset`   | `vec2`      | `(0.7, 0.0)` | Shadow sphere offset (X, Y)       |
| `shadowCoverage` | `float`     | `0.85`       | Crescent coverage (0=full, 1=new) |
| `shadowSoftness` | `float`     | `0.05`       | Edge softness/blur amount         |
| `glowColor`      | `vec3`      | `(1,1,1)`    | Emotion-based glow color (RGB)    |
| `glowIntensity`  | `float`     | `1.0`        | Glow brightness multiplier        |

### Blink Animation Config

```javascript
blink: {
    type: 'gentle-pulse',
    duration: 180,                   // Slow, calm blink (ms)
    scaleAxis: [0.95, 0.95, 0.95],  // Subtle uniform scale
    glowBoost: 0.2,                 // Soft glow increase
    curve: 'sine'                    // Smooth easing
}
```

---

## 🔬 Shader Implementation Details

### Vertex Shader (`moonCrescent.vert.glsl`)

```glsl
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    // Calculate world position for fragment shader clipping
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
}
```

### Fragment Shader Outline (`moonCrescent.frag.glsl`)

```glsl
uniform sampler2D colorMap;
uniform sampler2D normalMap;
uniform vec2 shadowOffset;
uniform float shadowCoverage;
uniform float shadowSoftness;
uniform vec3 glowColor;
uniform float glowIntensity;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    // 1. Sample textures
    vec4 texColor = texture2D(colorMap, vUv);
    vec3 normalSample = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;

    // 2. Calculate shadow sphere clipping
    vec3 moonCenter = vec3(0.0, 0.0, 0.0);
    vec3 shadowCenter = vec3(shadowOffset.x, shadowOffset.y, 0.0);
    float moonRadius = 0.5;

    float distToShadow = distance(vWorldPosition, shadowCenter);
    float clipThreshold = moonRadius * shadowCoverage;

    // Hard clip if deep inside shadow
    if (distToShadow < clipThreshold) {
        discard;
    }

    // Soft edge gradient near boundary
    float edgeDist = distToShadow - clipThreshold;
    float alpha = 1.0;
    if (edgeDist < shadowSoftness) {
        alpha = smoothstep(0.0, shadowSoftness, edgeDist);
    }

    // 3. Basic lighting (simplified Phong)
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diffuse = max(dot(vNormal, lightDir), 0.0);

    // 4. Combine textures + lighting + glow
    vec3 finalColor = texColor.rgb * diffuse;
    finalColor += glowColor * glowIntensity * 0.2; // Emissive glow

    gl_FragColor = vec4(finalColor, alpha * texColor.a);
}
```

---

## 📊 Performance Targets

| Metric                | Desktop | Mobile  | Notes                             |
| --------------------- | ------- | ------- | --------------------------------- |
| **FPS**               | 60      | 30      | Maintain during rotation/gestures |
| **Texture Memory**    | < 30 MB | < 15 MB | 4K desktop, 2K mobile             |
| **Shader Complexity** | Medium  | Medium  | Keep fragment ops minimal         |
| **Draw Calls**        | 1       | 1       | Single mesh, single material      |

---

## 🧪 Testing Checklist

### Phase 1 Tests

- [ ] Moon appears in geometry selector
- [ ] Clicking moon button morphs to gray sphere
- [ ] Blink animation plays smoothly
- [ ] Emotions change glow color correctly
- [ ] All gestures (bounce, pulse, etc.) work
- [ ] Morphing to/from other shapes is smooth

### Phase 2 Tests

- [ ] Textures load without errors
- [ ] Lunar surface detail is visible
- [ ] Normal map creates depth under lighting
- [ ] No texture seams at poles or equator
- [ ] Lighting responds to camera movement
- [ ] Fallback gray material shows if textures fail

### Phase 3 Tests

- [ ] Crescent shadow appears correctly
- [ ] Shadow boundary is smooth (anti-aliased)
- [ ] Shadow offset can be adjusted via uniform
- [ ] Shadow coverage can be adjusted via uniform
- [ ] Lit side of moon still shows texture detail
- [ ] Emissive glow works in shader
- [ ] No z-fighting or rendering artifacts

### Performance Tests

- [ ] 60fps on desktop (Chrome, Firefox, Safari)
- [ ] 30fps on mobile (iOS Safari, Chrome Android)
- [ ] Texture loading doesn't freeze UI
- [ ] Shader compilation doesn't cause frame drops
- [ ] Memory usage is acceptable (< 100MB total)

---

## 🐛 Known Challenges & Solutions

### Challenge 1: TIFF to JPG Conversion

**Problem:** NASA provides TIFF files, browsers need JPG/PNG **Solution:** Use
ImageMagick or Photoshop for batch conversion

```bash
# ImageMagick command
magick lroc_color_poles_4k.tif -quality 90 moon-color-4k.jpg
```

### Challenge 2: Normal Map Generation

**Problem:** NASA provides displacement, need normal map **Solution:** Use
Photoshop "Generate Normal Map" or GIMP plugin

- Strength: 5-10 (adjust for crater depth)
- Blur: 1-2px (smooth transitions)

### Challenge 3: Shader Clipping Artifacts

**Problem:** Hard clipping creates jagged edges **Solution:** Implement soft
edge gradient (see shader code above)

### Challenge 4: Texture Seam at 0° Longitude

**Problem:** UV wrapping may create visible seam **Solution:** Ensure texture
has seamless wrap or rotate sphere

### Challenge 5: Mobile Performance

**Problem:** 4K textures too large for mobile GPUs **Solution:** Implement LOD
system - detect device and load 2K version

---

## 📚 References

### NASA Resources

- **CGI Moon Kit:** https://svs.gsfc.nasa.gov/4720/
- **Lunar Reconnaissance Orbiter:** https://www.nasa.gov/mission_pages/LRO/main/
- **Data Attribution:** NASA/GSFC/Arizona State University

### Three.js Documentation

- **ShaderMaterial:** https://threejs.org/docs/#api/en/materials/ShaderMaterial
- **TextureLoader:** https://threejs.org/docs/#api/en/loaders/TextureLoader
- **GLSL Reference:**
  https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language

### GLSL Shader Tutorials

- **The Book of Shaders:** https://thebookofshaders.com/
- **Shadertoy:** https://www.shadertoy.com/ (inspiration/examples)
- **Three.js Journey Shaders:** https://threejs-journey.com/lessons/shaders

---

## ✅ Success Criteria

**Phase 1 Complete When:**

- Gray moon sphere exists in geometry registry
- Morphing and blinking work identically to other shapes
- All emotions apply color correctly

**Phase 2 Complete When:**

- Realistic lunar surface visible with NASA textures
- Normal mapping creates convincing depth
- Loading states handled gracefully

**Phase 3 Complete When:**

- Crescent shadow clips geometry correctly via shader
- Shadow is smooth and anti-aliased
- Shadow parameters can be controlled dynamically

**Project Complete When:**

- All tests pass (see Testing Checklist)
- Performance targets met (60fps desktop, 30fps mobile)
- Moon integrated seamlessly with existing emotion/gesture system
- Documentation updated with moon examples

---

## 🚦 Next Steps

1. **USER ACTION REQUIRED:** Download NASA textures (see "Required Assets")
2. **USER ACTION REQUIRED:** Convert TIFF → JPG and generate normal maps
3. Begin Phase 1 implementation (basic gray moon geometry)
4. Validate Phase 1 before proceeding to Phase 2
5. Iterate through phases sequentially

---

**🌙 TO THE MOON! 🚀**

_Generated by Claude Code for Emotive Engine 3D_ _Last Updated: 2025-01-07_
