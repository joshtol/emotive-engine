<div align="center">
  <img src="assets/emotive-engine-full-BW.svg" alt="Emotive Engine" width="600" />
  
  [![npm version](https://img.shields.io/npm/v/emotive-engine.svg)](https://www.npmjs.com/package/emotive-engine)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Performance](https://img.shields.io/badge/Performance-60fps-green.svg)](https://github.com/joshtol/emotive-engine)
  [![Canvas 2D](https://img.shields.io/badge/Canvas%202D-Optimized-blue.svg)](https://github.com/joshtol/emotive-engine)

  **A high-performance, emotionally-aware particle mascot system for next-generation conversational UIs**
  
  *"Making invisible states visible through coordinated particle chaos"*
  
  Built with pure Canvas 2D API, achieving rock-solid 60fps animations with thousands of particles - no WebGL, no heavy frameworks required.
</div>

## 🌟 Features

### Production-Ready Engine
- **20+ Emotional States**: From joy to contemplation, each with unique particle behaviors
- **15 Particle Behaviors**: Modular, extensible behaviors with visual documentation
- **Complete Gesture System**: Jump, morph, stretch, flicker, wave, and more
- **Performance Optimized**: Rock-solid 60fps with 1000+ particles
- **Adaptive Degradation**: Automatically adjusts quality for consistent performance
- **Web Worker Support**: Offload heavy computations for smooth main thread

### Technical Excellence
- **Modular Architecture**: Clean separation of concerns with registry pattern
- **Zero Heavy Dependencies**: Pure JavaScript, no Three.js or WebGL required
- **Dynamic Visual Resampling**: Maintains quality on resize without re-initialization
- **Particle Pooling**: Efficient memory management with object recycling
- **Plugin Architecture**: Extensible system for custom emotions and behaviors
- **Mobile Optimized**: Touch support with adaptive performance scaling
- **Accessibility Built-in**: Screen reader support and keyboard navigation

## 🚀 Quick Start

```bash
npm install emotive-engine
```

```javascript
import EmotiveMascot from './src/EmotiveMascot.js';

// Create an emotive mascot
const mascot = new EmotiveMascot({
  canvasId: 'mascot-canvas',
  emotion: 'neutral',
  renderingStyle: 'classic'  // or 'scifi' for alternative renderer
});

// Start the animation
mascot.start();

// Set emotions and trigger gestures
mascot.setEmotion('joy');
mascot.express('bounce');  // Direct gesture execution

// Set emotions with undertones for depth
mascot.setEmotion('anger', { undertone: 'intense' });  // Electric, overwhelming
mascot.setEmotion('love', { undertone: 'subdued' });   // Ghostly, subtle

// Chain gestures for complex expressions
mascot.express(['bounce', 'spin', 'pulse']);

// Respond to events
mascot.on('stateChange', (state) => {
  console.log(`Mascot is feeling ${state.emotion} (${state.undertone || 'clear'})`);
});
```

## 🎨 Live Demo

- [**Themed Sci-Fi Interface**](https://joshtol.github.io/emotive-engine/themed-scifi-demo.html) - Futuristic UI with light/dark/night themes showcasing the full emotional range

## 🏗️ Architecture

### Modular Particle System (v3.0.0)

The particle system has been completely modularized for maintainability and extensibility:

```
src/core/
├── Particle.js           # Orchestrator (500 lines)
└── particles/
    ├── behaviors/        # 15 particle behaviors
    │   ├── ambient.js    # Gentle drift (neutral)
    │   ├── rising.js     # Upward float (joy)
    │   ├── falling.js    # Downward sink (sadness)
    │   ├── aggressive.js # Chaotic bursts (anger)
    │   ├── scattering.js # Flee from center (fear)
    │   ├── burst.js      # Explosive expansion (surprise)
    │   ├── repelling.js  # Push away (disgust)
    │   ├── orbiting.js   # Valentine dance (love)
    │   ├── connecting.js # Social energy (curiosity)
    │   ├── resting.js    # Ultra-slow (sleepy)
    │   ├── radiant.js    # Sunburst (euphoria)
    │   ├── popcorn.js    # Bouncing (celebration)
    │   ├── ascending.js  # Incense smoke (zen)
    │   ├── erratic.js    # Nervous jitter (anxiety)
    │   └── cautious.js   # Watchful pause (suspicion)
    ├── gestures/         # Gesture motion system
    ├── config/           # Physics and settings
    └── utils/            # Color, math, easing
```

### Adding New Behaviors

Creating a new particle behavior is simple:

1. Copy `particles/behaviors/_template.js`
2. Implement `initialize()` and `update()` functions
3. Add visual documentation and recipes
4. Import in `behaviors/index.js`
5. That's it! The registry handles the rest

## 🧠 Emotional Intelligence

### Core Emotions & Particle Behaviors

| Emotion | Behavior | Visual Characteristics |
|---------|----------|------------------------|
| **Neutral** | `ambient` | Gentle upward drift like smoke |
| **Joy** | `rising` + `popcorn` | Buoyant upward movement with celebration pops |
| **Sadness** | `falling` | Heavy particles sinking with weight |
| **Anger** | `aggressive` | Sharp, chaotic movement with violent bursts |
| **Fear** | `scattering` | Particles fleeing frantically from center |
| **Surprise** | `burst` | Explosive outward expansion |
| **Disgust** | `repelling` | Maintaining distance, pushing away |
| **Love** | `orbiting` | Valentine firefly dance around center |
| **Curiosity** | `connecting` | Chaotic but attracted to center |
| **Sleepy** | `resting` | Ultra-slow vertical drift |
| **Euphoria** | `radiant` | Sunbeam radiation outward |
| **Zen** | `ascending` | Slow rise like incense smoke |
| **Nervous** | `erratic` | Jittery, unpredictable movement |
| **Suspicion** | `cautious` | Slow movement with watchful pauses |

### Gesture System

Complete gesture implementations for expressive animations:

| Gesture | Type | Description |
|---------|------|-------------|
| `bounce` | Blending | Vertical oscillation |
| `pulse` | Blending | Radial expansion/contraction |
| `shake` | Blending | Random jitter |
| `spin` | Override | Orbital rotation |
| `jump` | Override | Squash, leap, and land |
| `morph` | Override | Form geometric patterns |
| `stretch` | Override | Axis scaling |
| `wave` | Override | Infinity pattern flow |
| `tilt` | Override | Gather and sway |
| `drift` | Override | Controlled float |
| `flicker` | Blending | Opacity and motion variation |

## 🎨 Visual System

### Color Depth Palette

Each emotion uses a sophisticated 5-layer depth palette creating 3D particle effects:

- **MIDTONE (30%)**: Base color occupying middle space
- **DESATURATED (20%)**: Background depth, misty and distant
- **OVERSATURATED (20%)**: Foreground pop, electric and vibrant
- **HIGHLIGHT (15%)**: Light-catching particles
- **SHADOW (15%)**: Grounding depth particles

### Undertone System

Modify emotional expression with undertones:

```javascript
// Intense undertone - faster, more dramatic
mascot.setEmotion('joy', { undertone: 'intense' });

// Subdued undertone - slower, gentler
mascot.setEmotion('anger', { undertone: 'subdued' });

// Confused undertone - erratic modifications
mascot.setEmotion('neutral', { undertone: 'confused' });
```

## 🛠️ Development

### Prerequisites
- Node.js 14+
- Modern browser with Canvas 2D support

### Installation
```bash
git clone https://github.com/yourusername/emotive-engine.git
cd emotive-engine
npm install
```

### Running Locally
```bash
npm start
# Visit http://localhost:8080
```

### Testing
```bash
npm test          # Run test suite
npm run test:perf # Performance benchmarks
```

### Building for Production
```bash
npm run build     # Minified production build
```

## 📚 API Documentation

### EmotiveMascot Class

```javascript
const mascot = new EmotiveMascot(config);
```

#### Config Options
- `canvasId` (string): Target canvas element ID
- `emotion` (string): Initial emotional state
- `renderingStyle` (string): 'classic' or 'scifi'
- `particleLimit` (number): Max particles (default: 500)
- `enableSound` (boolean): Enable audio (default: false)
- `theme` (string): 'light', 'dark', or 'night'

#### Methods
- `start()`: Begin animation loop
- `stop()`: Pause animation
- `setEmotion(emotion, options)`: Change emotional state
- `express(gesture)`: Trigger gesture animation
- `on(event, handler)`: Event listener
- `setTheme(theme)`: Change visual theme
- `destroy()`: Clean up resources

#### Events
- `stateChange`: Emotion or undertone changed
- `gestureComplete`: Gesture animation finished
- `performanceWarning`: FPS dropped below threshold

## 🎮 Performance

### Optimization Strategies

1. **Particle Pooling**: Reuses particle objects to prevent garbage collection
2. **Batch Rendering**: Groups similar draw operations
3. **Spatial Indexing**: Efficient collision detection for behaviors
4. **Frame Skipping**: Maintains 60fps by dropping frames intelligently
5. **LOD System**: Reduces particle complexity at distance
6. **Worker Offloading**: Heavy calculations in Web Workers

### Benchmarks

| Particles | FPS (Chrome) | FPS (Firefox) | FPS (Safari) |
|-----------|--------------|---------------|--------------|
| 100       | 60           | 60            | 60           |
| 500       | 60           | 60            | 60           |
| 1000      | 60           | 58            | 56           |
| 2000      | 55           | 52            | 48           |

*Tested on M1 MacBook Pro at 1920x1080 resolution*

## 🤝 Contributing

We welcome contributions! The modular architecture makes it easy to add new behaviors and features.

### Adding a New Behavior

1. Create a new file in `src/core/particles/behaviors/`
2. Use the template and follow the pattern
3. Add comprehensive documentation
4. Submit a pull request

### Code Style
- ES6+ modules
- JSDoc comments
- Visual diagrams in comments
- Performance-conscious implementations

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Credits

Created by Josh Tolley and the Emotive Engine team.

Special thanks to all contributors who helped make this engine production-ready.

---

<div align="center">
  <i>Making AI conversations feel alive, one particle at a time.</i>
  
  ⭐ Star us on GitHub if you find this useful!
</div>