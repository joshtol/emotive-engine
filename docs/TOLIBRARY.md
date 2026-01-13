# Library Improvement Roadmap

**Goal:** Make `@joshtol/emotive-engine` easier for developers to integrate, debug, and extend.

---

## Priority 1: Critical — Error Handling & Validation

These issues cause silent failures that waste developer time debugging.

### ✅ Task 1.1: Add Input Validation to Core APIs
**Status:** Completed
**Files:** `src/3d/index.js`

Added validation with helpful warnings to `setEmotion()`, `express()`, `morphTo()`:
- Invalid inputs log warnings with valid alternatives via `getAvailableEmotions()`, `getAvailableGestures()`, `getAvailableGeometries()`
- Unknown but valid-format inputs warn but still proceed (allows custom extensions)

---

### ✅ Task 1.2: Standardize Return Values for Method Chaining
**Status:** Completed
**File:** `src/3d/index.js`

All state-changing methods now return `this` for chaining:
- `setEmotion()`, `express()`, `morphTo()`, `updateUndertone()`, `setPosition()`, `setContainment()`

---

### ✅ Task 1.3: Improve Destroy Guard Consistency
**Status:** Completed
**File:** `src/3d/index.js`

Added `_isDestroyed()` helper method used consistently across all methods:
- Methods returning `this` use: `if (this._isDestroyed()) return this;`
- Methods returning result objects use: `if (this._isDestroyed()) return { success: false, ... };`

---

## Priority 2: High — API Consistency

These issues cause confusion when switching between 2D and 3D modes.

### ✅ Task 2.1: Unify 2D/3D setEmotion Signatures
**Status:** Completed
**Files:** `src/3d/index.js`

3D `setEmotion()` now accepts same parameter formats as 2D:
- `setEmotion('joy', 500)` - duration as number
- `setEmotion('joy', 'calm')` - undertone as string
- `setEmotion('joy', { undertone: 'calm' })` - options object

---

### ✅ Task 2.2: Deprecate Confusing Method Aliases
**Status:** Completed
**File:** `src/3d/index.js`

Added deprecation warning to `setGeometry()`:
```javascript
setGeometry(geometryName, options = {}) {
    console.warn('[EmotiveMascot3D] setGeometry() is deprecated. Use morphTo() instead.');
    return this.morphTo(geometryName, options);
}
```

---

### ✅ Task 2.3: Standardize Event Emission Patterns
**Status:** Completed
**Files:** `src/3d/index.js`, `docs/EVENTS.md`

- Added `position:change` event to `setPosition()` with `{ x, y, z, previous }` payload
- Added `scale:change` event to `setContainment()` with `{ scale, previous }` payload
- Created comprehensive `docs/EVENTS.md` documenting all 12 events with examples

---

## Priority 3: Medium — Testing Gaps

These gaps make refactoring risky and hide regressions.

### ✅ Task 3.1: Add EmotiveMascot3D Unit Tests
**Status:** Completed
**Files:** `test/unit/3d/EmotiveMascot3D.test.js` (53 tests)

Tests cover:
- Constructor with default/custom config
- `setEmotion()` with valid/invalid emotions, undertones, durations
- `express()` with valid/invalid gestures
- `feel()` parsing and rate limiting
- `morphTo()` geometry validation
- `updateUndertone()` and `setPosition()` events
- Method chaining (return this)
- Post-destroy behavior
- Deprecated method warnings

---

### ✅ Task 3.2: Add 2D/3D API Parity Tests
**Status:** Completed
**Files:** `test/integration/api-parity.test.js` (20 tests)

Tests verify:
- Required shared methods exist on both classes
- 2D-only and 3D-only methods are documented
- `setEmotion()` signature accepts same formats on 3D (string, number, object)
- Method chaining returns `this`
- Event emission works correctly
- Helper methods return correct types

---

### ✅ Task 3.3: Add TypeScript Definition Tests
**Status:** Completed
**Files:** `test/types/index.test-d.ts`

Created type definition tests that verify:
- Constructor accepts proper config types
- Method signatures match implementation
- Union types for emotions, gestures, geometries
- EventManager interface
- FeelResult type

---

## Priority 4: Low — Documentation & DX

These improve developer experience but don't block usage.

### ✅ Task 4.1: Document All Events
**Status:** Completed
**Files:** `docs/EVENTS.md`

Created comprehensive event documentation with:
- All 12 events cataloged with payload shapes
- Code examples for each event
- Event design principles documented

---

### ✅ Task 4.2: Add Migration Guide for Major Changes
**Status:** Completed
**Files:** `docs/MIGRATION.md`

Created migration guide covering:
- Deprecated methods (`setGeometry()` → `morphTo()`)
- New v3.3 features (input validation, method chaining, unified signatures, new events)
- v3.2 changes (multi-instance support, SSR safety)
- v3.0 breaking changes (import paths, config options, event names)

---

### ✅ Task 4.3: Improve Error Messages with Context
**Status:** Completed
**Files:** `src/3d/index.js`, `src/EmotiveMascotPublic.js`

Improvements:
- Fixed hardcoded rate limit value in 2D `feel()` to use dynamic `limiter.maxCallsPerSecond`
- Standardized 2D warning prefixes to `[EmotiveMascot]` (matching 3D's `[EmotiveMascot3D]`)
- All validation warnings now include valid alternatives via helper methods

---

## Priority 5: Developer Experience Enhancements

### ✅ Task 5.1: Performance Documentation & Examples
**Status:** Completed
**Files:** `docs/PERFORMANCE.md`, `examples/3d/performance-tuning.html`

Created comprehensive performance tuning guide:
- Quality presets (High, Medium, Low, Minimal)
- FPS targets by device category
- Feature cost breakdown table
- Automatic degradation documentation
- Memory management guide
- Mobile optimization checklist

Created interactive performance tuning example with:
- Live FPS monitoring
- Toggle controls for all features
- Preset buttons for quick switching
- Draw call and particle count metrics

---

### ✅ Task 5.2: Troubleshooting Guide
**Status:** Completed
**Files:** `docs/TROUBLESHOOTING.md`

Created FAQ-style troubleshooting guide covering:
- Display issues (not showing, black canvas, distorted)
- Audio issues (BPM detection, CORS, visual response)
- Animation issues (gestures, emotions, morphing)
- Memory & performance issues
- Framework integration (React, Vue, Next.js)
- Common error messages with solutions

---

### ✅ Task 5.3: Quick Reference Card
**Status:** Completed
**Files:** `docs/QUICK_REFERENCE.md`

Created 1-page cheat sheet with:
- All emotions with descriptions and use cases
- All undertones
- All gestures by category (movement, effect, expressive)
- All geometries (3D only)
- Quick setup code for 2D and 3D
- Common patterns
- Method chaining examples
- Config options reference

---

### ✅ Task 5.4: Accessibility Support
**Status:** Completed
**Files:** `docs/ACCESSIBILITY.md`, `src/core/config/defaults.js`, `src/3d/index.js`, `examples/3d/accessibility.html`

Implemented:
- `prefers-reduced-motion` detection and response
- `prefersReducedMotion()` and `setReducedMotion(enabled)` API
- ACCESSIBILITY constants in defaults.js
- Media query change listener with cleanup
- `accessibility:reducedMotion` event

Created accessibility guide covering:
- ARIA labels and screen reader support
- Keyboard navigation
- Focus management
- Color contrast considerations
- Alternative content
- WCAG compliance checklist

Created accessibility example with full keyboard navigation.

---

### ✅ Task 5.5: Error Codes System
**Status:** Completed
**Files:** `src/core/errors/ErrorCodes.js`

Created error codes module with:
- 20+ error codes organized by category (init, lifecycle, emotion/gesture, audio, rendering, performance)
- Each error links to relevant documentation section
- Severity levels (error, warning, info)
- Helper functions: `formatMessage()`, `logError()`, `createError()`, `getDocsUrl()`

---

### ✅ Task 5.6: Package.json Improvements
**Status:** Completed
**Files:** `package.json`

Added:
- `"sideEffects": false` for better tree-shaking

---

### ✅ Task 5.7: TypeScript Improvements
**Status:** Completed
**Files:** `types/3d.d.ts`

Added types for:
- `FeelResult` interface
- `EventManager` interface
- `EventName` union type
- `prefersReducedMotion()` and `setReducedMotion()` methods
- Helper methods (`getAvailableEmotions`, etc.)
- Event manager property

---

## Completed Tasks (Archive)

### Session: January 2026 - DX Improvements

**Task 5.1: Performance Documentation**
Created `docs/PERFORMANCE.md` and `examples/3d/performance-tuning.html` with quality presets, FPS monitoring, and optimization guides.

**Task 5.2: Troubleshooting Guide**
Created `docs/TROUBLESHOOTING.md` covering common issues across display, audio, animation, memory, and framework integration.

**Task 5.3: Quick Reference Card**
Created `docs/QUICK_REFERENCE.md` as 1-page cheat sheet for emotions, gestures, geometries, and common patterns.

**Task 5.4: Accessibility Support**
Added `prefers-reduced-motion` support to engine, created `docs/ACCESSIBILITY.md` and `examples/3d/accessibility.html`.

**Task 5.5: Error Codes System**
Created `src/core/errors/ErrorCodes.js` with categorized error codes linking to documentation.

**Task 5.6: Tree-shaking Support**
Added `sideEffects: false` to package.json.

**Task 5.7: TypeScript Improvements**
Added FeelResult, EventManager types and accessibility methods to type definitions.

### Session: January 2026 - API Improvements & Testing

**Task 1.1: Add Input Validation to Core APIs**
Added validation with warnings to `setEmotion()`, `express()`, `morphTo()`. Added helper methods: `getAvailableEmotions()`, `getAvailableGestures()`, `getAvailableGeometries()`.

**Task 1.2: Standardize Return Values for Method Chaining**
All state-changing methods now return `this` for chaining.

**Task 1.3: Improve Destroy Guard Consistency**
Added `_isDestroyed()` helper method, standardized guards across all methods.

**Task 2.1: Unify 2D/3D setEmotion Signatures**
3D `setEmotion()` now accepts string, number, or object as second parameter.

**Task 2.2: Deprecate Confusing Method Aliases**
Added deprecation warning to `setGeometry()`.

**Task 2.3: Standardize Event Emission Patterns**
Added `position:change` and `scale:change` events with `previous` value tracking.

**Task 3.1: Add EmotiveMascot3D Unit Tests**
Created `test/unit/3d/EmotiveMascot3D.test.js` with 53 tests covering API validation, chaining, events, and lifecycle.

**Task 3.2: Add 2D/3D API Parity Tests**
Created `test/integration/api-parity.test.js` with 20 tests verifying shared and mode-specific methods.

**Task 4.1: Document All Events**
Created `docs/EVENTS.md` documenting all 12 events with examples.

**Task 4.2: Add Migration Guide**
Created `docs/MIGRATION.md` documenting deprecated methods, new features, and breaking changes.

**Task 4.3: Improve Error Messages**
Fixed hardcoded values in warnings, standardized prefixes across 2D/3D.

### Previous Sessions

**Remove Global Singleton Export**
AnimationLoopManager exports class, singleton kept for backwards compatibility.

**Add SSR Guards to init()**
Guard at top of `init()` throws descriptive error in SSR environments.

**Extract Audio Integration**
Created `src/3d/audio/AudioBridge.js` (826 lines), reduced main file by ~600 lines.

**Extract Canvas Layer Management**
Created `src/3d/CanvasLayerManager.js` (173 lines).

**Centralize Magic Numbers**
Created `src/core/config/defaults.js` with FRAME_TIMING, VISIBILITY, AUDIO constants.

**Improve Type Safety**
Added EmotionConfig, GestureConfig, and related interfaces to `types/index.d.ts`.

**Document Multi-Instance Usage**
Added README section, live example at `dual-mascot-test.html`.

**Add Integration Tests**
32 tests covering lifecycle, multi-instance, visibility, audio.

**Fix Hardcoded CSS Layout in Attachment**
`_updateAttachedPosition()` now uses `getBoundingClientRect()` instead of hardcoded CSS calculations.

---

## Quick Reference: File Locations

| Component | File |
|-----------|------|
| 3D Main Class | `src/3d/index.js` |
| 2D Main Class | `src/EmotiveMascotPublic.js` |
| TypeScript Types | `types/index.d.ts`, `types/3d.d.ts` |
| Config Defaults | `src/core/config/defaults.js` |
| Audio Bridge | `src/3d/audio/AudioBridge.js` |
| Error Codes | `src/core/errors/ErrorCodes.js` |
| Event Reference | `docs/EVENTS.md` |
| Migration Guide | `docs/MIGRATION.md` |
| Performance Guide | `docs/PERFORMANCE.md` |
| Troubleshooting | `docs/TROUBLESHOOTING.md` |
| Quick Reference | `docs/QUICK_REFERENCE.md` |
| Accessibility | `docs/ACCESSIBILITY.md` |
| Integration Tests | `test/integration/lifecycle.test.js` |
| Type Definition Tests | `test/types/index.test-d.ts` |

---

## Next Steps (Future Work)

The following are potential future enhancements identified during the DX analysis:

### Testing
- Add visual regression tests (screenshot comparison)
- Add browser compatibility tests (Firefox, Safari, mobile)
- Add performance benchmark tests

### Build
- Add bundle size limits to CI
- Consider externalizing Three.js as peer dependency option
- Add SRI hashes to CDN examples

### Documentation
- Add plugin authoring guide
- Add advanced patterns guide (gesture sequencing, timing coordination)
- Expand framework integration examples (React hooks, Vue 3 composition)

### Accessibility
- Add color contrast checking utilities
- Consider text-to-speech integration for emotion announcements
