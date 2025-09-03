<div align="center">
  <img src="assets/emotive-engine-full-BW.svg" alt="Emotive Engine" width="600" />
  
  [![npm version](https://img.shields.io/npm/v/emotive-engine.svg)](https://www.npmjs.com/package/emotive-engine)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Performance](https://img.shields.io/badge/Performance-60fps-green.svg)](https://github.com/joshtol/emotive-engine)
  [![Canvas 2D](https://img.shields.io/badge/Canvas%202D-Optimized-blue.svg)](https://github.com/joshtol/emotive-engine)

  **A high-performance, emotionally-aware particle mascot system for next-generation conversational UIs**
  
  Built with pure Canvas 2D API, achieving smooth 60fps animations with thousands of particles - no WebGL, no heavy frameworks required.
</div>

## 🌟 Features

### Production-Ready Engine
- **20+ Emotional States**: From joy to contemplation, each with unique particle behaviors
- **Advanced Particle Physics**: Flocking, morphing, gravitational effects, and fluid dynamics
- **Gesture Composition System**: Layer multiple animations for complex expressions
- **Performance Optimized**: 60fps with 1000+ particles using Canvas 2D optimizations
- **Adaptive Degradation**: Automatically adjusts quality for consistent performance
- **Web Worker Support**: Offload heavy computations for smooth main thread

### Technical Excellence
- **Zero Heavy Dependencies**: Pure JavaScript, no Three.js or WebGL required
- **Double Buffering**: Smooth rendering with offscreen canvas techniques
- **Batch Rendering**: Optimized draw calls for maximum performance
- **Plugin Architecture**: Extensible system for custom emotions and behaviors
- **Mobile Optimized**: Touch support with adaptive performance scaling
- **Accessibility Built-in**: Screen reader support and keyboard navigation

## 🚀 Quick Start

```bash
npm install emotive-engine
```

```javascript
import EmotiveEngine from 'emotive-engine';

// Create an emotive mascot
const mascot = new EmotiveEngine({
  canvasId: 'mascot-canvas',
  emotion: 'neutral',
  particleCount: 100
});

// Start the animation
mascot.start();

// React to emotions
mascot.setEmotion('joy');
mascot.addGesture('wave');

// Respond to events
mascot.on('stateChange', (state) => {
  console.log(`Mascot is feeling ${state.emotion}`);
});
```

## 🎨 Live Demos

- [**Standard Demo**](https://joshtol.github.io/emotive-engine/emotive-demo.html) - Classic aesthetic with emotion controls
- [**Sci-Fi Theme**](https://joshtol.github.io/emotive-engine/emotive-scifi-demo.html) - Futuristic UI with enhanced visual effects
- [**Full Controls**](https://joshtol.github.io/emotive-engine/emotive-demo-full-controls.html) - Complete feature showcase

## 🧠 Emotional Intelligence

The mascot responds to emotional states with sophisticated particle behaviors:

| Emotion | Particle Behavior | Visual Characteristics |
|---------|------------------|------------------------|
| **Joy** | Rising, celebratory | Golden particles, increased glow |
| **Curiosity** | Exploring, probing | Particles extend outward, searching |
| **Contemplation** | Slow orbital motion | Deep blues, thoughtful movement |
| **Excitement** | Rapid movement | Vibrant colors, energetic bursts |
| **Sadness** | Falling, drooping | Blue tones, reduced energy |
| **Love** | Heart formations | Pink/red hues, warm glow |
| **Fear** | Clustering, shaking | Particles huddle together |
| **Speaking** | Rhythmic pulsing | Synchronized with speech patterns |

## 🔧 Advanced Configuration

```javascript
const mascot = new EmotiveEngine({
  // Canvas setup
  canvasId: 'mascot-canvas',
  width: 400,
  height: 400,
  
  // Particle configuration
  particleCount: 150,
  particleSize: { min: 2, max: 6 },
  
  // Performance
  targetFPS: 60,
  enableWorkers: true,
  adaptivePerformance: true,
  
  // Visual settings
  glowIntensity: 1.2,
  motionBlur: 0.8,
  
  // Behavior
  emotion: 'neutral',
  undertone: 'calm',
  enableGestures: true,
  enablePhysics: true,
  
  // Audio reactive (optional)
  audioEnabled: false,
  audioSensitivity: 0.7
});
```

## 🏗️ Architecture

### Core Components

- **Emotive EngineRenderer**: High-performance Canvas 2D rendering engine
- **ParticleSystem**: Advanced particle physics and behaviors
- **EmotiveStateMachine**: Emotion management and transitions
- **GestureCompositor**: Complex animation layering
- **AnimationController**: Frame timing and interpolation
- **PerformanceMonitor**: Real-time optimization and degradation

### Performance Optimizations

1. **Double Buffering**: Offscreen canvas for smooth rendering
2. **Batch Rendering**: Minimized draw calls through path aggregation
3. **Spatial Indexing**: Efficient particle neighbor queries
4. **Object Pooling**: Reduced garbage collection overhead
5. **Web Workers**: Parallel computation for physics calculations
6. **Adaptive Quality**: Dynamic LOD based on performance metrics

## 🌐 Ecosystem Vision

Emotive Engine is designed as the foundation for a complete conversational UI ecosystem:

### Current Project (emotive-engine)
Core visualization and animation engine - the heart of the system.

### Planned Satellite Projects

#### emotive-voice 🎤
- TTS/STT integration layer
- Lip-sync timing and animation
- Voice emotion detection
- Real-time audio processing

#### emotive-llm-bridge 🤖
- LLM response interpretation
- Emotion sequence generation
- Streaming text handling
- Conversation state management

#### emotive-audio-reactor 🎵
- Music visualization
- Beat detection and sync
- Ambient sound response
- Frequency analysis effects

### Integration Pattern
```javascript
// Future ecosystem usage
import EmotiveEngine from 'emotive-engine';
import Emotive EngineVoice from 'emotive-voice';
import Emotive EngineLLM from 'emotive-llm-bridge';

const mascot = new EmotiveEngine({ canvasId: 'mascot' });
const voice = new Emotive EngineVoice({ mascot });
const llm = new Emotive EngineLLM({ mascot, model: 'gpt-4' });

// Seamless integration
llm.on('response', (text, emotion) => {
  mascot.setEmotion(emotion);
  voice.speak(text);
});
```

## 🎯 Use Cases

- **AI Assistants**: Give personality to conversational AI
- **Educational Tools**: Engaging mascot for interactive learning
- **Creative Applications**: Music visualizers, artistic installations
- **Gaming**: Companion characters, emotion-driven NPCs
- **Accessibility**: Visual communication for non-verbal interaction
- **Brand Mascots**: Interactive web presence for companies

## 📊 Performance Metrics

Tested on mid-range hardware (Intel i5, integrated graphics):

| Metric | Canvas 2D (Ours) | WebGL (Typical) | Three.js |
|--------|------------------|-----------------|----------|
| Particles @ 60fps | 1,500+ | 5,000+ | 3,000+ |
| Memory Usage | 45MB | 120MB | 180MB |
| Initial Load | 0.3s | 0.8s | 1.2s |
| Battery Impact | Low | High | High |
| Mobile Support | Excellent | Good | Variable |

*Note: Achieving WebGL-competitive performance with Canvas 2D through advanced optimizations*

## 🛠️ Development

```bash
# Install dependencies
npm install

# Development build with hot reload
npm run build:watch

# Production build
npm run build

# Run tests
npm test

# Analyze bundle size
npm run build:analyze
```

## 📚 API Documentation

### Core Methods

```javascript
// Lifecycle
mascot.start()           // Begin animation
mascot.stop()            // Pause animation
mascot.destroy()         // Clean up resources

// Emotions
mascot.setEmotion(name, intensity)     // Set emotional state
mascot.addUndertone(undertone)         // Add emotional modifier
mascot.blendEmotions(emotions, weights) // Blend multiple emotions

// Gestures
mascot.addGesture(name, options)       // Trigger gesture animation
mascot.queueGestures(gestures)         // Chain multiple gestures

// Interaction
mascot.respondToAudio(audioData)       // React to audio input
mascot.setGazeTarget(x, y)            // Look at specific point
mascot.pulse(intensity)               // Attention-getting pulse

// Events
mascot.on('stateChange', callback)
mascot.on('gestureComplete', callback)
mascot.on('particleSpawn', callback)
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Areas for Contribution
- New emotional states and behaviors
- Performance optimizations
- Accessibility improvements
- Plugin development
- Documentation and examples

## 📄 License

MIT © Joshua Tollette

---

<p align="center">
  <strong>Built with ❤️ for the future of conversational UI</strong>
</p>

<p align="center">
  <a href="https://github.com/joshtol/emotive-engine">GitHub</a> •
  <a href="https://www.npmjs.com/package/emotive-engine">NPM</a> •
  <a href="https://joshtol.github.io/emotive-engine/">Demos</a>
</p>