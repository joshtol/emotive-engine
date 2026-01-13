# Migration Guide

This guide helps you upgrade between versions of `@joshtol/emotive-engine`.

---

## Upgrading to v3.3.x

### Deprecated Methods

The following methods are deprecated and will be removed in v4.0:

#### `setGeometry()` → `morphTo()`

```javascript
// Before (deprecated)
mascot.setGeometry('heart');

// After
mascot.morphTo('heart');
```

The `setGeometry()` method now logs a deprecation warning and delegates to `morphTo()`.

---

### New Features

#### Input Validation

Methods now validate inputs and log helpful warnings:

```javascript
mascot.setEmotion('xyz');
// Console: [EmotiveMascot3D] Unknown emotion "xyz". Valid emotions: joy, sadness, ...

mascot.morphTo(null);
// Console: [EmotiveMascot3D] morphTo: Invalid shape "null". Use getAvailableGeometries() for valid options.
```

Use the new helper methods to discover valid options:

```javascript
mascot.getAvailableEmotions();   // ['joy', 'sadness', 'anger', ...]
mascot.getAvailableGestures();   // ['bounce', 'pulse', 'shake', ...]
mascot.getAvailableGeometries(); // ['sphere', 'crystal', 'moon', ...] (3D only)
```

#### Method Chaining

All state-changing methods now return `this` for chaining:

```javascript
// Now works (didn't before v3.3)
mascot
    .setEmotion('joy')
    .express('bounce')
    .morphTo('heart')
    .setPosition(100, 50);
```

#### Unified `setEmotion()` Signature (3D)

The 3D `setEmotion()` now accepts the same parameter formats as 2D:

```javascript
// All these now work in both 2D and 3D:
mascot.setEmotion('joy');                      // Just emotion
mascot.setEmotion('joy', 'excitement');        // With undertone string
mascot.setEmotion('joy', 500);                 // With duration (ms)
mascot.setEmotion('joy', { undertone: 'calm' }); // With options object
mascot.setEmotion('joy', null);                // Clear undertone
```

#### New Events

Position and scale changes now emit events:

```javascript
mascot.eventManager.on('position:change', ({ x, y, z, previous }) => {
    console.log(`Moved from (${previous.x}, ${previous.y}) to (${x}, ${y})`);
});

mascot.eventManager.on('scale:change', ({ scale, previous }) => {
    console.log(`Scale: ${previous} → ${scale}`);
});
```

See [EVENTS.md](./EVENTS.md) for the complete event reference.

---

## Upgrading to v3.2.x

### Multi-Instance Support

Multiple mascots can now run independently on the same page:

```javascript
const mascot1 = new EmotiveMascot3D({ coreGeometry: 'crystal' });
const mascot2 = new EmotiveMascot3D({ coreGeometry: 'moon' });

mascot1.init(document.getElementById('container-1'));
mascot2.init(document.getElementById('container-2'));

// Control independently
mascot1.setEmotion('joy');
mascot2.setEmotion('calm');
```

### SSR Safety

Calling `init()` in a server-side environment now throws a descriptive error:

```javascript
// In SSR (no window object):
mascot.init(container);
// Throws: Error: EmotiveMascot3D requires a browser environment. ...
```

Use the `isSSR()` helper to guard initialization:

```javascript
import { EmotiveMascot3D, isSSR } from '@joshtol/emotive-engine/3d';

if (!isSSR()) {
    const mascot = new EmotiveMascot3D();
    mascot.init(container);
}
```

---

## Upgrading to v3.0.x (Major)

### Breaking Changes

#### Import Paths

```javascript
// Before
import EmotiveMascot from '@joshtol/emotive-engine';
import EmotiveMascot3D from '@joshtol/emotive-engine/3d';

// After (v3.0+)
import { EmotiveMascot } from '@joshtol/emotive-engine';
import { EmotiveMascot3D } from '@joshtol/emotive-engine/3d';
```

#### Configuration Changes

The `emotion` config option was renamed to `defaultEmotion`:

```javascript
// Before
new EmotiveMascot({ emotion: 'joy' });

// After
new EmotiveMascot({ defaultEmotion: 'joy' });
```

#### Event Names

Some event names were standardized:

| Old Name | New Name |
|----------|----------|
| `emotionChange` | `emotion:change` |
| `gestureStart` | `gesture:trigger` |
| `shapeChange` | `shape:morph` |

---

## Version Compatibility

| Version | Node | Browsers |
|---------|------|----------|
| 3.x | 16+ | Chrome 90+, Firefox 88+, Safari 14+ |
| 2.x | 14+ | Chrome 80+, Firefox 78+, Safari 13+ |

---

## Getting Help

- Check the [README](../README.md) for usage examples
- See [EVENTS.md](./EVENTS.md) for event documentation
- File issues at [GitHub](https://github.com/joshtol/emotive-engine/issues)
