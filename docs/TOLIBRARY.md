# Transition to Library Architecture (TOLIBRARY)

**Status:** Actionable Roadmap
**Goal:** Refactor `@joshtol/emotive-engine` from a "robust single-purpose application" to a "modular, easy-to-consume enterprise library."

---

## 🚨 Priority 1: Critical Stability & Compatibility
*Must be completed to enable consumption in modern frameworks (Next.js, Nuxt) and complex apps.*

### Task 1.1: Fix SSR Incompatibility (Implicit DOM Dependencies)
**Severity:** Critical (Crashes Node.js environments)
**Context:** The engine accesses `window` and `document` at the module level or inside constructors, causing immediate failures in Server-Side Rendering.
- [ ] **Audit `src/3d/index.js`:** Wrap constructor DOM access. Delay canvas creation until `init()` is explicitly called by the user.
- [ ] **Audit `src/core/AnimationController.js`:** Ensure event listeners (`visibilitychange`) are attached only if `typeof document !== 'undefined'`.
- [ ] **Create `EnvironmentAdapter`:** Abstract `window.innerWidth` and `window.innerHeight` behind a helper that returns safe defaults on the server.

### Task 1.2: Remove Global Singletons
**Severity:** High (Prevents multi-instance usage)
**Context:** `src/core/AnimationLoopManager.js` exports a `new` instance by default.
- [ ] **Refactor Export:** Change `export const animationLoopManager = new AnimationLoopManager()` to export the class definition.
- [ ] **Update Consumers:** Update `EmotiveMascot` to instantiate its own loop manager OR accept one via config.
- [ ] **Goal:** Allow multiple mascots to run on one page without fighting for the same `requestAnimationFrame` priority queue.

---

## 🛠️ Priority 2: Core Architecture Refactoring
*Required to make the codebase maintainable and testable by a team.*

### Task 2.1: Decompose the "God Class" (`EmotiveMascot3D`)
**Severity:** High (Maintenance Nightmare)
**Context:** `src/3d/index.js` (~2,500 lines) violates Single Responsibility Principle.
- [ ] **Extract `MascotDOMManager`:** Move `setupCanvasLayers` (Lines 251-310) and resize logic to a dedicated class.
- [ ] **Extract `AudioAnalysisService`:** Move the ~350 lines of audio logic (Lines 1365-1700), including the CORS fetch workarounds and BPM detection, into `src/core/audio/`.
- [ ] **Extract `RenderOrchestrator`:** Separate the WebGL vs Canvas2D coordination logic from the high-level mascot state.

### Task 2.2: Decouple Animation Controller
**Severity:** Medium (Leaky Abstraction)
**Context:** `src/core/AnimationController.js` contains hardcoded logic for specific subsystems (e.g., specific particle array manipulation).
- [ ] **Define Lifecycle Interface:** Create a standard `ISubsystem` interface with `onSuspend()`, `onResume()`, and `update(dt)`.
- [ ] **Refactor `handleVisibilityChange`:** Remove the "TAB FOCUS FIX" logic (Lines 313-325) from the controller. Move the "gradual particle reduction" logic into `ParticleSystem.onResume()`.

---

## 🚀 Priority 3: Modernization & Ecosystem
*Enhancements for developer experience and commercialization.*

### Task 3.1: Standardize Configuration
**Severity:** Medium
**Context:** Magic numbers (e.g., `20ms` deltaTime cap, `350ms` peak gap) are scattered throughout the code.
- [ ] **Create `DefaultConfig`:** Centralize all heuristics and magic numbers into a single configuration object.
- [ ] **Allow Overrides:** Ensure users can inject these values via the constructor to tune the "feel" without forking the repo.

### Task 3.2: Asset Separation (Licensing Enabler)
**Severity:** Low (Code-wise), High (Business-wise)
**Context:** High-quality assets are mixed with source code.
- [ ] **Audit Assets:** Identify proprietary assets (Crystal models, specific moon textures).
- [ ] **Create Asset Loader:** Refactor `src/3d/geometries/` to load these assets dynamically or via a plugin system, rather than hard-importing them.
- [ ] **Publish Separate Package:** Move assets to `@joshtol/emotive-assets` (proprietary) while keeping the engine (MIT).

### Task 3.3: TypeScript Migration
**Severity:** Low (Future proofing)
**Context:** Complex state interactions are hard to track with just JSDoc.
- [ ] **Generate Interfaces:** Define strict interfaces for `Emotion`, `Gesture`, and `VisualParams`.
- [ ] **Convert Core:** Port `src/core/` to `.ts` files first, followed by `src/3d/`.

---

## 4. "Enterprise Ready" Checklist

| Feature | Current Status | Goal |
| :--- | :--- | :--- |
| **Unit Tests** | ~65% coverage | 85%+ coverage (specifically mocking DOM/Audio) |
| **Tree Shaking** | Partial | Full support (users import *only* what they need) |
| **SSR Support** | ❌ Fails on import | ✅ Safe to import in Node.js |
| **Multi-Instance** | ⚠️ Singleton conflicts | ✅ Completely isolated scopes |
| **Documentation** | ⚠️ Readme/JSDocs | ✅ Typedoc + Interactive Storybook |