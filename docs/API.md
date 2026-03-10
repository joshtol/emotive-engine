# API Reference

## Core Methods (Both 2D and 3D)

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
mascot.setEmotion(name, undertone); // undertones: nervous, confident, tired, intense, subdued

// Gestures
mascot.express(gesture);
mascot.chain('gesture1 > gesture2'); // Sequential
mascot.chain('sway+breathe+float'); // Simultaneous

// Shapes (3D only)
mascot.morphTo(shape);
```

## 3D-Specific Methods

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

## Emotions

15 built-in emotional states:

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

## Gestures

180+ base gestures. See [GESTURES.md](./GESTURES.md) for the full catalog.

**Motion:** `bounce`, `pulse`, `shake`, `nod`, `sway`, `float`, `wiggle`, `lean`

**Transform:** `spin`, `spinLeft`, `spinRight`, `jump`, `morph`, `stretch`, `tilt`, `twist`

**Effects:** `wave`, `flicker`, `burst`, `flash`, `glow`, `breathe`, `expand`

**Directional:** `stepLeft/Right/Up/Down`, `slideLeft/Right`, `leanLeft/Right`, `kickLeft/Right`, `floatUp/Down/Left/Right`, `pointUp/Down/Left/Right`

## Elemental Gestures (3D)

160+ gestures across 8 elements, each with custom GLSL shaders:

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
import { EmotiveMascot3D } from '@joshtol/emotive-engine/3d-elementals';

mascot.express('firecrown');
mascot.express('icevortex');
mascot.express('zap');
```

Elemental gestures require self-hosted 3D assets — see the README.

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
mascot.startSolarEclipse({ type: 'total' }); // 'total' or 'annular'
mascot.startLunarEclipse({ type: 'total' }); // 'total', 'partial', or 'penumbral'
```

## SSR / Multi-Instance

The engine requires a browser environment. For SSR frameworks (Next.js, Nuxt),
use dynamic imports with `ssr: false` or `<ClientOnly>`. An `isSSR()` helper is
exported from `@joshtol/emotive-engine/3d`.

Multiple mascots can run independently on the same page — each instance has its
own animation loop, emotion state, and resources.

## Browser Support

| Browser        | Version |
| -------------- | ------- |
| Chrome/Edge    | 90+     |
| Firefox        | 88+     |
| Safari         | 14+     |
| iOS Safari     | 14+     |
| Chrome Android | 90+     |

3D mode requires WebGL 2.0.
