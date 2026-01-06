<div align="center">

# Emotive Engine

**Expressive AI mascots for modern interfaces**

[![npm version](https://img.shields.io/npm/v/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE.md)
[![Downloads](https://img.shields.io/npm/dm/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)

<img src="assets/previews/3d-demo.gif" alt="Emotive Engine 3D Demo" width="100%" />

Real-time character animation engine with **Canvas 2D** and **WebGL 3D** rendering.

[Live Demos](https://joshtol.github.io/emotive-engine) |
[Documentation](#api-reference) |
[NPM](https://www.npmjs.com/package/@joshtol/emotive-engine)

</div>

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
- 40+ expressive gestures
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

Or via CDN:

```html
<!-- 2D Engine -->
<script src="https://unpkg.com/@joshtol/emotive-engine/dist/emotive-mascot.umd.js"></script>

<!-- 3D Engine (includes Three.js) -->
<script src="https://unpkg.com/@joshtol/emotive-engine/dist/emotive-mascot-3d.umd.js"></script>
```

---

## Quick Start

### 3D Mode (WebGL)

```javascript
import { EmotiveMascot3D } from '@joshtol/emotive-engine/3d';

const mascot = new EmotiveMascot3D({
  coreGeometry: 'crystal',  // crystal, moon, sun, heart, sphere
  enableParticles: true,
  enablePostProcessing: true,
});

mascot.init(document.getElementById('container'));
mascot.start();

// Control emotions and gestures
mascot.setEmotion('joy');
mascot.express('bounce');
mascot.morphTo('heart');
```

### 2D Mode (Canvas)

```javascript
import { EmotiveMascot } from '@joshtol/emotive-engine';

const mascot = new EmotiveMascot({
  canvasId: 'mascot',
  defaultEmotion: 'neutral',
});

await mascot.init(document.getElementById('container'));
mascot.start();

// Same API as 3D
mascot.setEmotion('joy');
mascot.express('bounce');
```

---

## LLM Integration with feel()

The `feel()` method lets LLMs control the mascot using natural language:

```javascript
// Simple emotion
mascot.feel('happy')

// Emotion with gesture
mascot.feel('curious, leaning in')

// With undertone modifier
mascot.feel('happy but nervous')

// With shape morph
mascot.feel('loving, heart shape, sparkle')

// With intensity
mascot.feel('very angry, shaking')
```

The engine parses ~1400 synonyms to understand natural expressions. For full documentation, see [LLM Integration Guide](./docs/LLM_INTEGRATION.md).

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

| Emotion | Description | Emotion | Description |
|---------|-------------|---------|-------------|
| `neutral` | Default calm | `joy` | Happy, upbeat |
| `calm` | Peaceful | `love` | Affectionate |
| `excited` | High energy | `euphoria` | Peak happiness |
| `sadness` | Melancholy | `anger` | Frustrated |
| `fear` | Anxious | `surprise` | Startled |
| `disgust` | Repulsed | `focused` | Concentrated |
| `suspicion` | Wary | `resting` | Idle/sleep |
| `glitch` | Digital artifact | | |

```javascript
mascot.setEmotion('joy');
mascot.setEmotion('calm', 'peaceful');  // with undertone
```

---

## Gestures

40+ expressive gestures in three categories:

**Motion:** `bounce`, `pulse`, `shake`, `nod`, `sway`, `float`, `wiggle`, `lean`

**Transform:** `spin`, `jump`, `morph`, `stretch`, `tilt`, `orbital`, `twist`

**Effects:** `wave`, `flicker`, `burst`, `flash`, `glow`, `breathe`, `expand`

```javascript
mascot.express('bounce');
mascot.chain('bounce > spin > pulse');    // sequential
mascot.chain('sway+breathe+float');       // simultaneous
```

---

## 3D Geometries

| Geometry | Description | Shader |
|----------|-------------|--------|
| `crystal` | Faceted hexagonal crystal | Subsurface scattering |
| `moon` | Realistic lunar surface | Custom phase shader |
| `sun` | Solar sphere with corona | Emissive + corona layers |
| `heart` | Heart-shaped crystal | Subsurface scattering |
| `sphere` | Smooth sphere | Standard PBR |

```javascript
mascot.morphTo('heart');  // Runtime geometry morphing
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
// Solar eclipse with corona
mascot.core3D.setSolarEclipse(0.8);  // 0-1 coverage

// Lunar eclipse (blood moon)
mascot.core3D.setLunarEclipse(1.0);  // Full umbra
```

---

## Configuration

### 3D Options

```javascript
new EmotiveMascot3D({
  // Geometry
  coreGeometry: 'crystal',

  // Rendering
  enableParticles: true,
  enablePostProcessing: true,  // Bloom effects
  enableShadows: false,

  // Camera
  enableControls: true,        // Orbit controls
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
  adaptive: true,  // Auto quality adjustment
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
mascot.setCameraPreset('front');  // front, side, top, angle

// Ambient Groove (rhythm-synced idle animation)
mascot.setGroove('groove1');              // Subtle, elegant (default)
mascot.setGroove('groove2');              // Energetic, bouncy
mascot.setGroove('groove3');              // Smooth, flowing
mascot.setGroove('groove2', { bars: 2 }); // Morph over 2 bars
mascot.enableGroove();
mascot.disableGroove();
```

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

| Browser | Version |
|---------|---------|
| Chrome/Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| iOS Safari | 14+ |
| Chrome Android | 90+ |

3D mode requires WebGL 2.0 support.

---

## Performance Tips

- Disable post-processing on mobile for 60fps
- Use `enableShadows: false` unless needed
- Lower `maxParticles` on constrained devices
- 2D mode is lighter weight for simple use cases

---

## License

MIT License - see [LICENSE.md](./LICENSE.md)

---

<div align="center">

Created by [Joshua Tollette](https://github.com/joshtol)

</div>
