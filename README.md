<div align="center">

# Emotive Engine

**Expressive AI mascots for modern interfaces**

[![npm version](https://img.shields.io/npm/v/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE.md)
[![Downloads](https://img.shields.io/npm/dm/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)
[![CI](https://github.com/joshtol/emotive-engine/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/joshtol/emotive-engine/actions/workflows/ci.yml)
[![3D + one element: 249 KB brotli](https://img.shields.io/badge/3D%20%2B%20one%20element-249%20KB%20brotli-4090CE.svg)](#import-only-what-you-use)

<img src="assets/previews/elemental-gestures.gif" alt="Emotive Engine: 8 elemental shaders, 160 elemental gestures" width="100%" />

Real-time character animation engine with **Canvas 2D** and **WebGL 3D**
rendering.<br/> 8 elemental shader systems. 160 elemental gestures. One
replicable pattern.

**[Live Demo](https://joshtol.github.io/emotive-engine)** ·
**[Elemental Gestures Demo](https://joshtol.github.io/emotive-engine/examples/3d/elemental-gestures.html)**
· **[NPM](https://www.npmjs.com/package/@joshtol/emotive-engine)**

</div>

---

## Quick Start

```bash
npm install @joshtol/emotive-engine
```

### 3D Mode (WebGL)

```javascript
import { EmotiveMascot3D } from '@joshtol/emotive-engine/3d';

const mascot = new EmotiveMascot3D({
    coreGeometry: 'crystal',
    assetBasePath: '/assets', // self-hosted assets (see below)
});

mascot.init(document.getElementById('container'));
mascot.start();

mascot.setEmotion('joy');
mascot.express('bounce');
mascot.morphTo('heart');
mascot.feel('happy, bouncing'); // Natural language control
```

3D mode requires Three.js (`npm install three`, version 0.170 or later) and a
browser with WebGL 2. Without WebGL 2, `init()` logs a warning and renders
nothing; it does not fall back to Canvas 2D, which is the separate
`@joshtol/emotive-engine` import below.

### 2D Mode (Canvas)

```javascript
import { EmotiveMascot } from '@joshtol/emotive-engine';

const mascot = new EmotiveMascot();
await mascot.init(document.getElementById('container'));
mascot.start();
mascot.feel('happy, bouncing');
```

2D mode has no dependencies and requires no external assets.

---

## Import only what you use

Every build is a separate entry, so a page that shows one elemental does not pay
for the other seven. Sizes are brotli over the wire (`npm run size:report`);
Three.js is a peer dependency and is not included in the 3D numbers.

| Import                                  |     Brotli | What you get                                   |
| --------------------------------------- | ---------: | ---------------------------------------------- |
| `@joshtol/emotive-engine`               |     178 KB | 2D canvas engine                               |
| `@joshtol/emotive-engine/lean`          |     166 KB | 2D, no rhythm sync / accessibility / profiling |
| `@joshtol/emotive-engine/minimal`       |      67 KB | 2D loading-screen build                        |
| `@joshtol/emotive-engine/3d`            |     232 KB | 3D, no elementals                              |
| `@joshtol/emotive-engine/3d-<element>`  | 249–256 KB | 3D + one elemental (see below)                 |
| `@joshtol/emotive-engine/3d-elementals` |     303 KB | 3D + all eight elementals                      |

The eight single-element entries are `3d-fire`, `3d-water`, `3d-ice`,
`3d-electric`, `3d-earth`, `3d-nature`, `3d-light` and `3d-void`. Each registers
only its own element and gestures; the other elements' shaders and gestures are
not in the file.

```javascript
// A page that only shows the electric elemental
import { EmotiveMascot3D } from '@joshtol/emotive-engine/3d-electric';

const mascot = new EmotiveMascot3D({
    coreGeometry: 'crystal',
    assetBasePath: '/assets',
    maxPixelRatio: 1.5, // cap the DPR (default 2.0): sharpness vs fill rate
    hdri: false, // skip the optional 1.7 MB studio HDRI
    glowHalo: false, // no screen-space halo when the canvas bleeds past its slot
    surface: 'light', // or mascot.setSurface('light'): arcs drawn as ink on light pages
});

mascot.init(document.getElementById('container'));
mascot.start();
mascot.express('shock'); // any electric gesture; fire gestures etc. are not registered
```

A gesture from an element that is not in the entry is simply unknown to
`express()`. Import `3d-elementals` when a page switches between elements.

---

## Features

<table>
<tr>
<td width="50%">

### 3D WebGL Rendering

- Custom GLSL shaders with subsurface scattering
- Physically-based materials and bloom effects
- 8 moon phases with tidal lock camera
- Solar and lunar eclipse simulations
- Runtime geometry morphing

</td>
<td width="50%">

### 2D Canvas Rendering

- Lightweight pure Canvas 2D
- Dynamic particle effects
- Shape morphing animations
- Gaze tracking
- Mobile-optimized

</td>
</tr>
</table>

**Shared:** 15 emotions · 179 gestures · Natural language `feel()` API ·
TypeScript definitions · Unified API

---

## Demo Gallery

### 3D WebGL

<table>
<tr>
<td align="center" width="33%">
<img src="assets/previews/crystal.gif" alt="Crystal Soul" width="100%" /><br/>
<strong>Crystal Soul</strong><br/>
<sub>Subsurface scattering shader</sub>
</td>
<td align="center" width="33%">
<img src="assets/previews/moon.gif" alt="Moon Phases" width="100%" /><br/>
<strong>Moon Phases</strong><br/>
<sub>8 phases with tidal lock</sub>
</td>
<td align="center" width="33%">
<img src="assets/previews/sun.gif" alt="Solar Eclipse" width="100%" /><br/>
<strong>Solar Eclipse</strong><br/>
<sub>Corona and diamond ring</sub>
</td>
</tr>
<tr>
<td align="center" colspan="3">
<img src="assets/previews/blood-moon.gif" alt="Blood Moon" width="50%" /><br/>
<strong>Blood Moon Eclipse</strong><br/>
<sub>Rayleigh scattering simulation</sub>
</td>
</tr>
</table>

### 2D Canvas

<table>
<tr>
<td align="center" width="33%">
<img src="assets/previews/hello-world.gif" alt="Hello World" width="100%" /><br/>
<strong>Hello World</strong>
</td>
<td align="center" width="33%">
<img src="assets/previews/basic-usage.gif" alt="Basic Usage" width="100%" /><br/>
<strong>Basic Usage</strong>
</td>
<td align="center" width="33%">
<img src="assets/previews/breathing.gif" alt="Breathing App" width="100%" /><br/>
<strong>Breathing App</strong>
</td>
</tr>
<tr>
<td align="center" width="33%">
<img src="assets/previews/events.gif" alt="Events" width="100%" /><br/>
<strong>Event Handling</strong>
</td>
<td align="center" width="33%">
<img src="assets/previews/rhythm.gif" alt="Rhythm Sync" width="100%" /><br/>
<strong>Rhythm Sync</strong>
</td>
</tr>
</table>

---

## 3D Assets

The npm package ships **JavaScript only**. GLB models, textures, and HDRI maps
must be self-hosted. They live in `assets/` in this repository. The 3D engine
loads WebP textures (Crystal 282 KB, Moon 1.2 MB, Sun 0.8 MB); the PNG/JPEG
sources sit beside them and are not requested at runtime.

```javascript
new EmotiveMascot3D({
    assetBasePath: '/assets', // wherever you host the assets folder
});
```

| Hosting Option        | `assetBasePath`                                     |
| --------------------- | --------------------------------------------------- |
| **Copy to `public/`** | `'/assets'`                                         |
| **CDN / S3**          | `'https://cdn.example.com/emotive-engine/assets'`   |
| **GitHub Pages**      | `'https://joshtol.github.io/emotive-engine/assets'` |

```
<assetBasePath>/
├── models/Elements/   # GLB models for elemental effects
├── textures/          # Crystal, Moon, Sun textures
└── hdri/              # Environment maps (optional)
```

---

## CDN Usage

```html
<!-- 2D (UMD, no dependencies) -->
<script src="https://unpkg.com/@joshtol/emotive-engine/dist/emotive-mascot.umd.js"></script>

<!-- 3D (ESM, requires Three.js import map) -->
<script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.170.0/build/three.module.min.js"
        }
    }
</script>
<script type="module">
    import { EmotiveMascot3D } from 'https://unpkg.com/@joshtol/emotive-engine/dist/emotive-mascot-3d.js';
</script>
```

---

## Documentation

| Doc                                              | Description                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| **[API Reference](./docs/API.md)**               | All methods, configuration options, emotions, gestures, geometries |
| **[LLM Integration](./docs/LLM_INTEGRATION.md)** | Natural language `feel()` API, system prompt examples              |
| **[Gestures](./docs/GESTURES.md)**               | Full gesture catalog (179 base + 160 elemental)                    |
| **[Quick Reference](./docs/QUICK_REFERENCE.md)** | Cheat sheet for emotions, undertones, and common patterns          |
| **[Architecture](./docs/ARCHITECTURE.md)**       | Internal design and rendering pipeline                             |

---

## Running Locally

```bash
git clone https://github.com/joshtol/emotive-engine.git
cd emotive-engine
npm install && npm run build && npm run local
# → http://localhost:3001
```

---

## License

MIT. See [LICENSE.md](./LICENSE.md)

<div align="center">

Created by [Joshua Tollette](https://github.com/joshtol)

</div>
