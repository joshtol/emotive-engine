# Transition to Library Architecture (TOLIBRARY)

**Status:** Actionable Roadmap
**Goal:** Refactor `@joshtol/emotive-engine` from a single-purpose application to a modular, consumable library.

---

## Priority 1: Critical — Multi-Instance & SSR Support

### Task 1.1: Remove Global Singleton Export ✅ COMPLETE
**Severity:** Critical (Blocks multi-instance usage)
**File:** `src/core/AnimationLoopManager.js` lines 369-375

**Solution:** Default export changed to class, singleton kept for backwards compatibility:
```javascript
export const animationLoopManager = new AnimationLoopManager(); // backwards compat
export default AnimationLoopManager; // class for multi-instance
```

**Completed:**
- [x] Change default export to class: `export default AnimationLoopManager`
- [x] Update `src/core/AnimationController.js` to use `this.loopManager` (injectable via config)
- [x] Add optional `loopManager` config param for shared instances when desired
- [x] Test page: `site/public/examples/3d/dual-mascot-test.html`

**Note:** 3D engine (`EmotiveMascot3D`) already uses its own RAF loop directly, so multiple 3D instances work independently without any changes.

---

### Task 1.2: Add SSR Guards to init() ✅ COMPLETE
**Severity:** High (Crashes Next.js/Nuxt on import)
**File:** `src/3d/index.js`

**Solution:** Guard added at top of `init()` with clear error message for SSR environments.

**Completed:**
- [x] Add guard at top of `init()`: throws descriptive error in SSR
- [x] Export `isSSR()` helper at `src/3d/index.js:2503`
- [x] Document SSR usage in README (Next.js, Nuxt 3 examples)

**Note:** Constructor remains SSR-safe (can instantiate on server, just can't call `init()`).

---

## Priority 2: Architecture — Reduce File Sizes

### Task 2.1: Extract Audio Integration from EmotiveMascot3D ✅ COMPLETE
**Severity:** High (Was 2,492 lines, now 1,892 lines)
**File:** `src/3d/index.js`

**Solution:** Created `src/3d/audio/AudioBridge.js` (826 lines) containing:
- Audio context and analyzer management
- CORS workaround via fetch + decodeAudioData buffer decode
- Dual analyzer setup (main + buffer for CORS bypass)
- Agent-based BPM detection with validation and auto-retry
- Event binding/cleanup for play/pause/seek/ended
- Groove confidence callbacks for animation intensity

**Completed:**
- [x] Create `src/3d/audio/AudioBridge.js` with callback-based API
- [x] Move `connectAudio()`, `disconnectAudio()` logic
- [x] Move all BPM detection methods (`_startBPMDetection`, `_validateAnalyzerWorking`, etc.)
- [x] Move buffer analysis methods (`_startBufferAnalysis`, `_stopBufferAnalysis`, `_rebuildBufferAnalysis`)
- [x] Update `EmotiveMascot3D` to use lazy-initialized AudioBridge via `_getAudioBridge()`
- [x] Reduce `index.js` by ~600 lines (from 2,492 to 1,892)

**Note:** Kept all functionality intact. AudioBridge uses callbacks for rhythm start/stop/BPM change rather than direct coupling to EmotiveMascot3D.

---

### Task 2.2: Extract Canvas Layer Management ✅ COMPLETE
**Severity:** Medium (Was 1,892 lines, now 1,826 lines)
**File:** `src/3d/index.js`

**Solution:** Created `src/3d/CanvasLayerManager.js` (173 lines) containing:
- Dual canvas layer setup (WebGL back + Canvas2D front)
- Container element handling (create or reuse)
- Deferred WebGL canvas append for GPU initialization
- Canvas dimension management
- Cleanup/destroy logic

**Completed:**
- [x] Create `src/3d/CanvasLayerManager.js` with setup/destroy API
- [x] Move `setupCanvasLayers()` method logic
- [x] Update animate() to use `_canvasLayerManager.appendWebGLCanvas()`
- [x] Update destroy() to use `_canvasLayerManager.destroy()`
- [x] Reduce `index.js` by ~66 lines (from 1,892 to 1,826)

**Note:** Resize handling stays in Core3DManager which handles Three.js renderer resize.

---

### Task 2.3: Refactor Visibility Change Handling ✅ COMPLETE
**Severity:** Medium (Was leaky abstraction)
**File:** `src/core/AnimationController.js`

**Problem:** Controller directly manipulated `particleSystem.particles` array.

**Solution:** Added `ParticleSystem.onVisibilityResume(gapMs, pausedCount)` method that encapsulates:
- Accumulator reset
- Gap-based particle management (clear all >30s, reduce 50% 10-30s, keep all <10s)

**Completed:**
- [x] Add `ParticleSystem.onVisibilityResume(gapMs, pausedCount)` method
- [x] Move particle reduction logic into ParticleSystem
- [x] Update AnimationController to call `particleSystem.onVisibilityResume()`
- [x] Reduced AnimationController by ~10 lines

**Note:** Renderer and StateMachine already use proper APIs (gap-based conditionals).

---

## Priority 3: Developer Experience

### Task 3.1: Centralize Magic Numbers 🔄 IN PROGRESS
**Severity:** Medium
**Scattered across:** Multiple files

**Solution:** Created `src/core/config/defaults.js` with categorized constants:
- `FRAME_TIMING` — TARGET_FRAME_TIME (16.67), DELTA_TIME_CAP (20), FRAME_BUDGET
- `VISIBILITY` — LONG_PAUSE_THRESHOLD (30000), MEDIUM_PAUSE_THRESHOLD (10000), reduction factors
- `AUDIO` — FFT_SIZE (256), SMOOTHING_TIME_CONSTANT (0.8), BPM_LOCK_TIMEOUT (10000)
- `MONITORING` — Health check, feature flags, context decay intervals
- `DEFAULT_CONFIG` — Combined object for constructor overrides

**Completed:**
- [x] Create `src/core/config/defaults.js` with all timing/threshold constants
- [x] Export as `DEFAULT_CONFIG` object
- [x] Update AnimationController.js to use FRAME_TIMING and VISIBILITY constants
- [x] Update ParticleSystem.js to use VISIBILITY constants
- [x] Update AudioBridge.js to use AUDIO constants

**Remaining:**
- [ ] Allow override via constructor: `new EmotiveMascot3D({ timing: { deltaTimeCap: 25 } })`

**Note:** Constructor override support deferred - current implementation provides central config for easy modification without runtime overhead.

---

### Task 3.2: Improve Type Safety
**Severity:** Low
**Current:** JSDoc only

**Tasks:**
- [ ] Create `src/types/index.d.ts` with interfaces:
  - `EmotionConfig`
  - `GestureConfig`
  - `VisualParams`
  - `MascotConfig`
- [ ] Add `"types": "./dist/types/index.d.ts"` to package.json
- [ ] Full TypeScript migration deferred (large effort, low ROI currently)

---

## Priority 4: Documentation & Testing

### Task 4.1: Document Multi-Instance Usage
- [ ] Add example: two mascots on one page
- [ ] Add example: SSR framework integration (Next.js dynamic import)

### Task 4.2: Add Integration Tests
- [ ] Test: Create/destroy mascot lifecycle
- [ ] Test: Multiple mascots don't interfere
- [ ] Test: Tab visibility pause/resume
- [ ] Test: Audio connection and disconnection

---

## Checklist Summary

| Feature | Status | Notes |
|---------|--------|-------|
| **SSR Safety** | ✅ Complete | Safe import, clear error on `init()` |
| **Multi-Instance** | ✅ Complete | Fully isolated instances |
| **Main File Size** | 🔄 In Progress | 1,826 lines (was 2,492), target <1,500 |
| **Config** | 🔄 In Progress | src/core/config/defaults.js created, key files updated |
| **Types** | ⏳ Pending | JSDoc → `.d.ts` declarations |
