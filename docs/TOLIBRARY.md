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

### Task 3.1: Add EmotiveMascot3D Unit Tests
**Severity:** High (Core 3D class untested)
**Files:** Create `test/unit/3d/EmotiveMascot3D.test.js`

**Problem:** No unit tests for the main 3D class:
- `setEmotion()` behavior untested
- `feel()` parsing and rate limiting untested
- `morphTo()` geometry transitions untested
- Destroy/cleanup sequences untested

**Tasks:**
- [ ] Create `test/unit/3d/EmotiveMascot3D.test.js`
- [ ] Test `setEmotion()` with valid/invalid emotions
- [ ] Test `express()` with valid/invalid gestures
- [ ] Test `feel()` parsing with various natural language inputs
- [ ] Test `feel()` rate limiting behavior
- [ ] Test `morphTo()` geometry transitions
- [ ] Test lifecycle: init → start → stop → destroy
- [ ] Test post-destroy method calls don't throw

**Acceptance:** 3D class has >80% method coverage.

---

### Task 3.2: Add 2D/3D API Parity Tests
**Severity:** Medium (API drift between modes)
**Files:** Create `test/integration/api-parity.test.js`

**Problem:** No tests verify 2D and 3D APIs match. They can drift apart unnoticed.

**Tasks:**
- [ ] Create `test/integration/api-parity.test.js`
- [ ] Test both modes have same public methods
- [ ] Test same inputs produce same events
- [ ] Test method signatures match (where applicable)

**Acceptance:** Test fails if 2D/3D public APIs diverge.

---

### Task 3.3: Add TypeScript Definition Tests
**Severity:** Medium (Type definitions can be wrong)
**Files:** Create `test/types/` directory

**Problem:** TypeScript definitions aren't tested against implementation.

**Tasks:**
- [ ] Create `test/types/index.test-d.ts` using `tsd` or `dtslint`
- [ ] Verify `EmotiveMascotConfig` matches actual options
- [ ] Verify method signatures match implementation
- [ ] Add to CI pipeline

**Acceptance:** Type definition errors caught before publish.

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

### Task 4.2: Add Migration Guide for Major Changes
**Severity:** Low
**Files:** Create `docs/MIGRATION.md`

**Problem:** No guidance for upgrading between versions.

**Tasks:**
- [ ] Document deprecated methods and replacements
- [ ] Document breaking changes between versions
- [ ] Provide code migration examples

---

### Task 4.3: Improve Error Messages with Context
**Severity:** Low
**File:** Multiple

**Problem:** Some errors lack context:
```javascript
console.warn('[feel] Rate limit exceeded. Max 10 calls per second.');
// Hardcoded "10" but actual limit is in _feelRateLimiter.maxCallsPerSecond
```

**Tasks:**
- [ ] Audit all `console.warn` and `console.error` calls
- [ ] Use actual config values in error messages
- [ ] Add suggestions for how to fix issues

---

## Completed Tasks (Archive)

### Session: January 2026 - API Improvements

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

**Task 4.1: Document All Events**
Created `docs/EVENTS.md` documenting all 12 events with examples.

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
| Event Reference | `docs/EVENTS.md` |
| Integration Tests | `test/integration/lifecycle.test.js` |
