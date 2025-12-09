<div align="center">
  <img src="assets/hero-banner.gif" alt="Emotive Engine" width="100%" />

[![npm version](https://img.shields.io/npm/v/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE.md)
[![Downloads](https://img.shields.io/npm/dm/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)

**Real-time character animation for AI interfaces**

Canvas 2D & WebGL 3D rendering | Emotional visualization | Shape morphing |
Dynamic gestures | TypeScript ready

[Live Demo](https://emotiveengine.com/demo) | [3D Demos](examples/3d/) |
[Documentation](https://github.com/joshtol/emotive-engine/wiki) |
[NPM](https://www.npmjs.com/package/@joshtol/emotive-engine)

</div>

---

## Overview

Emotive Engine is an open-source animation library for creating emotionally
expressive AI avatars and mascots. It provides two rendering modes:

- **2D Mode** - Pure Canvas 2D rendering with particle effects
- **3D Mode** - WebGL rendering with Three.js, custom shaders, and
  physically-based materials

Both modes share the same API for emotions, gestures, and shape morphing.

## Installation

```bash
npm install @joshtol/emotive-engine
```

Or include via CDN:

```html
<!-- 2D Engine -->
<script src="https://unpkg.com/@joshtol/emotive-engine/dist/emotive-mascot.umd.js"></script>

<!-- 3D Engine -->
<script src="https://unpkg.com/@joshtol/emotive-engine/dist/emotive-mascot-3d.umd.js"></script>
```

---

## Quick Start

### 2D Mode (Canvas)

```javascript
import EmotiveMascot from '@joshtol/emotive-engine';

const container = document.getElementById('mascot-container');

const mascot = new EmotiveMascot({
    canvasId: 'mascot',
    targetFPS: 60,
    defaultEmotion: 'neutral',
});

await mascot.init(container);
mascot.start();

// Set emotion
mascot.setEmotion('joy');

// Trigger gesture
mascot.express('bounce');

// Morph shape
mascot.morphTo('heart');
```

### 3D Mode (WebGL)

```javascript
import EmotiveMascot3D from '@joshtol/emotive-engine/3d';

const container = document.getElementById('mascot-container');

const mascot = new EmotiveMascot3D({
    coreGeometry: 'crystal', // crystal, moon, sun, heart, rough, sphere
    enableParticles: true,
    enablePostProcessing: true,
    defaultEmotion: 'neutral',
});

mascot.init(container);
mascot.start();

// Same API as 2D!
mascot.setEmotion('joy');
mascot.express('bounce');
```

---

## Features

### Emotions

15 built-in emotional states with unique visual characteristics:

| Emotion     | Description        | Color Theme   |
| ----------- | ------------------ | ------------- |
| `neutral`   | Default calm state | White/silver  |
| `joy`       | Happy, upbeat      | Warm yellow   |
| `calm`      | Peaceful, serene   | Soft blue     |
| `love`      | Affectionate       | Pink/red      |
| `excited`   | High energy        | Bright orange |
| `euphoria`  | Peak happiness     | Golden        |
| `sadness`   | Melancholy         | Deep blue     |
| `anger`     | Frustrated         | Red           |
| `fear`      | Anxious            | Purple        |
| `surprise`  | Startled           | Cyan          |
| `disgust`   | Repulsed           | Green         |
| `focused`   | Concentrated       | Cool blue     |
| `suspicion` | Wary               | Dark amber    |
| `resting`   | Idle/sleep         | Dim gray      |
| `glitch`    | Digital artifact   | Neon/static   |

```javascript
// Set emotion
mascot.setEmotion('joy');

// Set emotion with undertone modifier
mascot.setEmotion('joy', 'playful');
mascot.setEmotion('calm', { undertone: 'peaceful' });

// Update undertone without changing emotion
mascot.setUndertone('melancholic');
```

### Gestures

40+ expressive gestures in three categories:

**Motion Gestures** (blend with current animation):

- `bounce`, `pulse`, `shake`, `nod`, `sway`, `float`, `wiggle`, `lean`

**Transform Gestures** (override animation):

- `spin`, `jump`, `morph`, `stretch`, `tilt`, `orbital`, `twist`

**Effect Gestures** (visual effects):

- `wave`, `flicker`, `burst`, `flash`, `glow`, `breathe`, `expand`, `sparkle`

```javascript
// Single gesture
mascot.express('bounce');

// Gesture chain (sequential)
mascot.chain('rise'); // breathe > sway+lean+tilt

// Custom chain
mascot.chain('bounce > spin > pulse+sparkle');

// Simultaneous gestures (use + separator)
mascot.chain('sway+breathe+float');
```

**Built-in Chain Presets:**

- `rise` - breathe > sway+lean+tilt
- `flow` - sway > lean+tilt > spin > bounce
- `burst` - jump > nod > shake > flash
- `drift` - sway+breathe+float+drift
- `chaos` - shake+shake > spin+flash > bounce+pulse
- `radiance` - sparkle > pulse+flicker > shimmer

### 3D Geometries

Available geometry types for 3D mode:

| Geometry      | Description                           | Material                       |
| ------------- | ------------------------------------- | ------------------------------ |
| `crystal`     | Faceted hexagonal crystal (OBJ model) | Subsurface scattering shader   |
| `rough`       | Raw crystal formation (OBJ model)     | Subsurface scattering shader   |
| `heart`       | Heart-shaped crystal (OBJ model)      | Subsurface scattering shader   |
| `moon`        | Realistic lunar surface with texture  | Custom moon shader with phases |
| `sun`         | Solar sphere with corona effects      | Emissive shader                |
| `sphere`      | Smooth sphere                         | Standard material              |
| `torus`       | Donut shape                           | Standard material              |
| `icosahedron` | 20-faced polyhedron                   | Standard material              |

```javascript
// Create with specific geometry
const mascot = new EmotiveMascot3D({
    coreGeometry: 'crystal',
});

// Morph between geometries at runtime
mascot.morphTo('heart');
mascot.morphTo('sphere');
```

---

## Configuration

### 2D Configuration

```javascript
const mascot = new EmotiveMascot({
    canvasId: 'mascot',
    targetFPS: 60,
    defaultEmotion: 'neutral',
    enableParticles: true,
    maxParticles: 300,
    adaptive: true, // Auto-adjust quality for performance
});
```

### 3D Configuration

```javascript
const mascot = new EmotiveMascot3D({
    // Geometry
    coreGeometry: 'crystal', // crystal, moon, sun, heart, rough, sphere, etc.
    materialVariant: null, // 'multiplexer' for advanced shaders

    // Rendering
    enableParticles: true,
    enablePostProcessing: true, // Bloom, color grading
    enableShadows: false,

    // Camera
    enableControls: true, // Mouse/touch orbit controls
    cameraDistance: 3,
    fov: 45,
    minZoom: 1.5,
    maxZoom: 10,

    // Animation
    autoRotate: true, // Auto-rotate camera
    autoRotateSpeed: 0.5,
    enableBlinking: true,
    enableBreathing: true,

    // Defaults
    targetFPS: 60,
    defaultEmotion: 'neutral',
    maxParticles: 300,
});
```

---

## API Reference

### EmotiveMascot / EmotiveMascot3D

Both classes share this core API:

#### Lifecycle

```javascript
mascot.init(container); // Initialize with DOM element
mascot.start(); // Start animation loop
mascot.stop(); // Stop animation loop
mascot.destroy(); // Clean up resources
```

#### Emotions

```javascript
mascot.setEmotion(name); // Set emotion by name
mascot.setEmotion(name, undertone); // With undertone string
mascot.setEmotion(name, { undertone }); // With options object
mascot.setUndertone(undertone); // Change undertone only
```

#### Gestures

```javascript
mascot.express(gestureName); // Trigger single gesture
mascot.chain(chainName); // Execute gesture chain
mascot.chain([...gestures]); // Custom gesture array
```

#### Shape Morphing

```javascript
mascot.morphTo(shapeName); // Morph to new shape
```

### 3D-Specific Methods

```javascript
// Auto-rotation
mascot.enableAutoRotate();
mascot.disableAutoRotate();
mascot.autoRotateEnabled; // boolean getter

// Particles
mascot.enableParticles();
mascot.disableParticles();
mascot.particlesEnabled; // boolean getter

// Blinking
mascot.enableBlinking();
mascot.disableBlinking();
mascot.blinkingEnabled; // boolean getter

// Breathing
mascot.enableBreathing();
mascot.disableBreathing();
mascot.breathingEnabled; // boolean getter

// Wobble effects
mascot.enableWobble();
mascot.disableWobble();
mascot.wobbleEnabled; // boolean getter

// Camera presets
mascot.setCameraPreset('front', 1000); // front, side, top, angle, back
```

### Moon Phase Control (3D)

```javascript
import {
    setMoonPhase,
    animateMoonPhase,
    MOON_PHASES,
} from '@joshtol/emotive-engine/3d';

// Instant phase change
setMoonPhase(mascot.core3D, MOON_PHASES.FULL);
setMoonPhase(mascot.core3D, 0.5); // 0-1 progress

// Animated phase transition
animateMoonPhase(mascot.core3D, MOON_PHASES.CRESCENT_WAXING, 2000);

// Available phases:
// NEW, CRESCENT_WAXING, FIRST_QUARTER, GIBBOUS_WAXING,
// FULL, GIBBOUS_WANING, LAST_QUARTER, CRESCENT_WANING
```

### Blend Mode Control (3D)

```javascript
import { blendModeNames } from '@joshtol/emotive-engine/3d';

// Available modes (Photoshop-style):
// Multiply, Linear Burn, Color Burn, Color Dodge, Screen,
// Overlay, Add, Soft Light, Hard Light, Vivid Light,
// Linear Light, Difference, Exclusion, Darken, Lighten,
// Subtract, Divide, Pin Light
```

---

## Examples

### Interactive Demos

| Demo              | Description                         | Path                               |
| ----------------- | ----------------------------------- | ---------------------------------- |
| **3D Crystal**    | Crystal geometry with SSS shader    | `examples/3d/crystal-demo.html`    |
| **Blood Moon**    | Lunar eclipse with tidal locking    | `examples/3d/blood-moon-demo.html` |
| **Solar Eclipse** | Sun with corona and eclipse effects | `examples/3d/sun-demo.html`        |
| **3D Playground** | Full-featured 3D demo               | `examples/3d/3d-demo.html`         |
| **2D Playground** | Classic 2D particle demo            | `examples/basic-usage.html`        |
| **Rhythm Sync**   | Beat detection + animation          | `examples/rhythm-sync-demo.html`   |

### Running Examples Locally

```bash
# Clone the repo
git clone https://github.com/joshtol/emotive-engine.git
cd emotive-engine

# Install dependencies
npm install

# Build the library
npm run build

# Start local server
npm run local

# Open http://localhost:3001/examples/3d/crystal-demo.html
```

---

## Performance

### Recommended Settings

| Device  | Particles | Post-Processing | Shadows  |
| ------- | --------- | --------------- | -------- |
| Desktop | 300-500   | Enabled         | Optional |
| Laptop  | 200-300   | Enabled         | Disabled |
| Mobile  | 100-200   | Disabled        | Disabled |

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS Safari 14+, Chrome Android 90+

### Tips

- Disable post-processing on mobile for 60fps
- Use `enableShadows: false` unless specifically needed
- Lower `maxParticles` on constrained devices
- 3D mode requires WebGL 2.0 support

---

## Architecture

```
emotive-engine/
├── src/
│   ├── core/               # Shared core systems
│   │   ├── emotions/       # Emotion definitions
│   │   ├── gestures/       # Gesture definitions
│   │   └── particles/      # 2D particle system
│   ├── 3d/                 # WebGL 3D renderer
│   │   ├── geometries/     # 3D shape definitions
│   │   ├── shaders/        # GLSL shaders
│   │   ├── effects/        # Visual effects (SSS, eclipse)
│   │   ├── particles/      # 3D particle system
│   │   └── behaviors/      # Animation behaviors
│   └── index.js            # 2D entry point
├── dist/                   # Built files
├── examples/               # Demo files
└── types/                  # TypeScript definitions
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for
guidelines.

```bash
# Development build (with watch)
npm run build:watch

# Run tests
npm test

# Lint code
npm run lint:fix

# Build for production
npm run build
```

---

## License

MIT License - see [LICENSE.md](./LICENSE.md)

---

<div align="center">

Created by [Joshua Tollette](https://github.com/joshtol)

</div>
