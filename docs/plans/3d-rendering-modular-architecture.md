# 3D Rendering Modular Architecture - Full Pipeline Design

**Status:** Design Complete - Ready for Implementation
**Date:** 2025-10-31
**Approach:** Full Modular Pipeline (Zero Tech Debt)
**Estimated Timeline:** 4-6 weeks
**Estimated Size Impact:** ~47.5KB → ~120KB (full build) gzipped

## Executive Summary

This document outlines a complete modular architecture for the Emotive Engine 3D rendering system. The design transforms the current monolithic 3D implementation into a clean, modular pipeline with support for advanced features including:

- **Lighting System:** Directional, point, and ambient lights
- **Shadow System:** PCF-filtered shadow mapping
- **PBR Materials:** Physically-based rendering with metallic-roughness workflow
- **Post-Processing:** Bloom, SSAO, tone mapping
- **Shader System:** Chunk-based dynamic shader generation
- **Feature Toggles:** Tree-shakeable build variants (minimal, standard, full)

**Primary Use Case:** Real-time puppetry and emotional expression performance with AI/human interface
**Performance Targets:** 60 FPS desktop, 30 FPS mobile
**Visual Priorities:** Silhouette clarity, expressive lighting, atmospheric effects

## Current State Analysis

### Existing Implementation
- **Size:** 47.5KB gzipped, 1,003 LOC
- **Architecture:** Monolithic Core3DManager.js + WebGLRenderer.js
- **Features:** Basic 3D positioning, rotation, scale, particle system
- **Limitations:**
  - No lighting (pure white geometry)
  - No shadows
  - No material system
  - Limited visual appeal for performance use

### Pain Points
1. All 3D rendering logic in single Core3DManager.js file
2. WebGLRenderer.js mixing concerns (rendering, wireframe, shader management)
3. No extensibility for new materials or effects
4. Shader code hardcoded in renderer
5. Cannot selectively enable/disable features

## Architecture Overview

### Design Principles

1. **Single Responsibility:** Each module handles one concern
2. **Composition Over Inheritance:** Passes implement interfaces, don't extend bases
3. **Dependency Injection:** Components receive dependencies, don't create them
4. **Feature Toggles:** Runtime and build-time feature elimination
5. **Size Discipline:** No file exceeds 200 LOC (enforced via linting)

### Directory Structure

```
src/3d/
├── renderer/
│   ├── WebGLRenderer.js        # Core WebGL context & state (150 LOC)
│   ├── RenderPipeline.js       # Orchestrates render passes (120 LOC)
│   └── FramebufferManager.js   # FBO pooling & management (100 LOC)
├── passes/
│   ├── GeometryPass.js         # Main geometry rendering (80 LOC)
│   ├── ShadowPass.js           # Shadow map generation (100 LOC)
│   ├── BasePass.js             # Abstract pass interface (40 LOC)
│   └── index.js                # Pass registry (20 LOC)
├── lighting/
│   ├── LightingManager.js      # Light management (100 LOC)
│   ├── DirectionalLight.js     # Directional light impl (60 LOC)
│   ├── PointLight.js           # Point light impl (60 LOC)
│   └── index.js                # Light exports (15 LOC)
├── shadows/
│   ├── ShadowManager.js        # Shadow orchestration (120 LOC)
│   ├── ShadowMapRenderer.js    # Shadow map rendering (100 LOC)
│   └── PCFFilter.js            # PCF filtering utilities (80 LOC)
├── materials/
│   ├── MaterialSystem.js       # Material registry & shader gen (150 LOC)
│   ├── PBRMaterial.js          # PBR material definition (80 LOC)
│   ├── BasicMaterial.js        # Simple material (current) (60 LOC)
│   └── index.js                # Material exports (20 LOC)
├── post/
│   ├── PostProcessManager.js   # Effect chain orchestration (100 LOC)
│   ├── passes/
│   │   ├── BloomPass.js        # Bloom effect (120 LOC)
│   │   ├── SSAOPass.js         # Screen-space AO (150 LOC)
│   │   ├── ToneMappingPass.js  # HDR tone mapping (60 LOC)
│   │   └── BasePostPass.js     # Abstract post pass (30 LOC)
│   └── index.js                # Post exports (15 LOC)
├── shaders/
│   ├── ShaderLibrary.js        # Shader compilation & caching (120 LOC)
│   ├── chunks/                 # Reusable GLSL chunks
│   │   ├── lighting.glsl       # Lighting calculations
│   │   ├── pbr.glsl            # PBR BRDF functions
│   │   ├── shadows.glsl        # Shadow sampling
│   │   └── common.glsl         # Shared utilities
│   ├── templates/              # Full shader templates
│   │   ├── pbr.vert/.frag      # PBR shader pair
│   │   ├── basic.vert/.frag    # Basic shader pair
│   │   └── shadow.vert/.frag   # Shadow map shaders
│   └── index.js                # Shader exports (20 LOC)
├── geometry/
│   ├── GeometryManager.js      # Current geometry code (refactored)
│   └── primitives/             # Shape generators
├── config/
│   └── features.js             # Feature toggle configuration
└── index.js                    # Main EmotiveMascot3D (refactored, 150 LOC)
```

**Total:** ~2,500 LOC across 23+ modules

## Core Components

### 1. Renderer Layer

#### WebGLRenderer.js (150 LOC)

**Purpose:** Low-level WebGL state management and draw calls

**Responsibilities:**
- WebGL2 context initialization
- Extension and capability detection
- State tracking (program, framebuffer, viewport)
- Primitive draw operations
- State change optimization (avoid redundant GL calls)

**Key API:**
```javascript
class WebGLRenderer {
    constructor(canvas, config = {})
    setProgram(program)
    setFramebuffer(fbo)
    clear(color, depth, stencil)
    draw(geometry, mode = 'TRIANGLES')
    setViewport(x, y, width, height)
    enableDepthTest(enable)
    setBlending(mode)
    setCullFace(mode)
}
```

**Dependencies:** None (leaf node)

---

#### RenderPipeline.js (120 LOC)

**Purpose:** Orchestrate ordered execution of render passes

**Responsibilities:**
- Maintain ordered list of render passes
- Initialize passes with renderer and framebuffer manager
- Execute passes in sequence
- Handle resize events
- Coordinate pass dependencies (e.g., shadows before geometry)

**Key API:**
```javascript
class RenderPipeline {
    constructor(renderer, config = {})
    addPass(pass)
    removePass(pass)
    render(scene, camera)
    resize(width, height)
}
```

**Pass Interface:**
```javascript
interface IRenderPass {
    name: string
    enabled: boolean
    init(renderer, fbManager): void
    execute(scene, camera): void
    resize?(width, height): void
}
```

**Dependencies:** WebGLRenderer, FramebufferManager

---

#### FramebufferManager.js (100 LOC)

**Purpose:** Pool and manage framebuffer objects (FBOs) for render-to-texture

**Responsibilities:**
- Create FBOs with color and depth attachments
- Pool and recycle FBOs to reduce allocation
- Handle resize of all managed FBOs
- Support multiple texture formats (RGBA, R8, RGB16F, etc.)

**Key API:**
```javascript
class FramebufferManager {
    constructor(renderer)
    acquire(name, width, height, format = 'RGBA')
    release(name)
    get(name)
    create(width, height, format)
    resize(width, height)
}
```

**Dependencies:** WebGLRenderer

---

### 2. Render Passes

#### GeometryPass.js (80 LOC)

**Purpose:** Render main scene geometry with materials and lighting

**Responsibilities:**
- Render all visible geometry
- Apply materials (basic or PBR)
- Calculate lighting (directional, point, ambient)
- Apply shadows (if enabled)
- Output to main color buffer or G-buffer (if deferred)

**Key API:**
```javascript
class GeometryPass {
    constructor(materialSystem, lightingManager, shadowManager)
    init(renderer, fbManager)
    execute(scene, camera)
}
```

**Dependencies:** MaterialSystem, LightingManager, ShadowManager (optional)

---

#### ShadowPass.js (100 LOC)

**Purpose:** Generate shadow maps for shadow-casting lights

**Responsibilities:**
- Render depth from light's perspective
- Support multiple shadow-casting lights
- Configure shadow map resolution
- Coordinate with ShadowManager

**Key API:**
```javascript
class ShadowPass {
    constructor(shadowManager)
    init(renderer, fbManager)
    execute(scene, camera)
    setShadowMapSize(size)
}
```

**Dependencies:** ShadowManager

---

### 3. Lighting System

#### LightingManager.js (100 LOC)

**Purpose:** Manage all lights in the scene and prepare shader uniforms

**Responsibilities:**
- Add/remove lights
- Enforce maximum light counts (4 directional, 8 point)
- Prepare uniform data for shaders
- Track ambient lighting

**Key API:**
```javascript
class LightingManager {
    constructor()
    addLight(light)
    removeLight(light)
    getLightUniforms()
    setAmbient(color)
}
```

**Light Types:**
- **DirectionalLight:** Infinite distance, parallel rays (sun)
- **PointLight:** Omnidirectional from position (light bulb)
- **AmbientLight:** Global ambient term

**Dependencies:** None

---

#### DirectionalLight.js (60 LOC)

**Purpose:** Directional light implementation with optional shadow casting

**Properties:**
- `direction: vec3` - Light direction (normalized)
- `color: vec3` - Light color
- `intensity: float` - Brightness multiplier
- `castShadow: boolean` - Enable shadow mapping
- `shadowCamera: OrthographicCamera` - For shadow map rendering

**Key API:**
```javascript
class DirectionalLight {
    constructor(direction, color, intensity)
    getUniforms()
    enableShadows(bounds)
}
```

---

#### PointLight.js (60 LOC)

**Purpose:** Point light with distance attenuation

**Properties:**
- `position: vec3` - Light position in world space
- `color: vec3` - Light color
- `intensity: float` - Brightness multiplier
- `range: float` - Maximum effective distance
- `attenuation: vec3` - Attenuation coefficients [constant, linear, quadratic]

**Key API:**
```javascript
class PointLight {
    constructor(position, color, intensity, range)
    getUniforms()
    enableShadows()  // Future: cubemap shadows
}
```

---

### 4. Shadow System

#### ShadowManager.js (120 LOC)

**Purpose:** Orchestrate shadow map generation and provide shadow data to shaders

**Responsibilities:**
- Create and cache shadow map FBOs
- Coordinate with ShadowMapRenderer for rendering
- Provide shadow textures and matrices to geometry pass
- Configure shadow quality settings (map size, bias, PCF radius)

**Key API:**
```javascript
class ShadowManager {
    constructor(renderer, lightingManager)
    renderShadowMaps(scene)
    getShadowMap(light)
    getShadowUniforms()
    setShadowMapSize(size)
}
```

**Shadow Configuration:**
- `shadowMapSize: 1024` - Resolution per shadow map
- `shadowBias: 0.005` - Depth bias to prevent acne
- `pcfRadius: 2.0` - PCF filter kernel radius

**Dependencies:** ShadowMapRenderer, LightingManager

---

#### ShadowMapRenderer.js (100 LOC)

**Purpose:** Render scene from light's perspective to generate shadow maps

**Responsibilities:**
- Render depth-only pass for shadow casting geometry
- Use simple depth shader (no lighting calculations)
- Support orthographic (directional) and perspective (point/spot) cameras

**Key API:**
```javascript
class ShadowMapRenderer {
    constructor(renderer)
    render(scene, lightCamera, shadowMapFBO)
    renderObject(object, lightCamera)
}
```

**Dependencies:** WebGLRenderer

---

#### PCFFilter.js (80 LOC)

**Purpose:** Percentage Closer Filtering for soft shadow edges

**Implementation:** GLSL shader chunk, not a JavaScript class

**Technique:**
- Sample shadow map in NxN kernel (3x3 = 9 samples)
- Compare each sample depth with fragment depth
- Average results for soft shadow transition

**GLSL Function:**
```glsl
float sampleShadowMap(sampler2D shadowMap, vec4 shadowCoord, float bias) {
    // Transform to [0,1] range
    // PCF 3x3 kernel sampling
    // Return shadow factor [0=shadow, 1=lit]
}
```

---

### 5. Material System

#### MaterialSystem.js (150 LOC)

**Purpose:** Dynamic shader generation based on material features and scene lighting

**Responsibilities:**
- Register and manage materials
- Analyze material features (maps, PBR, etc.)
- Analyze scene features (light counts, shadows)
- Generate shader code via ShaderLibrary
- Cache compiled shader programs

**Key API:**
```javascript
class MaterialSystem {
    constructor(renderer, shaderLibrary)
    registerMaterial(name, material)
    getMaterial(name)
    getProgramForMaterial(material, scene)
    analyzeFeatures(material, scene)
}
```

**Feature Analysis:**
- Material type (basic, PBR)
- Texture maps (albedo, normal, metallic-roughness)
- Light counts (directional, point)
- Shadow receiving
- IBL usage (future)

**Shader Generation Flow:**
1. Analyze material + scene → features object
2. Hash features → cache key
3. Check program cache
4. If miss: Build shaders from templates + chunks
5. Compile and cache program
6. Return program

**Dependencies:** ShaderLibrary, WebGLRenderer

---

#### PBRMaterial.js (80 LOC)

**Purpose:** Physically-based material definition (metallic-roughness workflow)

**Properties:**
- `albedo: vec3` - Base color
- `metallic: float` - Metallic factor [0=dielectric, 1=metal]
- `roughness: float` - Surface roughness [0=smooth, 1=rough]
- `ao: float` - Ambient occlusion factor
- `albedoMap: Texture` - Albedo texture (optional)
- `normalMap: Texture` - Normal map (optional)
- `metallicRoughnessMap: Texture` - Combined MR map (optional)
- `aoMap: Texture` - AO map (optional)
- `receiveShadows: boolean` - Enable shadow receiving
- `useIBL: boolean` - Use image-based lighting (future)

**Mascot Compatibility:**
- `glowColor: vec3` - Glow color for mascot
- `glowIntensity: float` - Glow brightness

**Key API:**
```javascript
class PBRMaterial {
    constructor(config)
    getUniforms()
}
```

---

#### BasicMaterial.js (60 LOC)

**Purpose:** Simple material (current implementation compatibility)

**Properties:**
- `color: vec3` - Base color
- `colorMap: Texture` - Optional color texture
- `receiveShadows: boolean`
- `glowColor: vec3`
- `glowIntensity: float`

**Key API:**
```javascript
class BasicMaterial {
    constructor(config)
    getUniforms()
}
```

---

### 6. Post-Processing System

#### PostProcessManager.js (100 LOC)

**Purpose:** Chain multiple post-processing effects in sequence

**Responsibilities:**
- Manage ordered list of post-processing passes
- Ping-pong between framebuffers
- Handle enabled/disabled passes
- Coordinate final output to screen or framebuffer

**Key API:**
```javascript
class PostProcessManager {
    constructor(renderer, fbManager)
    addPass(pass)
    removePass(pass)
    process(inputTexture, outputFramebuffer)
    resize(width, height)
}
```

**Processing Flow:**
1. Input texture from geometry/lighting pass
2. For each enabled pass:
   - Render pass: input → temp FBO
   - Next pass uses temp FBO as input
3. Final pass renders to output FBO (or screen)

**Dependencies:** WebGLRenderer, FramebufferManager

---

#### BloomPass.js (120 LOC)

**Purpose:** Bloom/glow effect for bright areas

**Algorithm:**
1. **Bright Pass:** Extract pixels above brightness threshold
2. **Blur:** Gaussian blur the bright areas (multi-pass, downsampled)
3. **Combine:** Add blurred bloom back to original image

**Configuration:**
- `threshold: 0.8` - Luminance threshold for bloom
- `intensity: 0.5` - Bloom strength
- `radius: 1.0` - Blur radius
- `blurIterations: 3` - Number of blur passes

**Key API:**
```javascript
class BloomPass extends BasePostPass {
    constructor(config)
    setup()
    render(inputTexture, outputFramebuffer)
}
```

**Size Cost:** ~5-7KB

---

#### SSAOPass.js (150 LOC)

**Purpose:** Screen-space ambient occlusion for contact shadows

**Algorithm:**
1. Generate random sample kernel in hemisphere
2. For each fragment, sample depth in hemisphere around normal
3. Count samples occluded by geometry
4. Blur result to reduce noise
5. Multiply with scene color

**Requirements:**
- Depth buffer from geometry pass
- Normal buffer from geometry pass (or reconstruct from depth)

**Configuration:**
- `radius: 0.5` - Sample hemisphere radius
- `bias: 0.025` - Depth comparison bias
- `kernelSize: 16` - Number of samples per fragment

**Key API:**
```javascript
class SSAOPass extends BasePostPass {
    constructor(config)
    setup()
    render(inputTexture, outputFramebuffer)
    generateSampleKernel()
    generateNoiseTexture()
}
```

**Size Cost:** ~8-10KB

---

#### ToneMappingPass.js (60 LOC)

**Purpose:** HDR to LDR tone mapping and gamma correction

**Operators:**
- **ACES:** Filmic tone mapping (industry standard)
- **Reinhard:** Simple luminance-based
- **Uncharted2:** Game industry standard

**Configuration:**
- `operator: 'ACES'` - Tone mapping algorithm
- `exposure: 1.0` - Exposure adjustment
- `gamma: 2.2` - Gamma correction

**Key API:**
```javascript
class ToneMappingPass extends BasePostPass {
    constructor(config)
    setup()
    render(inputTexture, outputFramebuffer)
}
```

**Size Cost:** ~2-3KB

---

### 7. Shader System

#### ShaderLibrary.js (120 LOC)

**Purpose:** Dynamic shader generation from templates and chunks

**Responsibilities:**
- Load shader templates (pbr.vert/frag, basic.vert/frag)
- Load GLSL chunks (lighting, pbr, shadows, common)
- Build shaders by injecting chunks based on features
- Add preprocessor defines for feature flags
- Compile and cache shader programs

**Key API:**
```javascript
class ShaderLibrary {
    constructor(renderer)
    loadChunks()
    loadTemplates()
    buildVertexShader(features)
    buildFragmentShader(features)
    injectChunk(source, placeholder, chunkName)
    addDefines(source, features)
}
```

**Shader Generation Example:**
```javascript
// Input features:
{
    materialType: 'pbr',
    numDirectionalLights: 2,
    numPointLights: 4,
    receiveShadows: true,
    hasNormalMap: true
}

// Output shader:
#version 300 es
precision highp float;

#define NUM_DIR_LIGHTS 2
#define NUM_POINT_LIGHTS 4
#define USE_SHADOWS
#define USE_NORMAL_MAP

// ... template code with injected chunks
```

**Dependencies:** WebGLRenderer

---

#### Shader Chunks

**Purpose:** Reusable GLSL code blocks for common functionality

**chunks/common.glsl**
- Utility functions (saturate, luminance, etc.)
- Constants (PI, etc.)
- Common structs

**chunks/lighting.glsl**
- Light structures (DirectionalLight, PointLight)
- Light uniform arrays
- Light calculation functions
- Attenuation calculations

**chunks/pbr.glsl**
- PBR BRDF functions (Cook-Torrance)
- Fresnel-Schlick approximation
- GGX/Trowbridge-Reitz normal distribution
- Schlick-GGX geometry function
- Smith's geometry function
- Complete PBR evaluation function

**chunks/shadows.glsl**
- Shadow map sampling
- PCF filtering (3x3, 5x5 kernels)
- Shadow coordinate transformation
- Bias calculations

---

#### Shader Templates

**templates/pbr.vert**
- Vertex transformation
- Normal transformation
- UV passthrough
- Shadow coordinate calculation (if enabled)

**templates/pbr.frag**
- PBR material evaluation
- Light accumulation loop
- Shadow sampling (if enabled)
- Normal mapping (if enabled)
- Texture sampling (if maps present)

**templates/basic.vert/frag**
- Simple Blinn-Phong shading
- Backward compatibility with current system

**templates/shadow.vert/frag**
- Depth-only rendering for shadow maps
- Minimal vertex transformation

---

### 8. Feature Toggle System

#### config/features.js

**Purpose:** Centralized feature flag configuration for tree-shaking

**Feature Categories:**

**Lighting Features:**
- `LIGHTING: true` - Enable lighting system
- `DIRECTIONAL_LIGHTS: true` - Directional lights
- `POINT_LIGHTS: true` - Point lights
- `SPOT_LIGHTS: false` - Spot lights (future)

**Shadow Features:**
- `SHADOWS: true` - Shadow mapping
- `SHADOW_PCF: true` - PCF filtering
- `SHADOW_CASCADED: false` - Cascaded shadow maps (future)

**Material Features:**
- `PBR_MATERIALS: true` - PBR materials
- `NORMAL_MAPPING: true` - Normal maps
- `PARALLAX_MAPPING: false` - Parallax mapping (future)

**Post-Processing Features:**
- `POST_PROCESSING: true` - Post-processing framework
- `BLOOM: true` - Bloom effect
- `SSAO: true` - Ambient occlusion
- `SSR: false` - Screen-space reflections (future)
- `TONE_MAPPING: true` - HDR tone mapping

**Advanced Features:**
- `IBL: false` - Image-based lighting (future)
- `DEFERRED_RENDERING: false` - Deferred pipeline (future)
- `INSTANCING: false` - Instanced rendering (future)

**Tree-Shaking Strategy:**
```javascript
// Conditional exports eliminate dead code
export const BloomPass = (FEATURES.POST_PROCESSING && FEATURES.BLOOM)
    ? (await import('../post/passes/BloomPass.js')).BloomPass
    : null;

// Rollup eliminates entire module if false
```

---

### 9. Integration with Existing System

#### EmotiveMascot3D Refactoring

**Current Structure:**
```
EmotiveMascot3D
└── Core3DManager (god object)
    ├── Geometry management
    ├── Rendering logic
    ├── Shader management
    └── Animation handling
```

**New Structure:**
```
EmotiveMascot3D (150 LOC - orchestrator only)
├── WebGLRenderer
├── RenderPipeline
│   ├── ShadowPass (if FEATURES.SHADOWS)
│   ├── GeometryPass
│   └── PostProcessManager (if FEATURES.POST_PROCESSING)
├── LightingManager (if FEATURES.LIGHTING)
├── ShadowManager (if FEATURES.SHADOWS)
├── MaterialSystem
├── GeometryManager (refactored from Core3DManager)
└── AnimationController (extracted from Core3DManager)
```

**Backward Compatibility:**
- Existing gesture system unchanged
- Particle system integration unchanged
- Public API maintains same interface
- Feature flags default to "full" mode

---

## Build System

### Build Variants

**emotive-engine-minimal.js**
- Current feature set only
- No lighting, shadows, PBR, or post-processing
- **Size:** ~47.5KB gzipped (baseline)

**emotive-engine-standard.js**
- Lighting system (directional + point)
- Shadow mapping with PCF
- Basic materials (Blinn-Phong)
- **Size:** ~75KB gzipped (+27.5KB)

**emotive-engine-full.js**
- All standard features
- PBR materials
- Post-processing (bloom, SSAO, tone mapping)
- **Size:** ~120KB gzipped (+45KB)

### Rollup Configuration

**Tree-Shaking:**
```javascript
{
    treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
    }
}
```

**Feature Flag Replacement:**
```javascript
replace({
    'FEATURES.LIGHTING': JSON.stringify(true),
    'FEATURES.SHADOWS': JSON.stringify(true),
    // ... etc
    preventAssignment: true
})
```

**Build Script:**
```bash
# Build all variants
npm run build:minimal   # Just particles + basic 3D
npm run build:standard  # + lighting + shadows
npm run build:full      # + PBR + post-processing
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. Create directory structure
2. Implement WebGLRenderer (extract from current)
3. Implement RenderPipeline
4. Implement FramebufferManager
5. Implement BasePass interface
6. Implement GeometryPass (basic version)
7. Unit tests for core components

**Deliverable:** Working render pipeline with basic geometry rendering (feature parity with current)

---

### Phase 2: Lighting System (Week 2)
1. Implement LightingManager
2. Implement DirectionalLight
3. Implement PointLight
4. Implement lighting.glsl chunk
5. Create basic.frag template with lighting
6. Update GeometryPass to use LightingManager
7. Integration tests with mascot

**Deliverable:** Working lighting with multiple light sources

---

### Phase 3: Shadow System (Week 2-3)
1. Implement ShadowManager
2. Implement ShadowMapRenderer
3. Implement ShadowPass
4. Implement shadows.glsl chunk (PCF)
5. Update GeometryPass to receive shadows
6. Add shadow map debugging tools
7. Performance optimization

**Deliverable:** Working shadow mapping with PCF filtering

---

### Phase 4: Material System (Week 3-4)
1. Implement ShaderLibrary
2. Implement MaterialSystem
3. Create shader templates (pbr.vert/frag)
4. Implement pbr.glsl chunk
5. Implement PBRMaterial
6. Implement BasicMaterial
7. Migrate current shaders to BasicMaterial
8. Test material switching

**Deliverable:** Working PBR materials with dynamic shader generation

---

### Phase 5: Post-Processing (Week 4-5)
1. Implement PostProcessManager
2. Implement BasePostPass
3. Implement ToneMappingPass (simple, good test case)
4. Implement BloomPass
5. Implement SSAOPass (requires depth/normal buffers)
6. Test effect chaining
7. Performance profiling

**Deliverable:** Working post-processing pipeline with multiple effects

---

### Phase 6: Feature Toggles & Build System (Week 5)
1. Implement config/features.js
2. Add conditional imports throughout
3. Update EmotiveMascot3D initialization
4. Create build variants (minimal, standard, full)
5. Verify tree-shaking effectiveness
6. Bundle size analysis

**Deliverable:** Three build variants with verified sizes

---

### Phase 7: Integration & Testing (Week 6)
1. Refactor Core3DManager → GeometryManager
2. Update all examples to use new system
3. Backward compatibility testing
4. Performance benchmarking (60 FPS desktop, 30 FPS mobile)
5. Visual regression testing
6. Documentation updates
7. Migration guide

**Deliverable:** Complete integration with existing mascot system

---

## Testing Strategy

### Unit Tests
- Each module tested in isolation
- Mock dependencies (renderer, managers)
- Test feature flags enable/disable
- Shader generation testing

### Integration Tests
- Render pipeline execution
- Light + shadow interaction
- Material + lighting combinations
- Post-processing chains

### Performance Tests
- Frame rate monitoring (60 FPS target)
- Memory profiling (FBO pooling effectiveness)
- Shader compilation time
- Draw call counts

### Visual Tests
- Render output comparison (golden images)
- Shadow quality validation
- Material appearance verification
- Post-processing effect validation

---

## Performance Targets

### Desktop (60 FPS)
- 1080p resolution
- Full feature set enabled
- 4 directional lights
- 8 point lights
- All post-processing effects
- 1024x1024 shadow maps

### Mobile (30 FPS)
- 720p resolution
- Reduced feature set (standard build)
- 2 directional lights
- 4 point lights
- Bloom + tone mapping only
- 512x512 shadow maps

### Optimization Strategies
- FBO pooling (reduce allocation)
- Shader caching (reduce compilation)
- State change batching (reduce GL calls)
- Frustum culling (reduce draw calls)
- LOD system (future enhancement)

---

## Migration Path

### For Existing Users

**No Breaking Changes:**
- Default feature set = full build
- Existing API unchanged
- Gesture system works as-is
- Particle system integration unchanged

**Opt-In Enhancements:**
```javascript
// Add lighting
mascot.addLight(new DirectionalLight([0, -1, 0], [1, 1, 1], 1.0));

// Enable shadows
mascot.enableShadows();

// Use PBR material
mascot.setMaterial(new PBRMaterial({
    albedo: [0.86, 0.29, 0.60],
    metallic: 0.2,
    roughness: 0.4
}));

// Enable post-processing
mascot.enablePostProcessing({
    bloom: { threshold: 0.8, intensity: 0.5 },
    ssao: { radius: 0.5 },
    tonemap: { operator: 'ACES' }
});
```

**Build Selection:**
```html
<!-- Minimal build (current features) -->
<script src="emotive-engine-minimal.js"></script>

<!-- Standard build (lighting + shadows) -->
<script src="emotive-engine-standard.js"></script>

<!-- Full build (all features) -->
<script src="emotive-engine-full.js"></script>
```

---

## Future Enhancements

### Near-Term (Next 6 Months)
- Spot lights with cone attenuation
- Cascaded shadow maps for large scenes
- Image-based lighting (IBL) with environment maps
- Screen-space reflections (SSR)

### Mid-Term (6-12 Months)
- Deferred rendering pipeline (better performance with many lights)
- Instanced rendering for particle optimization
- Volumetric lighting / god rays
- Depth of field post-processing

### Long-Term (12+ Months)
- Skeletal animation system
- Cloth simulation
- Advanced particle effects (fire, smoke, fluids)
- VR/AR support

---

## Risk Assessment

### Technical Risks

**Risk:** Shader compilation overhead on initialization
**Mitigation:** Lazy compilation, shader caching, precompile common variants

**Risk:** FBO allocation causing memory pressure
**Mitigation:** FBO pooling, LRU eviction, configurable limits

**Risk:** Tree-shaking not eliminating code effectively
**Mitigation:** Careful module boundaries, build analysis, rollup-plugin-visualizer

**Risk:** Performance regression from increased complexity
**Mitigation:** Continuous benchmarking, performance budget, profiling

### Project Risks

**Risk:** Scope creep during implementation
**Mitigation:** Strict adherence to 200 LOC limit, feature flag discipline

**Risk:** Breaking backward compatibility
**Mitigation:** Comprehensive integration tests, migration guide, semantic versioning

**Risk:** Documentation lag
**Mitigation:** Document-as-you-code, JSDoc comments, example updates

---

## Success Criteria

### Technical Metrics
- ✅ No file exceeds 200 LOC
- ✅ All features tree-shakeable
- ✅ 60 FPS desktop, 30 FPS mobile
- ✅ ~120KB full build gzipped
- ✅ All unit tests passing
- ✅ Zero regressions in existing functionality

### Visual Quality
- ✅ Expressive lighting enhances emotion conveyance
- ✅ Shadows add depth and grounding
- ✅ PBR materials look realistic
- ✅ Bloom creates atmospheric glow
- ✅ SSAO adds contact shadows for detail

### Developer Experience
- ✅ Clear module boundaries
- ✅ Easy to add new materials
- ✅ Easy to add new lights
- ✅ Easy to add new post-processing effects
- ✅ Comprehensive documentation
- ✅ Migration path from current system

---

## Conclusion

This modular architecture provides a solid foundation for advanced 3D rendering while maintaining the Emotive Engine's focus on performance-driven emotional expression. The design achieves:

1. **Zero Tech Debt:** Clean module boundaries, no god objects
2. **Extensibility:** Easy to add new features without modifying existing code
3. **Performance:** Optimized for real-time puppetry use case
4. **Flexibility:** Feature toggles allow size/quality trade-offs
5. **Maintainability:** Small files, clear interfaces, comprehensive tests

The implementation plan spreads the work over 6 weeks with clear deliverables at each phase, allowing for incremental progress and testing. The migration path ensures existing users can adopt features at their own pace without breaking changes.

**Status:** Ready for implementation
