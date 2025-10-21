---
name: bundle-optimizer
description:
    Analyze and reduce bundle size, implement code splitting, optimize
    dependencies, and improve build performance. Use when bundle is too large,
    load times are slow, or implementing progressive loading.
trigger:
    bundle, package, size, optimization, tree-shaking, code splitting, build
    performance
---

# Bundle Optimizer

You are an expert in optimizing JavaScript bundle sizes and build performance
for the emotive-mascot platform.

## When to Use This Skill

- Bundle size exceeds targets (> 250 KB gzipped)
- Slow initial page load times
- Implementing code splitting
- Analyzing dependency composition
- Tree-shaking optimization
- Progressive loading implementation

## Current Bundle Targets

```json
{
    "emotive-mascot.umd.js": {
        "uncompressed": "< 900 KB",
        "gzipped": "< 234 KB"
    },
    "emotive-mascot.minimal.js": {
        "uncompressed": "< 400 KB",
        "gzipped": "< 120 KB"
    },
    "emotive-mascot.audio.js": {
        "uncompressed": "< 700 KB",
        "gzipped": "< 200 KB"
    }
}
```

## Analysis Tools

### Check Current Size

```bash
# Build and check sizes
npm run build

# View bundle sizes
ls -lh dist/

# Check gzipped sizes
gzip -c dist/emotive-mascot.umd.js | wc -c
```

### Analyze Bundle Composition

```bash
# Generate visual analysis
npm run build:analyze

# This creates bundle-analysis.html showing:
# - Module sizes
# - Duplicate dependencies
# - Large imports
```

### NPM Package Analysis

```bash
# Audit dependencies
npm audit

# Check for unused dependencies
npx depcheck

# Analyze package sizes
npx bundle-phobia <package-name>
```

## Optimization Techniques

### 1. Code Splitting

Split large features into separate chunks:

```javascript
// Instead of direct import
import { AudioEngine } from '@joshtol/emotive-engine';

// Use dynamic import
const loadAudio = async () => {
    const { AudioEngine } = await import('@joshtol/emotive-engine/audio');
    return new AudioEngine();
};
```

### 2. Tree Shaking

Ensure dead code elimination works:

```javascript
// rollup.config.js
export default {
    treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
    },
};

// Use named imports (not default)
import { EmotiveMascot, emotions } from '@joshtol/emotive-engine';
// NOT: import EmotiveEngine from '@joshtol/emotive-engine'
```

### 3. Minification

Optimize Terser settings:

```javascript
// rollup.config.js
import terser from '@rollup/plugin-terser';

terser({
    compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
        passes: 2, // Multiple passes for better compression
    },
    mangle: {
        properties: {
            regex: /^_/, // Mangle private properties starting with _
        },
    },
    format: {
        comments: false, // Remove all comments
    },
});
```

### 4. Remove Unused Dependencies

```bash
# Find what can be removed
npx depcheck

# Uninstall unused packages
npm uninstall <package-name>
```

## Progressive Loading Strategy

### Minimal Initial Bundle

Create a minimal bundle for fast first paint:

```javascript
// emotive-mascot.minimal.js includes ONLY:
// - Core engine
// - Basic emotions (5 most common)
// - Essential physics
// Total: ~120 KB gzipped
```

### Lazy Load Features

Load features as needed:

```typescript
// Load full emotion set on demand
const loadFullEmotions = async () => {
    const { extendedEmotions } = await import(
        '@joshtol/emotive-engine/emotions/extended'
    );
    mascot.addEmotions(extendedEmotions);
};

// Load audio module only when needed
const enableAudio = async () => {
    const { AudioEngine } = await import('@joshtol/emotive-engine/audio');
    mascot.enableAudio(new AudioEngine());
};

// Load LLM plugin for chat features
const enableChat = async () => {
    const { LLMEmotionPlugin } = await import(
        '@joshtol/emotive-engine/plugins/llm'
    );
    mascot.addPlugin(new LLMEmotionPlugin());
};
```

## Build Configuration

### Rollup Config Optimization

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/emotive-mascot.umd.js',
        format: 'umd',
        name: 'EmotiveMascot',
        sourcemap: false, // Disable in production
    },
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: false,
        }),
        commonjs(),
        terser({
            compress: {
                drop_console: true,
                passes: 2,
            },
        }),
    ],
    treeshake: {
        moduleSideEffects: false,
    },
};
```

### Next.js Config Optimization

```javascript
// next.config.js
module.exports = {
    swcMinify: true, // Use SWC for faster minification

    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Bundle analyzer
            if (process.env.ANALYZE === 'true') {
                const {
                    BundleAnalyzerPlugin,
                } = require('webpack-bundle-analyzer');
                config.plugins.push(
                    new BundleAnalyzerPlugin({
                        analyzerMode: 'static',
                        openAnalyzer: true,
                    })
                );
            }

            // Optimize chunks
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    // Separate emotive-mascot into its own chunk
                    emotive: {
                        name: 'emotive-mascot',
                        test: /[\\/]node_modules[\\/]@joshtol[\\/]emotive-engine/,
                        priority: 40,
                    },
                },
            };
        }

        return config;
    },
};
```

## Monitoring Bundle Size

### Package.json Configuration

```json
{
    "bundlesize": [
        {
            "path": "./dist/emotive-mascot.umd.js",
            "maxSize": "900 KB",
            "compression": "none"
        },
        {
            "path": "./dist/emotive-mascot.umd.js",
            "maxSize": "250 KB",
            "compression": "gzip"
        }
    ],
    "scripts": {
        "size": "bundlesize",
        "build:check": "npm run build && npm run size"
    }
}
```

### CI/CD Integration

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [pull_request]

jobs:
    check-size:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2
            - run: npm ci
            - run: npm run build
            - run: npm run size
```

## Quick Wins Checklist

- [ ] Remove unused dependencies (run `npx depcheck`)
- [ ] Enable tree-shaking in build config
- [ ] Use terser with aggressive settings
- [ ] Remove console.logs in production
- [ ] Disable sourcemaps in production
- [ ] Use dynamic imports for large features
- [ ] Compress images and assets
- [ ] Remove duplicate dependencies
- [ ] Use minimal build for simple use cases
- [ ] Monitor bundle size in CI/CD

## Common Issues

**Issue**: Bundle size suddenly increased **Solution**: Run
`npm run build:analyze` to identify what changed

**Issue**: Tree-shaking not working **Solution**: Ensure all imports are named
(not default) and check `sideEffects: false` in package.json

**Issue**: Dependencies duplicated **Solution**: Check npm/yarn lock file, use
`npm dedupe`

**Issue**: Slow build times **Solution**: Enable caching, use `esbuild` or `swc`
instead of Babel

## Resources

- [Rollup Config](../../rollup.config.js)
- [Package.json](../../package.json)
- [Bundle Size Limits](../../package.json#bundlesize)
- [Performance Auditor Skill](../performance-auditor/SKILL.md)
