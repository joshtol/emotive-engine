<div align="center">
  <img src="assets/emotive-engine-full-BW.svg" alt="Emotive Engine" width="600" />

  [![npm version](https://img.shields.io/npm/v/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)
  [![License: Dual](https://img.shields.io/badge/License-Dual%20(MIT%2FCommercial)-yellow.svg)](./LICENSE.md)
  [![Performance](https://img.shields.io/badge/Performance-60fps-green.svg)](https://github.com/joshtol/emotive-engine)

  **Real-time emotional visualization engine for next-generation UIs**

  Pure Canvas 2D • 60fps with 1000+ particles • No WebGL required
</div>

## Overview

Emotive Engine is a high-performance particle animation system that brings emotional intelligence to user interfaces. Create living, breathing mascots that respond to user interactions, music, and emotional states with sophisticated particle behaviors and smooth animations.

## Quick Start

```bash
npm install @joshtol/emotive-engine
```

```javascript
import EmotiveMascot from '@joshtol/emotive-engine';

// Create mascot
const mascot = new EmotiveMascot({
  canvasId: 'mascot-canvas',
  emotion: 'neutral'
});

// Start animation
mascot.start();

// Express emotions
mascot.setEmotion('joy');
mascot.express('bounce');

// Control rotation (v2.6.0)
mascot.setRotationSpeed(5);  // Degrees per frame
await mascot.renderer.rotationBrake.brakeToUpright();
```

## Key Features

### Emotional Intelligence
- **13+ Emotional States** - Joy, anger, love, fear, surprise, sadness, contemplation, and more
- **Dynamic Undertones** - Intense, subdued, energetic modifiers for emotional depth
- **Smooth Transitions** - Fluid morphing between emotional states

### Visual Systems
- **15+ Particle Behaviors** - Orbiting, scattering, connecting, surveillance, and more
- **26 Gesture Animations** - Bounce, spin, pulse, wave, shake, and complex combinations
- **Shape Morphing** - Transform between hearts, stars, triangles, circles with smooth interpolation
- **Chromatic Aberration** - Impact effects with red/cyan separation (v2.5.0)

### Audio Integration
- **Real-time Beat Detection** - Automatic BPM tracking and rhythm synchronization
- **32-band FFT Analysis** - Frequency spectrum visualization
- **Musical Quantization** - Animations lock to musical grid (beats, bars, phrases)
- **Audio-reactive Deformation** - Shapes respond to bass, mids, and vocals

### Performance
- **60fps Guaranteed** - Adaptive quality system maintains smooth framerate
- **Particle Pooling** - Efficient memory management with object recycling
- **Web Worker Support** - Offload computations from main thread
- **Mobile Optimized** - Touch support with performance scaling

### Technical Excellence
- **Pure JavaScript** - No heavy frameworks or WebGL dependencies
- **Modular Architecture** - Clean separation of concerns
- **Plugin System** - Extensible emotions, gestures, and behaviors
- **Value-agnostic Design** - All configurations externalized

## Core Features

### Emotional States

Set emotions with optional undertones for nuanced expression:

```javascript
// Basic emotion
mascot.setEmotion('joy');

// With undertone
mascot.setEmotion('anger', { undertone: 'intense' });
mascot.setEmotion('love', { undertone: 'subdued' });

// Available emotions
const emotions = [
  'neutral', 'joy', 'anger', 'sadness', 'fear',
  'surprise', 'disgust', 'contempt', 'love',
  'pride', 'curiosity', 'contemplation', 'suspicion'
];
```

### Gesture System

Trigger individual or chained gestures:

```javascript
// Single gesture
mascot.express('bounce');

// Chained gestures
mascot.express(['wave', 'spin', 'pulse']);

// Gesture types:
// - Motions: bounce, shake, vibrate
// - Transforms: spin, jump, morph, stretch
// - Effects: wave, pulse, breathe, glow
```

### Manual Rotation (v2.6.0)

Smooth rotation control with physics-based braking:

```javascript
// Set rotation speed (-10 to 10 degrees/frame)
mascot.setRotationSpeed(5);   // Clockwise
mascot.setRotationSpeed(-5);  // Counter-clockwise

// Smooth braking
await mascot.renderer.rotationBrake.brakeToUpright();
await mascot.renderer.rotationBrake.brakeToNearest(90);  // Nearest 90°
```

### Shape Morphing

Transform between shapes with automatic queueing:

```javascript
// Morph to shape
mascot.morphTo('heart');
mascot.morphTo('star');   // Queues if currently morphing

// Force immediate morph
mascot.morphTo('triangle', { force: true });

// Available shapes:
// circle, heart, star, triangle, square, hexagon, diamond
```

### Audio Visualization

Connect to audio for reactive animations:

```javascript
// Connect audio element
const audio = document.getElementById('music');
mascot.connectAudio(audio);

// Audio features automatically detected:
// - BPM and rhythm sync
// - Bass response (20-250Hz)
// - Vocal presence (1-4kHz)
// - Spectral changes
```

## Architecture

```
src/
├── EmotiveMascot.js         # Main entry point
├── core/
│   ├── EmotiveRenderer.js   # Canvas rendering engine
│   ├── ParticleSystem.js    # Particle management
│   ├── ShapeMorpher.js      # Shape transitions
│   ├── AudioAnalyzer.js     # Music analysis
│   └── animation/
│       └── RotationBrake.js # Smooth braking system
├── emotions/                # Emotional state definitions
├── gestures/                # Gesture animations
└── particles/               # Particle behaviors
```

## API Reference

### Constructor

```javascript
new EmotiveMascot(config)
```

**Config Options:**
- `canvasId` (string) - Canvas element ID
- `emotion` (string) - Initial emotion state
- `renderingStyle` (string) - 'classic' or 'scifi'
- `particleCount` (number) - Initial particle count
- `performanceMode` (string) - 'quality', 'balanced', or 'performance'

### Methods

#### Core Control
- `start()` - Begin animation loop
- `stop()` - Pause animation
- `reset()` - Reset to initial state

#### Emotional Control
- `setEmotion(emotion, options)` - Change emotional state
- `express(gesture)` - Trigger gesture(s)
- `morphTo(shape, options)` - Transform shape

#### Rotation Control
- `setRotationSpeed(speed)` - Set rotation velocity
- `renderer.rotationBrake.brakeToUpright()` - Brake to 0°
- `renderer.rotationBrake.brakeToNearest(angle)` - Brake to nearest angle

#### Audio
- `connectAudio(audioElement)` - Connect audio source
- `disconnectAudio()` - Disconnect audio

#### Events
- `on(event, callback)` - Listen for events
- `off(event, callback)` - Remove listener

**Available Events:**
- `stateChange` - Emotion/undertone change
- `gestureComplete` - Gesture animation finished
- `morphComplete` - Shape morph finished
- `beatDetected` - Musical beat detected

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

```bash
# Clone repository
git clone https://github.com/joshtol/emotive-engine.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## License

Dual-licensed:
- **MIT License** - Free for open-source projects
- **Commercial License** - Required for proprietary/commercial use

See [LICENSE.md](./LICENSE.md) for details.

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## Credits

Created by Josh Tolhurst

---

<div align="center">
  <i>Making invisible states visible through coordinated particle chaos</i>
</div>