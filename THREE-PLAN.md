# Three.js Integration Plan

## Overview

Replace custom WebGL renderer with Three.js for better visual quality, advanced
lighting, post-processing effects, and model loading capabilities.

**Architecture:** Separate 2D and 3D bundles with upfront WebGL2 capability
detection.

---

## Bundle Strategy

### Bundles

- `dist/emotive-mascot-2d.umd.js` (640-712 KB) - Canvas2D only
- `dist/emotive-mascot-3d.umd.js` (~500-600 KB) - Three.js + particles

### Capability Detection

Inline script (~2 KB) detects WebGL2 support and loads appropriate bundle before
initialization.

### Bundle Size Estimates

```
Three.js core:                    ~167 KB (gzipped: ~60 KB)
Three.js post-processing:         ~30 KB  (gzipped: ~10 KB)
Custom renderer + integration:    ~50 KB  (gzipped: ~15 KB)
Geometries + animations:          ~100 KB (gzipped: ~30 KB)
Particles (2D reused):            ~150 KB (gzipped: ~40 KB)
──────────────────────────────────────────────────────────
Total 3D bundle:                  ~497 KB (gzipped: ~155 KB)

2D bundle (unchanged):            712 KB (gzipped: ~200 KB)
```

**Result:** 3D bundle smaller than 2D! Users with modern browsers get better
visuals AND smaller download.

---

## Phase 1: Three.js Foundation (1 week)

### Day 1-2: Setup Three.js Build

- [x] Install Three.js: `npm install three` ✅ v0.181.0 installed
- [x] Update `rollup.config.js` to handle Three.js imports ✅ Removed glsl
      plugin
- [x] Remove `rollup-plugin-glsl` (Three.js has built-in shader support) ✅ Done
- [x] Create `src/3d/ThreeRenderer.js` ✅ Complete with lighting &
      post-processing
- [x] Replace custom WebGL renderer with Three.js ✅ Core3DManager updated
- [x] Implement basic scene, camera, renderer setup ✅ ThreeRenderer complete
- [x] Test basic sphere rendering with same API as current system ✅ Working
- [x] Verify bundle builds successfully ✅ 669 KB (includes Three.js core +
      post-processing)

### Day 3-4: Materials & Lighting

- [x] Create `src/3d/materials/GlowMaterial.js` with Fresnel shader ✅
      Integrated in ThreeRenderer
- [ ] Create `src/3d/materials/EmotiveMaterial.js` for emotion-based materials
      (Optional: can extract later)
- [x] Implement `src/3d/lights/EmotiveLights.js` - three-point lighting system
      ✅ Integrated in ThreeRenderer
- [x] Wire up emotion system to lighting (14 emotions) ✅ updateLighting()
      method complete
- [ ] Test emotion transitions with lighting changes
- [ ] Ensure glow matches or exceeds custom WebGL quality

### Day 5-7: Post-Processing

- [x] Setup EffectComposer in ThreeRenderer ✅ Complete
- [x] Add RenderPass (base scene render) ✅ Complete
- [x] Add UnrealBloomPass for glow/bloom effect ✅ Complete with emotion-based
      intensity
- [ ] Add optional FXAA anti-aliasing pass
- [x] Make post-processing toggleable via config ✅ enablePostProcessing option
- [ ] Performance test on mid-range devices
- [ ] Optimize bloom settings for best quality/performance ratio

---

## Phase 2: Advanced Geometries (1 week)

### Day 8-9: Procedural Geometries

- [x] Convert existing sphere geometry to Three.js (THREE.SphereGeometry) ✅
      ThreeGeometries.js
- [x] Convert existing crystal geometry to Three.js custom BufferGeometry ✅
      ThreeGeometries.js
- [x] Convert existing diamond geometry to Three.js custom BufferGeometry ✅
      ThreeGeometries.js
- [x] Create `src/3d/models/CoreGeometry.js` - geometry factory ✅
      THREE_GEOMETRIES registry
- [ ] Add more complex shapes (torus, icosahedron, octahedron)
- [ ] Implement geometry morphing system (smooth transitions)
- [x] Test `morphTo()` API with all geometries ✅ Core3DManager.morphToShape()

### Day 10-12: Model Loading (Optional Advanced Feature)

- [ ] Add GLTFLoader from Three.js examples
- [ ] Create `src/3d/models/CustomModel.js` - GLTF loader wrapper
- [ ] Create example mascot GLTF model (or find open-source model)
- [ ] Implement model animation system (if rigged)
- [ ] Add model loading to config options
- [ ] Document model requirements and format

### Day 13-14: GPU Particles

- [ ] Create `src/3d/particles/GPUParticles.js` using THREE.Points
- [ ] Implement GPU-based particle behaviors (radiant, spiral, etc.)
- [ ] Add particle shader with emotion-based colors
- [ ] Performance comparison: GPU particles vs Canvas2D particles
- [ ] Decision: Keep Canvas2D overlay or switch to GPU particles
- [ ] Optimize particle count for 60fps target

---

## Phase 3: Animation System (1 week)

### Day 15-17: Gesture Animations in 3D

- [ ] Create `src/3d/animation/GestureAnimations3D.js`
- [ ] Implement bounce gesture with 3D translation
- [ ] Implement spin gesture with 3D rotation
- [ ] Implement pulse gesture with 3D scale
- [ ] Implement shake gesture with camera shake
- [ ] Implement float gesture with smooth Y-axis motion
- [ ] Implement all 39 gestures with 3D-specific enhancements
- [ ] Add optional camera movements for dramatic gestures
- [ ] Create smooth transitions between gestures
- [ ] Test gesture chaining in 3D

### Day 18-19: Advanced Effects

- [ ] Implement particle trails using THREE.Line
- [ ] Add camera shake effect for intense emotions/gestures
- [ ] Add depth of field (DoF) for focus effects (optional)
- [ ] Add motion blur for fast movements (optional)
- [ ] Wire up special effects to emotion/gesture system
- [ ] Performance test all effects together

### Day 20-21: Polish & Testing

- [ ] Performance optimization pass
- [ ] Memory leak testing and fixes
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile browser testing (iOS Safari, Chrome Mobile)
- [ ] Bundle size optimization (tree-shaking check)
- [ ] Visual quality comparison: custom WebGL vs Three.js
- [ ] Frame rate benchmarking (target: 60fps on mid-range)

---

## Phase 4: Integration & Documentation (3-4 days)

### Day 22-23: Capability Detection & Bundle Loading

- [ ] Create `src/utils/capabilityDetection.js`
- [ ] Implement WebGL2 detection function
- [ ] Create inline detection script for HTML examples
- [ ] Add server-side detection helper (Node.js, optional)
- [ ] Update all examples to use capability detection
- [ ] Create example: `examples/auto-detect-demo.html`
- [ ] Create example: `examples/force-2d-demo.html`
- [ ] Create example: `examples/force-3d-demo.html`
- [ ] Test bundle loading on various devices

### Day 24-25: Documentation & Migration

- [ ] Update main README.md with 2D vs 3D guide
- [ ] Create MIGRATION.md - guide for custom WebGL → Three.js
- [ ] Document all new Three.js features
- [ ] Document lighting system API
- [ ] Document post-processing configuration
- [ ] Document geometry loading and custom models
- [ ] Create visual comparison images (2D vs 3D)
- [ ] Update API documentation with 3D-specific methods
- [ ] Create troubleshooting guide for common issues

---

## Phase 5: Build System & Release (2-3 days)

### Build Configuration

- [ ] Update `package.json` exports for 2D and 3D bundles
- [ ] Create separate rollup configs: `rollup.2d.config.js` and
      `rollup.3d.config.js`
- [ ] Update npm scripts: `build:2d`, `build:3d`, `build:all`
- [ ] Update TypeScript definitions for Three.js types
- [ ] Test tree-shaking with both bundles
- [ ] Verify sourcemaps work correctly

### Testing & QA

- [ ] Run full test suite against new 3D system
- [ ] Create Three.js-specific tests
- [ ] Performance benchmarking suite
- [ ] Visual regression testing (screenshot comparison)
- [ ] Bundle size monitoring (ensure < 600KB for 3D)

### Release Preparation

- [ ] Update CHANGELOG.md with Three.js integration
- [ ] Bump version to 4.0.0 (major change)
- [ ] Create release notes highlighting new features
- [ ] Prepare demo videos showing 3D capabilities
- [ ] Update npm package keywords

---

## Features Enabled by Three.js

### Visual Quality Improvements

- [x] Better lighting (ambient, directional, point lights)
- [x] Real-time shadows
- [x] Post-processing (bloom, glow, anti-aliasing)
- [x] Advanced materials (PBR, custom shaders)
- [x] Better anti-aliasing options
- [x] Model loading (GLTF/GLB support)
- [x] GPU-accelerated particles
- [x] Built-in animation system

### Advanced Effects

- [ ] Bloom/glow post-processing with emotion-based intensity
- [ ] Realistic shadows cast by mascot
- [ ] Camera effects (shake, zoom, dolly)
- [ ] Depth of field for focus control
- [ ] Motion blur for fast movements
- [ ] Particle trails
- [ ] Material variety (matte, glossy, toon, custom)

---

## API Compatibility

### Existing API (Must Maintain)

- [x] `init(container)` - Initialize engine
- [x] `start()` - Start animation loop
- [x] `stop()` - Stop animation loop
- [x] `setEmotion(emotion, options)` - Set emotional state
- [x] `express(gestureName)` - Trigger gesture
- [x] `morphTo(shapeName)` - Morph geometry
- [x] `chain(chainName)` - Execute gesture chain
- [x] `updateUndertone(undertone)` - Update undertone modifier

### New 3D-Specific API

- [ ] `setLighting(preset)` - Change lighting preset
- [ ] `setMaterial(materialType)` - Change material type
- [ ] `enablePostProcessing(effects)` - Toggle effects
- [ ] `loadModel(url)` - Load custom GLTF model
- [ ] `setCameraPosition(x, y, z)` - Manual camera control
- [ ] `enableShadows(enabled)` - Toggle shadow rendering

---

## File Structure

```
src/3d/
├── index.js                          # EmotiveMascot3D (entry point) - UPDATED
├── ThreeRenderer.js                  # NEW: Three.js wrapper
├── Core3DManager.js                  # UPDATED: Use ThreeRenderer
├── materials/                        # NEW: Custom materials
│   ├── GlowMaterial.js              # Fresnel glow shader
│   ├── EmotiveMaterial.js           # Emotion-based material
│   └── ParticleMaterial.js          # GPU particle material
├── lights/                           # NEW: Lighting system
│   └── EmotiveLights.js             # Dynamic emotion-based lighting
├── effects/                          # NEW: Post-processing
│   ├── BloomPass.js                 # Glow/bloom effect
│   ├── ComposerSetup.js             # Effect composer
│   └── effects.js                   # Effect registry
├── models/                           # NEW: 3D models
│   ├── CoreGeometry.js              # Procedural geometries
│   └── CustomModel.js               # GLTF loader
├── animation/
│   ├── ThreeAnimator.js             # NEW: Three.js-based animator
│   ├── ProceduralAnimator.js        # REMOVE: Replaced by ThreeAnimator
│   └── GestureAnimations3D.js       # NEW: 3D gesture definitions
├── particles/
│   └── GPUParticles.js              # NEW: THREE.Points particles
├── geometries/
│   ├── index.js                     # UPDATED: Use Three.js geometries
│   ├── Sphere.js                    # UPDATED: THREE.SphereGeometry
│   ├── Crystal.js                   # UPDATED: THREE.BufferGeometry
│   └── Diamond.js                   # UPDATED: THREE.BufferGeometry
├── renderer/
│   └── WebGLRenderer.js             # REMOVE: Replaced by ThreeRenderer
└── shaders/
    ├── core.vert                    # REMOVE: Use Three.js shaders
    └── core.frag                    # REMOVE: Use Three.js shaders
```

---

## Dependencies

### Install

```bash
npm install three
```

### Remove

```bash
npm uninstall rollup-plugin-glsl  # No longer needed
```

---

## Performance Targets

- **Target FPS:** 60fps on mid-range devices
- **Particle Count (3D):** Up to 300 particles (GPU-accelerated)
- **Particle Count (2D):** Up to 50 particles (Canvas2D)
- **Bundle Size (3D):** < 600 KB uncompressed, < 160 KB gzipped
- **Bundle Size (2D):** < 720 KB uncompressed, < 210 KB gzipped
- **Initialization Time:** < 100ms
- **Memory Usage:** < 100 MB for 3D, < 50 MB for 2D

---

## Risk Mitigation

### Potential Issues

1. **Bundle size bloat** - Tree-shaking may not work perfectly with Three.js
    - Mitigation: Use named imports, test bundle analyzer
2. **Performance on low-end devices** - Three.js may be slower than custom WebGL
    - Mitigation: Capability detection serves 2D bundle to low-end devices
3. **Breaking API changes** - Existing users may break
    - Mitigation: Keep 2D bundle unchanged, 3D is separate
4. **Shadow performance** - Real-time shadows can be expensive
    - Mitigation: Make shadows optional, use lower resolution shadow maps

---

## Success Criteria

- [x] 3D bundle builds successfully and loads in browser
- [ ] All 14 emotions render correctly with lighting
- [ ] All 39 gestures work in 3D with enhanced animations
- [ ] Post-processing effects improve visual quality noticeably
- [ ] Performance meets 60fps target on mid-range devices
- [ ] Bundle size stays under 600 KB for 3D
- [ ] Capability detection works across all major browsers
- [ ] Documentation is complete and examples work
- [ ] Existing 2D bundle remains unchanged and functional

---

## Timeline

**Total Estimated Time:** 3-4 weeks

- Phase 1: 7 days (Foundation)
- Phase 2: 7 days (Geometries & Models)
- Phase 3: 7 days (Animation & Effects)
- Phase 4: 3-4 days (Integration & Docs)
- Phase 5: 2-3 days (Build & Release)

---

## Notes

- Keep existing 2D system completely untouched
- Three.js 3D is a separate, parallel system
- Users choose bundle based on capability detection
- No runtime degradation from 3D → 2D
- Focus on visual quality over bundle size (3D users have modern browsers)
