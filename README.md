<div align="center">

# Emotive Engine

**Expressive AI mascots for modern interfaces**

[![npm version](https://img.shields.io/npm/v/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE.md)
[![Downloads](https://img.shields.io/npm/dm/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)

<img src="assets/previews/elemental-gestures.gif" alt="Emotive Engine — 8 elemental shaders, 160+ gestures" width="100%" />

Real-time character animation engine with **Canvas 2D** and **WebGL 3D**
rendering.<br/> 8 elemental shader systems. 160+ elemental gestures. One
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
    assetBasePath: '/assets', // path to self-hosted assets (see 3D Assets section)
});

mascot.init(document.getElementById('container'));
mascot.start();

mascot.setEmotion('joy');
mascot.express('bounce');
mascot.morphTo('heart');
```

3D mode requires Three.js as a peer dependency: `npm install three`

### 2D Mode (Canvas)

```javascript
import { EmotiveMascot } from '@joshtol/emotive-engine';

const mascot = new EmotiveMascot();
await mascot.init(document.getElementById('container'));
mascot.start();

mascot.setEmotion('joy');
mascot.express('bounce');
mascot.feel('happy, bouncing'); // Natural language control
```

[API Reference](#api-reference) |
[LLM Integration Guide](./docs/LLM_INTEGRATION.md)

---

<details>
<summary><strong>Table of Contents</strong></summary>

- [Quick Start](#quick-start)
- [Features](#features)
- [Demo Gallery](#demo-gallery)
- [Installation](#installation)
- [3D Assets (Models & Textures)](#3d-assets-models--textures)
- [LLM Integration with feel()](#llm-integration-with-feel)
- [Emotions](#emotions)
- [Gestures](#gestures)
- [Elemental Gestures (3D)](#elemental-gestures-3d)
- [3D Geometries](#3d-geometries)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Running Locally](#running-locally)
- [License](#license)

</details>

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

**Shared across both modes:**

- 15 emotional states with smooth transitions
- 180+ base gestures including directional movements
- **Natural language `feel()` API** for LLM integration
- TypeScript definitions
- Unified API

---

## Demo Gallery

### 3D WebGL Examples

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

### 2D Canvas Examples

<table>
<tr>
<td align="center" width="33%">
<img src="assets/previews/hello-world.gif" alt="Hello World" width="100%" /><br/>
<strong>Hello World</strong><br/>
<sub>Minimal setup</sub>
</td>
<td align="center" width="33%">
<img src="assets/previews/basic-usage.gif" alt="Basic Usage" width="100%" /><br/>
<strong>Basic Usage</strong><br/>
<sub>Emotions and gestures</sub>
</td>
<td align="center" width="33%">
<img src="assets/previews/breathing.gif" alt="Breathing App" width="100%" /><br/>
<strong>Breathing App</strong><br/>
<sub>Guided breathing</sub>
</td>
</tr>
<tr>
<td align="center" width="33%">
<img src="assets/previews/events.gif" alt="Events" width="100%" /><br/>
<strong>Event Handling</strong><br/>
<sub>Real-time monitoring</sub>
</td>
<td align="center" width="33%">
<img src="assets/previews/rhythm.gif" alt="Rhythm Sync" width="100%" /><br/>
<strong>Rhythm Sync</strong><br/>
<sub>Beat detection</sub>
</td>
<td align="center" width="33%">
<img src="assets/previews/claude-chat.gif" alt="Claude Chat" width="100%" /><br/>
<strong>LLM Integration</strong><br/>
<sub>Claude sentiment analysis</sub>
</td>
</tr>
</table>

---

## Installation

```bash
npm install @joshtol/emotive-engine
```

**3D mode requires Three.js** as a peer dependency:

```bash
npm install three
```

Or via CDN:

```html
<!-- 2D Engine (UMD, no dependencies) -->
<script src="https://unpkg.com/@joshtol/emotive-engine/dist/emotive-mascot.umd.js"></script>

<!-- 3D Engine (ESM — requires import map for Three.js) -->
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

## 3D Assets (Models & Textures)

The npm package ships **JavaScript only** — GLB models, textures, and HDRI maps
are **not** included to keep the package lean (~4 MB vs ~28 MB).

The assets live in the repository under `assets/models/` and `assets/textures/`.
To use 3D mode, self-host them and point the engine at your copy:

```javascript
const mascot = new EmotiveMascot3D({
    coreGeometry: 'crystal',
    assetBasePath: '/assets', // wherever you host the assets folder
});
```

### Hosting Options

| Option                | Example `assetBasePath`                                                  |
| --------------------- | ------------------------------------------------------------------------ |
| **Copy to `public/`** | `'/assets'`                                                              |
| **CDN / S3**          | `'https://cdn.example.com/emotive-engine/assets'`                        |
| **GitHub Pages**      | `'https://joshtol.github.io/emotive-engine/assets'`                      |
| **unpkg (repo)**      | `'https://raw.githubusercontent.com/joshtol/emotive-engine/main/assets'` |

The expected directory structure under your `assetBasePath`:

```
<assetBasePath>/
├── models/
│   └── Elements/       # GLB models for elemental effects
├── textures/
│   ├── Crystal/        # Crystal & heart geometry textures
│   ├── Moon/           # Moon geometry textures
│   └── Sun/            # Sun geometry textures
└── hdri/               # Environment maps (optional, enhances reflections)
```

> **2D mode does not require any external assets** — it works out of the box.

---

## LLM Integration with feel()

The `feel()` method lets LLMs control the mascot using natural language:

```javascript
mascot.feel('happy'); // Simple emotion
mascot.feel('curious, leaning in'); // Emotion + gesture
mascot.feel('happy but nervous'); // With undertone
mascot.feel('loving, heart shape, sparkle'); // Shape morph
mascot.feel('very angry, shaking'); // With intensity
```

The engine parses ~1400 synonyms to understand natural expressions. For full
documentation, see [LLM Integration Guide](./docs/LLM_INTEGRATION.md).

### LLM System Prompt Example

```
After each response, output: FEEL: <emotion>, <gesture>

Examples:
- Greeting: FEEL: happy, wave
- Thinking: FEEL: focused, leaning in
- Celebrating: FEEL: euphoric, star shape, sparkle
```

---

## Emotions

15 built-in emotional states with unique visual characteristics:

| Emotion     | Description      | Emotion    | Description    |
| ----------- | ---------------- | ---------- | -------------- |
| `neutral`   | Default calm     | `joy`      | Happy, upbeat  |
| `calm`      | Peaceful         | `love`     | Affectionate   |
| `excited`   | High energy      | `euphoria` | Peak happiness |
| `sadness`   | Melancholy       | `anger`    | Frustrated     |
| `fear`      | Anxious          | `surprise` | Startled       |
| `disgust`   | Repulsed         | `focused`  | Concentrated   |
| `suspicion` | Wary             | `resting`  | Idle/sleep     |
| `glitch`    | Digital artifact |            |                |

```javascript
mascot.setEmotion('joy');
mascot.setEmotion('calm', 'peaceful'); // with undertone
```

---

## Gestures

180+ base gestures in multiple categories:

**Motion:** `bounce`, `pulse`, `shake`, `nod`, `sway`, `float`, `wiggle`, `lean`

**Transform:** `spin`, `spinLeft`, `spinRight`, `jump`, `morph`, `stretch`,
`tilt`, `twist`

**Effects:** `wave`, `flicker`, `burst`, `flash`, `glow`, `breathe`, `expand`

**Directional (Dance):**

- `stepLeft`, `stepRight`, `stepUp`, `stepDown` - Quick 1-beat weight shifts
- `slideLeft`, `slideRight` - Smooth 2-beat glides
- `leanLeft`, `leanRight` - Body tilts
- `kickLeft`, `kickRight` - Side kicks

**Directional (Storytelling):**

- `floatUp`, `floatDown`, `floatLeft`, `floatRight` - Ethereal drift
- `pointUp`, `pointDown`, `pointLeft`, `pointRight` - Indication

```javascript
mascot.express('bounce');
mascot.express('stepLeft'); // Directional dance move
mascot.chain('bounce > spin > pulse'); // Sequential
mascot.chain('sway+breathe+float'); // Simultaneous
mascot.feel('look to the stars'); // Natural language → pointUp
```

---

## Elemental Gestures (3D)

The elemental bundle adds **160+ gestures** across 8 elements, each with custom
GLSL shaders, instanced GPU models, and per-element bloom thresholds:

| Element         | Gestures | Key Effects                                |
| --------------- | -------- | ------------------------------------------ |
| **Fire**        | 19       | Additive flame stacking, decoupled alpha   |
| **Water**       | 21       | Splash rings, flow dynamics                |
| **Ice**         | 16       | Voronoi cracks, subsurface refraction      |
| **Electricity** | 22       | 3D Voronoi bolts, lightning flash mechanic |
| **Earth**       | 22       | Petrify, rumble, quake effects             |
| **Nature**      | 21       | Entangle, bloom, seed burst                |
| **Light**       | 23       | Purify, beacon, ascend                     |
| **Void**        | 17       | Singularity, drain, corruption             |

```javascript
// Import from the elementals bundle — includes all 8 elements + 160+ gestures
import { EmotiveMascot3D } from '@joshtol/emotive-engine/3d-elementals';

mascot.express('firecrown');
mascot.express('icevortex');
mascot.express('zap');
```

> Elemental gestures require the 3D assets to be self-hosted — see
> [3D Assets](#3d-assets-models--textures).

---

## 3D Geometries

| Geometry  | Description               | Shader                   |
| --------- | ------------------------- | ------------------------ |
| `crystal` | Faceted hexagonal crystal | Subsurface scattering    |
| `heart`   | Heart-shaped crystal      | Subsurface scattering    |
| `moon`    | Realistic lunar surface   | Custom phase shader      |
| `rough`   | Rough organic crystal     | Subsurface scattering    |
| `sphere`  | Smooth sphere             | Standard PBR             |
| `star`    | Five-pointed star         | Subsurface scattering    |
| `sun`     | Solar sphere with corona  | Emissive + corona layers |

```javascript
mascot.morphTo('heart'); // Runtime geometry morphing
```

### Moon Phase Control

```javascript
import { setMoonPhase, MOON_PHASES } from '@joshtol/emotive-engine/3d';

setMoonPhase(mascot.core3D, MOON_PHASES.FULL);
setMoonPhase(mascot.core3D, MOON_PHASES.CRESCENT_WAXING);

// All phases: NEW, CRESCENT_WAXING, FIRST_QUARTER, GIBBOUS_WAXING,
//             FULL, GIBBOUS_WANING, LAST_QUARTER, CRESCENT_WANING
```

### Eclipse Effects

```javascript
// Solar eclipse (animated transition)
mascot.startSolarEclipse({ type: 'total' }); // 'total' or 'annular'

// Lunar eclipse (blood moon)
mascot.startLunarEclipse({ type: 'total' }); // 'total', 'partial', or 'penumbral'
```

---

## Configuration

### 3D Options

```javascript
new EmotiveMascot3D({
    // Geometry
    coreGeometry: 'crystal', // crystal, heart, moon, rough, sphere, star, sun
    assetBasePath: '/assets',

    // Rendering
    enableParticles: true,
    enablePostProcessing: true, // Bloom effects
    enableShadows: false,

    // Camera
    enableControls: true, // Orbit controls
    autoRotate: true,
    cameraDistance: 3,

    // Animation
    enableBlinking: true,
    enableBreathing: true,
    targetFPS: 60,
});
```

### 2D Options

```javascript
new EmotiveMascot({
    canvasId: 'mascot',
    targetFPS: 60,
    enableParticles: true,
    maxParticles: 300,
    adaptive: true, // Auto quality adjustment
});
```

---

## API Reference

### Core Methods (Both Modes)

```javascript
// Lifecycle
mascot.init(container);
mascot.start();
mascot.stop();
mascot.destroy();

// Natural language control (LLM-friendly)
mascot.feel('happy, bouncing');
mascot.feel('curious, leaning in');

// Emotions
mascot.setEmotion(name);
mascot.setEmotion(name, undertone);

// Gestures
mascot.express(gesture);
mascot.chain('gesture1 > gesture2');

// Shapes
mascot.morphTo(shape);
```

### 3D-Specific Methods

```javascript
// Toggle features
mascot.enableParticles();
mascot.disableParticles();
mascot.enableAutoRotate();
mascot.disableAutoRotate();

// Camera
mascot.setCameraPreset('front'); // front, side, top, angle

// Ambient Groove (rhythm-synced idle animation)
mascot.setGroove('groove1'); // Subtle, elegant (default)
mascot.setGroove('groove2'); // Energetic, bouncy
mascot.setGroove('groove3'); // Smooth, flowing
mascot.setGroove('groove2', { bars: 2 }); // Morph over 2 bars
mascot.enableGroove();
mascot.disableGroove();
```

### SSR / Multi-Instance

The engine requires a browser environment. For SSR frameworks (Next.js, Nuxt),
use dynamic imports with `ssr: false` or `<ClientOnly>`. An `isSSR()` helper is
exported from `@joshtol/emotive-engine/3d`.

Multiple mascots can run independently on the same page — each instance has its
own animation loop, emotion state, and resources. See the
[dual mascot demo](https://joshtol.github.io/emotive-engine/examples/3d/dual-mascot-test.html).

---

## Running Locally

```bash
git clone https://github.com/joshtol/emotive-engine.git
cd emotive-engine
npm install
npm run build
npm run local

# Open http://localhost:3001
```

Or view the [live demo gallery](https://joshtol.github.io/emotive-engine).

---

## Browser Support

| Browser        | Version |
| -------------- | ------- |
| Chrome/Edge    | 90+     |
| Firefox        | 88+     |
| Safari         | 14+     |
| iOS Safari     | 14+     |
| Chrome Android | 90+     |

3D mode requires WebGL 2.0 support.

---

## License

MIT License - see [LICENSE.md](./LICENSE.md)

---

<div align="center">

Created by [Joshua Tollette](https://github.com/joshtol)

</div>
