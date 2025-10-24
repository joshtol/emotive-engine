# Emotive Engine - CDN Setup Guide

## Quick Start

### unpkg (Recommended)

The easiest way to use Emotive Engine via CDN:

```html
<!-- Full build (all features) -->
<script src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"></script>

<!-- Minimal build (core only, smaller) -->
<script src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.minimal.umd.js"></script>

<!-- Audio build (audio-reactive focused) -->
<script src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.audio.umd.js"></script>
```

### jsDelivr (Alternative)

```html
<!-- Full build -->
<script src="https://cdn.jsdelivr.net/npm/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"></script>

<!-- Minimal build -->
<script src="https://cdn.jsdelivr.net/npm/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.minimal.umd.js"></script>

<!-- Audio build -->
<script src="https://cdn.jsdelivr.net/npm/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.audio.umd.js"></script>
```

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emotive Engine Demo</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #0a0a0a;
        }
        #mascot-canvas {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <canvas id="mascot-canvas" width="800" height="800"></canvas>

    <!-- Load from CDN -->
    <script src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"></script>

    <script>
        // Create mascot instance
        const mascot = new window.EmotiveMascot({
            canvasId: 'mascot-canvas',
            emotion: 'joy',
            particleCount: 300
        });

        // Start animation
        mascot.start();

        // Trigger emotions
        setTimeout(() => mascot.setEmotion('excited'), 2000);
        setTimeout(() => mascot.express('bounce'), 3000);
    </script>
</body>
</html>
```

## Version Pinning

### Latest Version (Auto-update)

```html
<!-- Always gets the latest v2.x.x version -->
<script src="https://unpkg.com/@joshtol/emotive-engine@2/dist/emotive-mascot.umd.js"></script>
```

⚠️ **Warning**: Not recommended for production. API may change between minor versions.

### Specific Version (Recommended)

```html
<!-- Locked to v2.5.1 -->
<script src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"></script>
```

✅ **Recommended**: Guarantees stability and predictable behavior.

### Latest Patch Version

```html
<!-- Gets latest v2.5.x patch -->
<script src="https://unpkg.com/@joshtol/emotive-engine@2.5/dist/emotive-mascot.umd.js"></script>
```

✅ **Safe**: Only receives bug fixes, no breaking changes.

## Build Variants

### Full Build (864 KB / 234 KB gzipped)

**Includes**: All features, Sentry error tracking, complete gesture library

```html
<script src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"></script>
```

**Use when**: You need all features and error tracking

### Minimal Build (~700 KB / ~190 KB gzipped)

**Includes**: Core animations, basic gestures, no Sentry, reduced effects

```html
<script src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.minimal.umd.js"></script>
```

**Use when**: You want smaller bundle size and don't need all features

### Audio Build (819 KB / 221 KB gzipped)

**Includes**: Full audio analysis, rhythm sync, BPM detection, audio-reactive gestures

```html
<script src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.audio.umd.js"></script>
```

**Use when**: Your app focuses on music or audio visualization

## Performance Optimization

### Preload for Faster Loading

```html
<head>
    <!-- Preload the script -->
    <link rel="preload"
          href="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"
          as="script">

    <!-- DNS prefetch for CDN -->
    <link rel="dns-prefetch" href="https://unpkg.com">
</head>
```

### Async/Defer Loading

```html
<!-- Defer: Loads in parallel, executes after HTML parsing -->
<script defer src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"></script>

<!-- Async: Loads and executes as soon as possible -->
<script async src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"></script>
```

**Recommendation**: Use `defer` for better performance and predictable load order.

### Lazy Load Pattern

```html
<script>
// Only load when needed
function loadEmotiveMascot() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js';
        script.onload = () => resolve(window.EmotiveMascot);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Load on user interaction
document.getElementById('start-button').addEventListener('click', async () => {
    const EmotiveMascot = await loadEmotiveMascot();
    const mascot = new EmotiveMascot({ canvasId: 'mascot-canvas' });
    mascot.start();
});
</script>
```

## CDN Features Comparison

| Feature | unpkg | jsDelivr | Notes |
|---------|-------|----------|-------|
| **Speed** | Fast | Very Fast | jsDelivr has more edge locations |
| **Availability** | 99.9% | 99.99% | Both highly reliable |
| **Analytics** | No | Yes | jsDelivr provides usage stats |
| **Fallback** | Manual | Automatic | jsDelivr auto-fails to npm |
| **HTTP/2** | ✅ | ✅ | Both support HTTP/2 |
| **HTTP/3** | ✅ | ✅ | Both support HTTP/3 |
| **Brotli** | ✅ | ✅ | Better compression than gzip |
| **CORS** | ✅ | ✅ | Properly configured |

## Module Formats

### UMD (Universal Module Definition)

**For**: Browser `<script>` tags, compatible with CommonJS and AMD

```html
<script src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"></script>
<script>
    // Available as global variable
    const mascot = new window.EmotiveMascot({ canvasId: 'canvas' });
</script>
```

### ES Modules (import/export)

**For**: Modern browsers with native ES module support

```html
<script type="module">
    import EmotiveMascot from 'https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.js';

    const mascot = new EmotiveMascot({ canvasId: 'canvas' });
    mascot.start();
</script>
```

## Subresource Integrity (SRI)

For added security, use SRI hashes:

### Generate SRI Hash

```bash
# Install sri-hash generator
npm install -g sri-toolbox

# Generate hash for specific version
sri-hash https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js
```

### Use SRI Hash

```html
<script
    src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"
    integrity="sha384-[HASH_GOES_HERE]"
    crossorigin="anonymous">
</script>
```

## CDN Fallback Pattern

Protect against CDN downtime:

```html
<script src="https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"></script>
<script>
    // Fallback to jsDelivr if unpkg fails
    if (typeof EmotiveMascot === 'undefined') {
        document.write(
            '<script src="https://cdn.jsdelivr.net/npm/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js"><\/script>'
        );
    }
</script>
```

## TypeScript Support via CDN

```html
<!-- Import types for TypeScript -->
<script type="module">
    /** @type {import('https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-engine.d.ts').EmotiveMascot} */
    const mascot = new window.EmotiveMascot({ canvasId: 'canvas' });
</script>
```

## Testing CDN Links

### Check if CDN is serving correctly

```bash
# Test unpkg
curl -I https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js

# Test jsDelivr
curl -I https://cdn.jsdelivr.net/npm/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js

# Expected: HTTP/2 200 OK
```

### Verify file integrity

```bash
# Download and check size
curl -s https://unpkg.com/@joshtol/emotive-engine@2.5.1/dist/emotive-mascot.umd.js | wc -c

# Expected: ~864000 bytes
```

## Best Practices

### ✅ Do

- Pin to specific version in production
- Use minimal build when possible
- Implement lazy loading for better performance
- Add SRI hashes for security
- Use defer attribute for non-critical scripts
- Monitor CDN uptime with external service
- Test across multiple browsers

### ❌ Don't

- Use @latest in production
- Load multiple build variants simultaneously
- Skip version pinning
- Block render with sync CDN scripts
- Ignore bundle size impact
- Trust CDN without fallback

## Troubleshooting

### Script Not Loading

1. **Check browser console** for errors
2. **Verify CDN status**: https://unpkg.com or https://jsdelivr.com
3. **Try alternative CDN** (switch unpkg ↔ jsDelivr)
4. **Check CORS headers** in Network tab
5. **Disable ad blockers** temporarily

### Global Not Defined

```javascript
// Check if loaded
if (typeof window.EmotiveMascot === 'undefined') {
    console.error('Emotive Engine failed to load from CDN');
}
```

### Version Mismatch

```javascript
// Check loaded version
console.log('Emotive Engine version:', window.EmotiveMascot.VERSION);
```

## Support

- **Documentation**: https://docs.emotive-engine.com
- **GitHub**: https://github.com/joshtol/emotive-core
- **Issues**: https://github.com/joshtol/emotive-core/issues
- **NPM**: https://www.npmjs.com/package/@joshtol/emotive-engine

---

**Last Updated**: 2025-10-17
**Engine Version**: 2.5.1
**CDN Tested**: unpkg, jsDelivr
