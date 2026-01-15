# Changelog - Emotive Engine Core

All notable changes and innovations to this project are documented in this file
with timestamps for IP protection.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.7] - 2025-01-14

### 🐛 Bug Fixes

- **FIXED** `setBPMMultiplier()` not actually affecting animation speed
    - Was incorrectly scaling the progress value instead of the frequency
    - Now correctly applies multiplier to phase calculation so 0.5 = half speed
    - Accent response still syncs to actual beats for proper feel

## [3.3.6] - 2025-01-14

### 🎵 Groove Animation Speed Control

- **ADDED** `setBPMMultiplier(multiplier)` API for controlling groove animation
  speed
    - Scales effective BPM used for animations without affecting BPM detection
    - Set to 0.5 to halve animation speed (useful for high BPM songs > 90)
    - Set to 2.0 to double animation speed (useful for very slow songs)
    - Range: 0.25 to 4.0, default 1.0
    - Available on both `EmotiveMascot3D` and `Rhythm3DAdapter`

- **ADDED** `getBPMMultiplier()` API to retrieve current multiplier value

## [3.3.5] - 2025-01-14

### ⚡ Performance Optimizations (Render Loop)

- **OPTIMIZED** Soul mesh caching in ThreeRenderer
    - Soul mesh reference now cached instead of traversing scene every frame
    - Eliminates `scene.traverse()` overhead during soul render pass

- **OPTIMIZED** Vector3 pooling in soul pass
    - Reuses pre-allocated `_soulPosTemp` vector for position projection
    - Eliminates `position.clone()` allocation every frame

- **OPTIMIZED** CrystalSoul uniform updates
    - `energyIntensity` now set once in constructor (was setting 0.8 every
      frame)
    - `emotionColor` only updates when RGB values actually change
    - Reduces unnecessary GPU uniform syncs

- **OPTIMIZED** Core3DManager normalized color caching
    - `normalizeRGBLuminance()` now computed once when emotion changes
    - Was being called twice per frame in render loop
    - Eliminates redundant color calculations and array allocations

## [3.3.4] - 2025-01-14

### ⚡ Performance Optimizations

- **OPTIMIZED** Render pass skipping for non-crystal geometries
    - Soul render pass (layer 2) now skipped when geometry doesn't have a soul
    - Particle passes (depth + render + bloom) skipped when particles disabled
    - Added `hasSoul` and `hasParticles` flags to render() method
    - Expected savings: 15-25ms per frame for moon/sun/sphere geometries

- **OPTIMIZED** CrystalSoul shader noise calculations
    - Reduced noise function calls from 4 to 2 per fragment
    - Adjusted threshold values to maintain visual quality
    - Expected savings: 8-12ms per frame when crystal active

- **OPTIMIZED** Core3DManager now passes optimization flags to renderer
    - Automatically detects when soul and particles are active
    - No API changes required - optimizations are automatic

## [3.3.3] - 2025-01-14

### 🐛 Shader Fixes

- **FIXED** WebGL shader warnings for division by zero in blend modes
    - RGB to HSL conversion now uses safe division with epsilon guard
    - Color Burn, Color Dodge, and Vivid Light blend modes use
      `max(divisor, 0.0001)`
    - Eliminates GPU driver warnings about floating-point division by zero

## [3.3.2] - 2025-01-14

### 📦 Build Changes

- **FIXED** Three.js was still being bundled into dist files despite
  peerDependencies change
    - Added `external: ['three']` to rollup config for 3D build
    - 3D bundle size reduced from ~1.3MB to ~615KB
    - Eliminates "Multiple instances of Three.js" warning for consumers

## [3.3.1] - 2025-01-14

### 📦 Dependency Changes

- **CHANGED** Three.js moved from `dependencies` to `peerDependencies`
    - Prevents duplicate Three.js instances when consumers have their own
      version
    - Consumers using 3D mode must now install `three` separately:
      `npm install three`
    - Supports Three.js versions `^0.181.0 || ^0.182.0`

### 🐛 Bug Fixes

- **FIXED** Race condition in 3D demo toggle handlers (wobble, particles, visual
  controls)
    - Toggle setup functions now support deferred mascot initialization
    - Handlers check mascot availability at click time instead of setup time

## [Unreleased]

### 🎵 Groove Preset System

#### Frame-Rate Independent Timing

- **FIXED** Groove animation desync on frame drops by removing `grooveTime`
  accumulator
- **CHANGED** Groove now computed from absolute `beatProgress`/`barProgress`
  (performance.now() based)
- **ADDED** deltaTime clamping (50ms max) to prevent smoothing overshoot during
  frame drops
- **INCREASED** `grooveSmoothingSpeed` to 12.0 for tighter beat sync

#### Groove Presets

- **ADDED** `groove1`: Subtle, elegant - gentle bounce and sway (default)
- **ADDED** `groove2`: Energetic, bouncy - pronounced vertical motion, playful
- **ADDED** `groove3`: Smooth, flowing - emphasis on rotation and sway, languid
- **ADDED** Seamless morphing between groove presets during transitions

#### API

- **ADDED** `mascot.setGroove(name)` - Immediate switch to groove preset
- **ADDED** `mascot.setGroove(name, { bars: N })` - Morph over N bars
- **ADDED** `mascot.setGroove(name, { duration: N })` - Morph over N seconds
- **ADDED** `mascot.getGroovePresets()` - Returns available preset names
- **ADDED** `mascot.getCurrentGroove()` - Returns active preset name
- **EXPORTED** `GROOVE_PRESETS` constant for preset inspection

## [3.2.0] - 2025-12-12 - 3D Engine & Audio Sync

### 🎮 3D Mascot Renderer

This major release introduces a complete 3D rendering engine powered by
Three.js, enabling photorealistic crystal, gemstone, and celestial body
visualizations with full emotion integration.

#### Core 3D System

- **ADDED** EmotiveMascot3D class with 2D/3D mode toggle
- **ADDED** Crystal blend-layers shader with soul-inside effect
- **ADDED** CrystalSoul class for emotion-driven inner core animations
- **ADDED** Physically-based subsurface scattering (BSSRDF) for gemstones
- **ADDED** Internal caustics and SSS presets for realistic gem rendering
- **ADDED** Component blend layers and internal lighting model

#### Geometries & Shapes

- **ADDED** Heart geometry with organic morphing
- **ADDED** Rough crystal geometry for natural gem appearance
- **ADDED** Mineral/stone geometries with SSS shader support
- **ADDED** Smooth geometry morphing with proper animation timing

#### Celestial Bodies

- **ADDED** Realistic sun with animated fire-like rays and corona
- **ADDED** Moon phases with shadow sliding transitions
- **ADDED** Total solar eclipse with Einstein ring gravitational lensing
- **ADDED** Lunar eclipse with smooth blood moon transitions
- **ADDED** Alpha-preserving bloom pass for starry backgrounds

#### Black Hole System

- **ADDED** Emotion-driven black hole with accretion disk
- **ADDED** Gravitational lensing Einstein ring effect
- **ADDED** Hawking radiation particle system with quantum tunneling
- **ADDED** Relativistic jets with emotion color tinting
- **ADDED** Far-side disk gravitational lensing (NASA M87\* accuracy)
- **ADDED** Blend layer controls for all black hole components

### 🎵 3D Rhythm Sync System

- **ADDED** Rhythm3DAdapter for audio-reactive 3D animations
- **ADDED** connectAudio/disconnectAudio API on EmotiveMascot3D
- **ADDED** Exponential smoothing for fluid beat-synced motion
- **ADDED** Stale rhythm detection with time-based fallback
- **ADDED** Shared rhythmEngine singleton via window global

### 💃 3D Gesture System

- **FIXED** Charleston gesture - proper screen-space motion with radians
- **FIXED** Running Man gesture - smooth jogging with subtle tilt (~2-3°)
- **ADDED** GlowLayer for gesture-driven screen-space halo effects
- **ADDED** All 2D gestures now have matching 3D transformations

### 🎨 Visual Effects

- **ADDED** Emotion color bleed effect for particles
- **ADDED** Emotion-driven soulAnimation for crystal inner core
- **ADDED** GrowIn animation for smooth element appearance
- **FIXED** Dark halos around 3D particles with premultiplied alpha
- **FIXED** White bloom on colored gemstones eliminated
- **FIXED** Core glow toggle now works for crystal geometries
- **IMPROVED** Bloom resolution to 0.75x for better quality

### 📱 Demo & UX Improvements

- **ADDED** Audio mixer style fader controls with step buttons
- **ADDED** Precision mode for blend layer sliders (long-press)
- **ADDED** Camera controls hint tooltip with pinch zoom
- **ADDED** Visual controls (particles, glow, auto-rotate) to demos
- **FIXED** Touch input lag on mobile devices eliminated
- **FIXED** Slider activation threshold to prevent accidental movement
- **REFACTORED** Shared 3D demo styles to common CSS file

### 📚 Documentation

- **ADDED** Comprehensive JSDoc headers to all use case files
- **ADDED** 3D TypeScript definitions
- **REWRITTEN** README with comprehensive 3D documentation

### 🐛 Bug Fixes

- **FIXED** Education use case stability and scroll-driven positioning
- **FIXED** Retail checkout mascot interactions and sun bloom
- **FIXED** Particle orbit distance for consistent rendering across screen sizes
- **FIXED** Gap between sun and corona with additive blending
- **FIXED** Geometry morphing cleanup and sun bloom pixelation

### ⚡ Performance & Bundle Optimization - 2025-10-31

#### Major Bundle Size Reduction & Build Streamlining

**Impact Summary:**

- **Bundle Size**: 930KB → 688KB (-242KB, **-26%**)
- **Lean Bundle**: 848KB → 616KB (-232KB, **-27%**)
- **Gzipped**: 252KB → 173KB (-79KB, **-31%**)
- **Build Time**: ~18s → ~7s (**-61% faster**)
- **dist/ Folder**: 50MB → 13MB (**-74% smaller**)
- **Build Files**: 9 → 3 (**-67% fewer**)
- **Dependencies**: 2 prod + 4 Babel → 0 (**-6 packages**)
- **Modules**: 410 → 265 (**-145 modules, -35%**)

**What was optimized:**

**1. Removed Sentry Error Monitoring (300KB savings)**

- **Removed**: `@sentry/browser` dependency (300.5KB, 9.5% of bundle)
- **Rationale**: This is an open-source library, not a SaaS product
    - Users should add their own error tracking
    - Privacy concerns with bundled telemetry
    - Sentry was never initialized (no DSN configured anywhere)
    - Never used in examples or production code
- **Alternative**: Users can listen to error events via
  `mascot.on('error', ...)`
- **Files removed**:
    - `src/utils/sentry.js`
    - Imports from `src/EmotiveMascot.js`
    - Initialization code from `src/mascot/system/InitializationManager.js`
- **Result**: 300KB smaller bundles, better privacy, cleaner architecture

**2. Removed Babel Transpilation Dependencies**

- **Removed**: All Babel packages (unused in build process)
    - `@babel/core`
    - `@babel/plugin-transform-runtime`
    - `@babel/preset-env`
    - `@babel/runtime`
- **Rationale**:
    - No Babel plugins configured in Rollup
    - Target browsers (Chrome 90+, Firefox 88+, Safari 14+) support modern JS
      natively
    - Code already uses native async/await, classes, ES6 modules
    - Node target is >=20.0.0 (full modern JS support)
- **Result**:
    - Faster builds (-53% initial improvement)
    - Smaller node_modules
    - Zero runtime dependencies!

**3. Streamlined Build Variants**

- **Removed 6 redundant builds**:
    - `mascot.dev.js` (redundant dev build)
    - `emotive-mascot.umd.dev.js` (redundant dev build)
    - `emotive-mascot.minimal.js` (only 10KB smaller than lean)
    - `emotive-mascot.minimal.umd.js` (redundant variant)
    - `emotive-mascot.audio.js` (only 44KB larger than full build)
    - `emotive-mascot.audio.umd.js` (redundant variant)
- **Kept 3 essential builds**:
    - `mascot.js` (688KB ES) - NPM consumers with bundlers
    - `emotive-mascot.umd.js` (688KB UMD) - CDN/browser usage
    - `emotive-mascot.lean.umd.js` (616KB) - Marketing sites
- **Rationale**:
    - Dev builds unnecessary (use production build with source maps)
    - Minimal and Audio variants too close in size to full build
    - Lean build sufficient for size-conscious users
- **Result**: Simpler maintenance, faster CI, smaller deployments

**4. Enabled Aggressive Tree-Shaking**

- **Changed**: `treeshake.moduleSideEffects: true` → `false`
- **Impact**: Better dead code elimination across all builds
- **Safe**: No side effects in module initialization

**5. Enhanced Lean Build Optimization**

- Added 3-pass terser optimization (was 2)
- Enabled console removal in production
- Private property mangling (`_` prefix)
- Same API name as full build for easy swapping

**Architecture improvements:**

- **Zero runtime dependencies**: Package now has empty `dependencies` object
- **Faster npm install**: Fewer packages to download
- **Better privacy**: No bundled telemetry or monitoring
- **Cleaner exports**: Only what users actually need
- **Testing**: All 2,827 tests passing ✓

**Files modified:**

- [package.json](package.json) - Removed 6 dependencies
- [rollup.config.js](rollup.config.js) - Streamlined to 2 build configs
- [scripts/copy-built-files.js](scripts/copy-built-files.js) - Updated for 3
  builds
- [src/EmotiveMascot.js](src/EmotiveMascot.js) - Removed Sentry import
- [src/mascot/system/InitializationManager.js](src/mascot/system/InitializationManager.js) -
  Removed Sentry init

**Breaking changes**: None - All changes are internal optimizations

**Migration guide**: No action needed - package.json will automatically use new
builds

### 🔧 Code Quality Improvements - 2025-10-30

#### Refactoring: God Object Reduction Phase 4

**What was improved:**

Continued architectural improvements by extracting two more managers from god
objects:

**1. DegradationEventHandler Extraction**

- Created
  [src/mascot/performance/DegradationEventHandler.js](src/mascot/performance/DegradationEventHandler.js)
  (127 lines)
- Extracted from [src/EmotiveMascot.js](src/EmotiveMascot.js)
- **Impact**: Reduced EmotiveMascot from 1,531 → 1,501 lines (30 lines, 2.0%)
- **Purpose**: Consolidated performance degradation event handling
- **Fixed**: Architecture split where degradation concerns were scattered
  between EmotiveMascot and PerformanceMonitoringManager
- **Methods extracted**: `handleDegradationEvent()`,
  `applyDegradationSettings()`

**2. GestureSoundLibrary Extraction**

- Created
  [src/core/audio/GestureSoundLibrary.js](src/core/audio/GestureSoundLibrary.js)
  (513 lines)
- Extracted from [src/core/audio/SoundSystem.js](src/core/audio/SoundSystem.js)
- **Impact**: Reduced SoundSystem from 928 → 581 lines (347 lines, **37.4%
  reduction**)
- **Purpose**: Centralized gesture sound configuration database
- **Coverage**: 30 gesture types with complete frequency/volume envelopes
- **Methods extracted**: 359-line `getGestureSoundConfig()` method

**Architecture improvements:**

- **Total reduction**: 377 lines across two files
- **Pattern**: Dependency injection with lazy evaluation via getter functions
- **Testing**: All 2,827 tests passing ✓
- **Documentation**: Updated ARCHITECTURE.md with new manager locations

**Cumulative refactoring progress:**

- Phase 1: ShadowEffectManager (274 lines)
- Phase 2: 5 managers from EmotiveMascotPublic (325 lines)
- Phase 3: Render managers from EmotiveMascot (multiple extractions)
- Phase 4: DegradationEventHandler + GestureSoundLibrary (377 lines)

## [3.0.0] - 2025-10-28 - Open Source Launch

### 🎉 MAJOR RELEASE: Open Source Community Edition

This major release marks the official open source launch of Emotive Engine with
complete community infrastructure, comprehensive documentation, critical plugin
system fixes, and professional GitHub repository setup.

**What's New:**

- Complete open source community files (CODE_OF_CONDUCT.md, CONTRIBUTING.md,
  SECURITY.md)
- GitHub Wiki with 5 comprehensive pages (Home, API Reference, Examples Gallery,
  Installation & Setup, Troubleshooting)
- GitHub Discussions configured with welcome post, categories, and example
  discussions
- Professional social preview image (1280x640px GIF) for repository sharing
- Social preview capture tool (examples/social-preview-capture.html)
- 3 critical plugin system fixes making the plugin architecture fully functional

**Breaking Changes:**

- Plugin lifecycle now requires proper `update()` and `render()` implementation
- Plugin adapters now properly exposed through EmotiveMascot API

**Community Infrastructure:**

- Contributor Covenant Code of Conduct
- Comprehensive contributing guidelines
- Security policy for vulnerability reporting
- Issue templates (bug report, feature request, Q&A)
- Pull request template with checklist
- GitHub Discussions with 4 categories + welcome post

### 📚 Plugin Documentation - Clarification - 2025-10-28

#### Documentation: Clarified Plugin Templates vs Exports

**Documentation issue discovered**: Plugin README was misleading about how to
use example plugins.

**What was unclear:**

- README showed
  `import CustomEmotionPlugin from './plugins/example-emotion-plugin.js'`
- Implied example plugins were importable from the emotive-engine package
- Users would try to import plugins that aren't exported
- No clear explanation that plugins are templates to copy, not pre-built exports

**What was fixed:**

- **ADDED** clear warning at top: "These are template files for you to copy and
  customize"
- **UPDATED** Quick Start with proper workflow: copy → customize → use
- **FIXED** `init(mascot)` signature to `init(api)` with correct pattern
- **ADDED** note about plugin adapters: `api.mascot.Emotions.pluginAdapter`
- **CLARIFIED** plugins are source templates, not package exports

**Correct usage:**

```javascript
// 1. Copy example-emotion-plugin.js to your project
// 2. Customize it (rename, change emotions, etc.)
// 3. Import YOUR copy:
import MyPlugin from './my-plugin.js'; // YOUR file, not from package

const mascot = new EmotiveMascot({ canvasId: 'canvas' });
await mascot.init(canvas);
mascot.registerPlugin(new MyPlugin());
```

**Impact**: Users now understand plugins are templates to customize, not
ready-to-use imports.

### 🔌 Plugin System - Critical Fix #3 - 2025-10-27

#### BREAKING: Plugin Lifecycle Integration (Fixes Missing update/render Calls)

**Third critical bug discovered**: Plugin update() and render() methods were
never called, making plugins static and non-functional.

**What was broken:**

- PluginSystem.js had NO update() or render() methods
- EmotiveMascot never called plugin update/render
- Example plugins define update() and render() but they were never executed
- Result: Plugins could register emotions/gestures but couldn't animate or
  render custom effects

**What was fixed:**

- **ADDED** PluginSystem.update(deltaTime, state) method
  ([src/core/PluginSystem.js:852](src/core/PluginSystem.js#L852))
- **ADDED** PluginSystem.render(ctx, state) method
  ([src/core/PluginSystem.js:875](src/core/PluginSystem.js#L875))
- **ADDED** pluginSystem.update() call in VisualizationRunner
  ([src/mascot/VisualizationRunner.js:191](src/mascot/VisualizationRunner.js#L191))
- **ADDED** pluginSystem.render() call in EmotiveMascot render loop
  ([src/EmotiveMascot.js:1982](src/EmotiveMascot.js#L1982))

**Plugin lifecycle now complete:**

```javascript
// 1. Plugin init - called once when registered
init(api) { this.mascot = api.mascot; }

// 2. Plugin update - called every frame (60 FPS)
update(deltaTime, state) { /* animate based on current emotion */ }

// 3. Plugin render - called every frame
render(ctx, state) { /* draw custom effects */ }

// 4. Plugin destroy - called when unregistered
destroy() { /* cleanup */ }
```

**Impact**: Plugins now have full lifecycle. Custom animations and rendering
effects work. Example emotion plugin's vignette and speed lines now render.

### 🔌 Plugin System - Critical Fix #2 - 2025-10-27

#### BREAKING: PluginSystem Integration (Fixes Architectural Mismatch)

**Second critical bug discovered**: PluginSystem.js did not pass mascot
reference to plugins, creating architectural mismatch between PluginSystem and
plugin adapters.

**Architecture discovered:**

- **Two separate plugin systems exist:**
    1. **PluginSystem.js** (867 lines) - Enterprise system with validation,
       sandboxing, hooks
    2. **Plugin Adapters** - Simple Map-based registries (emotion, gesture,
       particle)
- **Example plugins use adapter pattern** but PluginSystem didn't provide access

**What was broken:**

- PluginSystem called `plugin.init(pluginAPI)` but pluginAPI had no mascot
  reference
- PluginSystem constructor never received mascot instance
- Plugins expected `init(mascot)` or `init(api.mascot)`
- Result: Plugins received `{registerHook, emit, on, ...}` but no mascot

**What was fixed:**

- **ADDED** mascot parameter to PluginSystem constructor
  ([src/core/PluginSystem.js:59](src/core/PluginSystem.js#L59))
- **ADDED** `mascot: this.mascot` to pluginAPI
  ([src/core/PluginSystem.js:118](src/core/PluginSystem.js#L118))
- **UPDATED** EmotiveMascot to pass `mascot: this` to PluginSystem
  ([src/EmotiveMascot.js:351](src/EmotiveMascot.js#L351))
- **UPDATED** all example plugins to handle `init(api)` with fallback
  ([src/plugins/example-emotion-plugin.js:122](src/plugins/example-emotion-plugin.js#L122))

**How plugins now work:**

```javascript
// Plugin receives pluginAPI with mascot:
init(api) {
    this.mascot = api.mascot || api;  // Support both patterns
    const adapter = this.mascot.Emotions.pluginAdapter;
    adapter.registerPluginEmotion('custom', emotionDef);
}
```

**Impact**: PluginSystem.js and plugin adapters now properly integrated. Full
plugin lifecycle works end-to-end.

### 🔌 Plugin System - Critical Fix #1 - 2025-10-27

#### BREAKING: Plugin Adapter Exposure (Fixes Non-Functional Plugin System)

**First critical bug discovered and fixed**: Plugin adapters were not accessible
to plugins, making the entire emotion/gesture plugin system non-functional.

**What was broken:**

- Plugins expected `this.mascot.Emotions.pluginAdapter` to exist
- EmotiveMascot did not expose `Emotions`, `Gestures`, or `ParticleBehaviors`
  modules
- Plugin adapters were not exported from `src/index.js`
- Result: `example-emotion-plugin.js` and `example-gesture-plugin.js` would fail
  silently

**What was fixed:**

- **ADDED** `this.Emotions` exposure on EmotiveMascot instance
  ([src/EmotiveMascot.js:183](src/EmotiveMascot.js#L183))
- **ADDED** `this.Gestures` exposure on EmotiveMascot instance
  ([src/EmotiveMascot.js:184](src/EmotiveMascot.js#L184))
- **ADDED** `this.ParticleBehaviors` exposure on EmotiveMascot instance
  ([src/EmotiveMascot.js:185](src/EmotiveMascot.js#L185))
- **EXPORTED** `emotionPluginAdapter` from [src/index.js](src/index.js#L64)
- **EXPORTED** `gesturePluginAdapter` from [src/index.js](src/index.js#L76)
- **EXPORTED** `particleBehaviorPluginAdapter` from
  [src/index.js](src/index.js#L81)

**How plugins access adapters:**

```javascript
// Via mascot instance:
const adapter = mascot.Emotions.pluginAdapter;
adapter.registerPluginEmotion('custom', emotionDef);
```

**Impact**: Plugin adapters now accessible. Combined with Fix #2, entire plugin
system now functional.

#### Plugin Documentation Updates

- **FIXED** [src/plugins/README.md](src/plugins/README.md) initialization
  pattern - added missing `await mascot.init(canvas)` call
- **FIXED** src/plugins/README.md method references - changed `triggerGesture()`
  to `express()` (primary API)
- **REMOVED** fake `setParticleBehavior()` method reference from plugin docs
- **UPDATED** Plugin API properties section with warning about internal vs
  public API
- **FIXED**
  [src/plugins/example-emotion-plugin.js](src/plugins/example-emotion-plugin.js)
  to use `express()` instead of `triggerGesture()`
- **FIXED**
  [src/plugins/example-gesture-plugin.js](src/plugins/example-gesture-plugin.js)
  header comments to use `express()`

#### Technical Documentation Accuracy

- **FIXED** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - changed fake
  'gestureComplete' event to real 'gesture' event
- **FIXED** docs/ARCHITECTURE.md custom emotion example to use unique name
  'energized' instead of existing 'excited'
- **FIXED** docs/ARCHITECTURE.md plugin example to use real 'gesture' event
  instead of fake 'emotionChange'
- **FIXED** [docs/BUSINESS_POTENTIAL.md](docs/BUSINESS_POTENTIAL.md) - removed
  fake 'empathy' emotion references
- **FIXED** docs/BUSINESS_POTENTIAL.md - removed fake semantic performance API
  references
- **FIXED** docs/BUSINESS_POTENTIAL.md - clarified emotion+undertone notation as
  descriptive language
- **FIXED** [docs/INNOVATIONS.md](docs/INNOVATIONS.md) - corrected emotion count
  from 12 to 15 with complete list
- **FIXED** docs/INNOVATIONS.md - changed fake 'empathy' emotion to 'calm' in
  code examples
- **FIXED** docs/INNOVATIONS.md - corrected emotion×undertone math from 72 to 90
  unique states
- **FIXED** docs/INNOVATIONS.md gesture compatibility matrix with clarifying
  comment

### 📚 Documentation Overhaul - 2025-10-27

#### Examples Standardization

- **FIXED** All 10 examples to use ONLY real API methods (removed all fake
  methods)
- **ADDED** Educational STEP-by-step comments to all examples
- **CREATED** [examples/example-styles.css](examples/example-styles.css) for
  consistent branding
- **ADDED** Complexity ratings (⭐ to ⭐⭐⭐⭐) to all examples
- **FIXED** [examples/hello-world.html](examples/hello-world.html) with proper
  canvas gradient pattern
- **REBUILT** [examples/basic-usage.html](examples/basic-usage.html) with
  best-practice layout
- **REBUILT** [examples/breathing-app.html](examples/breathing-app.html) with
  timed animation sequences
- **UPDATED** [examples/event-handling.html](examples/event-handling.html) to
  use REAL event system
- **IMPROVED** [examples/rhythm-sync-demo.html](examples/rhythm-sync-demo.html)
  with better tap tempo detection
- **UPDATED**
  [examples/llm-integration/claude-haiku.html](examples/llm-integration/claude-haiku.html)
  with real API
- **UPDATED** [examples/react-component.jsx](examples/react-component.jsx) as
  template with warnings
- **UPDATED** [examples/vue-component.vue](examples/vue-component.vue) as
  template with warnings

#### Documentation Fixes

- **FIXED** [README.md](README.md) Quick Start code - added missing
  `mascot.init(canvas)` call
- **UPDATED** README.md emotions list to match actual API (joy, calm, excited,
  sadness, love, focused, empathy, neutral)
- **UPDATED** README.md shapes list (circle, heart, star, sun, moon)
- **UPDATED** README.md gestures list (bounce, spin, pulse, glow, breathe,
  expand)
- **FIXED** [CONTRIBUTING.md](CONTRIBUTING.md) build output path to
  `site/public/emotive-engine.js`
- **FIXED** CONTRIBUTING.md examples references (removed non-existent
  hello-world-cdn.html)
- **FIXED** CONTRIBUTING.md project structure diagram
- **UPDATED** CONTRIBUTING.md license from "dual MIT/Commercial" to "MIT
  License"
- **FIXED** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) event examples to use
  real events
- **REWROTE** [site/DEPLOYMENT_CHECKLIST.md](site/DEPLOYMENT_CHECKLIST.md) for
  actual Next.js site
- **FIXED** [examples/README.md](examples/README.md) to remove fake API methods
- **FIXED**
  [examples/llm-integration/README.md](examples/llm-integration/README.md) with
  real integration patterns

#### Open Source Cleanup

- **DELETED** `scripts/add-copyright.js` (proprietary copyright script)
- **UPDATED** [docs/INNOVATIONS.md](docs/INNOVATIONS.md) to remove proprietary
  language
- **CHANGED** "Trade Secrets" section to "Implementation Details" with source
  links
- **ADDED** "Open Source Philosophy" section to INNOVATIONS.md
- **REMOVED** patent filing recommendations

#### Asset Cleanup

- **DELETED** Entire `site/assets/` directory (duplicates of
  site/public/assets/)
- **DELETED** Duplicate emotion SVGs from `assets/emotions/`
- **DELETED** Obsolete `site/docs/` directory
- **DELETED** Unused audio files and SVGs
- **REMOVED** 49+ duplicate/unused files

### 🎯 Impact

All documentation now uses ONLY real API methods from working examples. No more
fake methods like:

- ❌ `addGesture()`, `blendEmotions()`, `queueGestures()` (never existed)
- ❌ Emotions: anger, fear, curiosity, excitement (not in working examples)
- ❌ Events: emotionChange, gestureStart, gestureComplete (fake)

✅ Everything now matches [examples/hello-world.html](examples/hello-world.html)
and other working examples!

## [3.0.0] - 2025-10-20 - Semantic Performance System 🎭

### 🎯 Major Feature: Context-Aware Performance Choreography

This major release introduces the **Semantic Performance System**, enabling
developers to express AI intent through universal, choreographed animation
sequences with context-aware intensity adjustment. This eliminates manual
animation timing and gesture coordination, reducing code by 98%.

#### Core System Implementation

- **ADDED** `PerformanceSystem` - Main orchestrator for semantic performances
- **ADDED** `ContextManager` - Manages conversation context (frustration,
  urgency, magnitude)
- **ADDED** `SequenceExecutor` - Timeline-based multi-step performance execution
- **ADDED** 44 built-in semantic performances across 3 categories:
    - **Conversational** (16): `listening`, `thinking`, `empathizing`,
      `celebrating`, `greeting`, etc.
    - **Feedback** (13): `success_minor`, `success_epic`, `error_moderate`,
      `warning`, etc.
    - **State** (15): `idle`, `processing`, `loading`, `completed`,
      `monitoring`, etc.

#### New API Methods

- **ADDED** `perform(semanticAction, options)` - Execute semantic performance
- **ADDED** `updateContext(updates)` - Update conversation context
- **ADDED** `getContext()` - Get current context state
- **ADDED** `incrementFrustration(amount)` - Increase user frustration
- **ADDED** `decrementFrustration(amount)` - Decrease user frustration
- **ADDED** `resetFrustration()` - Reset frustration to zero
- **ADDED** `getAvailablePerformances()` - List all 44 performance names
- **ADDED** `registerPerformance(name, definition)` - Add custom performances
- **ADDED** `getPerformanceAnalytics()` - Get execution analytics
- **ADDED** `getContextAnalytics()` - Get context history analytics

#### Context-Aware Intelligence

- **ADDED** Automatic intensity calculation based on:
    - Frustration level (0-100) → Boosts intensity up to +0.3
    - Urgency (low/medium/high) → Adjusts intensity by ±0.2
    - Magnitude (small/moderate/major/epic) → Scales from -0.1 to +0.3
- **ADDED** Automatic frustration decay (-5 points per 10 seconds, configurable)
- **ADDED** Context history tracking for UX optimization
- **ADDED** Performance execution analytics

#### Configuration Options

- **ADDED** `enablePerformanceHistory` (default: true) - Track context history
- **ADDED** `enableFrustrationDecay` (default: true) - Auto-decay frustration
- **ADDED** `performanceHistoryLimit` (default: 50) - Max history entries
- **ADDED** `frustrationDecayRate` (default: 5) - Decay points per interval
- **ADDED** `frustrationDecayInterval` (default: 10000) - Decay interval in ms
- **ADDED** `allowConcurrentPerformances` (default: false) - Allow multiple
  performances
- **ADDED** `enablePerformanceAnalytics` (default: true) - Track analytics

#### Documentation

- **ADDED** `docs/api/semantic-performances.md` - Complete semantic performance
  guide (420+ lines)
- **ADDED** `docs/SEMANTIC_PERFORMANCES_QUICK_REFERENCE.md` - Quick reference
  cheat sheet
- **UPDATED** `API.md` - Added Semantic Performance System section
- **UPDATED** `README.md` - Highlighted new feature in Key Features section

#### Retail Use Case Integration

- **MIGRATED** `site/src/app/use-cases/retail/AICheckoutAssistant.tsx` to
  semantic API
- **REDUCED** Animation choreography code from 50+ lines → 1 line (98%
  reduction)
- **IMPROVED** User experience with context-aware intensity adjustments
- **SIMPLIFIED** Maintenance with centralized performance definitions

#### Developer Experience

```javascript
// Before v3.0: Manual choreography (50+ lines)
const intensity = frustration > 60 ? 1.0 : 0.7;
mascot.setEmotion('empathy', intensity);
setTimeout(() => mascot.express('shake'), 200);
setTimeout(() => mascot.express('nod'), 600);
setTimeout(() => mascot.express('point'), 900);

// After v3.0: Semantic API (1 line)
await mascot.perform('offering_urgent_help', {
    context: { frustration: 85, urgency: 'high' },
});
```

#### Breaking Changes

- None - Fully backward compatible with v2.x API
- All existing methods continue to work as before
- Semantic Performance System is additive, not replacing existing APIs

### 📊 Impact

- **Code Reduction**: 98% less animation choreography code
- **Maintainability**: Centralized performance definitions
- **Consistency**: Universal archetypes across all use cases
- **Extensibility**: Easy custom performance registration

## [2.5.1] - 2025-10-17 - Dependency Cleanup & Build Optimization 🧹

### 🎯 Production-Ready Package Management

This patch release eliminates unnecessary dependencies that were inflating the
package size and causing installation bloat. The core engine is now truly
framework-agnostic with zero React/Next.js dependencies.

#### Dependency Cleanup

- **REMOVED** React 19.2.0 from core dependencies (not needed in engine)
- **REMOVED** React-DOM 19.2.0 from core dependencies (not needed in engine)
- **REMOVED** Next.js 15.5.6 from core dependencies (belongs in demo site only)
- **REMOVED** Firebase 12.4.0 from core dependencies (moved to site)
- **REMOVED** Firebase Admin 13.5.0 from core dependencies (server-side only)
- **REDUCED** node_modules size from ~250MB → ~50MB (80% reduction)
- **ELIMINATED** 183 unnecessary packages from dependency tree
- **KEPT** @sentry/browser 10.20.0 (optional error monitoring)
- **KEPT** @babel/runtime 7.28.4 (required for terser transforms)

#### Build System Enhancements

- **CREATED** `src/minimal.js` - Optimized entry point for minimal builds
- **CREATED** `src/audio.js` - Audio-focused entry point for music apps
- **UPDATED** Rollup config to use dedicated entry points for tree-shaking
- **ENABLED** Aggressive tree-shaking (`moduleSideEffects: false`)
- **FIXED** Export errors in new entry point files

#### Bundle Size Targets

- **UPDATED** bundlesize targets to realistic industry-standard values:
    - Full UMD: 900KB raw / 250KB gzip (was 500KB/150KB)
    - Minimal ES: 400KB raw / 120KB gzip (new target)
    - Audio ES: 700KB raw / 200KB gzip (new target)

#### Documentation

- **ADDED** Bundle Sizes section to README.md
- **DOCUMENTED** Build variant usage and import patterns
- **EXPLAINED** Tree-shaking benefits for modern bundlers

### 📊 Build Output Results

| Build           | Raw Size | Gzipped | Target Met |
| --------------- | -------- | ------- | ---------- |
| **Full UMD**    | 845KB    | 234KB   | ✅ Yes     |
| **Minimal ES**  | 782KB    | 216KB   | ⚠️ Close   |
| **Audio ES**    | 801KB    | 221KB   | ✅ Yes     |
| **Full ES**     | 845KB    | 234KB   | ✅ Yes     |
| **Minimal UMD** | 783KB    | 217KB   | ⚠️ Close   |
| **Audio UMD**   | 801KB    | 221KB   | ✅ Yes     |

**Note:** Minimal and audio builds are close to full size because they still
import the complete `EmotiveMascot` class. Further optimization would require
deeper refactoring (Phase 2 work).

### 🧪 Quality Assurance

- **PASSED** All 350 automated tests (65 more tests than v2.5.0!)
- **VERIFIED** No regression in functionality
- **CONFIRMED** Clean linting (only pre-existing warnings)
- **VALIDATED** All 6 bundle outputs generate successfully

### 🔄 Breaking Changes

**BREAKING:** If your project relied on transitive dependencies (React, Next.js,
Firebase) from this package, you must now install them directly in your own
`package.json`. This is the correct approach for package management.

**Migration:**

```bash
# If you use React in your project, add it explicitly:
npm install react react-dom

# If you use Next.js in your project, add it explicitly:
npm install next
```

### 💾 Git History

- Branch: `fix/production-ready`
- Commit: `9c0d0cf6`
- Files Changed: 9 files (+646, -2814 lines)
- Tests: 350/350 passing

### 📈 Impact

**Before v2.5.1:**

- `npm install @joshtol/emotive-engine` → 250MB node_modules
- 7 production dependencies (including React, Next.js)
- Confusing for users expecting a pure canvas library

**After v2.5.1:**

- `npm install @joshtol/emotive-engine` → 50MB node_modules (80% smaller!)
- 2 production dependencies (@babel/runtime, @sentry/browser)
- Clear, focused dependency tree

---

## [2.5.0] - 2025-10-17 - Production Ready Release 🚀

### 🎯 10-Day Production Readiness Plan Complete

This release marks the completion of a comprehensive 10-day production readiness
initiative, transforming the codebase from a development prototype to a
production-grade engine ready for deployment and partnership discussions.

#### Build System & Repository Hygiene (Days 1-2)

- **REMOVED** Webpack build system (5 packages + 90 dependencies removed)
- **CONSOLIDATED** Build configs from 10 → 8 files (Rollup-only approach)
- **UNTRACKED** 8 build artifacts from git (.gitignore updated)
- **UPDATED** 54 dependencies (jsdom 23.2.0 → 27.0.0,
  @rollup/plugin-node-resolve 15.3.1 → 16.0.3)
- **VERIFIED** All 7 builds working (UMD, ES, minimal, audio, dev variants)
- **REDUCED** Security vulnerabilities from 7 → 3 (dev dependencies only)

#### Test Infrastructure (Days 3-5)

- **CREATED** Comprehensive test infrastructure (324 tests total):
    - 17 EmotiveMascot core tests
    - 28 ParticleSystem tests
    - 55 colorUtils tests
    - 28 easing tests
    - 43 GestureController tests
    - 40 AudioHandler tests
    - 26 ConfigurationManager tests
    - 30 StateCoordinator tests
    - 23 VisualizationRunner tests
    - 20 integration/lifecycle tests
    - 14 site component tests
- **ACHIEVED** 65.81% branch coverage (exceeded 40% target)
- **ESTABLISHED** Vitest 3.2.4 with coverage reporting
- **INSTALLED** @vitest/coverage-v8 for detailed coverage metrics

#### God Object Refactoring - Phase 1 (Days 6-7)

- **MIGRATED** GestureController from EmotiveMascot.js (285 lines removed)
- **REDUCED** EmotiveMascot.js from 2,967 → 2,682 lines (-9.6%)
- **EXPANDED** GestureController.js from 32 → 318 lines (+286 lines)
- **INCREASED** Delegation rate from 9.3% → 14.8%
- **ADDED** 68 GestureController-specific tests
- **MAINTAINED** 100% backward compatibility (all 324 tests passing)

#### Documentation & Code Cleanup (Day 8)

- **CREATED** docs/ directory structure (docs/cherokee, docs/archive)
- **MOVED** PRODUCTION-READY-PLAN.md to docs/ for better organization
- **UPDATED** README.md with Documentation section linking to docs/
- **ADDED** .gitattributes file to enforce LF line endings across platforms
- **REMOVED** Debug console.warn from GestureController.js
- **FIXED** CRLF/LF line ending warnings (normalized to LF)

#### Source Maps & Build Optimization (Day 9)

- **ENABLED** Source maps for all 7 bundles:
    - emotive-mascot.umd.js (production)
    - emotive-mascot.umd.dev.js (development)
    - mascot.js (ES production)
    - mascot.dev.js (ES development)
    - emotive-mascot.minimal.js (minimal ES)
    - emotive-mascot.minimal.umd.js (minimal UMD)
    - emotive-mascot.audio.js (audio-only)
- **GENERATED** .map files for all bundles (174+ source files included)
- **VERIFIED** Bundle sizes within limits (133 kB gzipped < 150 kB target)
- **MAINTAINED** Build time at ~18.3s (no performance regression)

#### Final Validation (Day 10)

- **PASSED** All 324 automated tests
- **GENERATED** Coverage report (29.22% statements, 65.81% branches)
- **BUILT** All 7 distribution targets successfully
- **AUDITED** Security (3 moderate vulnerabilities in dev dependencies only)
- **UPDATED** Version to 2.5.0
- **CREATED** Git tag v2.5.0-production-ready

### 📊 Success Metrics

| Metric                     | Before        | After              | Status  |
| -------------------------- | ------------- | ------------------ | ------- |
| **Build Configs**          | 10 files      | 8 files            | ✅ Done |
| **Build Artifacts in Git** | 7 tracked     | 0 tracked          | ✅ Done |
| **Test Files**             | 0             | 324 tests          | ✅ Done |
| **Test Coverage**          | 0%            | 65.81% (branch)    | ✅ Done |
| **God Objects**            | 2 (6K+ lines) | Phase 1 Complete   | ✅ Done |
| **Outdated Deps**          | 15 packages   | 0 packages         | ✅ Done |
| **Source Maps**            | Disabled      | Enabled (7 builds) | ✅ Done |
| **Security Vulns**         | 7             | 3 (dev only)       | ✅ Done |

### 🎯 Production Readiness Status

The Emotive Engine is now **production-ready** for:

- Cherokee Nation partnership discussions
- NPM package publication
- Alpha testing with early adopters
- Product Hunt launch preparation
- Heritage Center pilot deployment

### 🚀 Next Steps (Post-Production)

1. **Month 1**: Core Engine Perfection
    - Manual emotion testing (13 emotions × undertones)
    - Performance validation (60 FPS on low-end devices)
    - Audio integration testing (BPM detection, rhythm sync)

2. **Months 2-3**: Public API Stabilization
    - Review 86 public methods
    - Lock API design (no breaking changes after this)
    - Alpha testing with 3-5 users

3. **Months 3-4**: SDK Extraction
    - Extract public SDK from private core
    - Publish to NPM as `@emotive-engine/core`
    - Generate TypeScript definitions

4. **Month 4+**: Cherokee Partnership & Launch
    - Cherokee Nation demo and LOI
    - Product Hunt launch
    - Heritage Center pilot deployment

### 🙏 Acknowledgments

This production-ready release was achieved through systematic planning, rigorous
testing, and careful refactoring. Special thanks to the 10-day production plan
framework that guided this transformation.

---

### ✨ Public API Enhancements

#### Instant Emotion Transitions

- **Added** duration parameter support to `setEmotion()` method in
  EmotiveMascotPublic
    - Accepts duration as second parameter: `setEmotion('joy', 0)` for instant
      transitions
    - Supports three parameter formats:
        - Undertone string: `setEmotion('joy', 'warm')`
        - Duration number: `setEmotion('joy', 0)` for instant (no particle
          artifacts)
        - Options object:
          `setEmotion('joy', { undertone: 'warm', duration: 0 })`
    - Default transition duration remains 500ms for backwards compatibility

- **Fixed** particle transition artifacts when rapidly switching emotion states
    - Instant transitions (0ms) eliminate errant particles from previous states
    - Particularly useful for card carousels and rapid UI interactions
    - Cherokee language learning demo updated to use instant transitions

#### Documentation

- **Updated** API.md with comprehensive setEmotion() parameter documentation
- **Added** examples for all parameter formats
- **Documented** use case for instant transitions to prevent particle artifacts

## [2.6.0] - 2025-01-14

### 🎯 Rotation & Braking System Overhaul

#### Major Changes

- **CONVERTED** entire rotation system from radians to degrees for simplicity
    - Renderer now uses degrees internally (0-360°)
    - Velocity is measured in degrees per frame (not radians per second)
    - All angle calculations simplified to match standard animation practices

#### Braking System Rewrite

- **REDESIGNED** RotationBrake class for smooth, predictable deceleration
    - Time-based easing using quartic ease-out function (1 - (1-t)^4)
    - Dynamic duration calculation:
      `(angleToTravel / |velocity|) * DURATION_FACTOR * 5`
    - Brake runs within renderer's animation loop (no separate RAF)
    - Automatic target calculation to nearest upright (0°/360°) position
    - Smooth anticipatory deceleration that visually "seeks" the target

#### Demo Improvements

- **UPDATED** rotation slider to use -10 to 10 range (matches velocity units)
- **ADDED** gradient background to rotation slider (blue CCW → green CW)
- **ENHANCED** slider thumb with gradient, shadows, and hover effects
- **SIMPLIFIED** brake button to single-click only (removed double-click)
- **FIXED** slider immediately resets to 0 when brake is pressed

#### Technical Details

- **REMOVED** 200+ lines of complex physics calculations
- **REPLACED** with ~100 lines of simple, working code
- **ELIMINATED** unit conversion bugs between radians/degrees
- **FIXED** race conditions between brake and renderer updates
- **IMPROVED** performance with single animation loop

## [2.5.0] - 2025-01-11

### ✨ Visual Effects & Polish

#### New Features

- **Added** Chromatic aberration effect on impact gestures (bounce, shake,
  pulse, flash, jump, slam, spin, flicker)
    - Subtle red/cyan color separation creating a "glitch" effect
    - CSS-based animation for smooth performance
    - Intensity varies by gesture type (flash/jump = 100%, shake = 90%, bounce =
      80%, etc.)
    - Quick 300-500ms duration for tasteful impact enhancement
- **Renamed** Sparkle effect to Flicker (creates falling star particles)
- **Added** New Sparkle effect with firefly-like glow particles
- **Improved** Star particle shape from 4-pointed to 5-pointed with better
  proportions

#### Technical Improvements

- **Refactored** Special effects to use CSS animations on visible canvas element
- **Fixed** Canvas element targeting for post-processing effects
- **Optimized** Effect update loop with proper fade timing

## [2.4.0] - 2025-01-11

### 🔧 Production Readiness & NPM Package Preparation

#### Code Cleanup

- **Removed** all console.log statements (126 total) for production deployment
- **Fixed** syntax errors from incomplete console statement removal
- **Fixed** drop shadow rendering issue causing core dimming
- **Fixed** orbital gesture to keep core stationary (particle-only effect)

#### Bug Fixes

- **Fixed** bass sensitivity in web audio - removed fallback code triggering on
  every beat
- **Fixed** rhythm sync BPM detection jumping - tightened tolerances to 3%
- **Fixed** gesture animations (glow/flash/flicker) not triggering independently
- **Fixed** flash gesture to emanate outward in wave pattern (less
  seizure-inducing)
- **Fixed** core dimming issue by removing drop shadow overlay

#### NPM Package Plan

- **Planned** Public API wrapper (EmotiveMascotPublic.js) with safe methods
  only:
    - Animation control (play, pause, stop)
    - Gesture/emotion triggers with timestamps
    - Audio loading and analysis
    - Timeline recording/playback
    - Frame export for video generation
    - Quality settings for mobile
- **Planned** Timeline System for animation recording:
    - Record user interactions with timestamps
    - Export/import animation sequences as JSON
    - Seek/scrub functionality
    - Synchronize with audio playback

- **Planned** Security measures:
    - Hide internal implementation (ShapeMorpher, AudioDeformer)
    - Private modules for core algorithms
    - Non-enumerable internal methods
    - Bundled & minified distribution

- **Planned** Package structure:
    ```
    package.json (private: true)
    src/
      EmotiveMascotPublic.js  (public API)
      EmotiveMascot.js         (internal)
      core/                    (internal modules)
    dist/
      emotive-engine.min.js    (bundled & minified)
      emotive-engine.d.ts      (TypeScript definitions)
    ```

### 🎯 Next Steps

- Implement public API wrapper
- Add timeline recording system
- Create build process with Webpack/Rollup
- Generate TypeScript definitions
- Prepare for private NPM publication on GitHub

## [2.3.0] - 2025-01-10

### 🎵 Advanced Audio-Reactive Visualization System

#### Spectral Analysis & Onset Detection

- **Implemented** real-time spectral flux onset detection for transient
  identification
- **Created** frequency band analyzer with 32-band FFT analysis (0-24kHz
  spectrum)
- **Added** adaptive thresholding system for dynamic audio response
- **Developed** spectral contrast detection to isolate vocal/lead frequencies
  from background

#### Bass Response System

- **Engineered** bass thump detection algorithm targeting sub-bass frequencies
  (bands 0-2)
- **Implemented** dynamic threshold calculation (8% above rolling average)
- **Added** randomized directional wobble effect for organic bass visualization
- **Created** smooth decay system with configurable hold times for natural
  movement

#### Vocal/Transient Effects

- **Developed** subtle shimmer/ripple effect system for vocal presence
- **Implemented** 2-3 point glitch system with low intensity (0.02-0.05)
- **Added** glow boost effect (+30% brightness) on vocal onsets
- **Created** hold time system (250ms) for sustained visual feedback

#### Frequency Band Targeting

- **Identified** optimal vocal range in bands 9-13 (centered on band 11)
- **Implemented** Gaussian weighting for vocal band emphasis
- **Added** drum rejection algorithm to minimize false positives
- **Created** ratio-based detection to ensure vocal concentration

#### Debug & Monitoring Tools

- **Built** real-time frequency band visualizer with color coding
- **Added** bass and transient indicators with energy readouts
- **Implemented** console logging for thump detection debugging
- **Created** visual feedback system for effect activation

### 🎨 Visual Refinements

- **Reduced** glitch intensity from 0.08-0.16 to 0.02-0.05 for subtlety
- **Changed** glitch behavior from harsh inward pull to gentle shimmer
- **Lowered** glitch trigger probability from 30% to 20%
- **Smoothed** decay rates for more organic transitions

### 🔧 Performance Optimizations

- **Optimized** spectral history buffer (30 frames/1 second)
- **Reduced** glitch point count from 4-6 to 2-3 points
- **Streamlined** frequency band calculations with efficient loops
- **Implemented** frame-based throttling for audio updates

## [2.2.0] - 2025-01-10

### 🎨 Major Improvements: Shape Morphing & Animation System

#### Shape System Enhancements

- **Removed** eclipse and solar shapes for cleaner shape library
- **Removed** special moon-to-sun transition animations for consistency
- **Fixed** moon shadow behavior - now ALWAYS slides away before ANY
  transformation
- **Enhanced** sun rays to animate like fire with organic flickering motion
- **Smoothed** lunar eclipse animations with gradual transitions and S-curve
  blending

#### Advanced Musical Quantization

- **Implemented** adaptive quantization granularity based on BPM:
    - Fast tempos (>140 BPM): 8th note quantization
    - Medium tempos (100-140 BPM): 16th note quantization
    - Slow tempos (<100 BPM): 32nd note quantization
- **Added** phase-aware quantization - weaker at morph start/end for smooth
  transitions
- **Introduced** BPM-based strength curve - optimal at 90 BPM, weaker at
  extremes
- **Applied** cubic interpolation (smoothstep) for natural quantization blending

#### Morph Queue System

- **Added** automatic morph queueing to prevent interruptions
- **Implemented** force override option for immediate morphs
- **Created** queue management methods (hasQueuedMorph, clearQueue)

### 🐛 Bug Fixes

- **Fixed** MusicalDuration.getDuration error by properly using toMilliseconds
  method
- **Fixed** non-finite value errors in createRadialGradient with safety checks
- **Added** parameter validation for radius, x, y in all shape render functions
- **Fixed** undefined primaryColor errors with emotion state fallbacks

### 🔧 Technical Improvements

- **Optimized** sun ray rendering with single path for all flames
- **Improved** shadow interpolation logic for all moon transitions
- **Enhanced** error boundaries with proper fallback states
- **Refined** progress clamping between 0 and 1 throughout system

## [2.1.0] - 2025-01-09

### 🎵 Major Innovation: Musical Time-Based Animation System

- **PATENTABLE**: Invented revolutionary gesture scheduling system that operates
  in musical time rather than clock time
- **PATENTABLE**: Developed 60,000ms/BPM conversion algorithm for perfect beat
  synchronization
- **PATENTABLE**: Created hierarchical rhythm modulation system (Gesture →
  Emotion → Undertone)
- Implemented `MusicalDuration` class for tempo-adaptive animations
- Built `GestureScheduler` with musical boundary quantization
- Added per-gesture queue management to prevent spam
- Integrated rhythm engine with all gesture types

### ✨ Added

- **Rhythm Integration Module** (`src/core/rhythmIntegration.js`)
    - Connects rhythm engine to gesture system
    - Provides tempo and pattern management
    - Handles start/stop/pause functionality
- **Musical Duration System** (`src/core/MusicalDuration.js`)
    - Converts between musical time (beats/bars) and milliseconds
    - Supports subdivisions (quarter, eighth, sixteenth notes)
    - Automatic tempo scaling

- **Gesture Scheduler** (`src/core/GestureScheduler.js`)
    - Schedules gestures on musical boundaries (beat/bar/phrase)
    - Queue management with overflow handling
    - Visual feedback callbacks for UI integration

- **Enhanced Gesture Transitions**
    - Smooth entry/exit for scan gesture (15% transition zones)
    - Improved hula gesture with sine-based easing (10% transitions)
    - Fixed orbit gesture center clustering with minimum radius enforcement

### 🔧 Fixed

- Fixed rhythmEngine property access (getBPM() → .bpm)
- Removed debug code that was changing particle colors
- Fixed gesture transitions for scan, hula, and orbit
- Corrected FPS counter implementation

### 📝 Documentation

- Created comprehensive defensive publication (2025-01-09)
- Added detailed BPM conversion formula explanation
- Documented rhythm configuration for all gestures

## [2.0.0] - 2025-01-08

### 🧠 Major Innovation: Emotion-Driven Particle System

- **PATENTABLE**: Created emotion matrix with behavioral undertones
- Developed 40+ unique gesture animations
- Implemented particle physics with emotional responsiveness
- Built modular gesture system with hot-swapping capability

### ✨ Added

- **Core Emotion System**
    - 12 primary emotions (neutral, joy, sadness, anger, fear, surprise,
      disgust, love, euphoria, excited, suspicion, resting)
    - 6 behavioral undertones (nervous, intense, tired, confident, subdued)
    - Emotion-gesture mapping system

- **Gesture Categories**
    - Motion gestures (bounce, pulse, shake, spin, etc.)
    - Transform gestures (expand, contract, morph, etc.)
    - Effects gestures (flash, glow, flicker, etc.)
    - Complex gestures (scan, hula, orbit with 3D depth)

- **Particle System**
    - Dynamic particle count based on emotion
    - Velocity and acceleration modulation
    - Color and glow effects per emotion
    - Z-coordinate system for 3D depth

### 🎨 UI/UX

- Sci-fi themed demo interface
- Light/Dark/Night theme system
- Real-time FPS counter
- Gesture button visual feedback

## [1.0.0] - 2025-01-07

### 🚀 Initial Release

- Basic particle engine with canvas rendering
- Simple emotion states
- Foundation for gesture system
- Basic orbital and wave animations

---

## IP Protection Notes

This changelog serves as a legal record of innovation dates. Each entry is
timestamped and describes novel features that may be eligible for patent
protection.

### Key Innovations for Patent Consideration:

1. **Musical Time-Based Animation** (2025-01-09) - First known system to operate
   entirely in musical time
2. **Hierarchical Rhythm Modulation** (2025-01-09) - Three-tier system for
   rhythm influence
3. **Gesture Scheduling with Queue Management** (2025-01-09) - Prevents spam
   while maintaining musicality
4. **Emotion-Undertone Matrix** (2025-01-08) - Dual-layer emotional expression
   system

### Trade Secrets (Not Disclosed):

- Specific implementation of BPM conversion optimizations
- Queue overflow handling algorithms
- Particle clustering prevention techniques
- Performance optimization methods

---

**Copyright © 2025 Joshua Tollette**

Released under the MIT License. See [LICENSE.md](./LICENSE.md) for details.
