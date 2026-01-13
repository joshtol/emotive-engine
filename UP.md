# Code Quality Improvement Tasks

Prioritized list of technical debt items from codebase analysis.

## Completed

- [x] **Rotation File Consolidation** - Deleted RotationRenderManager.js (43
      lines) and RotationController.js (140 lines), consolidated into
      RotationManager.js
- [x] **Dead Import Cleanup** - Removed 42 unused underscore-prefixed imports
      and 42 eslint-disable comments from EmotiveMascot.js (-83 lines)
- [x] **Debug Console Cleanup** - Removed debug console.warn statements from
      CrystalSoul.js, RotationBrake.js, AnimationController.js,
      AnimationLoopManager.js, ShapeMorpher.js

## High Priority

### 1. EmotiveMascot.js Delegation Proxy

**Impact:** High | **Effort:** Medium

The main entry point (1,847 lines) is mostly a delegation layer that forwards
calls to internal managers. Many methods are simple one-liners like:

```javascript
setEmotion(emotion) { return this.emotionManager.setEmotion(emotion); }
```

**Action items:**

- [ ] Audit all public methods to identify pure proxies vs. actual logic
- [ ] Consider exposing managers directly via getters for power users
- [ ] Document which methods add value vs. pure delegation
- [ ] Potentially split into focused facade classes by domain

### 2. Manager Epidemic (57 Manager Files)

**Impact:** High | **Effort:** High

Over-abstraction with 57 files containing "Manager" in the name. Many are thin
wrappers around simpler operations.

**Candidates for consolidation:**

- [ ] `InitializationManager` - Could be static factory methods
- [ ] `ConfigurationManager` - Could merge with options validation
- [ ] `LifecycleManager` - Could be callbacks on main class
- [ ] `StateManager` vs `StateStore` - Consolidate
- [ ] Review all `*Manager.js` files for necessity

### 3. Circular Dependency Hell

**Impact:** High | **Effort:** Medium

Multiple circular import patterns create fragile initialization order.

**Action items:**

- [ ] Run `madge --circular src/` to identify all cycles
- [ ] Document the dependency graph
- [ ] Break cycles using dependency injection or event patterns
- [ ] Consider barrel exports for cleaner imports

## Medium Priority

### 4. Bundle Size (765KB+)

**Impact:** Medium | **Effort:** Medium

Main bundle is large for a mascot animation library.

**Action items:**

- [ ] Run bundle analyzer to identify heavy modules
- [ ] Implement proper tree-shaking friendly exports
- [ ] Consider splitting 3D features into separate lazy-loaded chunk
- [ ] Audit and remove unused dependencies
- [ ] Minify and optimize production builds

### 5. Synonym Dictionary (~223 Aliases)

**Impact:** Medium | **Effort:** Low

Emotion and gesture registries have extensive alias mappings (e.g., "happy" →
"joy", "grin" → "smile").

**Action items:**

- [ ] Audit which aliases are actually used by consumers
- [ ] Consider moving aliases to a separate optional module
- [ ] Document canonical names vs. aliases in API docs
- [ ] Add deprecation warnings for obscure aliases

### 6. Test Coverage Gap (12%)

**Impact:** Medium | **Effort:** High

Only ~12% test coverage leaves significant risk.

**Priority areas to cover:**

- [ ] Core animation loop
- [ ] Emotion state transitions
- [ ] Gesture calculations
- [ ] Public API surface
- [ ] Edge cases in rendering

### 7. File Explosion (408 Files)

**Impact:** Low | **Effort:** High

Many small files that could be consolidated.

**Action items:**

- [ ] Identify clusters of related tiny files
- [ ] Merge single-function utility files
- [ ] Consolidate type definitions
- [ ] Review folder structure for simplification

## Low Priority

### 8. ASCII Art Headers

**Impact:** Low | **Effort:** Low

Decorative ASCII art banners in some files add visual noise.

**Action items:**

- [ ] Remove ASCII art from source files
- [ ] Keep branding in README/docs only
- [ ] Standardize file headers to simple JSDoc

## Tracked Bugs

See [TODO.md](./TODO.md) for bugs discovered during refactoring.
