# Bundle Optimization Recommendations

## Current State (as of 2025-10-25)

### Bundle Sizes
- **Full (UMD)**: 879KB raw, 238KB gzipped
- **Lean (UMD)**: 797KB raw, 218KB gzipped
- **Minimal (UMD)**: 816KB raw, 221KB gzipped

All bundles are currently **within acceptable limits** but there's room for optimization.

---

## Priority 1: Remove or Make Dependencies Optional

### 1. Sentry (`@sentry/browser`) - ~50-80KB impact
**Current State**: Production dependency (always bundled)
**Issue**: Not all users need error tracking
**Recommendation**:
```javascript
// Make Sentry an optional peer dependency
// Load dynamically only if configured
const sentryConfig = config.sentry?.enabled;
if (sentryConfig) {
    const Sentry = await import('@sentry/browser');
    // Initialize Sentry
}
```
**Expected Savings**: 50-80KB gzipped

### 2. Babel Runtime (`@babel/runtime`) - ~20-30KB impact
**Current State**: Production dependency
**Review**: Check if all polyfills are necessary for Node 14+ target
**Recommendation**:
- Review which Babel transforms are actually needed
- Consider raising minimum Node version to 16+ (removes need for some polyfills)
- Use targeted polyfills instead of full @babel/runtime

**Expected Savings**: 20-30KB gzipped

---

## Priority 2: Code Splitting and Lazy Loading

### 1. Emotion Definitions
**Current**: All emotions loaded upfront
**Opportunity**: Lazy load emotion configs
```javascript
// Instead of importing all emotions:
import { emotions } from './emotions/index.js';

// Lazy load on demand:
const getEmotion = async (name) => {
    const emotion = await import(`./emotions/${name}.js`);
    return emotion.default;
};
```
**Expected Savings**: 30-50KB initial bundle

### 2. Gesture Animations
**Current**: All gestures bundled
**Opportunity**: Split into core + optional gestures
- Core gestures: bounce, pulse, wave (always loaded)
- Advanced gestures: loaded on-demand

**Expected Savings**: 40-60KB initial bundle

### 3. Particle Behaviors
**Current**: All particle behaviors included
**Opportunity**: Create behavior plugins loaded dynamically
**Expected Savings**: 20-30KB initial bundle

---

## Priority 3: Tree-Shaking Improvements

### 1. Ensure Proper ESM Exports
**Current**: Using named exports (good!)
**Review**: Ensure all modules are side-effect free

Add to package.json:
```json
{
    "sideEffects": [
        "*.css",
        "src/core/polyfills.js"
    ]
}
```

### 2. Remove Unused Utilities
**Action Items**:
- Audit which utility functions are actually used
- Remove or mark as tree-shakeable
- Use bundler analysis to identify dead code

---

## Priority 4: Build Configuration Optimizations

### 1. Enable Advanced Terser Options
Currently using aggressive compression. Review:
```javascript
// rollup.config.js - already quite optimized
compress: {
    passes: 3,
    dead_code: true,
    evaluate: true,
    inline: 3
}
```

### 2. Consider Modern Build Target
**Current**: ES2020
**Opportunity**: Create ES2022 build for modern browsers
- Smaller bundle (native optional chaining, nullish coalescing)
- Better performance (native features vs polyfills)

Create dual bundles:
- `emotive-mascot.modern.js` (ES2022, smaller)
- `emotive-mascot.legacy.js` (ES2020, current)

---

## Priority 5: Feature Flags and Variants

### 1. Create Micro Variants
**Current Variants**:
- Full: Everything
- Minimal: No audio
- Lean: Ultra-optimized
- Audio: Audio-focused

**New Variants to Consider**:
- **Core**: Emotions + basic gestures only (~400KB)
- **Visual**: No audio, no analytics (~500KB)
- **Enterprise**: Full features + Sentry (~900KB current)

### 2. Runtime Feature Detection
Instead of bundling all features, detect what's needed:
```javascript
const features = {
    audio: config.connectAudio !== undefined,
    sentry: config.sentry?.enabled,
    // etc
};
// Load only needed modules
```

---

## Quick Wins (Immediate Implementation)

### 1. Make Sentry Optional (1-2 hours)
- Move to peerDependencies
- Dynamic import
- **Impact**: -50KB gzipped

### 2. Audit @babel/runtime (2-3 hours)
- Check which polyfills are used
- Remove unused
- **Impact**: -20KB gzipped

### 3. Add sideEffects to package.json (30 minutes)
- Enable better tree-shaking
- **Impact**: -10KB gzipped

### 4. Create ES2022 modern build (3-4 hours)
- Dual output
- **Impact**: -30KB gzipped for modern browsers

**Total Quick Wins**: ~110KB gzipped reduction (from 238KB → ~128KB)

---

## Long-term Optimizations (Future Releases)

### 1. Plugin Architecture (v3.0)
- Core engine: ~300KB
- Plugins loaded on-demand
- True modular architecture

### 2. WASM for Heavy Computations
- Particle physics in WASM
- Audio analysis in WASM
- Potential 20-30% performance boost

### 3. Service Worker Caching
- Cache bundles for repeat visits
- Perceived size: 0KB after first load

---

## Monitoring and Limits

### Current Limits (enforced by CI)
```javascript
SIZE_LIMITS = {
    'lean': { raw: 850KB, gzip: 250KB },
    'minimal': { raw: 850KB, gzip: 250KB },
    'full': { raw: 900KB, gzip: 300KB }
}
```

### Recommended Targets for v3.0
```javascript
TARGET_SIZES = {
    'core': { gzip: 100KB },      // New ultra-minimal
    'visual': { gzip: 150KB },    // No audio/analytics
    'full': { gzip: 200KB },      // Current -100KB
    'enterprise': { gzip: 250KB } // With Sentry
}
```

---

## Action Plan

**Phase 1 - Quick Wins (This Week)**
- [ ] Make Sentry optional with dynamic import
- [ ] Audit and optimize Babel runtime
- [ ] Add sideEffects to package.json
- [ ] Create ES2022 modern build

**Phase 2 - Code Splitting (Next Sprint)**
- [ ] Lazy load emotion definitions
- [ ] Split gestures into core + advanced
- [ ] Create particle behavior plugins

**Phase 3 - Architecture (v3.0)**
- [ ] Design plugin system
- [ ] Implement lazy loading framework
- [ ] Create micro variants

---

## Measurement

Track bundle sizes in CI/CD (✅ Already implemented):
```bash
npm run size
```

Visualize bundle composition:
```bash
npm run build:analyze
# Opens dist/bundle-analysis.html
```

---

**Generated**: 2025-10-25
**Status**: Recommendations ready for implementation
**Owner**: Engineering Team
