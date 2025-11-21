# Black Hole Geometry Implementation Plan

**Goal**: Create NASA-accurate Black Hole geometry for Emotive Engine 3D mascot
system, based on Event Horizon Telescope M87\* imagery.

**Reference**: NASA Chandra X-ray Observatory M87\* Black Hole image with
labeled components.

**Architecture**: THREE.Group with multiple meshes (shadow, accretion disk,
photon ring), custom shader materials with Photoshop-style blend layers,
particle accretion system with gravitational physics.

**Estimated Complexity**: 1000-1500 lines of code, 8-12 hours implementation
time.

---

## 🎯 Implementation Status: PRODUCTION READY ✅

### ✅ Phase 1: Core Implementation (COMPLETED)

All core black hole functionality has been implemented and integrated:

**Files Created:**

- ✅ `src/3d/shaders/blackHoleWithBlendLayers.js` (~220 lines) - Complete shader
  with differential rotation, Doppler beaming, turbulence, 4 blend layers
- ✅ `src/3d/geometries/BlackHole.js` (~360 lines) - THREE.Group with
  shadow/disk/photon ring, material creation, update functions
- ✅ `examples/3d/black-hole-demo.html` (~400 lines) - Demo page with physics
  info and controls

**Files Modified:**

- ✅ `src/3d/utils/MaterialFactory.js` - Added
  `createBlackHoleMaterialWrapper()` for emissive material routing
- ✅ `src/3d/geometries/ThreeGeometries.js` - Added `blackHole` entry to
  registry with blink config
- ✅ `src/3d/Core3DManager.js` - Added material updates, rotation config
  handling, autoRotate immunity, Group mesh material application
- ✅ `src/3d/particles/Particle3DTranslator.js` - Added
  `_translateGravitationalAccretion()` (~95 lines) with M87\* physics,
  hemisphere spawn constraints
- ✅ `src/3d/particles/Particle3DRenderer.js` - Added Z-axis culling to hide
  particles in front of black hole
- ✅ `src/3d/index.js` - Added geometry-specific particle behavior override for
  black hole
- ✅ `src/3d/ThreeRenderer.js` - Added THREE.Group detection and handling,
  material safety checks for Groups
- ✅ `src/core/particles/behaviors/gravitational-accretion.js` - Created core
  behavior for particle system registration
- ✅ `src/core/particles/behaviors/index.js` - Registered gravitationalAccretion
  behavior
- ✅ `scripts/generate-perlin-noise.cjs` - Node.js script for programmatic
  Perlin noise generation

**Key Features Implemented:**

- Event horizon shadow (2.0× Schwarzschild) with edge glow
- Accretion disk (2.5-8× Schwarzschild) with differential rotation
- Photon ring (1.5× Schwarzschild) with additive blending
- Keplerian orbital mechanics for particles
- Spaghettification physics (stretching starts at 2.5×, dramatic at 1.5×, death
  at 1.0×)
- Doppler beaming, temperature gradient, multi-octave turbulence
- 4 Photoshop-style blend layers
- Emotion-based color tinting

**Architecture Challenges Solved:**

- ✅ THREE.Group vs BufferGeometry handling in ThreeRenderer
- ✅ Material application to Group child meshes (disk, shadow, photon ring)
- ✅ Render loop material updates for Groups (skip coreMesh.material checks)
- ✅ Perlin noise texture generation with seamless tiling

**Phase 2: Emotion System Integration (COMPLETED)**

✅ Auto-Derived Black Hole Behavior:

- Added `deriveBlackHoleParams()` function in `BlackHole.js`
- Black hole properties automatically calculated from emotion modifiers:
    - `diskRotationSpeed` = emotion speed modifier
    - `turbulence` = intensity × (2 - smoothness) ← chaotic when high
      intensity + low smoothness
    - `dopplerIntensity` = 0.4 + (intensity × 0.3)
    - `shadowGlow` = max(0.2, intensity × 0.4)
- Passed `emotionData` through material creation pipeline (Core3DManager →
  MaterialFactory → BlackHole)
- Removed 26-line `geometries` sections from emotion files, replaced with 2-line
  comments
- Added emotion selector to `black-hole-demo.html` (fear, joy, neutral, anger,
  sadness, surprise)

**Architecture Benefits:**

- ✅ DRY principle - no config duplication
- ✅ Works for ALL emotions without custom config
- ✅ Emotion modifiers have natural meaning (speed → rotation, intensity →
  chaos)
- ✅ Easy to tune by adjusting emotion modifiers

**Advanced Features Implemented:**

✅ Blend Layer Controls:

- Added 4 blend layer sliders to black hole demo (right menu)
- Real-time adjustment of layer strengths (Base, Overlay, Additive, Screen)
- Proper shader uniform access through Group userData (diskMesh)
- Fixed disk rotation speed slider to use correct THREE.Group structure

**Next Steps:**

- ⏳ Optional: Additional UI features (Schwarzschild radius slider, disk tilt
  angle)
- ⏳ Optional: Visual effects (lens flare, gravitational lensing shader)

---

## Architecture Summary

### Key Design Decisions (Updated)

1. **Separate Shader**: Create `blackHoleWithBlendLayers.js` (NOT extend sun
   shader) for clean separation of concerns
2. **Material Pattern**: Follow sun pattern - geometry + material creation in
   `BlackHole.js`, wrapper in MaterialFactory
3. **Blend Layers**: Import shared `blendModesGLSL` from `utils/blendModes.js`
   (4 layers with mode/strength/enabled)
4. **Particle System**: Add `'accretion'` behavior to Particle3DTranslator
   (integrate with existing 2D→3D system)
5. **Rotation**: Export `BLACK_HOLE_ROTATION_CONFIG` with
   `baseSpeed: 0, axes: [0,0,0], type: 'still'`
6. **AutoRotate Immunity**: Black hole immune to autoRotate (like moon) - disk
   rotates in shader only
7. **THREE.Group**: Black hole is THREE.Group containing shadow + disk + photon
   ring meshes
8. **Material Type**: Mark as `'emissive'` in geometry registry (like sun) to
   route to correct MaterialFactory path

### Files to Create/Modify

**New Files:**

- `src/3d/shaders/blackHoleWithBlendLayers.js` - Vertex + fragment shaders with
  blend layers
- `src/3d/geometries/BlackHole.js` - Geometry creation + material creation +
  update function
- `examples/3d/black-hole-demo.html` - Demo page with tabbed controls
- `assets/textures/perlin-noise-512.png` - Noise texture (user to provide)

**Modified Files:**

- `src/3d/utils/MaterialFactory.js` - Add black hole case to emissive materials
- `src/3d/geometries/ThreeGeometries.js` - Add black hole entry to registry
- `src/3d/Core3DManager.js` - Handle black hole updates, autoRotate immunity
- `src/3d/particles/Particle3DTranslator.js` - Add `_translateAccretion()`
  method
- `src/core/emotions/base/*.js` - Add `blackHole:` config to all base emotions

---

## Phase 1: Core Implementation (Do First)

### 1. Geometry Creation - `src/3d/geometries/BlackHole.js`

#### Core Structure

- [x] Create `createBlackHoleGroup()` function returning THREE.Group
- [x] Define Schwarzschild radius constant (base unit for all measurements)
- [x] Create multi-mesh hierarchy: Shadow + Disk + Photon Ring

#### Event Horizon Shadow (Mesh 1)

- [x] Create black sphere:
      `new THREE.SphereGeometry(schwarzschildRadius * 2.0, 64, 64)`
- [x] Material: Simple shader with edge glow (separate from disk shader)
    - [x] Pure black base color
    - [x] Edge glow using fresnel effect (normal dot camera)
    - [x] Uniform: `shadowGlowIntensity`, `shadowGlowColor`
- [x] Render order: 1 (renders first, behind everything)
- [x] Position: Center (0, 0, 0)

#### Accretion Disk (Mesh 2)

- [x] Create flat ring: Custom BufferGeometry or THREE.RingGeometry
- [x] Inner radius: 2.5x Schwarzschild radius
- [x] Outer radius: 8.0x Schwarzschild radius
- [x] Segments: 128 radial, 64 angular (high detail for smooth rotation)
- [x] Render order: 2 (middle layer)
- [x] Initial tilt: Match NASA M87\* image angle (~17° from face-on)

#### Photon Ring (Mesh 3)

- [x] Create thin torus:
      `new THREE.TorusGeometry(schwarzschildRadius * 1.5, thickness, 64, 128)`
- [x] Thickness: Very thin (0.05x Schwarzschild radius)
- [x] Material: Emissive bright white/yellow with AdditiveBlending
- [x] Render order: 3 (renders last, brightest on top)
- [x] Position: At 1.5x Schwarzschild radius (photon sphere)

#### Group Assembly

- [x] Add all meshes to THREE.Group
- [x] Set group scale to match other geometries (radius ~0.5 default scale)
- [x] Set render orders: Shadow(1) → Disk(2) → Photon Ring(3)
- [x] Return THREE.Group (not a config constant)

#### Exports

- [x] Export `createBlackHoleGroup()` - geometry creation function
- [x] Export `BLACK_HOLE_ROTATION_CONFIG` - rotation behavior config
- [x] Export `createBlackHoleMaterial(textureLoader, options)` - material
      creation
- [x] Export `updateBlackHoleMaterial(material, deltaTime, options)` - update
      function

---

### 2. Custom Shader Material - `src/3d/shaders/blackHoleWithBlendLayers.js`

**Architecture Decision**: Create separate black hole shader (NOT extend sun
shader) for clean separation of concerns. Import shared blend mode utilities
from `utils/blendModes.js`.

#### Vertex Shader

- [x] Pass UV coordinates to fragment shader
- [x] Pass world position for Doppler calculations
- [x] Pass view position (camera-relative) for shadow edge glow
- [x] Pass normal vectors for edge detection (shadow glow)
- [x] Export as `blackHoleWithBlendLayersVertexShader`

#### Fragment Shader - Core Features

- [x] **Differential Rotation**: Inner disk rotates faster than outer (Kepler's
      3rd law)
    - [x] Formula: `angularVelocity = baseSpeed / pow(radius, 1.5)`
    - [x] Uniform: `time` for animated rotation
    - [x] Uniform: `diskRotationSpeed` for speed control
    - [x] Rotate UV coordinates in shader based on radial distance

- [x] **Doppler Beaming**: Approaching side brighter (relativistic effect)
    - [x] Calculate velocity vector from rotation direction
    - [x] Apply brightness boost to approaching side (left in M87\* image)
    - [x] Uniform: `dopplerIntensity` (0.0 to 1.0, default 0.6)
    - [x] Brightness multiplier: `1.0 + dopplerIntensity * velocityDotCamera`

- [x] **Color Gradient**: Radial gradient from inner (bright) to outer (dim)
    - [x] Inner edge: Hot white/blue (high energy)
    - [x] Outer edge: Cool red/orange (lower energy)
    - [x] Uniform: `emotionColorTint` (vec3) for emotion-based color shifting
    - [x] Uniform: `emotionColorStrength` (float) to control tint intensity

- [x] **Turbulence**: Flowing striations using noise texture
    - [x] Sample noise texture with animated UV offset
    - [x] Layer multiple octaves for detail (2-3 octaves)
    - [x] Uniform: `noiseTexture` (sampler2D - 512x512 PNG Perlin noise)
    - [x] Uniform: `turbulenceStrength` (0.0 to 1.0, default 0.4)
    - [x] Animate noise offset over time for flowing effect

**Note**: Shadow edge glow is handled by separate shadow mesh shader (not in
disk shader)

#### Fragment Shader - Blend Layer System (4 Layers)

- [x] Import blend mode functions from `utils/blendModes.js` (use
      `${blendModesGLSL}`)
- [x] **Layer 1**: Base disk appearance adjustment
    - [x] Blend mode: Configurable (uniform: `layer1Mode`)
    - [x] Uniform: `layer1Enabled`, `layer1Strength`, `layer1Mode`
    - [x] Default: Normal blend @ 1.0 strength

- [x] **Layer 2**: Turbulence/detail enhancement
    - [x] Blend mode: Configurable (uniform: `layer2Mode`)
    - [x] Uniform: `layer2Enabled`, `layer2Strength`, `layer2Mode`
    - [x] Default: Overlay @ 0.4 strength

- [x] **Layer 3**: Accretion stream highlights
    - [x] Blend mode: Configurable (uniform: `layer3Mode`)
    - [x] Uniform: `layer3Enabled`, `layer3Strength`, `layer3Mode`
    - [x] Default: Add @ 0.6 strength

- [x] **Layer 4**: Atmospheric/edge effects
    - [x] Blend mode: Configurable (uniform: `layer4Mode`)
    - [x] Uniform: `layer4Enabled`, `layer4Strength`, `layer4Mode`
    - [x] Default: Screen @ 0.3 strength

#### Blend Layer Application

- [x] Apply layers sequentially (Layer 1 → 2 → 3 → 4)
- [x] Each layer:
      `finalColor = applyBlendMode(finalColor, layerColor, mode, strength, enabled)`
- [x] Match sun shader pattern for consistency

#### Uniforms Summary

```glsl
// Animation
uniform float time;
uniform float diskRotationSpeed;

// Visual effects
uniform float dopplerIntensity;
uniform float turbulenceStrength;
uniform sampler2D noiseTexture;

// Blend layers (4 layers × 3 properties = 12 uniforms)
uniform float layer1Mode;
uniform float layer1Strength;
uniform float layer1Enabled;
// ... repeat for layers 2, 3, 4

// Emotion-based color shifting
uniform vec3 emotionColorTint;
uniform float emotionColorStrength;

// Base color/opacity
uniform vec3 baseColor;
uniform float opacity;
```

#### Export Functions

- [x] Export `getBlackHoleWithBlendLayersShaders()` function
- [x] Returns: `{ vertexShader, fragmentShader }`
- [x] Match sun shader export pattern

---

### 3. Black Hole Geometry Integration - `src/3d/geometries/BlackHole.js`

**Architecture Decision**: Follow sun pattern - geometry creation + material
creation in same file, then export material wrapper for MaterialFactory.

#### Geometry Creation Functions

- [x] Export `createBlackHoleGroup()` - returns THREE.Group with all meshes
- [x] Export `BLACK_HOLE_ROTATION_CONFIG` - rotation behavior config
- [x] Export `createBlackHoleMaterial(textureLoader, options)` - material
      creation

#### Black Hole Material Creation

- [x] Function: `createBlackHoleMaterial(textureLoader, options = {})`
- [x] Load noise texture: `/assets/textures/perlin-noise-512.png`
- [x] Import `getBlackHoleWithBlendLayersShaders()` from shader file
- [x] Create THREE.ShaderMaterial with blend layer uniforms for **disk mesh**
- [x] Create simple shader for **shadow mesh** (edge glow only)
- [x] Initialize all uniforms with default values
- [x] Return object: `{ diskMaterial, shadowMaterial }` (or apply directly to
      meshes in Group)

#### Update Function

- [x] Export `updateBlackHoleMaterial(material, deltaTime, options = {})`
- [x] Update `time` uniform (for rotation animation)
- [x] Update `emotionColorTint` if emotion changed
- [x] Called from Core3DManager render loop (like `updateSunMaterial()`)

---

### 4. Material Factory Integration - `src/3d/utils/MaterialFactory.js`

#### New Material Type

- [x] Add `case 'blackHole':` to `createEmissiveMaterial()` function
- [x] Import `createBlackHoleMaterial` from BlackHole.js
- [x] Call `createBlackHoleMaterial(textureLoader, options)` wrapper
- [x] Return `{ material, type: 'blackHole' }`

#### MaterialFactory Wrapper

- [x] Function:
      `createBlackHoleMaterialWrapper(textureLoader, glowColor, glowIntensity, materialVariant)`
- [x] Pass options to BlackHole.js material creator (follows sun pattern)
- [x] Return `{ material, type: 'blackHole' }`

---

### 5. Geometry Registry - `src/3d/geometries/ThreeGeometries.js`

#### Add Black Hole Entry

- [x] Import `createBlackHoleGroup` from `BlackHole.js`
- [x] Add `'blackHole'` entry to `THREE_GEOMETRIES` registry:

```javascript
blackHole: {
    geometry: createBlackHoleGroup(),
    material: 'emissive', // Signal to use emissive material (like sun)
    blink: {
        type: 'gravitational-pulse',
        duration: 300,
        scaleAxis: [1.1, 1.1, 1.1], // Slight expansion
        glowBoost: 0.8, // Strong intensity pulse
        curve: 'sine'
    }
}
```

---

### 6. Core3DManager Integration - `src/3d/Core3DManager.js`

**Architecture Decision**: Core3DManager already supports THREE.Group via
`this.coreMesh`. Black hole will be treated as emissive geometry (like sun),
with special handling for multi-mesh Group structure.

#### Geometry Loading

- [x] Handle `'blackHole'` geometry type in constructor
- [x] Create black hole meshes using MaterialFactory
- [x] Add to scene with proper render order

#### Material Updates in Render Loop

- [x] Import `updateBlackHoleMaterial` from BlackHole.js
- [x] Call `updateBlackHoleMaterial(material, deltaTime)` in render loop
- [x] Update `time` uniform for disk rotation animation
- [x] Update `emotionColorTint` when emotion changes
- [x] Follow sun pattern: check `if (this.customMaterialType === 'blackHole')`

#### Rotation Behavior

- [x] Import `BLACK_HOLE_ROTATION_CONFIG` from BlackHole.js
- [x] Pass to RotationBehavior constructor as `geometryRotation` parameter (like
      sun does)
- [x] Config values:
    ```javascript
    {
      baseSpeed: 0,
      axes: [0, 0, 0],
      type: 'still'
    }
    ```
- [x] Disk rotates in shader (not mesh rotation)
- [x] Emotion modifiers can tilt the Group (pitch/roll via shake), but no Y-axis
      spin
- [x] Example: Anger adds shake to tilt, Calm straightens

#### autoRotate Handling

- [x] Black hole should be **immune** to autoRotate (like moon)
- [x] Add check in constructor:
      `const isBlackHole = this.geometryType === 'blackHole';`
- [x] Disable `autoRotate` if moon or black hole:
      `autoRotate: (isMoon || isBlackHole) ? false : ...`
- [x] Re-enable when morphing away from black hole (existing morph code)

---

### 7. Particle Accretion System - `src/3d/particles/Particle3DTranslator.js`

**Architecture Decision**: Add new `'gravitationalAccretion'` behavior to
Particle3DTranslator (NOT separate system) for integration with existing 2D→3D
particle system.

#### New Translation Method: `_translateGravitationalAccretion()`

- [x] Add to Particle3DTranslator class (alongside surveillance, zen, etc.)
- [x] Takes 2D particle position from existing particle system
- [x] Applies gravitational physics to pull toward center
- [x] Calculates orbital motion (tangential velocity)
- [x] Returns 3D position (THREE.Vector3)

#### Gravitational Physics Implementation

- [x] Calculate distance from particle to center
- [x] Apply gravitational force: `force = G / (distance^2)`
- [x] Tuned constant: `G_CONSTANT = 0.5` (visual effect, not real physics)
- [x] Update particle velocity toward center
- [x] Angular momentum: particles spiral inward (not straight line)

#### Orbital Decay

- [x] Particles spawn at outer edge: `baseRadius * 8.0` (disk outer radius)
- [x] Start with high angular momentum (fast tangential velocity)
- [x] Friction/drag dissipates angular momentum → particles lose energy
- [x] As particles spiral inward, tangential speed increases (Kepler's law)
- [x] Total spiral time: ~10-15 seconds from spawn to event horizon
- [x] Physics: `tangentialSpeed ∝ 1/sqrt(radius)` (Keplerian orbit)

#### Spaghettification Effect

- [x] **Physics Update**: For M87\* supermassive black hole, tidal forces are
      weak near horizon
- [x] Start subtle stretching at disk inner edge: `baseRadius * 2.5` (innermost
      stable orbit)
- [x] Dramatic stretching begins at: `baseRadius * 1.5` (photon sphere)
- [x] Apply tidal stretching: elongate particle along radial vector (scale.y \*=
      stretchFactor)
- [x] Fade opacity progressively:
      `opacity = smoothstep(1.5, 1.0, distance / baseRadius)`
- [x] Particle "dies" (recycled) at event horizon edge: `baseRadius * 1.0` (not
      inside horizon)
- [x] Stretch factor formula:
      `stretchFactor = 1.0 + max(0, (2.5 - normalizedDistance) * 0.5)`

#### Visual Properties

- [x] Particle color matches disk gradient (from emotion color)
- [x] Size scales slightly larger during spaghettification
- [x] Use additive blending (already in Particle3DRenderer)
- [x] Emotion-based tinting (same as disk shader)

#### Integration Pattern

- [x] Add `'gravitationalAccretion'` case to behavior switch in
      translateParticlePosition()
- [x] Store particle-specific orbital data in `particle.behaviorData`:
    - `orbitalAngle` - current angle around center
    - `orbitalRadius` - distance from center
    - `angularVelocity` - rotation speed
- [x] Initialize on first translation, persist across frames

---

### 8. Noise Texture Asset - `assets/textures/perlin-noise-512.png`

#### Specifications

- [x] Size: 512x512 pixels
- [x] Format: PNG (better compression than JPG for tileable textures)
- [x] Content: Perlin noise (seamless tileable)
- [x] Transparency: Some transparency at edges for smooth blending
- [x] Contrast: Medium contrast (not too harsh, not too flat)

#### Generation Method (Completed)

**✅ Generated programmatically** using `scripts/generate-perlin-noise.cjs`:

- Custom Perlin noise algorithm implementation
- Multi-octave noise (4 octaves, persistence 0.5)
- Seamless tiling via 4D torus coordinate mapping
- Medium contrast adjustment (0.1-0.9 range with gamma 1.2)
- Output: 512×512 PNG (106.97 KB)

#### Testing

- [x] Verify tiling (no visible seams when repeated)
- [x] Test in shader (should create flowing, organic patterns)
- [x] Adjust contrast if needed (too strong = distracting, too weak = invisible)

---

### 9. Demo Page - `examples/3d/black-hole-demo.html`

#### Base Structure

- [x] Copy `sun-demo.html` as template
- [x] Update title: "Black Hole 3D Geometry Demo - M87\*"
- [x] Initialize with `coreGeometry: 'blackHole'` and
      `materialVariant: 'multiplexer'`
- [x] Load at fear emotion initially (dark theme)

#### UI Layout - Simple Side Menus (Implemented)

- [x] Left menu: Particle toggle, disk glow toggle, controls toggle, rotation
      speed slider
- [x] Center: Black hole canvas (responsive, full size)
- [x] Right menu: NASA M87\* physics info panels
- [x] Match sun-demo.html styling for consistency

#### Controls Implemented

- [x] **Particle Toggle**: Enable/disable gravitational accretion particles
- [x] **Disk Glow Toggle**: Enable/disable accretion disk glow
- [x] **Camera Controls Toggle**: Enable/disable OrbitControls
- [x] **Disk Rotation Speed Slider**: 0.0 to 3.0 (default 1.0)
    - Updates `diskRotationSpeed` uniform in real-time

#### Info Panels (Right Menu)

- [x] NASA M87\* Physics panel
    - Event horizon (2.0× Schwarzschild)
    - Photon ring (1.5× Schwarzschild)
    - ISCO (2.5× Schwarzschild)
    - Accretion disk (2.5-8× Schwarzschild)
    - Doppler beaming explanation
- [x] Particle Physics panel
    - Orbital decay mechanics
    - Spaghettification zones
    - Velocity increases as radius decreases
- [x] References panel

#### Visual Layout

- [x] Left menu: Controls (scrollable, dark theme)
- [x] Center: Canvas (responsive, aspect ratio 1:1)
- [x] Right menu: Physics info (scrollable, educational)
- [x] Match styling of sun-demo.html (consistent UI)

---

### 9. Emotion Configurations - `src/core/emotions/base/*.js` ✅ COMPLETED

#### ✅ Auto-Derivation System (Implemented Instead of Per-Emotion Configs)

**Architecture Decision**: Instead of adding verbose `blackHole:` configs to
each emotion file, we implemented an auto-derivation system that calculates
black hole behavior from existing emotion modifiers.

**Implementation**:

- [x] Added `deriveBlackHoleParams(emotionData)` function in `BlackHole.js`
- [x] Passed `emotionData` through material creation pipeline
- [x] Updated emotion files with 2-line explanatory comments (replaced 26-line
      configs)

**Auto-Derivation Formula** (`BlackHole.js:188-199`):

```javascript
function deriveBlackHoleParams(emotionData) {
    const speed = emotionData?.modifiers?.speed || 1.0;
    const intensity = emotionData?.modifiers?.intensity || 1.0;
    const smoothness = emotionData?.modifiers?.smoothness || 1.0;

    return {
        diskRotationSpeed: speed, // Faster emotion = faster disk
        turbulence: intensity * (2.0 - smoothness), // High intensity + low smoothness = chaotic
        dopplerIntensity: 0.4 + intensity * 0.3, // More intense = stronger doppler
        shadowGlow: Math.max(0.2, intensity * 0.4), // Brighter emotions = more edge glow
    };
}
```

**Results by Emotion**:

- [x] **Fear** (speed: 1.4, intensity: 1.2, smoothness: 0.5): Fast rotation,
      high turbulence (1.8), strong effects
- [x] **Joy** (speed: 1.8, intensity: 1.1, smoothness: 1.0): Very fast rotation,
      moderate turbulence (1.1), bright
- [x] **Neutral** (speed: 1.0, intensity: 1.0, smoothness: 1.0): Baseline
      rotation, balanced turbulence (1.0)
- [x] **Anger**: Auto-derives from modifiers (typically high speed + intensity)
- [x] **Sadness**: Auto-derives from modifiers (typically low speed + intensity)
- [x] **Surprise**: Auto-derives from modifiers

**Benefits**:

- ✅ DRY principle - no config duplication across 20+ emotion files
- ✅ Works for ALL emotions automatically (including custom user emotions)
- ✅ Semantic meaning - emotion modifiers naturally map to black hole physics
- ✅ Easy to tune - adjust emotion modifiers, not geometry-specific configs

---

### 10. Advanced Features - Gravitational Lensing

#### Lensing Shader (Optional Enhancement)

- [ ] Distort background stars around black hole shadow
- [ ] Create Einstein ring effect (light bending around event horizon)
- [ ] Render background scene to texture
- [ ] Apply radial distortion in post-processing shader
- [ ] Uniform: `u_lensingStrength` (0.0 to 1.0, default 0.5)

#### Implementation Approach

- [ ] Option A: Post-processing effect (render to texture, apply distortion)
- [ ] Option B: Refraction shader on shadow mesh
- [ ] Performance consideration: May be expensive on mobile (toggle-able)

#### Demo Controls

- [ ] Add "Gravitational Lensing" checkbox in demo page
- [ ] Strength slider (if enabled)

---

### 11. Advanced Features - Relativistic Jets ✅ COMPLETE

#### Jet Geometry

- [x] Create two cone geometries for jets (top and bottom)
- [x] Material: Emissive with additive blending
- [x] Color: Blue/white (synchrotron radiation)
- [x] Length: ~10x Schwarzschild radius
- [x] Width: Narrow at base, widens gradually

#### Jet Shader

- [x] Animated flow (particles streaming outward via vertex displacement)
- [x] Opacity gradient (bright at base, fades at tip)
- [x] Flickering effect (unstable jet turbulence via sin waves)
- [x] Radial fade from center (brightest along jet axis)

#### Emotion Integration

- [x] Jets hidden by default (jetIntensity: 0.0)
- [x] Jets toggleable via UI for ALL emotions
- [x] Jet intensity controllable via slider (0.0 to 1.0)
- [x] Uniform: `jetIntensity` controls visibility and brightness

#### Demo Controls

- [x] Added "Show Jets" toggle button in demo page
- [x] Intensity slider (0% to 100%)
- [x] Button shows active state when jets visible
- [x] Slider updates button state automatically

#### Implementation Details (`BlackHole.js:153-234`)

**Jet Cone Geometry**:

```javascript
const jetLength = SCHWARZSCHILD_RADIUS * 10.0;
const jetTopRadius = SCHWARZSCHILD_RADIUS * 0.8;
const topJetGeometry = new THREE.ConeGeometry(
    jetTopRadius,
    jetLength,
    16,
    8,
    true
);
topJetGeometry.translate(0, jetLength / 2, 0);
```

**Jet Shader Uniforms**:

- `time`: Animation clock for flowing particles
- `jetIntensity`: Controls visibility (0.0 = hidden, 1.0 = full brightness)
- `jetColor`: Blue-white synchrotron radiation (0.7, 0.85, 1.0)

**Vertex Shader**: Applies flowing displacement
(`sin(vUv.y * 15.0 - time * 3.0)`)

**Fragment Shader**:

- Opacity gradient: `1.0 - vUv.y` (bright at base, transparent at tip)
- Flickering: `0.8 + 0.2 * sin(time * 5.0)`
- Radial fade: `1.0 - length(vUv.x - 0.5) * 2.0`
- Combined with `jetIntensity` uniform for smooth visibility control

---

### 12. Advanced Features - Hawking Radiation

#### Particle Effect

- [ ] Spawn tiny particles just outside event horizon
- [ ] Particles drift outward slowly (quantum tunneling simulation)
- [ ] Very faint glow (barely visible)
- [ ] Color: Soft white/blue

#### Physics Simulation

- [ ] Random spawn locations on event horizon surface
- [ ] Small outward velocity (escape velocity)
- [ ] Fade out after ~2-3 seconds
- [ ] Very sparse (1-2 particles per second)

#### Emotion Integration

- [ ] Hawking radiation only visible in "calm" emotion (subtle, contemplative)
- [ ] Represents quantum uncertainty and information paradox

#### Demo Controls

- [ ] Add "Hawking Radiation" checkbox in demo page
- [ ] Intensity slider (particle spawn rate)

---

### 13. Testing & Validation

#### Visual Accuracy

- [ ] Compare to NASA M87\* reference image
- [ ] Verify Doppler beaming asymmetry (left side brighter)
- [ ] Verify disk tilt angle matches reference (~17°)
- [ ] Verify photon ring at correct radius (1.5x Schwarzschild)
- [ ] Verify shadow size (2x event horizon)

#### Performance Testing

- [ ] Mobile devices (target: 30+ FPS)
- [ ] Desktop (target: 60 FPS)
- [ ] Particle count stress test (max particles before slowdown)
- [ ] Shader complexity (optimize if needed)

#### Emotion Transitions

- [ ] Test morphing from sphere → black hole
- [ ] Test morphing from moon → black hole
- [ ] Test emotion changes (anger → calm → joy)
- [ ] Verify color tints apply correctly
- [ ] Verify rotation behavior changes smoothly

#### Blend Layer System

- [ ] Test all blend modes (Add, Multiply, Screen, Overlay, etc.)
- [ ] Verify layer enable/disable works
- [ ] Verify strength sliders work (0.0 to 1.0)
- [ ] Test layer combinations (multiple layers active)

#### Particle Accretion

- [ ] Verify particles orbit correctly
- [ ] Verify spaghettification at inner radius
- [ ] Verify particles fade at event horizon
- [ ] Test particle recycling (no memory leaks)

---

### 14. Optimization

#### Shader Optimizations

- [ ] Use `mediump` precision where possible (mobile performance)
- [ ] Minimize texture lookups (cache noise samples)
- [ ] Simplify blend mode functions (remove unused modes)
- [ ] Use precomputed constants (e.g., Schwarzschild radius multiples)

#### Geometry Optimizations

- [ ] LOD (Level of Detail) for disk geometry (reduce segments on mobile)
- [ ] Frustum culling for jets (don't render if off-screen)
- [ ] Backface culling where applicable

#### Particle Optimizations

- [ ] Limit max particle count (e.g., 200 particles)
- [ ] Use instanced rendering (if available)
- [ ] Cull particles outside camera frustum

#### Asset Optimization

- [ ] Compress noise texture (PNG with low color depth if possible)
- [ ] Lazy-load advanced features (jets, lensing, Hawking radiation)

---

### 15. Documentation

#### Code Comments

- [ ] Document BlackHole.js geometry creation
- [ ] Document BlackHoleShader.js uniforms and blend modes
- [ ] Document AccretionParticles.js physics formulas
- [ ] Add JSDoc comments to all public functions

#### README Section

- [ ] Add "Black Hole Geometry" section to main README
- [ ] Explain scientific accuracy (based on NASA EHT M87\* image)
- [ ] List features (Doppler beaming, spaghettification, blend layers)
- [ ] Link to demo page (black-hole-demo.html)

#### Demo Page Instructions

- [ ] Add "About" section explaining black hole physics
- [ ] Explain each control (what it does, why it's there)
- [ ] Add tooltips for scientific terms (Schwarzschild radius, Doppler beaming,
      etc.)

---

### 16. Assets Checklist

- [ ] `src/3d/geometries/BlackHole.js` (geometry creation)
- [ ] `src/3d/materials/BlackHoleShader.js` (vertex + fragment shaders)
- [ ] `src/3d/particles/AccretionParticles.js` (particle physics)
- [ ] `assets/textures/perlin-noise-512.png` (noise texture)
- [ ] `examples/3d/black-hole-demo.html` (demo page)
- [ ] Updates to `src/3d/materials/MaterialFactory.js`
- [ ] Updates to `src/3d/geometries/ThreeGeometries.js`
- [ ] Updates to `src/core/Core3DManager.js`
- [ ] Updates to emotion configs (anger.js, joy.js, calm.js, etc.)

---

### 17. Final Checklist

#### Core Implementation

- [ ] Black hole geometry renders correctly
- [ ] Accretion disk rotates in shader (differential rotation)
- [ ] Doppler beaming creates asymmetry (left brighter)
- [ ] Photon ring is visible and bright
- [ ] Shadow is pure black with subtle edge glow

#### Blend Layer System

- [ ] All 4 layers work independently
- [ ] All blend modes work (Add, Multiply, Screen, Overlay, etc.)
- [ ] Strength sliders control opacity
- [ ] Enable/disable toggles work

#### Particle Accretion

- [ ] Particles orbit and spiral inward
- [ ] Spaghettification effect at inner disk
- [ ] Particles fade at event horizon
- [ ] No performance issues with max particles

#### Demo Page

- [ ] All sliders work and update in real-time
- [ ] Emotion selector changes color tint
- [ ] Blend layer controls are functional
- [ ] Layout is responsive and matches sun-demo.html

#### Advanced Features

- [ ] Gravitational lensing (optional, toggle-able)
- [ ] Relativistic jets (optional, toggle-able)
- [ ] Hawking radiation (optional, toggle-able)

#### Performance

- [ ] 30+ FPS on mobile devices
- [ ] 60 FPS on desktop
- [ ] No memory leaks in particle system
- [ ] Smooth emotion transitions

#### Polish

- [ ] Code is documented with comments
- [ ] README is updated
- [ ] Demo page has instructions
- [ ] All assets are optimized

---

## Estimated Timeline

- **Geometry Creation**: 1-2 hours
- **Shader Development**: 3-4 hours (most complex part)
- **Particle System**: 2-3 hours
- **Integration & Testing**: 1-2 hours
- **Demo Page**: 1 hour
- **Polish & Optimization**: 1 hour

**Total**: 8-12 hours for complete implementation with all advanced features.

---

## Scientific References

- **NASA Chandra X-ray Observatory**: M87\* Black Hole imagery
- **Event Horizon Telescope (EHT)**: First black hole photograph (2019)
- **Schwarzschild Metric**: Event horizon radius calculation
- **Doppler Beaming**: Relativistic brightness asymmetry
- **Kepler's Third Law**: Differential rotation in accretion disks
- **Spaghettification**: Tidal forces near event horizon

---

## Notes

- This plan includes ALL features in Phase 1 (no Phase 2)
- Photoshop-style blend layers (not separate texture layers)
- Disk rotates in shader, event horizon stays still (scientifically accurate)
- Black hole is immune to autoRotate (like moon)
- Particle accretion uses gravitational physics simulation
- Maximum realism balanced with performance constraints (30+ FPS mobile)
