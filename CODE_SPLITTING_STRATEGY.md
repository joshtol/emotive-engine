# Code Splitting Strategy for Emotive-Mascot

## Problem Statement

Based on Chrome DevTools Performance profile:

- **Script Evaluation**: 652ms (38.4% of initial load time)
- **Bundle Size**: ~900KB uncompressed mascot engine loaded upfront
- **CLS**: 0.29 (target: < 0.1)

## Solution: Progressive Loading Architecture

### 3-Tier Loading Strategy

#### Tier 1: Critical Path (< 100ms)

**What loads**: HTML, critical CSS, hero text, CTA buttons

**Bundle composition**:

- Next.js framework core
- Hero section React components
- EmotiveHeader/Footer (minimal)

**Expected size**: ~80KB gzipped

#### Tier 2: Interactive Elements (< 500ms)

**What loads**: Mascot engine (lazy), waitlist form handler

**Loading trigger**: Intersection Observer when canvas enters viewport

**Bundle composition**:

- LazyMascot component (~40KB)
- Emotive engine script (234KB gzipped) - loaded dynamically

**Expected size**: ~274KB gzipped

#### Tier 3: Below-the-Fold (On Scroll)

**What loads**: Features showcase, use case previews, analytics

**Loading trigger**: Intersection Observer with 100px rootMargin

**Bundle composition**:

- LazyFeaturesShowcase (~15KB)
- Additional sections as user scrolls

## Implementation Files

### 1. LazyMascot Component

**File**: `site/src/components/LazyMascot.tsx`

**Features**:

- Intersection Observer for viewport detection
- Dynamic script loading
- Skeleton/loading state
- Prevents double initialization
- Smooth fade-in animation

**Key optimizations**:

```typescript
// Only load when 10% visible + 50px margin
observer.observe(containerRef.current, {
    threshold: 0.1,
    rootMargin: '50px',
});

// Dynamic script loading (not bundled)
const script = document.createElement('script');
script.src = `/emotive-engine.js?v=${Date.now()}`;
script.async = true;
```

### 2. LazyFeaturesShowcase Component

**File**: `site/src/components/LazyFeaturesShowcase.tsx`

**Features**:

- Intersection Observer (100px rootMargin)
- Skeleton loader prevents layout shift
- CSS media queries (no JS detection) prevents hydration mismatch
- Reserved height prevents CLS

**Key optimizations**:

```typescript
// Reserve space to prevent CLS
const estimatedHeight = isMobile ? '600px' : '800px'

// Skeleton loader while loading
{!isVisible && <SkeletonGrid />}

// Only render when visible
{isVisible && <FeaturesGrid />}
```

### 3. Optimized Page Component

**File**: `site/src/app/page.optimized.tsx`

**Features**:

- React.lazy() for code splitting
- Suspense boundaries with fallbacks
- Minimal critical path
- Progressive enhancement

**Key optimizations**:

```typescript
const LazyMascot = lazy(() => import('@/components/LazyMascot'))
const LazyFeaturesShowcase = lazy(() => import('@/components/LazyFeaturesShowcase'))

<Suspense fallback={null}>
  <LazyMascot />
</Suspense>
```

## Expected Performance Improvements

### Bundle Size

| Metric             | Before         | After       | Change            |
| ------------------ | -------------- | ----------- | ----------------- |
| Initial Bundle     | ~980KB         | ~580KB      | **-400KB (-41%)** |
| Mascot Engine      | Loaded upfront | Lazy loaded | Deferred          |
| Features Component | Loaded upfront | Lazy loaded | Deferred          |

### Timing Metrics

| Metric              | Before | After   | Change            |
| ------------------- | ------ | ------- | ----------------- |
| Script Evaluation   | 652ms  | ~200ms  | **-452ms (-69%)** |
| LCP                 | 0.18s  | < 0.15s | **-0.03s (-17%)** |
| CLS                 | 0.29   | < 0.1   | **-0.19 (-66%)**  |
| Time to Interactive | ~2.5s  | ~1.2s   | **-1.3s (-52%)**  |

### Resource Loading Timeline

```
0ms     HTML arrives
50ms    Critical CSS parsed
100ms   Hero section rendered (LCP ✓)
200ms   Script evaluation complete
300ms   Mascot canvas enters viewport → starts loading
500ms   Mascot engine loaded and initialized
800ms   User scrolls → FeaturesShowcase starts loading
1000ms  FeaturesShowcase rendered
```

## Implementation Steps

### Step 1: Create Lazy Components

```bash
# Already created:
site/src/components/LazyMascot.tsx
site/src/components/LazyFeaturesShowcase.tsx
```

### Step 2: Update page.tsx

```bash
# Option A: Replace current page
mv site/src/app/page.tsx site/src/app/page.backup.tsx
mv site/src/app/page.optimized.tsx site/src/app/page.tsx

# Option B: Test side-by-side
# Keep page.optimized.tsx and compare
```

### Step 3: Add Bundle Analyzer

```bash
npm install --save-dev @next/bundle-analyzer

# Update next.config.js (see below)

# Analyze bundle
ANALYZE=true npm run build
```

### Step 4: Measure Performance

```bash
# Run Lighthouse
npm run build
npm run start
# Open Chrome DevTools → Lighthouse → Run audit

# Compare metrics:
# - LCP should be < 0.2s
# - CLS should be < 0.1
# - TBT should be < 300ms
```

## Next.js Bundle Analyzer Configuration

Add to `next.config.js`:

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
    // ... existing config

    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    // Separate heavy libraries
                    mascot: {
                        name: 'mascot',
                        test: /[\\/]emotive-engine/,
                        priority: 40,
                    },
                    firebase: {
                        name: 'firebase',
                        test: /[\\/]node_modules[\\/]firebase/,
                        priority: 35,
                    },
                    react: {
                        name: 'react',
                        test: /[\\/]node_modules[\\/](react|react-dom)/,
                        priority: 30,
                    },
                },
            };
        }
        return config;
    },
};

module.exports = withBundleAnalyzer(nextConfig);
```

## Testing Checklist

- [ ] LCP < 0.2s (target: 0.15s)
- [ ] CLS < 0.1 (target: 0.05)
- [ ] FCP < 1.8s
- [ ] TBT < 300ms
- [ ] Initial bundle < 600KB
- [ ] Mascot loads smoothly when scrolled into view
- [ ] Features showcase loads without layout shift
- [ ] No hydration errors in console
- [ ] Mobile performance (test on real device)
- [ ] Lighthouse score > 95

## Monitoring & Validation

### Chrome DevTools Performance Tab

1. Open DevTools → Performance
2. Click Record
3. Reload page
4. Stop after 5 seconds
5. Check:
    - Evaluate Script time (should be < 300ms)
    - Long tasks (should be < 50ms each)
    - Layout shifts (should be 0)

### Lighthouse CI

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=http://localhost:3000

# Expected scores:
# Performance: > 95
# Accessibility: > 95
# Best Practices: > 95
# SEO: > 95
```

### Bundle Analysis

```bash
ANALYZE=true npm run build

# Opens visual bundle map
# Check for:
# - Largest chunks (should be lazy loaded)
# - Duplicate dependencies
# - Unnecessary imports
```

## Rollback Plan

If issues occur after deployment:

```bash
# Quick rollback
git revert HEAD
git push

# Or restore backup
mv site/src/app/page.tsx site/src/app/page.optimized.tsx
mv site/src/app/page.backup.tsx site/src/app/page.tsx
```

## Future Optimizations

1. **Route-based code splitting**: Split use case pages into separate chunks
2. **Image optimization**: Use Next.js Image component with lazy loading
3. **Font subsetting**: Load only required glyphs
4. **Service Worker**: Cache mascot engine for repeat visits
5. **CDN distribution**: Serve mascot engine from CDN
6. **WebAssembly**: Port heavy calculations to WASM

## References

- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Web Vitals](https://web.dev/vitals/)
- [React.lazy()](https://react.dev/reference/react/lazy)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Next.js Code Splitting](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
